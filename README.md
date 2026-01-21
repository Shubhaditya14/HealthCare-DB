# Smart Healthcare System

A modern, secure web application for healthcare management featuring separate portals for patients and doctors. Built with React, Flask, MySQL, and Redis.

## 🚀 Features

### Patient Portal
- **Registration & Authentication**: Secure account creation with JWT-based authentication
- **Appointment Booking**: Browse doctors by specialization and book appointments
- **Dashboard**: View upcoming and past appointments
- **Profile Management**: Update personal information and medical details

### Doctor Portal
- **Professional Registration**: Register with license verification
- **Appointment Management**: View and manage patient appointments
- **Dashboard**: Track scheduled, completed, and cancelled appointments
- **Patient Information**: Access patient details for scheduled appointments

### Security Features
- 🔒 **Password Hashing**: PBKDF2-SHA256 encryption for all passwords
- 🎫 **JWT Authentication**: Secure token-based authentication with automatic refresh
- 🛡️ **Multi-layer Validation**: Client-side (Zod) and server-side (Marshmallow) validation
- 🚦 **Rate Limiting**: Protection against brute force attacks
- 🔐 **CSRF Protection**: Double-submit cookie pattern for state-changing requests
- 🚫 **SQL Injection Prevention**: Parameterized queries via SQLAlchemy ORM

## 🛠️ Technology Stack

### Frontend
- **React 18.x** - UI library
- **React Router v6** - Client-side routing
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Axios** - HTTP client with interceptors
- **CSS3** - Custom styling (no frameworks)

### Backend
- **Flask 3.x** - Web framework
- **SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT authentication
- **Marshmallow** - Request/response validation
- **Flask-CORS** - Cross-origin resource sharing
- **Werkzeug** - Password hashing utilities

### Database & Caching
- **MySQL 8.x** - Relational database
- **Redis** - Session storage and rate limiting

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+ and npm
- MySQL 8.x
- Redis (optional, for rate limiting)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DBMS_EL
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create MySQL database
mysql -u root -p
CREATE DATABASE healthcare_db;
EXIT;

# Configure environment variables
# Edit backend/.env with your database credentials

# Initialize database migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Run the backend server
python run.py
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Edit frontend/.env if needed (default: http://localhost:5000/api)

# Run the frontend development server
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
DBMS_EL/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration
│   │   ├── models/              # Database models
│   │   │   ├── patient.py
│   │   │   ├── doctor.py
│   │   │   ├── appointment.py
│   │   │   └── prescription.py
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth_routes.py
│   │   │   ├── patient_routes.py
│   │   │   ├── doctor_routes.py
│   │   │   └── appointment_routes.py
│   │   ├── schemas/             # Marshmallow validation
│   │   │   ├── patient_schema.py
│   │   │   ├── doctor_schema.py
│   │   │   └── appointment_schema.py
│   │   └── utils/               # Helper functions
│   │       ├── decorators.py
│   │       ├── error_handlers.py
│   │       └── sanitization.py
│   ├── migrations/              # Database migrations
│   ├── requirements.txt
│   └── run.py                   # Entry point
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── Logo-2.png           # Company logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Shared components
│   │   │   ├── patient/         # Patient components
│   │   │   └── doctor/          # Doctor components
│   │   ├── pages/               # Page components
│   │   ├── contexts/            # React contexts
│   │   ├── utils/               # Utilities
│   │   │   ├── api.js           # Axios configuration
│   │   │   └── validation.js    # Zod schemas
│   │   ├── styles/              # CSS files
│   │   ├── App.jsx              # Main app component
│   │   └── index.jsx            # Entry point
│   └── package.json
│
├── PROJECT_STATE.md             # Project documentation
├── PROMPT_FOR_CLAUDE_CODE.md    # Implementation guide
└── README.md                    # This file
```

## 🔑 Environment Variables

### Backend (.env)
```env
FLASK_ENV=development
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/healthcare_db
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
CSRF_SECRET=your-csrf-secret-key-change-in-production
REDIS_URL=redis://localhost:6379/0
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (patient or doctor)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Patients
- `POST /api/patients/register` - Register new patient
- `GET /api/patients/me` - Get patient profile
- `PUT /api/patients/me` - Update patient profile
- `GET /api/patients/appointments` - Get patient's appointments

### Doctors
- `POST /api/doctors/register` - Register new doctor
- `GET /api/doctors/me` - Get doctor profile
- `PUT /api/doctors/me` - Update doctor profile
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/appointments` - Get doctor's appointments

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment status


## 📱 User Interface

The application features a clean, professional medical theme with:
- **Color Scheme**: Blue primary (#2563eb), green secondary (#10b981)
- **Typography**: System fonts for optimal readability
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 480px
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation

## 🔒 Security Best Practices

1. **Never store plaintext passwords** - All passwords are hashed with PBKDF2-SHA256
2. **Server-side validation** - Client validation is UX only, server is authoritative
3. **JWT in localStorage** - With proper expiry (1 hour access, 30 day refresh)
4. **Input sanitization** - All user input is escaped and validated




