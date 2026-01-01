touch PROJECT_STATE.md
touch PROMPT_FOR_CLAUDE_CODE.md
touch README.md

# Check and start Ollama
echo "Checking Ollama installation..."
if command -v ollama &> /dev/null; then
    echo "Ollama is installed"

    # Check if Ollama is running
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "Starting Ollama server..."
        ollama serve &
        sleep 3
    else
        echo "Ollama is already running"
    fi

    # Pull required models if not present
    echo "Checking for required models..."
    if ! ollama list | grep -q "mistral:7b"; then
        echo "Pulling mistral:7b model..."
        ollama pull mistral:7b
    fi
    if ! ollama list | grep -q "nomic-embed-text"; then
        echo "Pulling nomic-embed-text model..."
        ollama pull nomic-embed-text
    fi
else
    echo "WARNING: Ollama not installed. Install from https://ollama.com"
    echo "AI features will not work without Ollama"
fi

# Backend structure
mkdir -p backend/app/{models,routes,schemas,utils,services,data}
mkdir -p backend/migrations
mkdir -p backend/tests

# Backend files
touch backend/run.py
touch backend/requirements.txt
touch backend/.env
touch backend/.gitignore

# Backend app files
touch backend/app/__init__.py
touch backend/app/config.py

# Backend models
touch backend/app/models/__init__.py
touch backend/app/models/patient.py
touch backend/app/models/doctor.py
touch backend/app/models/appointment.py

# Backend routes
touch backend/app/routes/__init__.py
touch backend/app/routes/auth_routes.py
touch backend/app/routes/patient_routes.py
touch backend/app/routes/doctor_routes.py
touch backend/app/routes/appointment_routes.py

# Backend schemas
touch backend/app/schemas/__init__.py
touch backend/app/schemas/patient_schema.py
touch backend/app/schemas/doctor_schema.py
touch backend/app/schemas/appointment_schema.py

# Backend utils
touch backend/app/utils/__init__.py
touch backend/app/utils/decorators.py
touch backend/app/utils/error_handlers.py
touch backend/app/utils/sanitization.py

# Backend tests
touch backend/tests/__init__.py
touch backend/tests/test_patient_registration.py
touch backend/tests/test_security.py

# Frontend structure
mkdir -p frontend/public
mkdir -p frontend/src/{components/{common,patient,doctor},pages,contexts,utils,styles}

# Frontend public files
touch frontend/public/index.html
echo "# Place your company logo here as logo.png" > frontend/public/README.md

# Frontend root files
touch frontend/package.json
touch frontend/.env
touch frontend/.gitignore

# Frontend src files
touch frontend/src/index.jsx
touch frontend/src/index.css
touch frontend/src/App.jsx

# Common components
touch frontend/src/components/common/Navbar.jsx
touch frontend/src/components/common/Footer.jsx
touch frontend/src/components/common/ProtectedRoute.jsx
touch frontend/src/components/common/FormInput.jsx

# Patient components
touch frontend/src/components/patient/PatientRegister.jsx
touch frontend/src/components/patient/PatientLogin.jsx
touch frontend/src/components/patient/PatientDashboard.jsx
touch frontend/src/components/patient/AppointmentBooking.jsx

# Doctor components
touch frontend/src/components/doctor/DoctorRegister.jsx
touch frontend/src/components/doctor/DoctorLogin.jsx
touch frontend/src/components/doctor/DoctorDashboard.jsx

# Pages
touch frontend/src/pages/Home.jsx
touch frontend/src/pages/About.jsx
touch frontend/src/pages/NotFound.jsx
touch frontend/src/pages/Unauthorized.jsx

# Contexts
touch frontend/src/contexts/AuthContext.jsx

# Utils
touch frontend/src/utils/api.js
touch frontend/src/utils/validation.js

# Styles
touch frontend/src/styles/global.css
touch frontend/src/styles/navbar.css
touch frontend/src/styles/forms.css
touch frontend/src/styles/dashboard.css