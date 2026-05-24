#!/bin/bash
echo "========================================"
echo "  HexaAgent - 一键安装"
echo "========================================"
echo ""

ROOT="$(dirname "$0")"

echo "[1/3] Installing Python dependencies..."
cd "$ROOT/backend"
pip install -r requirements.txt

echo ""
echo "[2/3] Installing Node.js dependencies..."
cd "$ROOT/frontend"
npm install

echo ""
echo "[3/3] Initializing knowledge base..."
cd "$ROOT/backend"
python scripts/init_kb.py

echo ""
echo "========================================"
echo "  Installation complete!"
echo "========================================"
echo ""
echo "  Run ./start.sh to launch HexaAgent"
echo "  First launch will show API key setup page"
echo ""
