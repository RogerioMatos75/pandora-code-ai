@echo off
echo === Verificando Servidor Pandora AI ===

curl -X GET http://localhost:5000/status 2>nul
if errorlevel 1 (
    echo [ERRO] Servidor nao esta respondendo
    echo Tente:
    echo 1. Execute start.bat
    echo 2. Verifique se nao ha outro processo na porta 5000
    echo 3. Verifique os logs em server/logs
) else (
    echo [OK] Servidor esta rodando!
)

pause
