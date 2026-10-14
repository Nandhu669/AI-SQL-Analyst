# AI SQL Analyst Launcher for PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting AI SQL Analyst (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$rootDir\backend`" && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Starting Vite Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$rootDir\frontend`" && npm run dev"

Write-Host ""
Write-Host "Both services are running in their own windows." -ForegroundColor Cyan
Write-Host "Opening http://127.0.0.1:5173 in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:5173"
