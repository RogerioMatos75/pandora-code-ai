import aiohttp
import asyncio
import json
import sys
from datetime import datetime

async def test_analyze_code():
    print("\n=== Testes de Análise de Código ===")
    
    # Casos de teste
    test_cases = [
        {
            "name": "Função Fibonacci recursiva",
            "code": """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
            """,
            "expected_topics": ["complexidade", "recursivo", "melhoria"]
        },
        {
            "name": "Função simples",
            "code": """
def soma(a, b):
    return a + b
            """,
            "expected_topics": ["simples", "legibilidade"]
        },
        {
            "name": "Classe com métodos",
            "code": """
class Calculator:
    def add(self, a, b):
        return a + b
    def subtract(self, a, b):
        return a - b
            """,
            "expected_topics": ["classe", "método"]
        }
    ]
    
    async with aiohttp.ClientSession() as session:
        for test_case in test_cases:
            print(f"\n🔍 Testando: {test_case['name']}")
            try:
                async with session.post(
                    'http://localhost:8000/analyze',
                    json={'code': test_case['code']},
                    timeout=30
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        analysis = result.get('analysis', '')
                        
                        # Verifica se a análise contém os tópicos esperados
                        topics_found = [
                            topic for topic in test_case['expected_topics']
                            if topic.lower() in analysis.lower()
                        ]
                        
                        print("\n✅ Resposta recebida:")
                        print(f"- Status: {response.status}")
                        print(f"- Tópicos encontrados: {len(topics_found)}/{len(test_case['expected_topics'])}")
                        print("\nAnálise completa:", "-"*40)
                        print(json.dumps(result, indent=2, ensure_ascii=False))
                    else:
                        print(f"❌ Erro: Status {response.status}")
                        print(await response.text())
            except Exception as e:
                print(f"❌ Erro no teste '{test_case['name']}': {str(e)}")

async def test_service_status():
    async with aiohttp.ClientSession() as session:
        async with session.get('http://localhost:8000/status') as response:
            result = await response.json()
            print("Status do serviço:", json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    print("Iniciando testes...")
    asyncio.run(test_service_status())
    asyncio.run(test_analyze_code())
    print("\nTestes concluídos!")
