#!/usr/bin/env bash

echo "============================================================"
echo "       MINI AUDIT DOCUMENT REVIEW SYSTEM - STARTUP          "
echo "============================================================"

if [ -d "backend/.venv" ]; then
    PYTHON_CMD="backend/.venv/bin/python"
else
    PYTHON_CMD="python3"
fi

(cd backend && $PYTHON_CMD -m app.seed > /dev/null 2>&1)

echo "[1/2] Starting FastAPI Backend on http://localhost:8000..."
(cd backend && $PYTHON_CMD -m uvicorn app.main:app --reload --port 8000) &
BACKEND_PID=$!

echo "[2/2] Starting Next.js Frontend on http://localhost:3000..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
