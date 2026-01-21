#!/bin/bash
set -euo pipefail

echo "=================================================="
echo "   Smart Healthcare System - All-in-One Runner    "
echo "=================================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3.11}"

cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

echo ""
echo "[0/6] Checking Ollama (AI Service)..."
if command -v ollama &> /dev/null; then
    echo "Ollama is installed"

    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "Starting Ollama server..."
        ollama serve &
        OLLAMA_PID=$!
        sleep 3
    else
        echo "Ollama is already running"
    fi

    echo "Checking for required AI models..."
    if ! ollama list 2>/dev/null | grep -q "llama3.2"; then
        echo "Pulling llama3.2:latest model (chat)..."
        ollama pull llama3.2:latest
    fi
    if ! ollama list 2>/dev/null | grep -q "nomic-embed-text"; then
        echo "Pulling nomic-embed-text (embeddings)..."
        ollama pull nomic-embed-text
    fi
    echo "AI models ready!"
else
    echo "WARNING: Ollama not installed. AI chat/RAG features will be disabled."
    echo "Install from: https://ollama.com"
fi

# Check local CV model artifacts
echo ""
echo "[1/6] Verifying on-device DR model artifacts..."
if [ -f "$PROJECT_ROOT/model/final_dr_model.keras" ] || { [ -f "$PROJECT_ROOT/model/config.json" ] && [ -f "$PROJECT_ROOT/model/model.weights.h5" ]; }; then
    echo "Retinopathy model files found."
else
    echo "WARNING: Retinopathy model files missing in $PROJECT_ROOT/model. Place final_dr_model.keras OR config.json + model.weights.h5 to enable DR screening."
fi

echo ""
echo "[2/6] Setting up Backend..."
cd "$PROJECT_ROOT/backend"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    "$PYTHON_BIN" -m venv venv
fi

source venv/bin/activate

echo "Installing backend dependencies (ordered to reduce macOS wheel issues)..."
pip install --upgrade pip >/dev/null
pip install "numpy==1.26.4" >/dev/null
pip install "Pillow==10.4.0" >/dev/null
pip install "Werkzeug==3.1.5" >/dev/null
pip install "Flask==3.1.2" >/dev/null
pip uninstall -y tensorflow-macos tensorflow-metal >/dev/null 2>&1 || true
pip install "tensorflow==2.16.1" >/dev/null
pip install "opencv-python==4.10.0.84" >/dev/null
pip install -r requirements.txt >/dev/null
pip install python-dotenv >/dev/null

# Warn if TensorFlow/Keras isn't available on this Python version (robust to shadowed importlib/pkgutil)
python - <<'PY'
import sys

def has_module(name: str) -> bool:
    # Try importlib.util.find_spec
    try:
        import importlib.util as iu
        if hasattr(iu, "find_spec") and iu.find_spec(name):
            return True
    except Exception:
        pass
    # Try pkgutil.find_loader if present
    try:
        import pkgutil
        if hasattr(pkgutil, "find_loader") and pkgutil.find_loader(name):
            return True
    except Exception:
        pass
    return False

ver = f"{sys.version_info.major}.{sys.version_info.minor}"
tf = any(has_module(m) for m in ["tensorflow", "tensorflow_macos", "tensorflow_cpu", "tensorflow-cpu"])
keras = has_module("keras")

if not keras:
    print(f"WARNING: Keras not installed (Python {ver} may not be supported). Retinopathy screening will be disabled. Use Python 3.10/3.11 for supported wheels.")
elif not tf:
    print(f"WARNING: TensorFlow backend not installed (Python {ver} may not be supported). Retinopathy screening will be disabled. Use Python 3.10/3.11 for GPU/CPU builds.")
PY

echo "Running database migrations..."
export FLASK_APP=run.py
if [ ! -d "migrations" ]; then
    flask db init >/dev/null
    flask db migrate -m "Initial migration" >/dev/null
fi
flask db upgrade >/dev/null

echo "Creating demo users..."
python create_demo_users.py >/dev/null || echo "Warning: could not create demo users."

echo ""
echo "[3/6] Setting up Frontend..."
cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take a while)..."
    npm install >/dev/null
fi

echo ""
echo "[4/6] Starting Backend Server..."
cd "$PROJECT_ROOT/backend"
python run.py &
BACKEND_PID=$!
echo "Backend running on http://localhost:5001 (PID: $BACKEND_PID)"
sleep 5

echo ""
echo "[5/6] Loading Synthetic Patient Data for AI..."
curl -s -X POST http://localhost:5001/api/ai/load-synthetic-data -H "Content-Type: application/json" -d '{"force": true}' || echo "Could not load synthetic data (backend may not be ready)"

echo ""
echo "[6/6] Starting Frontend Server..."
cd "$PROJECT_ROOT/frontend"
npm start &
FRONTEND_PID=$!
echo "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "=================================================="
echo "   System is running! Access it at:               "
echo "   http://localhost:3000                          "
echo "=================================================="
echo "Press Ctrl+C to stop all services."

wait
