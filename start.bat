@echo off
chcp 65001 >nul
echo ========================================
echo   HexaAgent - 六爻解卦智能体
echo ========================================
echo.

echo [1/2] Starting backend ...
cd /d "%~dp0backend"
start "Backend" python -m uvicorn main:app --host 0.0.0.0 --port 8000

echo [2/2] Starting frontend ...
cd /d "%~dp0frontend"
start "Frontend" npm run dev

echo.
echo Both servers are starting...
echo   本机访问: http://localhost:5173

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" 2^>nul') do (
    set ip=%%a
    set ip=!ip: =!
    if not "!ip!"=="" if not "!ip!"=="127.0.0.1" (
        echo   手机访问: http://!ip!:5173
    )
)
echo.
pause
