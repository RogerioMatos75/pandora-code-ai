from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from services.gemini_service import GeminiService  # Alterado de DeepSeek para Gemini
import logging

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

logger = logging.getLogger(__name__)
ai_service = None  # Renomeado para ser mais genérico

class CodeAnalysisRequest(BaseModel):
    code: str

@app.post("/analyze")
async def analyze_code(request: CodeAnalysisRequest):
    try:
        global ai_service
        if ai_service is None:
            ai_service = GeminiService()
        
        analysis = await ai_service.analyze_code(request.code)
        return {"analysis": analysis}
    except Exception as e:
        logger.exception("Erro na análise de código")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return FileResponse('static/index.html')

@app.get("/status")
def check_status():
    return {
        "status": "online",
        "service": "PandoraCodeAI",
        "endpoints": [
            {"path": "/", "method": "GET", "description": "Root endpoint"},
            {"path": "/analyze", "method": "POST", "description": "Code analysis endpoint"},
            {"path": "/status", "method": "GET", "description": "Service status"}
        ]
    }