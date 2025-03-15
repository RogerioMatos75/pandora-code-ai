@echo off
echo === Verificacao do Servidor Pandora AI ===

REM Verifica Python
python --version > nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Instale Python 3.8 ou superior
    pause
    exit /b 1
)

REM Verifica se esta no diretorio correto
if not exist "app.py" (
    echo [ERRO] app.py nao encontrado!
    echo Execute este script da pasta server
    pause
    exit /b 1
)

REM Verifica ambiente virtual
if not exist "..\venv\Scripts\activate.bat" (
    echo Criando ambiente virtual...
    python -m venv ..\venv
)

REM Ativa ambiente virtual
call ..\venv\Scripts\activate.bat

REM Verifica/instala dependencias
pip install -r requirements.txt

REM Verifica arquivo de configuracao
if not exist "config\settings.json" (
    if exist "config\settings.example.json" (
        echo Copiando configuracoes de exemplo...
        copy "config\settings.example.json" "config\settings.json"
    ) else (
        echo [ERRO] Arquivo de configuracao nao encontrado!
        pause
        exit /b 1
    )
)

echo === Iniciando Servidor ===
echo * Python: Ativo
echo * Virtualenv: Ativo
echo * Dependencias: Instaladas
echo * Configuracao: OK

python app.py

pause
