#!/bin/bash
echo "========================================"
echo "  HexaAgent - 六爻解卦智能体"
echo "========================================"
echo ""

# 启动后端
echo "[1/2] Starting backend on http://localhost:8000 ..."
cd "$(dirname "$0")/backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 启动前端
echo "[2/2] Starting frontend on http://localhost:5173 ..."
cd "$(dirname "$0")/frontend"
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting..."
echo "  本机访问:  http://localhost:5173"

# Show local IP for mobile access
LOCAL_IP=$(ipconfig 2>/dev/null | grep -o 'IPv4[^:]*: [0-9.]*' | grep -o '[0-9.]*$' | grep -v '127.0.0.1' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
fi
if [ -n "$LOCAL_IP" ]; then
    echo "  手机访问:  http://$LOCAL_IP:5173"
fi

echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
