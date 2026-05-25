@echo off
echo ========================================
echo   HexaAgent - Liu Yao AI Agent
echo ========================================
echo.

REM --- Pre-flight checks ---
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [Error] Python not found. Please install Python 3.10+ first.
    echo   Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [Error] Node.js not found. Please install Node.js 18+ first.
    echo   Download: https://nodejs.org/
    pause
    exit /b 1
)

REM --- Install deps if needed ---
if not exist "%~dp0frontend\node_modules" (
    echo [Setup] Installing frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
    if %errorlevel% neq 0 (
        echo [Error] npm install failed.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)

python -c "import fastapi" 2>nul
if %errorlevel% neq 0 (
    echo [Setup] Installing Python dependencies...
    cd /d "%~dp0backend"
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [Error] pip install failed.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)

if not exist "%~dp0backend\data\guji_index.json" (
    echo [Setup] Initializing knowledge base...
    cd /d "%~dp0backend"
    python scripts/init_kb.py
    cd /d "%~dp0"
)

echo.
echo [1/2] Starting backend ...
start "HexaAgent Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting frontend ...
start "HexaAgent Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Backend API   http://localhost:8000/docs
echo   Frontend UI   http://localhost:5173
echo.
echo   If backend window shows errors, check:
echo   - Is .env configured with API key?
echo   - Is port 8000 free?
echo ========================================
echo.
pause
