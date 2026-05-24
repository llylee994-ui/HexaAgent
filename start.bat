@echo off
chcp 65001 >nul
echo ========================================
echo   HexaAgent - 六爻解卦智能体
echo ========================================
echo.

echo [1/2] Starting backend on http://localhost:8000 ...
start "HexaAgent Backend" cmd /c "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting frontend on http://localhost:5173 ...
start "HexaAgent Frontend" cmd /c "cd /d %~dp0frontend && npx vite --host 0.0.0.0 --port 5173"

echo.
echo Both servers are starting...
echo   Backend API:  http://localhost:8000/docs
echo.
echo   -------- 访问方式 --------
echo   本机访问:  http://localhost:5173

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" 2^>nul') do (
    setlocal enabledelayedexpansion
    set ip=%%a
    set ip=!ip: =!
    if not "!ip!"=="" if not "!ip!"=="127.0.0.1" (
        echo   手机访问:  http://!ip!:5173
        goto :found
    )
    endlocal
)
:found

echo.
echo   提示: 手机和电脑需在同一 WiFi 下
echo   扫码: 打开手机浏览器访问上方地址
echo.
echo Close this window or the server windows to stop.
pause
