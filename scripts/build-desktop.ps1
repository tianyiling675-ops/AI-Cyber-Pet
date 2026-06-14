$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$web = Join-Path $root "web"
$desktop = Join-Path $root "desktop"

Write-Host "Building web assets..."
Set-Location $web
npm.cmd run build

Write-Host "Building Electron unpacked exe..."
Set-Location $desktop
npm.cmd run build

Write-Host "Done. Check desktop\dist\win-unpacked\CyberPet.exe."
