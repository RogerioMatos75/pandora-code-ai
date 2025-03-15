# Pandora Code AI

Assistente de programação usando IA para ajudar iniciantes, oferecendo análise de código, correção de erros e sugestões em tempo real.

## ✨ Novos Recursos

### 🔍 Caixa de Pandora
- Análise de erros em tempo real
- Suporte para erros do terminal
- Interface intuitiva para correções
- Sugestões contextuais

### 🎯 Principais Funcionalidades
- Análise de segurança de código
- Geração de código assistida
- Explicação de código para iniciantes
- Correção automática de problemas
- Métricas de uso

### 🖥️ Interface Aprimorada
- Nova barra lateral dedicada
- Feedback visual em tempo real
- Organização intuitiva de comandos
- Atalhos personalizáveis

## ✨ Destaques do Projeto

### 🏗️ Arquitetura Robusta

- Estrutura modular e organizada
- Separação clara de responsabilidades
- Fácil manutenção e extensão

### 🤖 Integração IA

- Uso do Microsoft CodeGPT-small-py
- Análises em tempo real
- Otimizado para performance

### 📊 Métricas e Análises

- Análise estática de código
- Detecção de vulnerabilidades
- Sugestões de melhorias

## 🚀 Recursos Principais

- Análise de segurança de código
- Sugestões de melhorias
- Explicação de código para iniciantes
- Geração de código assistida
- Métricas de uso

## 🛠️ Stack Técnica

- TypeScript/Node.js para a extensão
- Python/Flask para o servidor
- Gemini API para processamento de IA
- Jest para testes
- Node-fetch para comunicação HTTP

## 📋 Pré-requisitos

- Node.js 16+
- Python 3.8+
- VSCode 1.80+
- API Key do Gemini

## 🚀 Instalação

1. **Configurar Ambiente Node.js**
```bash
npm install
```

2. **Configurar Ambiente Python**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
pip install -r server/requirements.txt
```

3. **Configurar Variáveis de Ambiente**
- Copie `.env.example` para `.env`
- Adicione sua API key do Gemini

4. **Iniciar o Servidor**
```bash
.\start-server.bat  # Windows
./start-server.sh   # Linux/Mac
```

5. **Compilar a Extensão**
```bash
npm run compile
```

## 📋 Feedback Necessário

1. **Funcionalidades**

   - A integração com DeepSeek está intuitiva?
   - As análises são úteis para iniciantes?
   - Quais recursos estão faltando?

2. **Código**

   - Estrutura do projeto está clara?
   - Padrões de código estão consistentes?
   - Cobertura de testes é suficiente?

3. **Documentação**
   - O guia de instalação está claro?
   - Faltam exemplos de uso?
   - Documentação técnica é adequada?

## Desenvolvimento

### Pré-requisitos

- Node.js 16+
- Python 3.8+
- VSCode 1.80+

### Configuração

```bash
# Instalar dependências
npm install

# Configurar ambiente de desenvolvimento
npm run prepare

# Compilar extensão
npm run compile
```

### Testes

```bash
# Executar testes unitários
npm run test:unit

# Verificar cobertura de testes
npm run test:coverage
```

### Servidor Python

```bash
cd server
pip install -r requirements.txt
python app.py
```

## Status do Projeto

- [x] Análise de código
- [x] Detecção de vulnerabilidades
- [x] Geração de código
- [x] Testes unitários
- [ ] Testes de integração
- [ ] Documentação completa

## Configuração do Ambiente

### Extensão VSCode

1. Instale o Node.js e npm
2. Execute `npm install` na pasta raiz
3. Execute `npm run compile` para compilar a extensão

### Servidor Python

1. Crie um ambiente virtual: `python -m venv venv`
2. Ative o ambiente virtual:
   - Windows: `.\venv\Scripts\activate`
   - Unix: `source venv/bin/activate`
3. Instale as dependências: `pip install -r server/requirements.txt`
4. Execute o servidor: `python server/app.py`

## Desenvolvimento

1. Abra o projeto no VSCode
2. Pressione F5 para iniciar o modo de depuração
3. Use `npm run watch` para compilação automática durante o desenvolvimento

## 🤖 Instalação do DeepSeek

### Pré-requisitos

- CUDA 11.8+ (para GPU) ou CPU com AVX2
- 16GB+ RAM (recomendado 32GB)
- 20GB+ de espaço em disco

### Passos de Instalação

1. **Instalar o DeepSeek**

```bash
# Criar ambiente virtual Python
python -m venv deepseek-env
source deepseek-env/bin/activate  # Linux/Mac
.\deepseek-env\Scripts\activate   # Windows

