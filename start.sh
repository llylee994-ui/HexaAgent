#!/bin/bash
echo "========================================"
echo "  HexaAgent - 六爻解卦智能体"
echo "========================================"
echo ""

# 启动后端
echo "[1/2] Starting backend on http://localhost:8000 ..."
cd "$(dirname "$0")/backend"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 启动前端
echo "[2/2] Starting frontend on http://localhost:5173 ..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting..."
echo "  Backend API:  http://localhost:8000/docs"
echo "  Frontend UI:  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
