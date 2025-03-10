import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def install_deepseek():
    print("Iniciando instalação do DeepSeek...")
    
    # Verificar requisitos
    print("Verificando requisitos...")
    cuda_available = torch.cuda.is_available()
    device = "cuda" if cuda_available else "cpu"
    print(f"Usando device: {device}")
    
    # Baixar modelo e tokenizer
    print("Baixando modelo DeepSeek...")
    model_name = "deepseek-ai/deepseek-coder-6.7b-instruct"
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            trust_remote_code=True,
            torch_dtype=torch.float16 if cuda_available else torch.float32
        )
        
        # Salvar localmente
        save_path = "models/deepseek-local"
        os.makedirs(save_path, exist_ok=True)
        
        print("Salvando modelo localmente...")
        model.save_pretrained(save_path)
        tokenizer.save_pretrained(save_path)
        
        print(f"Modelo instalado com sucesso em: {save_path}")
        
    except Exception as e:
        print(f"Erro durante a instalação: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    install_deepseek()
