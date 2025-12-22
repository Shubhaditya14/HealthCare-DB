#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Smart Healthcare System - All-in-One Runner    ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${RED}Stopping all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Backend Setup
echo -e "\n${GREEN}[1/4] Setting up Backend...${NC}"
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
pip install -r requirements.txt
pip install python-dotenv

# Initialize Database
echo "Initializing database..."
if [ -d "migrations" ]; then
    rm -rf migrations
fi

# Remove existing sqlite db if exists to start fresh
if [ -f "healthcare.db" ]; then
    rm healthcare.db
fi

export FLASK_APP=run.py
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Create Demo Users
echo "Creating demo users..."
python create_demo_users.py

# 2. Frontend Setup
echo -e "\n${GREEN}[2/4] Setting up Frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take a while)..."
    npm install
fi

# 3. Start Backend
echo -e "\n${GREEN}[3/4] Starting Backend Server...${NC}"
cd ../backend
python run.py &
BACKEND_PID=$!
echo "Backend running on http://localhost:5001 (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 5

# 4. Start Frontend
echo -e "\n${GREEN}[4/4] Starting Frontend Server...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!
echo "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${GREEN}   System is running! Access it at:${NC}"
echo -e "${GREEN}   http://localhost:3000${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "Press Ctrl+C to stop all services."

# Keep script running
wait
