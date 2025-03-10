# Script de configuração de segurança para o Husky
Write-Host "Configurando permissões de segurança para o Husky..."

# Configurar política de execução
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Verificar se o diretório .husky existe
if (Test-Path ".husky") {
    # Configurar permissões do pre-commit
    $acl = Get-Acl ".husky\pre-commit"
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "Users",
        "FullControl",
        "Allow"
    )
    $acl.SetAccessRule($accessRule)
    Set-Acl ".husky\pre-commit" $acl

    Write-Host "Permissões configuradas com sucesso!"
} else {
    Write-Error "Diretório .husky não encontrado!"
}
