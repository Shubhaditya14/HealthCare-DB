#!/bin/bash
set -euo pipefail

echo "==============================================="
echo "   Smart Healthcare System - Setup Assistant   "
echo "==============================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect conda Python 3.10 environment for ARM64 macOS
if [ -d "/opt/anaconda3/envs/dbms/bin" ]; then
    PYTHON_BIN="/opt/anaconda3/envs/dbms/bin/python"
else
PYTHON_BIN="${PYTHON_BIN:-python3.11}"
fi

echo ""
echo "[1/5] Checking Ollama (optional for AI chat/RAG)..."
if command -v ollama &> /dev/null; then
    echo "Ollama detected."
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "Starting Ollama server..."
        ollama serve >/dev/null 2>&1 &
        sleep 3
    fi
    if ! ollama list 2>/dev/null | grep -q "llama3.2"; then
        echo "Pulling llama3.2:latest..."
        ollama pull llama3.2:latest
    fi
    if ! ollama list 2>/dev/null | grep -q "nomic-embed-text"; then
        echo "Pulling nomic-embed-text..."
        ollama pull nomic-embed-text
    fi
else
    echo "Ollama not installed. Install from https://ollama.com to enable chat/RAG features."
fi

echo ""
echo "[2/5] Verifying on-device DR model artifacts..."
if [ -f "$PROJECT_ROOT/model/final_dr_model.keras" ] || { [ -f "$PROJECT_ROOT/model/config.json" ] && [ -f "$PROJECT_ROOT/model/model.weights.h5" ]; }; then
    echo "Retinopathy model files present."
else
    echo "WARNING: Missing final_dr_model.keras OR model/config.json + model/model.weights.h5. Place the pretrained DR model to enable screening."
fi

echo ""
echo "[3/5] Preparing backend virtual environment..."
cd "$PROJECT_ROOT/backend"
if [ -d "venv" ]; then
    echo "Recreating backend virtual environment for a clean, conflict-free install..."
    rm -rf venv
fi
echo "Creating virtual environment..."
"$PYTHON_BIN" -m venv venv
source venv/bin/activate
pip install --upgrade pip >/dev/null
echo "Installing backend dependencies (ordered to reduce macOS wheel issues)..."
pip install "numpy==1.26.4"
pip install "Pillow==10.4.0"
pip install "Werkzeug==3.1.5"
pip install "Flask==3.1.2"
pip uninstall -y tensorflow-macos tensorflow-metal >/dev/null 2>&1 || true
pip install "tensorflow==2.16.1"
pip install "opencv-python==4.10.0.84"
pip install -r requirements.txt
pip install python-dotenv >/dev/null

python - <<'PY'
import sys

def has_module(name: str) -> bool:
    try:
        import importlib.util as iu
        if hasattr(iu, "find_spec") and iu.find_spec(name):
            return True
    except Exception:
        pass
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
    print(f"WARNING: TensorFlow backend not installed (Python {ver} may not be supported). Retinopathy screening will be disabled. Use Python 3.10/3.11 for supported TF wheels.")
PY

echo ""
echo "[4/5] Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "node_modules already present; skipping npm install."
fi

echo ""
echo "[5/5] Database bootstrap (optional)..."
cd "$PROJECT_ROOT/backend"
export FLASK_APP=run.py
if [ ! -d "migrations" ]; then
    flask db init
    flask db migrate -m "Initial migration"
fi
flask db upgrade
python create_demo_users.py || echo "Warning: could not create demo users."

echo ""
echo "Setup complete! To run everything, execute: ./run_everything.sh"
