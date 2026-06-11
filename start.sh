#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo "  HexaAgent - 六爻解卦智能体"
echo "========================================"
echo ""

# ── 检测 Python ──
PYTHON=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        ver=$("$cmd" --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
        if [ -n "$ver" ] && [ "$(echo "$ver" | awk -F. '{print $1}')" -ge 3 ] && [ "$(echo "$ver" | awk -F. '{print $2}')" -ge 10 ]; then
            PYTHON="$cmd"
            break
        fi
    fi
done

if [ -z "$PYTHON" ]; then
    echo "[Error] Python 3.10+ not found. Please install Python 3.10+ first."
    echo "  macOS:   brew install python@3.12"
    echo "  Ubuntu:  sudo apt install python3.12"
    echo "  Download: https://www.python.org/downloads/"
    exit 1
fi
echo "[OK] $($PYTHON --version)"

# ── 检测 Node.js ──
if ! command -v node &>/dev/null; then
    echo "[Error] Node.js not found. Please install Node.js 18+ first."
    echo "  macOS:   brew install node"
    echo "  Ubuntu:  sudo apt install nodejs"
    echo "  Download: https://nodejs.org/"
    exit 1
fi
NODE_VER=$(node --version | grep -oE '[0-9]+' | head -1)
if [ "$NODE_VER" -lt 18 ]; then
    echo "[Error] Node.js 18+ required. Current: $(node --version)"
    exit 1
fi
echo "[OK] node $(node --version)"

echo ""

# ── 安装前端依赖 ──
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "[Setup] Installing frontend dependencies..."
    cd "$SCRIPT_DIR/frontend"
    npm install
    cd "$SCRIPT_DIR"
fi

# ── 安装 Python 依赖 ──
if ! $PYTHON -c "import fastapi" 2>/dev/null; then
    echo "[Setup] Installing Python dependencies..."
    cd "$SCRIPT_DIR/backend"
    $PYTHON -m pip install -r requirements.txt
    cd "$SCRIPT_DIR"
fi

# ── 初始化知识库 ──
if [ ! -f "$SCRIPT_DIR/backend/data/chroma_db/guji_index.json" ]; then
    echo "[Setup] Initializing knowledge base..."
    cd "$SCRIPT_DIR/backend"
    $PYTHON scripts/init_kb.py
    cd "$SCRIPT_DIR"
fi

echo ""

# ── 启动后端 ──
echo "[1/2] Starting backend on http://localhost:8000 ..."
cd "$SCRIPT_DIR/backend"
$PYTHON -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# ── 启动前端 ──
echo "[2/2] Starting frontend on http://localhost:5173 ..."
cd "$SCRIPT_DIR/frontend"
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ""
echo "Both servers are starting..."
echo "  本机访问：http://localhost:5173"

# ── 局域网 IP（供手机访问） ──
LOCAL_IP=""
if command -v ifconfig &>/dev/null; then
    LOCAL_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
fi
if [ -n "$LOCAL_IP" ]; then
    echo "  手机访问：http://$LOCAL_IP:5173"
fi

echo ""
echo "Press Ctrl+C to stop both servers."

# ── 优雅退出 ──
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Done."
    exit 0
}
trap cleanup INT TERM

wait
