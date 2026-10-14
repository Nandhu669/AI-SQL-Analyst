@echo off
title AI SQL Analyst Launcher
echo ========================================================
echo   Starting AI SQL Analyst (Backend + Frontend)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "AI SQL Analyst - Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Vite Frontend on http://127.0.0.1:5173 ...
start "AI SQL Analyst - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Both services are launching in dedicated windows!
echo   Frontend: http://127.0.0.1:5173
echo   Backend:  http://127.0.0.1:8000/docs
echo ========================================================
echo.
ping 127.0.0.1 -n 3 >nul
start http://127.0.0.1:5173
