# Requer privilégios de administrador
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Execute como Administrador!"
    exit 1
}

Write-Host "🔍 Verificando status da virtualização..."

# Verifica se a virtualização está habilitada no Windows
try {
    $hyperv = Get-WmiObject -Class Win32_ComputerSystem
    if ($hyperv.HypervisorPresent) {
        Write-Host "✅ Virtualização está ativada!"
    }
    else {
        Write-Host "❌ Virtualização desativada"
        Write-Host "🔄 Tentando ativar..."
        
        # Tenta ativar o hypervisor
        bcdedit /set hypervisorlaunchtype auto
        
        Write-Host "⚠️ Por favor, reinicie o computador para aplicar as alterações"
        Write-Host "📝 Se ainda não funcionar, você precisa ativar a virtualização na BIOS/UEFI"
    }
}
catch {
    Write-Host "❌ Erro ao verificar virtualização: $($_.Exception.Message)"
    exit 1
}
