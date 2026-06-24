@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   HexaAgent - Liu Yao AI Agent
echo ========================================
echo.

REM --- Find Python ---
set PYTHON=
set PIP=
for %%c in (python3 python py) do (
    if "!PYTHON!"=="" (
        %%c --version >nul 2>&1
        if !errorlevel! equ 0 (
            set PYTHON=%%c
            set PIP=%%c -m pip
        )
    )
)

if "%PYTHON%"=="" (
    echo [Error] Python not found. Please install Python 3.10+ first.
    echo.
    echo    Troubleshooting:
    echo    1. Install from https://www.python.org/downloads/
    echo    2. CHECK "Add Python to PATH" during installation!
    echo    3. If already installed, re-run the installer and
    echo       choose "Modify" ^> check "Add to PATH"
    echo    4. Or try: py --version (Python launcher)
    echo.
    pause
    exit /b 1
)

REM --- Verify Python version ---
for /f "tokens=2 delims= " %%v in ('%PYTHON% --version 2^>^&1') do set PY_VER=%%v
echo [OK] Python %PY_VER%

REM --- Find Node.js ---
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [Error] Node.js not found. Please install Node.js 18+ first.
    echo   Download: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=1 delims=v" %%v in ('node --version 2^>^&1') do set NODE_VER=%%v
echo [OK] Node.js v%NODE_VER%

echo.

REM --- Install frontend deps ---
if not exist "%~dp0frontend\node_modules" (
    echo [Setup] Installing frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
    if !errorlevel! neq 0 (
        echo [Error] npm install failed.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)

REM --- Install Python deps ---
%PYTHON% -c "import fastapi" 2>nul
if %errorlevel% neq 0 (
    echo [Setup] Installing Python dependencies...
    cd /d "%~dp0backend"
    %PIP% install -r requirements.txt
    if !errorlevel! neq 0 (
        echo [Error] pip install failed. Try running manually:
        echo   %PYTHON% -m pip install -r requirements.txt
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)

REM --- Init knowledge base ---
if not exist "%~dp0backend\data\chroma_db\guji_index.json" (
    echo [Setup] Initializing knowledge base...
    cd /d "%~dp0backend"
    %PYTHON% scripts/init_kb.py
    cd /d "%~dp0"
)

echo.
echo [1/2] Starting backend ...
start "HexaAgent Backend" cmd /k "cd /d %~dp0backend && %PYTHON% -m uvicorn main:app --host 0.0.0.0 --port 8000"

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
