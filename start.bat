@echo off
echo ========================================
echo   HexaAgent - 六爻解卦智能体
echo ========================================
echo.

echo [1/2] Starting backend on http://localhost:8000 ...
start "HexaAgent Backend" cmd /c "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo [2/2] Starting frontend on http://localhost:5173 ...
start "HexaAgent Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting...
echo   Backend API:  http://localhost:8000/docs
echo   Frontend UI:  http://localhost:5173
echo.
echo Close this window or the server windows to stop.
pause
