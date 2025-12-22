import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <header className="about-header">
          <h1>About Smart Healthcare System</h1>
          <p className="about-subtitle">
            A modern web application for healthcare management
          </p>
        </header>

        {/* System Overview */}
        <section className="about-section">
          <h2>System Overview</h2>
          <p>
            Smart Healthcare System is a modern web application designed to streamline
            healthcare management. It provides separate portals for patients and doctors,
            enabling appointment booking, medical record management, and secure communication.
          </p>
          <div className="capabilities-list">
            <h3>Key Capabilities:</h3>
            <ul>
              <li>Patients can register, login, book appointments with doctors, and view their appointment history</li>
              <li>Doctors can register with license verification, manage their appointments, and update appointment statuses</li>
              <li>Secure authentication with JWT tokens</li>
              <li>HIPAA-compliant data handling with encrypted passwords and protected health information</li>
            </ul>
          </div>
        </section>

        {/* UI Architecture */}
        <section className="about-section">
          <h2>UI Architecture</h2>
          <div className="architecture-block">
            <h3>Frontend: React Single-Page Application (SPA)</h3>
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
└── Doctor Components
    ├── Registration       # Doctor signup form
    ├── Login              # Doctor login form
    └── Dashboard          # Manage appointments`}</pre>
            </div>
            <h4>Routing (React Router v6):</h4>
            <ul>
              <li><strong>Public routes:</strong> /, /about, /patient/login, /doctor/login, etc.</li>
              <li><strong>Protected routes:</strong> /patient/dashboard, /doctor/dashboard (require valid JWT)</li>
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
            <h3>Backend: Flask RESTful API</h3>
            <div className="code-block">
              <pre>{`Structure:
├── app/
│   ├── __init__.py        # Flask app factory
│   ├── config.py          # Configuration
│   ├── models/            # SQLAlchemy ORM models
│   │   ├── patient.py
│   │   ├── doctor.py
│   │   └── appointment.py
│   ├── routes/            # API endpoints
│   │   ├── auth_routes.py
│   │   ├── patient_routes.py
│   │   ├── doctor_routes.py
│   │   └── appointment_routes.py
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
              <h3>Database & Caching</h3>
              <ul>
                <li><strong>MySQL 8.x</strong> - Relational database</li>
                <li><strong>Redis</strong> - Session storage, rate limiting</li>
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

Relationships:
• One Patient → Many Appointments
• One Doctor → Many Appointments
• One Appointment → One Patient, One Doctor`}</pre>
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
                  <td>/api/auth/login</td>
                  <td>Login (patient or doctor)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td>/api/auth/refresh</td>
                  <td>Refresh access token</td>
                  <td>Refresh Token</td>
                </tr>
                <tr className="endpoint-category">
                  <td colSpan="4">Patients</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td>/api/patients/register</td>
                  <td>Register new patient</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td>/api/patients/me</td>
                  <td>Get current patient info</td>
                  <td>JWT (Patient)</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td>/api/patients/appointments</td>
                  <td>Get patient's appointments</td>
                  <td>JWT (Patient)</td>
                </tr>
                <tr className="endpoint-category">
                  <td colSpan="4">Doctors</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td>/api/doctors/register</td>
                  <td>Register new doctor</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td>/api/doctors/me</td>
                  <td>Get current doctor info</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td>/api/doctors</td>
                  <td>List all doctors (for booking)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><span className="method-get">GET</span></td>
                  <td>/api/doctors/appointments</td>
                  <td>Get doctor's appointments</td>
                  <td>JWT (Doctor)</td>
                </tr>
                <tr className="endpoint-category">
                  <td colSpan="4">Appointments</td>
                </tr>
                <tr>
                  <td><span className="method-post">POST</span></td>
                  <td>/api/appointments</td>
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
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <section className="about-section about-footer">
          <h2>Project Information</h2>
          <p>
            This Smart Healthcare System was built as a portfolio project demonstrating
            full-stack web development skills with a focus on security, clean architecture,
            and professional UI/UX design.
          </p>
          <p>
            <strong>Built by:</strong> Shubhaditya<br />
            <strong>Technologies:</strong> React, Flask, MySQL, JWT<br />
            <strong>Purpose:</strong> Demonstration of secure, scalable web architecture
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
