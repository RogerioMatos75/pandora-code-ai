# Pandora Code AI

Extensão VSCode para auxiliar programadores iniciantes usando DeepSeek localmente.

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
