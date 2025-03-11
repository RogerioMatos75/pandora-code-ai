@echo off
setlocal

REM Define o diretório do script como diretório atual
cd /d "%~dp0"

echo === Iniciando Servidor Pandora Code AI ===

REM Verifica se Python esta instalado
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Erro: Python nao encontrado!
    echo Por favor, instale Python 3.8 ou superior
    pause
    exit /b 1
)

REM Verifica arquivos de configuração
if not exist "..\server\config\settings.json" (
    if exist "..\server\config\settings.example.json" (
        echo Copiando arquivo de configuracao exemplo...
        copy "..\server\config\settings.example.json" "..\server\config\settings.json"
    ) else (
        echo Erro: Arquivo de configuracao nao encontrado!
        pause
        exit /b 1
    )
)

REM Verifica arquivo .env
if not exist "..\.env" (
    echo Criando arquivo .env...
    echo CONFIG_PATH=./server/config/settings.json> ..\.env
    echo Arquivo .env criado com configuracao padrao
)

REM Ativa o ambiente virtual
if exist "..\venv\Scripts\activate.bat" (
    call ..\venv\Scripts\activate.bat
) else (
    echo Ambiente virtual nao encontrado
    echo Criando novo ambiente virtual...
    python -m venv ..\venv
    call ..\venv\Scripts\activate.bat
)

REM Instala dependências se necessário
if not exist "requirements.txt" (
    echo Erro: requirements.txt nao encontrado!
    pause
    exit /b 1
)

pip install -r requirements.txt

echo.
echo === Configuracao ===
echo * Ambiente virtual: ATIVO
echo * Arquivo .env: VERIFICADO
echo * Configuracoes: VERIFICADAS
echo.

REM Inicia o servidor
echo Iniciando servidor FastAPI...
python app.py

pause
