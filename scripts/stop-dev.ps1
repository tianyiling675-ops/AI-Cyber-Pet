$ErrorActionPreference = "SilentlyContinue"

$root = (Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path
$processes = Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -and $_.CommandLine.Contains($root)
}

foreach ($process in $processes) {
  Stop-Process -Id $process.ProcessId -Force
}

Write-Host "Stopped CyberPet dev processes."
