# Script para limpar cache do Next.js
# Execute com: .\clear-cache.ps1

Write-Host "Limpando cache do Next.js..." -ForegroundColor Yellow

# Parar servidor se estiver rodando
Write-Host "Parando servidor Next.js..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Remover diretórios de cache
Write-Host "Removendo diretórios de cache..." -ForegroundColor Cyan

if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Cache .next removido" -ForegroundColor Green
}

if (Test-Path node_modules/.cache) {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✓ Cache node_modules removido" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cache limpo com sucesso!" -ForegroundColor Green
Write-Host "Execute 'npm run dev' para reiniciar o servidor" -ForegroundColor Yellow
