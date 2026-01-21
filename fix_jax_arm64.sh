#!/bin/bash
set -euo pipefail

echo "==============================================="
echo "   Fix TensorFlow/JAX ARM64 macOS Issue       "
echo "==============================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Use conda ARM64 Python 3.10 environment
if [ ! -d "/opt/anaconda3/envs/dbms/bin" ]; then
    echo "ERROR: Conda environment 'dbms' not found"
    echo "Run: conda create -y -n dbms python=3.10"
    exit 1
fi

PYTHON_BIN="/opt/anaconda3/envs/dbms/bin/python"
echo "Using: $PYTHON_BIN"
$PYTHON_BIN --version
$PYTHON_BIN -c "import platform; print(f'Python arch: {platform.machine()}')"

echo ""
echo "[1/4] Removing old venv with x86_64 packages..."
rm -rf "$PROJECT_ROOT/backend/venv"

echo ""
echo "[2/4] Creating new venv with ARM64 Python..."
cd "$PROJECT_ROOT/backend"
$PYTHON_BIN -m venv venv
source venv/bin/activate

echo ""
echo "[3/4] Installing ARM64 jaxlib first..."
/opt/anaconda3/envs/dbms/bin/pip install --no-deps --target=venv/lib/python3.10/site-packages \
    "jax==0.4.30" \
    "jaxlib==0.4.30" \
    "ml-dtypes>=0.2.0" \
    "numpy<1.24,>=1.22" \
    "opt-einsum" \
    "scipy"

echo ""
echo "[4/4] Installing all remaining dependencies..."
pip install --upgrade pip
pip install python-dotenv
pip install -r requirements.txt

echo ""
echo "Testing imports..."
python -c "import jax; import jaxlib; print(f'jax: {jax.__version__}, jaxlib: {jaxlib.__version__}')"
python -c "import tensorflow as tf; print(f'TensorFlow version: {tf.__version__}')"
python -c "import keras; print(f'Keras version: {keras.__version__}')"

echo ""
echo "Fix complete! Run ./run_everything.sh to start the system."