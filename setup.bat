@echo off
chcp 65001 >nul
echo ========================================
echo   HexaAgent - 一键安装
echo ========================================
echo.

echo [1/3] Installing Python dependencies...
cd /d "%~dp0backend"
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Python dependency install failed
    pause
    exit /b 1
)

echo.
echo [2/3] Installing Node.js dependencies...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo Error: Node dependency install failed
    pause
    exit /b 1
)

echo.
echo [3/3] Initializing knowledge base...
cd /d "%~dp0backend"
python scripts/init_kb.py

echo.
echo ========================================
echo   Installation complete!
echo ========================================
echo.
echo   Run start.bat to launch HexaAgent
echo   First launch will show API key setup page
echo.
pause
