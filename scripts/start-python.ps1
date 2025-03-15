Write-Host "🐍 Iniciando ambiente Python..."

# Verifica se Python está instalado
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python não encontrado! Por favor, instale Python 3.8 ou superior"
    exit 1
}

# Ativa ambiente virtual
if (Test-Path "..\venv\Scripts\activate.ps1") {
    Write-Host "✅ Ativando ambiente virtual..."
    & "..\venv\Scripts\activate.ps1"
}
else {
    Write-Host "🔄 Criando novo ambiente virtual..."
    python -m venv ..\venv
    & "..\venv\Scripts\activate.ps1"
}

# Instala dependências
if (Test-Path "..\server\requirements.txt") {
    Write-Host "📦 Instalando dependências..."
    pip install -r ..\server\requirements.txt
}

# Inicia o servidor Flask
Write-Host "🚀 Iniciando servidor Python..."
Set-Location ..\server
python app.py
