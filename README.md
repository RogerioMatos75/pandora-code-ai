# Pandora Code AI

Extensão VSCode que utiliza DeepSeek localmente para auxiliar programadores iniciantes.

## ✨ Destaques do Projeto

### 🏗️ Arquitetura Robusta

- Estrutura modular e organizada
- Separação clara de responsabilidades
- Fácil manutenção e extensão

### 🤖 Integração IA

- Uso do DeepSeek localmente
- Análises em tempo real
- Baixa latência nas respostas

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
- Python/FastAPI para o servidor
- DeepSeek para IA local
- Jest para testes

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

### Windows

Execute o script de configuração de segurança como administrador:

```powershell
# No PowerShell como administrador
.\scripts\setup-security.ps1
```

Ou configure manualmente:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
$acl = Get-Acl ".husky\pre-commit"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Users","FullControl","Allow")
$acl.SetAccessRule($accessRule)
Set-Acl ".husky\pre-commit" $acl
```

### Linux/Mac

```bash
chmod +x .husky/pre-commit
```

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
