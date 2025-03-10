import aiohttp
import os
import json
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        try:
            config = self._load_config()
            self.config = config['api']['gemini']
            self.base_url = self.config['base_url']
            self.api_key = self.config['key']
            logger.info("✅ Gemini configurado com sucesso")
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Gemini: {str(e)}")
            raise

    def _load_config(self):
        load_dotenv()
        config_path = os.getenv('CONFIG_PATH')
        if not config_path:
            raise ValueError("CONFIG_PATH não encontrado no .env")
            
        with open(config_path, 'r') as f:
            return json.load(f)

    async def analyze_code(self, code: str):
        try:
            prompt = f"""Como especialista em código Python, analise:
1. Complexidade do algoritmo
2. Legibilidade do código
3. Sugestões de melhorias

Código:
{code}"""

            url = f"{self.base_url}/models/gemini-2.0-flash:generateContent?key={self.api_key}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json={
                        "contents": [{
                            "parts":[{"text": prompt}]
                        }]
                    },
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    result = await response.json()
                    
                    if 'candidates' in result:
                        text = result['candidates'][0]['content']['parts'][0]['text']
                        return self._format_response(text)
                    
                    return self._get_default_analysis(code)
                    
        except Exception as e:
            logger.error(f"Erro na análise: {str(e)}")
            return self._get_default_analysis(code)

    def _format_response(self, text):
        # Remove caracteres especiais e formata
        clean_text = ''.join(c for c in text if ord(c) < 128).strip()
        
        if not clean_text or len(clean_text) < 50:
            return self._get_default_analysis(None)
            
        return clean_text

    def _get_default_analysis(self, code):
        return """
1. Complexidade:
   - Análise de complexidade indisponível no momento
   
2. Legibilidade:
   - O código precisa ser reanalisado
   
3. Sugestões:
   - Recomenda-se adicionar documentação
   - Implementar testes unitários
   - Adicionar tratamento de erros
""".strip()
