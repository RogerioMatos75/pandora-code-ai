from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch
import logging

logger = logging.getLogger(__name__)

class DeepSeekService:
    def __init__(self):
        try:
            # Mudando para um modelo específico para código
            self.model_name = "microsoft/codebert-base"
            logger.info(f"🔄 Iniciando carregamento do modelo {self.model_name}...")
            
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model = self.model.to(self.device)
            
            logger.info("✅ Modelo carregado com sucesso")
            
        except Exception as e:
            logger.error(f"❌ Erro ao carregar modelo: {str(e)}")
            raise

    async def analyze_code(self, code: str):
        try:
            prompt = f"""
Análise técnica do seguinte código Python:

{code}

Resposta (em tópicos):
1. Complexidade:
"""
            # Gera a análise
            outputs = self.generator(prompt, 
                                  max_length=500, 
                                  num_return_sequences=1,
                                  temperature=0.7,
                                  pad_token_id=50256)
            
            response = outputs[0]['generated_text']
            
            # Formata a resposta
            if len(response) < 50:
                return self._get_default_analysis(code)
                
            # Limpa e estrutura a resposta
            analysis = self._format_analysis(response)
            return analysis
            
        except Exception as e:
            logger.error(f"Erro na análise: {str(e)}")
            return self._get_default_analysis(code)

    def _format_analysis(self, text):
        # Remove caracteres não-ASCII
        clean_text = ''.join(c for c in text if ord(c) < 128)
        
        # Estrutura a análise
        analysis = """
1. Complexidade: {}
2. Legibilidade: {}
3. Sugestões: {}
""".format(
            self._extract_section(clean_text, "Complexidade"),
            self._extract_section(clean_text, "Legibilidade"),
            "Adicionar documentação e testes."
        )
        
        return analysis.strip()

    def _extract_section(self, text, section):
        try:
            if section in text:
                return text.split(section + ":")[1].split("\n")[0].strip()
            return "Análise não disponível"
        except:
            return "Análise não disponível"

    def _get_default_analysis(self, code):
        is_class = "class" in code
        is_recursive = "return" in code and code.count(code.split("def ")[1].split("(")[0]) > 1
        
        return f"""
1. Complexidade: {'Média (implementação recursiva)' if is_recursive else 'Baixa (implementação simples)'}
2. Legibilidade: {'Boa, estrutura de classe clara' if is_class else 'Código conciso e direto'}
3. Sugestões: Adicionar documentação, testes unitários e tratamento de erros
""".strip()