# Instalar dependências
pip install torch transformers accelerate

# Baixar o modelo DeepSeek
python -c "from transformers import AutoModelForCausalLM, AutoTokenizer; AutoModelForCausalLM.from_pretrained('deepseek-ai/deepseek-coder-6.7b-instruct', trust_remote_code=True); AutoTokenizer.from_pretrained('deepseek-ai/deepseek-coder-6.7b-instruct')"
```

2. **Configurar o servidor local**

```bash
cd server
pip install -r requirements.txt
python app.py
```

3. **Configurar a extensão**

- Abra as configurações do VSCode
- Procure por "Pandora AI"
- Configure o caminho do modelo:
  ```json
  {
    "pandoraAI.modelPath": "deepseek-ai/deepseek-coder-6.7b-instruct",
    "pandoraAI.host": "localhost",
    "pandoraAI.port": 11434
  }
  ```

### Verificar Instalação

```bash
# Testar se o modelo está funcionando
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explique o que é uma função em programação"}'
```

## 🔒 Configuração de Segurança

1. **Arquivo de Configuração**

   ```bash
   # Copiar arquivo de exemplo
   cp server/config/settings.example.json server/config/settings.json

   # Editar configurações
   nano server/config/settings.json
   ```

2. **Variáveis de Ambiente**

   ```bash
   # Criar arquivo .env na raiz
   echo "CONFIG_PATH=./server/config/settings.json" > .env
   ```

3. **Chaves de API**
   - Nunca commite o arquivo `settings.json`
   - Mantenha suas chaves de API seguras
   - Use o arquivo `.env` para configurações locais

## 🚀 Iniciando o Projeto

1. **Preparar Ambiente**

   ```bash
   # Instalar dependências Node
   npm install

   # Configurar ambiente Python
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate # Linux/Mac
   ```

2. **Iniciar Servidor**

   ```bash
   # Na raiz do projeto
   .\start-server.bat  # Windows
   ./start-server.sh   # Linux/Mac
   ```

3. **Compilar Extensão**
   ```bash
   npm run compile
   ```

## 💻 Dicas de Desenvolvimento

### Depuração

- Remover todos os breakpoints: 
  - Via interface: Debug Panel > botão direito > "Remove All Breakpoints"
  - Via comando: Ctrl+Shift+P > "Debug: Remove All Breakpoints"
  - Via atalho: Ctrl+Shift+F9

## 📬 Como Contribuir

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/sua-feature`
3. Commit suas mudanças: `git commit -m 'feat: Adiciona nova feature'`
4. Push para a branch: `git push origin feature/sua-feature`
5. Abra um Pull Request

## 🤝 Feedback

- Use a aba Issues para reportar bugs
- Discuta ideias nas Discussions
- PRs são bem-vindos!

## 🚀 Novidades na Instalação

1. **Configuração Simplificada**
```bash
npm install
npm run compile
```

2. **Iniciar Servidor**
```bash
npm run start-python
```

3. **Atalhos Principais**
- `Ctrl+Alt+P`: Abrir Caixa de Pandora
- Clique direito em código: Analisar erro
- Terminal > Analisar erro: Análise de erros do terminal

## 💡 Como Usar

1. **Análise de Erros**
   - Selecione o código com erro
   - Clique direito > "Analisar Erro"
   - Ou use a Caixa de Pandora diretamente

2. **Erros do Terminal**
   - Selecione o erro no terminal
   - Clique direito > "Analisar Erro do Terminal"
   - Veja sugestões na Caixa de Pandora

3. **Correções Automáticas**
   - Use o botão "Aplicar Correção"
   - Ou copie as sugestões para o clipboard
   - Visualize explicações detalhadas
