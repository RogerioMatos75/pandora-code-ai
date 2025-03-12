import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuração da API do Gemini
gemini_api_key = os.environ.get("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("Erro: A variável de ambiente GEMINI_API_KEY não está definida.")

genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel('gemini-pro')

@app.route('/analyze', methods=['POST'])
def analyze_code():
    try:
        data = request.get_json()
        code = data.get('code')
        if not code:
            return jsonify({'error': 'Code is required'}), 400

        prompt = f"""Analise este código e forneça sugestões de melhoria:
        {code}
        """

        response = model.generate_content(prompt)
        return jsonify({'analysis': response.text})

    except Exception as e:
        print(f"Erro no servidor: {e}")
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

@app.route('/status')
def status():
    return jsonify({
        "status": "online",
        "service": "PandoraCodeAI",
        "model": "gemini-pro"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
