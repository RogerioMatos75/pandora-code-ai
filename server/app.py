from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import asyncio
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await initialize_model()
        yield
    finally:
        # Cleanup, if needed
        pass

app = FastAPI(
    title="Pandora Code AI Server",
    lifespan=lifespan
)

# Modelos Pydantic para requests/responses
class CodeRequest(BaseModel):
    code: str
    language: Optional[str] = None
    context: Optional[str] = None

class CodeResponse(BaseModel):
    text: str
    suggestions: List[str] = []
    errors: List[str] = []

class ModelStatus(BaseModel):
    is_loaded: bool
    device: str
    model_name: str
    memory_usage: float

# Variáveis globais para o modelo
model = None
tokenizer = None
model_status = {"is_loaded": False}

# Remover ou comentar o antigo @app.on_event("startup")
# @app.on_event("startup")
# async def startup_event():
#     """Inicializa o modelo durante a inicialização do servidor"""
#     try:
#         await initialize_model()
#     except Exception as e:
#         print(f"Erro ao inicializar modelo: {str(e)}")

async def initialize_model():
    """Carrega o modelo DeepSeek"""
    global model, tokenizer, model_status
    
    # Usando modelo menor e mais eficiente
    model_name = "microsoft/CodeGPT-small-py"  # ~500MB
    device = "cpu"
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float32,
            quantization_config={"load_in_8bit": True},  # Reduz uso de memória
            low_cpu_mem_usage=True
        )
        model = model.to(device)
        
        model_status = {
            "is_loaded": True,
            "device": device,
            "model_name": model_name,
            "memory_usage": 0  # Não podemos medir na CPU
        }
    except Exception as e:
        model_status["is_loaded"] = False
        raise HTTPException(status_code=500, detail=f"Erro ao carregar modelo: {str(e)}")

@app.get("/status")
async def get_status() -> ModelStatus:
    """Retorna o status atual do modelo"""
    return ModelStatus(**model_status)

@app.post("/generate")
async def generate_code(request: CodeRequest) -> CodeResponse:
    """Gera código baseado no prompt"""
    if not model_status["is_loaded"]:
        raise HTTPException(status_code=503, detail="Modelo não está carregado")
    
    try:
        inputs = tokenizer(request.code, return_tensors="pt").to(model.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=2048,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True
            )
        
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return CodeResponse(
            text=generated_text,
            suggestions=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_code(request: CodeRequest) -> CodeResponse:
    """Analisa código e retorna sugestões"""
    if not model_status["is_loaded"]:
        raise HTTPException(status_code=503, detail="Modelo não está carregado")
    
    try:
        prompt = f"""
        Analise este código e forneça sugestões de melhoria:
        ```{request.language or ''}
        {request.code}
        ```
        """
        
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=1024,
                num_return_sequences=1,
                temperature=0.3
            )
        
        analysis = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return CodeResponse(
            text=analysis,
            suggestions=[s.strip() for s in analysis.split('\n') if s.strip()]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=11434,
        reload=True,
        log_level="info"
    )
