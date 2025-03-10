import asyncio
import subprocess
import sys
import time
import requests
import os
import logging
from tests.test_analyze import test_analyze_code, test_service_status

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def wait_for_server(max_retries=15, delay=2):
    print("\n🔍 Verificando se o servidor está rodando...")
    for i in range(max_retries):
        try:
            response = requests.get('http://localhost:8000/status')
            if response.status_code == 200:
                print("✅ Servidor está rodando!")
                return True
        except requests.RequestException as e:
            print(f"⏳ Tentativa {i+1}/{max_retries} - Aguardando servidor... ({str(e)})")
            time.sleep(delay)
    return False

async def read_process_output(process):
    while True:
        line = process.stdout.readline()
        if not line:
            break
        print(f"SERVER: {line.strip()}")

def kill_process_on_port(port):
    try:
        import psutil
        
        for proc in psutil.process_iter(['pid', 'name']):
            try:
                connections = psutil.Process(proc.info['pid']).connections()
                for conn in connections:
                    if conn.laddr.port == port:
                        psutil.Process(proc.info['pid']).kill()
                        print(f"✅ Processo na porta {port} finalizado")
                        time.sleep(1)
                        return True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
    except Exception as e:
        print(f"⚠️ Erro ao tentar liberar porta: {e}")
    return True

async def main():
    server_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(server_dir)
    
    # Limpa porta antes de iniciar
    kill_process_on_port(8000)
    
    try:
        print("\n🚀 Iniciando servidor...")
        server_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Cria task para ler output do servidor
        asyncio.create_task(read_process_output(server_process))
        
        # Espera o servidor iniciar
        if not await wait_for_server():
            print("❌ Timeout ao aguardar servidor!")
            return
        
        # Aguarda um pouco mais para garantir que o servidor está pronto
        await asyncio.sleep(2)
        
        # Executa os testes
        try:
            print("\n🚀 Iniciando testes...")
            await test_service_status()
            await asyncio.sleep(1)  # Pequena pausa entre os testes
            await test_analyze_code()
            print("\n✅ Testes concluídos!")
        except Exception as e:
            print(f"\n❌ Erro nos testes: {str(e)}")
            logger.exception("Erro detalhado:")
        
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        logger.exception("Erro detalhado:")
        
    finally:
        if 'server_process' in locals():
            print("\n🛑 Encerrando servidor...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()
            print("✅ Servidor encerrado.")

if __name__ == "__main__":
    asyncio.run(main())
