import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <header className="about-header">
          <h1>About Smart Healthcare System</h1>
          <p className="about-subtitle">
            A modern web application for healthcare management with AI-powered clinical decision support
          </p>
        </header>

        {/* System Overview */}
        <section className="about-section">
          <h2>System Overview</h2>
          <div className="system-diagram">
            <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                     SMART HEALTHCARE SYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  REACT FRONTEND  │◄────────────►│  FLASK BACKEND   │        │
│  │  (Port 3000)     │   REST API   │  (Port 5001)     │        │
│  └──────────────────┘   + JWT      └────────┬─────────┘        │
│                                             │                   │
│                                    ┌────────▼─────────┐        │
│                                    │   SQLite                  │
│                                    │    Database      │        │
│                                    └──────────────────┘        │
│                                             │                   │
│                                    ┌────────▼─────────┐        │
│                                    │  OLLAMA LLM      │        │
│                                    │  (Port 11434)    │        │
│                                    └──────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
          <p>
            Smart Healthcare System is a comprehensive web application designed to streamline
            healthcare management. It provides separate portals for patients and doctors,
            enabling appointment booking, medical record management, and AI-powered clinical
            decision support.
          </p>
          <div className="capabilities-list">
            <h3>Key Capabilities:</h3>
            <ul>
              <li>Patients can register, login, book appointments with doctors, and view their appointment history</li>
              <li>Doctors can register with license verification, manage their appointments, and update appointment statuses</li>
              <li>AI-powered drug interaction checking to identify medication conflicts</li>
              <li>Intelligent prescription suggestions based on diagnosis and patient context</li>
              <li>RAG-based patient history search for semantic medical record retrieval</li>
              <li>Secure authentication with JWT tokens</li>
            </ul>
          </div>
        </section>

        {/* Access URLs */}
        <section className="about-section">
          <h2>Access URLs & Endpoints</h2>

          <div className="urls-block">
            <h3>Service URLs</h3>
            <div className="urls-grid">
              <div className="url-item">
                <span className="url-label">Frontend:</span>
                <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">http://localhost:3000</a>
              </div>
              <div className="url-item">
                <span className="url-label">Backend API:</span>
                <a href="http://localhost:5001/api" target="_blank" rel="noopener noreferrer">http://localhost:5001/api</a>
              </div>
              <div className="url-item">
                <span className="url-label">Ollama LLM:</span>
                <a href="http://localhost:11434" target="_blank" rel="noopener noreferrer">http://localhost:11434</a>
              </div>
            </div>
          </div>

          <div className="urls-block">
            <h3>Frontend Routes</h3>
            <table className="urls-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>URL</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Home</td>
                  <td><a href="http://localhost:3000/" target="_blank" rel="noopener noreferrer">http://localhost:3000/</a></td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>About</td>
                  <td><a href="http://localhost:3000/about" target="_blank" rel="noopener noreferrer">http://localhost:3000/about</a></td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>Patient Login</td>
                  <td><a href="http://localhost:3000/patient/login" target="_blank" rel="noopener noreferrer">http://localhost:3000/patient/login</a></td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>Patient Register</td>
                  <td><a href="http://localhost:3000/patient/register" target="_blank" rel="noopener noreferrer">http://localhost:3000/patient/register</a></td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>Patient Dashboard</td>
                  <td><a href="http://localhost:3000/patient/dashboard" target="_blank" rel="noopener noreferrer">http://localhost:3000/patient/dashboard</a></td>
                  <td>Protected (Patient)</td>
                </tr>
                <tr>
                  <td>Doctor Login</td>
                  <td><a href="http://localhost:3000/doctor/login" target="_blank" rel="noopener noreferrer">http://localhost:3000/doctor/login</a></td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>Doctor Register</td>
                  <td><a href="http://localhost:3000/doctor/register" target="_blank" rel="noopener noreferrer">http://localhost:3000/doctor/register</a></td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>Doctor Dashboard</td>
                  <td><a href="http://localhost:3000/doctor/dashboard" target="_blank" rel="noopener noreferrer">http://localhost:3000/doctor/dashboard</a></td>
                  <td>Protected (Doctor)</td>
                </tr>
                <tr>
                  <td>AI Dashboard</td>
                  <td><a href="http://localhost:3000/ai-dashboard" target="_blank" rel="noopener noreferrer">http://localhost:3000/ai-dashboard</a></td>
                  <td>Protected (Doctor)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* UI Architecture */}
        <section className="about-section">
          <h2>Frontend Architecture</h2>
          <div className="architecture-block">
            <h3>React Single-Page Application (SPA)</h3>
            <div className="code-block">
              <pre>{`Component Structure:
├── App.jsx                 # Main router with all routes
├── AuthContext            # Global authentication state (JWT tokens, user info)
├── Common Components
│   ├── Navbar             # Navigation with logo
│   ├── Footer             # Site footer
│   ├── ProtectedRoute     # Route wrapper for auth
│   └── FormInput          # Reusable form component
├── Patient Components
│   ├── Registration       # Patient signup form
│   ├── Login              # Patient login form
│   ├── Dashboard          # Appointments overview
│   └── AppointmentBooking # Book new appointments
├── Doctor Components
│   ├── Registration       # Doctor signup form
│   ├── Login              # Doctor login form
│   ├── Dashboard          # Manage appointments
│   ├── DrugInteractionChecker  # AI drug check
│   ├── PrescriptionAssistant   # AI prescriptions
│   └── PatientHistorySearch    # RAG search
└── Pages
    ├── Home               # Landing page
    ├── About              # This page
    └── AIDashboard        # AI features hub`}</pre>
            </div>
            <h4>Routing (React Router v6):</h4>
            <ul>
              <li><strong>Public routes:</strong> /, /about, /patient/login, /doctor/login, etc.</li>
              <li><strong>Protected routes:</strong> /patient/dashboard, /doctor/dashboard, /ai-dashboard (require valid JWT)</li>
            </ul>
            <h4>State Management:</h4>
            <ul>
              <li>React Context API for global auth state</li>
              <li>React Hook Form + Zod for form validation</li>
              <li>Axios interceptors for automatic token refresh</li>
            </ul>
          </div>
        </section>

        {/* Backend Architecture */}
        <section className="about-section">
          <h2>Backend Architecture</h2>
          <div className="architecture-block">
            <h3>Flask RESTful API</h3>
            <div className="code-block">
              <pre>{`Structure:
├── app/
│   ├── __init__.py        # Flask app factory
│   ├── config.py          # Configuration
│   ├── models/            # SQLAlchemy ORM models
│   │   ├── patient.py
│   │   ├── doctor.py
│   │   ├── appointment.py
│   │   ├── prescription.py
│   │   └── medical_record.py
│   ├── routes/            # API endpoints
│   │   ├── auth_routes.py
│   │   ├── patient_routes.py
│   │   ├── doctor_routes.py
│   │   ├── appointment_routes.py
│   │   └── ai_routes.py
│   ├── services/          # AI Business logic
│   │   ├── ai_service.py       # Ollama wrapper
│   │   ├── drug_checker.py     # Drug interactions
│   │   ├── prescription_ai.py  # Rx suggestions
│   │   └── rag_service.py      # History search
│   ├── schemas/           # Marshmallow validation
│   └── utils/             # Helpers & decorators
└── run.py                 # Entry point`}</pre>
            </div>
            <h4>Authentication Flow:</h4>
            <ol>
              <li>User submits credentials to /api/auth/login</li>
              <li>Flask validates against database</li>
              <li>If valid, generates JWT tokens (access + refresh)</li>
              <li>Frontend stores tokens in localStorage</li>
              <li>All subsequent requests include JWT in Authorization header</li>
              <li>Flask validates JWT with @jwt_required decorator</li>
            </ol>
          </div>
        </section>

        {/* AI Services */}
        <section className="about-section">
          <h2>AI Services Architecture</h2>
          <div className="ai-services-grid">
            <div className="ai-service-card">
              <h3>Drug Interaction Checker</h3>
              <p>Two-tier approach for medication safety:</p>
              <ul>
                <li><strong>Tier 1:</strong> Rule-based database with 10+ known interactions</li>
                <li><strong>Tier 2:</strong> LLM analysis for comprehensive checking</li>
                <li>Allergy matching and severity classification</li>
                <li>Returns: warnings, severity level, safety status</li>
              </ul>
              <div className="code-block small">
                <pre>{`POST /api/ai/check-interactions
{
  "medications": ["warfarin", "aspirin"],
  "patient_allergies": ["penicillin"]
}`}</pre>
              </div>
            </div>

            <div className="ai-service-card">
              <h3>Prescription Assistant</h3>
              <p>AI-powered prescription suggestions:</p>
              <ul>
                <li>Treatment guidelines for common conditions</li>
                <li>Patient context-aware recommendations</li>
                <li>Considers age, allergies, current medications</li>
                <li>Automatic interaction checking on suggestions</li>
              </ul>
              <div className="code-block small">
                <pre>{`POST /api/ai/suggest-prescription
{
  "diagnosis": "hypertension",
  "patient_age": 55,
  "patient_allergies": ["sulfa"]
}`}</pre>
              </div>
            </div>

            <div className="ai-service-card">
              <h3>Patient History Search (RAG)</h3>
              <p>Semantic search over medical records:</p>
              <ul>
                <li>Vector embeddings via nomic-embed-text</li>
                <li>Cosine similarity for relevance matching</li>
                <li>LLM summarization of results</li>
                <li>Natural language Q&A on patient history</li>
              </ul>
              <div className="code-block small">
                <pre>{`POST /api/ai/search-history
{
  "patient_id": 1,
  "query": "cardiac history"
}`}</pre>
              </div>
            </div>
          </div>

          <div className="ollama-block">
            <h3>Ollama Integration</h3>
            <div className="code-block">
              <pre>{`Ollama Service (Port 11434)
├── Models:
│   ├── llama3.2:latest    # Chat & Generation (3.2B params)
│   └── nomic-embed-text   # Vector Embeddings
│
├── Endpoints Used:
│   ├── GET  /api/tags       → List available models
│   ├── POST /api/generate   → Text generation
│   ├── POST /api/chat       → Chat completion
│   └── POST /api/embeddings → Generate embeddings`}</pre>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="about-section">
          <h2>Security Features</h2>
          <div className="security-grid">
            <div className="security-item">
              <h4>1. Input Validation</h4>
              <ul>
                <li><strong>Client-side:</strong> Zod schemas (UX, immediate feedback)</li>
                <li><strong>Server-side:</strong> Marshmallow schemas (authoritative)</li>
                <li><strong>Database:</strong> Constraints (last line of defense)</li>
              </ul>
            </div>
            <div className="security-item">
              <h4>2. Authentication</h4>
              <ul>
                <li>Password hashing with pbkdf2:sha256</li>
                <li>JWT tokens with short expiry (1 hour access, 30 day refresh)</li>
                <li>Automatic token refresh when expired</li>
              </ul>
            </div>
            <div className="security-item">
              <h4>3. Rate Limiting</h4>
              <ul>
                <li>5 registration attempts per hour per IP</li>
                <li>10 login attempts per 5 minutes per IP</li>
                <li>Prevents brute force attacks</li>
              </ul>
            </div>
            <div className="security-item">
              <h4>4. SQL Injection Prevention</h4>
              <ul>
                <li>SQLAlchemy ORM with parameterized queries</li>
                <li>No raw SQL string concatenation</li>
              </ul>
            </div>
            <div className="security-item">
              <h4>5. XSS Prevention</h4>
              <ul>
                <li>React auto-escapes output by default</li>
                <li>Server-side output escaping for JSON responses</li>
              </ul>
            </div>
            <div className="security-item">
              <h4>6. Authorization</h4>
              <ul>
                <li>Protected routes check user type</li>
                <li>Patients can't access doctor endpoints (and vice versa)</li>
                <li>@jwt_required decorator on sensitive endpoints</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-category">
              <h3>Frontend</h3>
              <ul>
                <li><strong>React 18.x</strong> - UI library</li>
                <li><strong>React Router v6</strong> - Client-side routing</li>
                <li><strong>React Hook Form</strong> - Form handling</li>
                <li><strong>Zod</strong> - Schema validation</li>
                <li><strong>Axios</strong> - HTTP client</li>
                <li><strong>CSS3</strong> - Custom styling</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Backend</h3>
              <ul>
                <li><strong>Flask 3.x</strong> - Web framework</li>
                <li><strong>SQLAlchemy</strong> - ORM</li>
                <li><strong>Flask-JWT-Extended</strong> - JWT auth</li>
                <li><strong>Marshmallow</strong> - Schema validation</li>
                <li><strong>Flask-CORS</strong> - Cross-origin requests</li>
                <li><strong>Werkzeug</strong> - Password hashing</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Database</h3>
              <ul>
                <li><strong>SQLite</strong> - Development database</li>
                <li><strong>MySQL 8.x</strong> - Production database</li>
                <li><strong>Flask-Migrate</strong> - Schema migrations</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>AI/ML</h3>
              <ul>
                <li><strong>Ollama</strong> - Local LLM inference</li>
                <li><strong>llama3.2</strong> - Chat model</li>
                <li><strong>nomic-embed-text</strong> - Embeddings</li>
                <li><strong>NumPy</strong> - Vector operations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Database Schema */}
        <section className="about-section">
          <h2>Database Schema</h2>
          <div className="schema-block">
            <div className="code-block">
              <pre>{`Tables:

patients
├── id (PK)
├── first_name, last_name
├── email (UNIQUE), phone
├── date_of_birth
├── blood_group (optional)
├── password_hash
└── created_at, updated_at

doctors
├── id (PK)
├── first_name, last_name
├── email (UNIQUE), phone
├── specialization
├── license_number (UNIQUE)
├── years_experience
├── password_hash
└── created_at, updated_at

appointments
├── id (PK)
├── patient_id (FK → patients.id)
├── doctor_id (FK → doctors.id)
├── appointment_date, appointment_time
├── reason (TEXT)
├── status (scheduled/completed/cancelled)
└── created_at, updated_at

prescriptions
├── id (PK)
├── appointment_id (FK → appointments.id)
├── doctor_id (FK → doctors.id)
├── patient_id (FK → patients.id)
├── medication, dosage, instructions
└── created_at

medical_records
├── id (PK)
├── patient_id (FK → patients.id)
├── record_type (diagnosis/lab_result/procedure/allergy/note)
├── title, content
├── record_date
├── embedding (JSON - for vector search)
└── created_at

Relationships:
• One Patient → Many Appointments
• One Doctor → Many Appointments
• One Appointment → One Prescription
• One Patient → Many Medical Records`}</pre>
            </div>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="about-section">
          <h2>API Endpoints</h2>
          <div className="endpoints-table">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Description</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr className="endpoint-category">
                  <td colSpan="4">Authentication</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/auth/login" target="_blank" rel="noopener noreferrer">/api/auth/login</a></td>
                  <td>Login (patient or doctor)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/auth/refresh" target="_blank" rel="noopener noreferrer">/api/auth/refresh</a></td>
                  <td>Refresh access token</td>
                  <td>Refresh Token</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td><a href="http://localhost:5001/api/auth/me" target="_blank" rel="noopener noreferrer">/api/auth/me</a></td>
                  <td>Get current user info</td>
                  <td>JWT</td>
                </tr>
                <tr className="endpoint-category">
                  <td colSpan="4">Patients</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/patients/register" target="_blank" rel="noopener noreferrer">/api/patients/register</a></td>
                  <td>Register new patient</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td><a href="http://localhost:5001/api/patients/me" target="_blank" rel="noopener noreferrer">/api/patients/me</a></td>
                  <td>Get current patient info</td>
                  <td>JWT (Patient)</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td><a href="http://localhost:5001/api/patients/appointments" target="_blank" rel="noopener noreferrer">/api/patients/appointments</a></td>
                  <td>Get patient's appointments</td>
                  <td>JWT (Patient)</td>
                </tr>
                <tr className="endpoint-category">
                  <td colSpan="4">Doctors</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/doctors/register" target="_blank" rel="noopener noreferrer">/api/doctors/register</a></td>
                  <td>Register new doctor</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td><a href="http://localhost:5001/api/doctors/me" target="_blank" rel="noopener noreferrer">/api/doctors/me</a></td>
                  <td>Get current doctor info</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td><a href="http://localhost:5001/api/doctors" target="_blank" rel="noopener noreferrer">/api/doctors</a></td>
                  <td>List all doctors (for booking)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td><a href="http://localhost:5001/api/doctors/appointments" target="_blank" rel="noopener noreferrer">/api/doctors/appointments</a></td>
                  <td>Get doctor's appointments</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr className="endpoint-category">
                  <td colSpan="4">Appointments</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/appointments" target="_blank" rel="noopener noreferrer">/api/appointments</a></td>
                  <td>Create new appointment</td>
                  <td>JWT (Patient)</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td>/api/appointments/:id</td>
                  <td>Get appointment details</td>
                  <td>JWT</td>
                </tr>
                <tr>
                  <td><span className="method-put">PUT</span></td>
                  <td>/api/appointments/:id</td>
                  <td>Update appointment status</td>
                  <td>JWT</td>
                </tr>
                <tr>
                  <td><span className="method-delete">DELETE</span></td>
                  <td>/api/appointments/:id</td>
                  <td>Cancel appointment</td>
                  <td>JWT</td>
                </tr>
                <tr className="endpoint-category">
                  <td colSpan="4">AI Features</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td><a href="http://localhost:5001/api/ai/status" target="_blank" rel="noopener noreferrer">/api/ai/status</a></td>
                  <td>Check AI service availability</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/ai/check-interactions" target="_blank" rel="noopener noreferrer">/api/ai/check-interactions</a></td>
                  <td>Check drug interactions</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/ai/suggest-prescription" target="_blank" rel="noopener noreferrer">/api/ai/suggest-prescription</a></td>
                  <td>Get prescription suggestion</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/ai/generate-instructions" target="_blank" rel="noopener noreferrer">/api/ai/generate-instructions</a></td>
                  <td>Generate patient instructions</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/ai/search-history" target="_blank" rel="noopener noreferrer">/api/ai/search-history</a></td>
                  <td>Search patient medical records</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td><a href="http://localhost:5001/api/ai/ask-about-patient" target="_blank" rel="noopener noreferrer">/api/ai/ask-about-patient</a></td>
                  <td>Q&A on patient history</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr className="endpoint-category">
                  <td colSpan="4">Ollama (Direct)</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td><a href="http://localhost:11434/api/tags" target="_blank" rel="noopener noreferrer">http://localhost:11434/api/tags</a></td>
                  <td>List available models</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td>http://localhost:11434/api/generate</td>
                  <td>Text generation</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td>http://localhost:11434/api/chat</td>
                  <td>Chat completion</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td>http://localhost:11434/api/embeddings</td>
                  <td>Generate embeddings</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Data Flow */}
        <section className="about-section">
          <h2>Data Flow</h2>
          <div className="dataflow-grid">
            <div className="dataflow-card">
              <h3>Authentication Flow</h3>
              <div className="code-block small">
                <pre>{`User Login Form
      ↓
POST /api/auth/login
      ↓
Validate Credentials
      ↓
Generate JWT Tokens
      ↓
Store in localStorage
      ↓
Axios Interceptor adds token
      ↓
Protected Routes accessible`}</pre>
              </div>
            </div>

            <div className="dataflow-card">
              <h3>Drug Check Flow</h3>
              <div className="code-block small">
                <pre>{`Doctor enters medications
      ↓
POST /api/ai/check-interactions
      ↓
Rule-based check (fast)
      ↓
LLM analysis (comprehensive)
      ↓
Merge results
      ↓
Return warnings + severity`}</pre>
              </div>
            </div>

            <div className="dataflow-card">
              <h3>RAG Search Flow</h3>
              <div className="code-block small">
                <pre>{`Search query entered
      ↓
Embed query (nomic-embed-text)
      ↓
Cosine similarity search
      ↓
Select top-K records
      ↓
LLM summarization
      ↓
Return results + summary`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="about-section about-footer">
          <h2>Project Information</h2>
          <p>
            This Smart Healthcare System was built as a portfolio project demonstrating
            full-stack web development skills with a focus on security, clean architecture,
            AI integration, and professional UI/UX design.
          </p>
          <p>
            <strong>Built by:</strong> Shubhaditya<br />
            <strong>Technologies:</strong> React, Flask, SQLite/MySQL, Ollama LLM<br />
            <strong>AI Features:</strong> Drug Interaction Checker, Prescription Assistant, RAG Search<br />
            <strong>Purpose:</strong> Demonstration of secure, scalable web architecture with AI
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
