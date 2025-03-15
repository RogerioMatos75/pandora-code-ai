## Amanhã para retomar:

## Depois de fazer essas alterações, siga estes passos:

Pare o servidor se estiver rodando
Execute: 
```
npm run build //para gerar uma nova build
```
Execute:
```
npm run preview 
``` 
para iniciar o servidor de preview
Acesse http://localhost:4000 no navegador
Se ainda assim não funcionar, 

você pode tentar:
Limpar o cache do navegador
Reiniciar o VS Code
Verificar se não há outros processos usando a porta 4000
Executar npm run clean seguido de npm install para reinstalar as dependências

# Agora você pode iniciar tudo com estes comandos:

Verificar/ativar virtualização:
```
npm run check-virt
```
Iniciar servidor Python:
```
npm run start-python
```
Em outro terminal, iniciar a extensão VS Code:
```
npm run compile
```
E pressione F5 para iniciar o modo de depuração.

O servidor Python precisa estar rodando para que a Pandora Code AI funcione corretamente!
http://localhost:4000

Use as credenciais:
Email: admin@ncfseguros.com
Senha: admin123
Após estes passos, seu aplicativo estará disponível em:

Frontend: https://ncf-seguros.vercel.app
API: https://ncf-seguros.vercel.app/api

# cd PandoraCodeAI
```
code . //para abrir o VS Code
cd server
.\venv\Scripts\activate //para ativar o ambiente virtual
python app.py //para iniciar o servidor
Em um novo terminal, compilar e iniciar a extensão:
# Na pasta raiz do projeto
npm run compile  
# Compila a extensão
.\start-server.bat
```
Depois, pressione F5 no VSCode para iniciar a extensão em modo de desenvolvimento.
Após iniciar, você poderá ver:

O painel da Pandora na barra lateral
A Caixa de Pandora disponível para análise de erros
Os comandos disponíveis através do Command Palette (Ctrl+Shift+P):
Pandora Code AI: Analisar Código
Pandora Code AI: Verificar Segurança
Pandora Code AI: Explicar Código
Pandora Code AI: Gerar Código
Você pode verificar se a extensão está funcionando corretamente selecionando um trecho de código e usando o comando "Explicar Código" ou "Analisar Código".
--------------------------------------

# Na pasta raiz do projeto
```
cd c:\Users\roger\AndroidStudioProjects\pandora-code-ai
.\venv\Scripts\activate  # Ativa o ambiente virtual
cd server
python app.py  # Inicia o servidor
```

# Agora você pode:

Verificar se o servidor está rodando:
```
cd server .\check-server.bat
```

Iniciar o servidor com todas as verificações:
```
.\start.bat
```

# Agora você pode executar de qualquer uma dessas formas:

No PowerShell: 
```
.\start-server.bat
```
No CMD: 
```
start-server.bat
```
Clicando duas vezes no arquivo no Explorer
(Press CTRL+C to quit)
Developer: Reload Window

# Remover configuração atual do Husky
```
Remove-Item -Recurse -Force .husky
Remove-Item -Recurse -Force .git/hooks
```

# Reinstalar Husky
```
npm uninstall husky
npm install --save-dev husky@8.0.3
```

# Inicializar Husky novamente
```
npm run prepare
```

# Adicionar hook pre-commit
```
npx husky add .husky/pre-commit "npx.cmd --no-install lint-staged"
```

# Dar permissão de execução (mesmo no Windows)
```
icacls .husky\pre-commit /grant Everyone:F
```

# Para usar, basta executar:
```
npm run setup-security
```

# Server Python (FastAPI)

Integração completa com DeepSeek
Endpoints para análise
Interface do VSCode

Melhorar o feedback visual
Adicionar mais interações
Testes

Completar a cobertura de testes
Adicionar testes de integração

Limpar arquivos temporários:

# Limpar node_modules
```
Remove-Item -Recurse -Force node_modules/
```

# Limpar build
```
Remove-Item -Recurse -Force dist/
Remove-Item -Recurse -Force out/
```

# Limpar cache Python
```
Remove-Item -Recurse -Force server/__pycache__/
```

Vou ajudar você a interpretar esses comandos que são os passos iniciais para configurar o ambiente de desenvolvimento do projeto PandoraCodeAI:

cd PandoraCodeAI

Navega para o diretório do projeto PandoraCodeAI
```
npm install
```

Instala todas as dependências Node.js definidas no package.json
Isso configurará o ambiente front-end/cliente
```
python -m venv venv
```

Cria um ambiente virtual Python chamado "venv"
Isso isolará as dependências Python do projeto
```
.\venv\Scripts\activate
```

Ativa o ambiente virtual Python criado
No Windows, usa-se este comando específico
Em sistemas Unix seria source 
```
venv/bin/activate
pip install -r server/requirements.txt
```

Instala todas as dependências Python listadas no arquivo requirements.txt
Isso configurará o ambiente back-end/servidor
code .

Abre o Visual Studio Code no diretório atual do projeto
Estes comandos configuram um ambiente de desenvolvimento completo com:

Node.js para o front-end
Python com ambiente virtual para o back-end
VS Code como IDE
Agora você está pronto para começar a desenvolver no projeto PandoraCodeAI.
```
python run_tests.py
Deactivate
bcdedit /set hypervisorlaunchtype off
```