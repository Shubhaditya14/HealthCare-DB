#!/bin/bash

echo "=================================================="
echo "   Smart Healthcare System - All-in-One Runner    "
echo "=================================================="

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 0. Ollama Setup (for AI features)
echo ""
echo "[0/5] Checking Ollama (AI Service)..."
if command -v ollama &> /dev/null; then
    echo "Ollama is installed"

    # Check if Ollama is running
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "Starting Ollama server..."
        ollama serve &
        OLLAMA_PID=$!
        sleep 3
    else
        echo "Ollama is already running"
    fi

    # Check for required models
    echo "Checking for required AI models..."
    if ! ollama list 2>/dev/null | grep -q "llama3.2"; then
        echo "Pulling llama3.2 model (this may take a while)..."
        ollama pull llama3.2:latest
    fi
    if ! ollama list 2>/dev/null | grep -q "nomic-embed-text"; then
        echo "Pulling nomic-embed-text model..."
        ollama pull nomic-embed-text
    fi
    echo "AI models ready!"
else
    echo "WARNING: Ollama not installed. AI features will be disabled."
    echo "Install from: https://ollama.com"
fi

# 1. Backend Setup
echo ""
echo "[1/5] Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt -q
pip install python-dotenv -q

# Initialize Database
echo "Initializing database..."
rm -rf instance migrations 2>/dev/null

export FLASK_APP=run.py
flask db init 2>/dev/null
flask db migrate -m "Initial migration" 2>/dev/null
flask db upgrade 2>/dev/null

# Create Demo Users
echo "Creating demo users..."
python create_demo_users.py

# 2. Frontend Setup
echo ""
echo "[2/5] Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take a while)..."
    npm install
fi

# 3. Start Backend
echo ""
echo "[3/5] Starting Backend Server..."
cd ../backend
python run.py &
BACKEND_PID=$!
echo "Backend running on http://localhost:5001 (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 5

# 4. Load Synthetic AI Data
echo ""
echo "[4/5] Loading Synthetic Patient Data for AI..."
curl -s -X POST http://localhost:5001/api/ai/load-synthetic-data -H "Content-Type: application/json" -d '{"force": true}' || echo "Could not load synthetic data (backend may not be ready)"

# 5. Start Frontend
echo ""
echo "[5/5] Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!
echo "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "=================================================="
echo "   System is running! Access it at:               "
echo "   http://localhost:3000                          "
echo "=================================================="
echo "Press Ctrl+C to stop all services."

# Keep script running
wait
