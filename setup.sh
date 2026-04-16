#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# Amazon Clone - Quick Start Script
# Usage: bash setup.sh
# ─────────────────────────────────────────────────────────────────
set -e

echo ""
echo "🛒  Amazon Clone - Setup"
echo "═══════════════════════════════════════"

# ── 1. Backend ────────────────────────────────────────────────────
echo ""
echo "📦  Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "✓  Virtual environment created"
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate

pip install -q -r requirements.txt
echo "✓  Python dependencies installed"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✓  .env created from .env.example"
  echo "⚠️   Edit backend/.env to set your DATABASE_URL"
fi

echo ""
echo "🗄️   To seed the database, run:"
echo "    cd backend && source venv/bin/activate && python seed.py"

cd ..

# ── 2. Frontend ───────────────────────────────────────────────────
echo ""
echo "⚛️   Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✓  .env created from .env.example"
fi

npm install --silent
echo "✓  Node dependencies installed"

cd ..

# ── 3. Done ───────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════"
echo "✅  Setup complete!"
echo ""
echo "🚀  Start commands:"
echo ""
echo "   Backend:   cd backend && source venv/bin/activate && python seed.py && uvicorn app.main:app --reload"
echo "   Frontend:  cd frontend && npm start"
echo ""
echo "   OR use Docker:  docker-compose up --build"
echo ""
echo "   API Docs:   http://localhost:8000/docs"
echo "   App:        http://localhost:3000"
echo "   Login:      test@example.com / password123"
echo "═══════════════════════════════════════"
