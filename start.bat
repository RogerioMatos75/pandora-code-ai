@echo off
echo === Iniciando Pandora Code AI ===

echo 1. Ativando ambiente virtual...
call venv\Scripts\activate

echo 2. Navegando para pasta do servidor...
cd server

echo 3. Iniciando servidor Python...
python app.py

pause
