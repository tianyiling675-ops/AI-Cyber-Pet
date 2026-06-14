$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$web = Join-Path $root "web"
$desktop = Join-Path $root "desktop"

Write-Host "Starting CyberPet backend..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$backend'; if (Test-Path .\.venv\Scripts\python.exe) { .\.venv\Scripts\python.exe run.py } else { python run.py }"
) -WindowStyle Hidden

Start-Sleep -Seconds 2

Write-Host "Starting CyberPet web..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$web'; npm.cmd run dev"
) -WindowStyle Hidden

Start-Sleep -Seconds 3

Write-Host "Starting CyberPet desktop..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$desktop'; npm.cmd run dev"
) -WindowStyle Hidden

Write-Host "CyberPet dev stack launched."
Write-Host "Mobile: http://localhost:5173/mobile"
Write-Host "Demo:   http://localhost:5173/demo"
Write-Host "Eval:   http://localhost:5173/eval"
