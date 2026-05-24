@echo off
echo ========================================
echo   HexaAgent - Liu Yao AI Agent
echo ========================================
echo.

REM Check if deps need installing
if not exist "%~dp0frontend\node_modules" (
    echo [Setup] Installing frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
)
if not exist "%~dp0frontend\node_modules" (
    echo Error: npm install failed. Check Node.js installation.
    pause
    exit /b 1
)

REM Check Python deps
python -c "import fastapi" 2>nul
if %errorlevel% neq 0 (
    echo [Setup] Installing Python dependencies...
    cd /d "%~dp0backend"
    pip install -r requirements.txt
    cd /d "%~dp0"
)

REM Init knowledge base if needed
if not exist "%~dp0backend\data\guji_index.json" (
    echo [Setup] Initializing knowledge base...
    cd /d "%~dp0backend"
    python scripts/init_kb.py
    cd /d "%~dp0"
)

echo.
echo [1/2] Starting backend ...
start "HexaAgent Backend" cmd /c "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting frontend ...
start "HexaAgent Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Backend API   http://localhost:8000/docs
echo   Frontend UI   http://localhost:5173
echo.
echo   Mobile: same WiFi, open http://YOUR_IP:5173
echo ========================================
echo.
pause
