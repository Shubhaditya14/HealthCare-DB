# Smart Healthcare System - Project Architecture

A comprehensive healthcare management system with AI-powered clinical decision support, built using React, Flask, SQLite/MySQL, and Ollama for local LLM inference.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Access URLs & Endpoints](#access-urls--endpoints)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Architecture](#database-architecture)
6. [AI Services Architecture](#ai-services-architecture)
7. [Data Flow](#data-flow)
8. [Security Architecture](#security-architecture)
9. [Technology Stack](#technology-stack)

---

## System Overview

```
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
│                                    │   SQLite/MySQL   │        │
│                                    │    Database      │        │
│                                    └──────────────────┘        │
│                                             │                   │
│                                    ┌────────▼─────────┐        │
│                                    │  OLLAMA LLM      │        │
│                                    │  (Port 11434)    │        │
│                                    └──────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

The system consists of four main layers:
- **Frontend**: React SPA handling user interface and client-side logic
- **Backend**: Flask REST API managing business logic and data processing
- **Database**: SQLite (dev) / MySQL (prod) for persistent storage
- **AI Services**: Ollama-powered LLM for clinical decision support

---

## Frontend Architecture

### Technology Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| React Router | 6.20.1 | Client-side routing |
| React Hook Form | 7.48.2 | Form management |
| Zod | 3.22.4 | Schema validation |
| Axios | 1.6.2 | HTTP client |

### Directory Structure
```
frontend/src/
├── components/
│   ├── common/           # Shared components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── FormInput.jsx
│   │   └── ProtectedRoute.jsx
│   ├── patient/          # Patient-specific components
│   │   ├── PatientRegister.jsx
│   │   ├── PatientLogin.jsx
│   │   ├── PatientDashboard.jsx
│   │   └── AppointmentBooking.jsx
│   └── doctor/           # Doctor-specific components
│       ├── DoctorRegister.jsx
│       ├── DoctorLogin.jsx
│       ├── DoctorDashboard.jsx
│       ├── DrugInteractionChecker.jsx
│       ├── PrescriptionAssistant.jsx
│       └── PatientHistorySearch.jsx
├── contexts/
│   └── AuthContext.jsx   # Global authentication state
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── AIDashboard.jsx   # AI features hub
│   └── NotFound.jsx
├── utils/
│   ├── api.js            # Axios instance & API endpoints
│   └── validation.js
├── styles/
│   └── ai.css
└── App.jsx               # Main routing configuration
```

### State Management

The application uses **React Context API** for global state management:

```
┌─────────────────────────────────────────┐
│            AuthContext                   │
├─────────────────────────────────────────┤
│  State:                                 │
│  - user (current user info)             │
│  - isAuthenticated (boolean)            │
│  - loading (boolean)                    │
│  - error (string)                       │
├─────────────────────────────────────────┤
│  Methods:                               │
│  - login()                              │
│  - register()                           │
│  - logout()                             │
│  - clearError()                         │
└─────────────────────────────────────────┘
```

### API Layer (`api.js`)

The API layer uses Axios with interceptors for automatic token handling:

```javascript
// Request Interceptor
- Attaches JWT Bearer token to all requests

// Response Interceptor
- Handles 401 errors
- Automatically refreshes tokens
- Retries failed requests

// API Groupings
- authAPI: login, refresh, logout, me
- patientAPI: register, profile, appointments
- doctorAPI: register, profile, appointments
- appointmentAPI: CRUD operations
- aiAPI: AI feature endpoints
```

### Protected Routes

Routes are protected based on authentication status and user type:

```jsx
<ProtectedRoute allowedTypes={['doctor']}>
  <DoctorDashboard />
</ProtectedRoute>
```

---

## Backend Architecture

### Technology Stack
| Technology | Purpose |
|------------|---------|
| Flask 3| Web framework |
| SQLAlchemy | ORM |
| Flask-JWT-Extended | JWT authentication |
| Flask-Migrate | Database migrations |
| Marshmallow | Schema validation |
| Flask-CORS | Cross-origin support |

### Directory Structure
```
backend/
├── app/
│   ├── __init__.py       # Flask app factory
│   ├── config.py         # Configuration settings
│   ├── models/           # SQLAlchemy models
│   │   ├── patient.py
│   │   ├── doctor.py
│   │   ├── appointment.py
│   │   ├── prescription.py
│   │   └── medical_record.py
│   ├── routes/           # API blueprints
│   │   ├── auth_routes.py
│   │   ├── patient_routes.py
│   │   ├── doctor_routes.py
│   │   ├── appointment_routes.py
│   │   └── ai_routes.py
│   ├── services/         # Business logic
│   │   ├── ai_service.py
│   │   ├── drug_checker.py
│   │   ├── prescription_ai.py
│   │   └── rag_service.py
│   ├── utils/            # Helpers
│   │   ├── decorators.py
│   │   └── error_handlers.py
│   └── data/             # Static data
│       └── synthetic_patients.json
├── migrations/           # Database migrations
├── run.py                # Entry point
└── requirements.txt
```

### API Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login for patients/doctors |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/logout` | Logout |

#### Patients (`/api/patients`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients/register` | Register new patient |
| GET | `/patients/me` | Get own profile |
| PUT | `/patients/me` | Update profile |
| GET | `/patients/appointments` | Get appointments |

#### Doctors (`/api/doctors`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/doctors/register` | Register new doctor |
| GET | `/doctors/me` | Get own profile |
| GET | `/doctors` | List all doctors |
| GET | `/doctors/<id>` | Get doctor details |

#### Appointments (`/api/appointments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/appointments` | Create appointment |
| GET | `/appointments/<id>` | Get appointment |
| PUT | `/appointments/<id>` | Update status |
| DELETE | `/appointments/<id>` | Cancel |

#### AI Features (`/api/ai`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/status` | Check AI availability |
| POST | `/ai/check-interactions` | Drug interaction check |
| POST | `/ai/suggest-prescription` | Prescription suggestion |
| POST | `/ai/generate-instructions` | Patient instructions |
| POST | `/ai/search-history` | Search medical records |
| POST | `/ai/ask-about-patient` | Q&A on patient history |

---

## Database Architecture

### Entity-Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Patient   │       │  Appointment │       │   Doctor    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │───┐   │ id (PK)      │   ┌───│ id (PK)     │
│ first_name  │   │   │ patient_id   │───┘   │ first_name  │
│ last_name   │   └───│ doctor_id    │       │ last_name   │
│ email       │       │ date         │       │ email       │
│ phone       │       │ time         │       │ specialization
│ dob         │       │ reason       │       │ license_no  │
│ blood_group │       │ status       │       │ experience  │
│ password    │       └──────┬───────┘       │ password    │
└──────┬──────┘              │               └─────────────┘
       │                     │
       │              ┌──────▼───────┐
       │              │ Prescription │
       │              ├──────────────┤
       │              │ id (PK)      │
       └──────────────│ patient_id   │
                      │ doctor_id    │
                      │ appointment_id
                      │ medication   │
                      │ dosage       │
                      │ instructions │
                      └──────────────┘

┌─────────────────┐
│  MedicalRecord  │
├─────────────────┤
│ id (PK)         │
│ patient_id (FK) │
│ record_type     │
│ title           │
│ content         │
│ record_date     │
│ embedding (JSON)│
└─────────────────┘
```

### Model Details

#### Patient
```python
- id: Primary key
- first_name, last_name: Names
- email: Unique email
- phone: Contact number
- date_of_birth: Date
- blood_group: A+, B-, O+, etc.
- password_hash: PBKDF2-SHA256
- is_active: Boolean
- created_at, updated_at: Timestamps
```

#### Doctor
```python
- id: Primary key
- first_name, last_name: Names
- email: Unique email
- specialization: Cardiology, Neurology, etc.
- license_number: Unique medical license
- years_experience: Integer
- password_hash: PBKDF2-SHA256
- is_active: Boolean
```

#### MedicalRecord
```python
- id: Primary key
- patient_id: Foreign key to Patient
- record_type: diagnosis, lab_result, procedure, allergy, note
- title: Record title
- content: Full content text
- record_date: Date of record
- embedding: JSON-stored vector for semantic search
```

---

## AI Services Architecture

### Overview

The AI layer provides three main features:
1. **Drug Interaction Checker** - Identifies medication conflicts
2. **Prescription Assistant** - Suggests treatments based on diagnosis
3. **Patient History Search** - RAG-based semantic search over records

### Ollama Integration

```
┌───────────────────────────────────────────────────┐
│                  OLLAMA SERVICE                   │
│                 (Port 11434)                      │
├───────────────────────────────────────────────────┤
│                                                   │
│  Models:                                          │
│  ├── llama3.2:latest  (Chat & Generation)        │
│  └── nomic-embed-text (Embeddings)               │
│                                                   │
│  Endpoints Used:                                  │
│  ├── /api/tags       → List models               │
│  ├── /api/generate   → Text generation           │
│  ├── /api/chat       → Chat completion           │
│  └── /api/embeddings → Vector embeddings         │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Drug Interaction Checker (`drug_checker.py`)

Uses a **two-tier approach**:

```
┌─────────────────────────────────────────────────────────┐
│                 Drug Interaction Check                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tier 1: Rule-Based Database (Fast)                    │
│  ├── 10+ known interaction rules                       │
│  ├── Drug class mappings (SSRI, NSAID, etc.)          │
│  └── Allergy matching                                  │
│                                                         │
│  Tier 2: LLM Analysis (Comprehensive)                  │
│  ├── Ollama generates nuanced analysis                 │
│  ├── JSON-formatted responses                          │
│  └── Detects interactions beyond database              │
│                                                         │
│  Output:                                                │
│  {                                                      │
│    "warnings": [...],                                   │
│    "severity": "critical|high|moderate|low|none",     │
│    "safe": boolean                                      │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

### Prescription Assistant (`prescription_ai.py`)

```
┌─────────────────────────────────────────────────────────┐
│               Prescription Suggestion                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Input:                                                 │
│  ├── Diagnosis                                          │
│  ├── Patient age                                        │
│  ├── Allergies                                          │
│  ├── Current medications                                │
│  └── Existing conditions                                │
│                                                         │
│  Process:                                               │
│  1. Check treatment guidelines database                 │
│  2. Call LLM for personalized suggestion               │
│  3. Run interaction check on suggestion                │
│                                                         │
│  Output:                                                │
│  {                                                      │
│    "medication": "drug_name",                          │
│    "dosage": "10-40mg",                                │
│    "frequency": "once daily",                          │
│    "alternatives": [...],                              │
│    "warnings": [...]                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

### RAG Service (`rag_service.py`)

Retrieval-Augmented Generation for patient history search:

```
┌─────────────────────────────────────────────────────────┐
│                    RAG Pipeline                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. EMBEDDING GENERATION                                │
│     Medical Records → Ollama (nomic-embed-text)        │
│                    → Vector embeddings stored in DB    │
│                                                         │
│  2. QUERY PROCESSING                                    │
│     User Query → Embed query                           │
│               → Cosine similarity search               │
│               → Select top-K matching records          │
│                                                         │
│  3. AI SUMMARIZATION                                    │
│     Top records → LLM (llama3.2)                       │
│                → Generate summary/answer               │
│                                                         │
│  Output:                                                │
│  {                                                      │
│    "records": [...with similarity scores],             │
│    "summary": "AI-generated summary",                  │
│    "answer": "Direct answer to question"               │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────►│  Backend │────►│ Validate │────►│ Generate │
│  Form    │     │  /login  │     │ Password │     │   JWT    │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
┌──────────┐     ┌──────────┐     ┌──────────┐         │
│Protected │◄────│  Axios   │◄────│  Store   │◄────────┘
│  Routes  │     │Interceptor│    │  Token   │
└──────────┘     └──────────┘     └──────────┘
```

### AI Drug Check Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Doctor    │────►│  /api/ai/   │────►│ Rule-Based  │
│   Enters    │     │  check-     │     │   Check     │
│   Meds      │     │ interactions│     └──────┬──────┘
└─────────────┘     └─────────────┘            │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Display    │◄────│   Merge     │◄────│   Ollama    │
│  Warnings   │     │  Results    │     │   Analysis  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### RAG Search Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Search    │────►│   Embed     │────►│   Cosine    │
│   Query     │     │   Query     │     │  Similarity │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
┌─────────────┐     ┌─────────────┐     ┌──────▼──────┐
│  Display    │◄────│  Summarize  │◄────│  Top-K      │
│  Results    │     │  with LLM   │     │  Records    │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Security Architecture

### Authentication & Authorization

| Layer | Implementation |
|-------|----------------|
| Tokens | JWT (Access: 1hr, Refresh: 30 days) |
| Storage | localStorage |
| Password | PBKDF2-SHA256 hashing |
| Route Protection | Frontend + Backend validation |

### Input Validation

```
┌─────────────────────────────────────────────────────────┐
│                  Validation Pipeline                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (Zod)          Backend (Marshmallow)         │
│  ├── Type checking       ├── Schema validation         │
│  ├── Format validation   ├── Type coercion             │
│  └── Error messages      └── Sanitization              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Security Features

- **Rate Limiting**: Login (10/5min), Register (5/hour)
- **CORS**: Restricted to `http://localhost:3000`
- **SQL Injection**: Prevented via SQLAlchemy ORM
- **XSS**: Input sanitization on both ends
- **Authorization**: User type checks on protected routes

---

## Technology Stack

### Complete Stack Overview

```
┌─────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FRONTEND                    BACKEND                   │
│  ├── React 18               ├── Flask 3.x              │
│  ├── React Router 6         ├── SQLAlchemy             │
│  ├── React Hook Form        ├── Flask-JWT-Extended     │
│  ├── Zod                    ├── Marshmallow            │
│  ├── Axios                  ├── Flask-CORS             │
│  └── CSS3                   └── NumPy                  │
│                                                         │
│  DATABASE                    AI/ML                      │
│  ├── SQLite (dev)           ├── Ollama                 │
│  ├── MySQL (prod)           ├── llama3.2 (chat)        │
│  └── Flask-Migrate          └── nomic-embed-text       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# Backend
DATABASE_URL=sqlite:///healthcare.db
JWT_SECRET_KEY=your-secret-key
FLASK_ENV=development

# Frontend
REACT_APP_API_URL=http://localhost:5001/api

# AI Service (Ollama)
OLLAMA_HOST=http://localhost:11434
```

---

## Quick Reference

### Key File Locations

| Component | Path |
|-----------|------|
| Frontend Entry | `frontend/src/App.jsx` |
| API Config | `frontend/src/utils/api.js` |
| Auth Context | `frontend/src/contexts/AuthContext.jsx` |
| AI Dashboard | `frontend/src/pages/AIDashboard.jsx` |
| Backend Entry | `backend/run.py` |
| App Factory | `backend/app/__init__.py` |
| Models | `backend/app/models/*.py` |
| AI Services | `backend/app/services/*.py` |
| Database | `backend/healthcare.db` |

### Ports

| Service | Port |
|---------|------|
| React Frontend | 3000 |
| Flask Backend | 5001 |
| Ollama LLM | 11434 |

---

*Last Updated: December 2024*
