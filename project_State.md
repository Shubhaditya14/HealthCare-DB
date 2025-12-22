# Smart Healthcare System - Project State v1.0

**Last Updated:** December 19, 2025  
**Status:** Initial Implementation Phase  
**Target Completion:** 3-4 days from start

---

## Meta-Instructions for LLM

When this file is uploaded to a new LLM instance:

1. **Read this entire file first** - Understand context before making suggestions
2. **Maintain architectural consistency** - Follow established patterns
3. **Security first** - Never compromise on security measures outlined
4. **Ask before major changes** - Confirm architectural decisions with user
5. **Reference this file** - When unsure about decisions, check this state file
6. **Update tracking** - Note any deviations from original plan

**User Context:** Shubhaditya is a 2nd year AI/ML student who prefers:
- Understanding architecture before implementation
- Socratic learning (guided discovery over direct answers)
- Production-grade code quality
- Building sophisticated systems

---

## Project Overview

**Name:** Smart Healthcare System  
**Type:** Web Application (Patient & Doctor Portal)  
**Timeline:** 3-4 day deadline  
**Purpose:** Portfolio project for AI infrastructure internships (OpenAI, Anthropic, HuggingFace, Spotify, Netflix)

### Core Functionality
- Patient registration, login, appointment booking
- Doctor registration, login, appointment management, prescription creation
- Secure authentication with JWT
- HIPAA-compliant data handling
- Professional UI with company branding

---

## Technology Stack

### Frontend
- **Framework:** React 18.x
- **Routing:** React Router v6
- **State Management:** React Context API + hooks
- **Form Handling:** React Hook Form + Zod validation
- **HTTP Client:** Axios with interceptors
- **Styling:** CSS3 (custom styles, no frameworks to keep it lightweight)
- **Icons:** SVG icons (inline or from free icon library)

### Backend
- **Framework:** Flask 3.x
- **Database:** MySQL 8.x with SQLAlchemy ORM
- **Authentication:** Flask-JWT-Extended
- **Validation:** Marshmallow schemas
- **Security:** Flask-CSRF, Flask-Limiter
- **Caching:** Redis (for sessions and rate limiting)

### Infrastructure
- **Development:** Local (laptop + MySQL + Redis)
- **Deployment:** TBD (likely Render or Railway for demo)

---

## Architecture Decisions

### Why These Choices?

**React (not Next.js):**
- Simpler for 3-4 day timeline
- Client-side rendering sufficient for this use case
- User already comfortable with React

**Flask (not FastAPI):**
- Part of existing project requirements
- Synchronous model simpler for MVP
- Strong ecosystem for auth/validation

**MySQL (not PostgreSQL):**
- Project requirement
- User already familiar with it

**JWT (not session cookies):**
- Stateless authentication
- Easier to scale horizontally
- Industry standard for SPAs

**No UI framework (not Tailwind/Bootstrap):**
- Custom CSS shows design skills
- Lighter bundle size
- More control over appearance

---

## Current Progress

### Completed
- ✅ Security & validation design document
- ✅ Frontend validation schema (Zod)
- ✅ Backend validation schema (Marshmallow)
- ✅ Database models defined
- ✅ Error handling patterns established

### In Progress
- 🔄 Full web application implementation (both portals)

### Not Started
- ⏸️ Deployment configuration
- ⏸️ Email verification system
- ⏸️ Forgot password flow
- ⏸️ Advanced features (file uploads, notifications)

---

## Key Technical Patterns

### 1. Authentication Flow
User → Login → Flask validates → Generate JWT → Store in localStorage
→ All subsequent requests include JWT in Authorization header
→ Flask validates JWT on protected routes

### 2. Form Validation (Multi-Layer)Client (Zod) → Server (Marshmallow) → Database (Constraints)

Client: UX, immediate feedback
Server: Security, authoritative validation
Database: Last line of defense


### 3. Error HandlingBackend returns: { error: "type", message: "user-friendly", errors: {field: [msgs]} }
Frontend displays: Inline field errors + toast for general errors

### 4. Route ProtectionFrontend: ProtectedRoute component checks JWT, redirects if invalid
Backend: @jwt_required decorator on sensitive endpoints

### 5. CSRF ProtectionLogin response includes csrf_token cookie
All POST/PUT/DELETE requests include X-CSRF-Token header
Flask validates token matches cookie

---

## File Structuresmart-healthcare-system/
├── backend/
│   ├── app/
│   │   ├── init.py          # Flask app factory
│   │   ├── models/
│   │   │   ├── patient.py       # Patient model
│   │   │   ├── doctor.py        # Doctor model
│   │   │   ├── appointment.py   # Appointment model
│   │   │   └── prescription.py  # Prescription model
│   │   ├── routes/
│   │   │   ├── auth_routes.py   # Login/logout/refresh
│   │   │   ├── patient_routes.py # Patient CRUD
│   │   │   ├── doctor_routes.py  # Doctor CRUD
│   │   │   └── appointment_routes.py # Appointment management
│   │   ├── schemas/
│   │   │   ├── patient_schema.py
│   │   │   ├── doctor_schema.py
│   │   │   └── appointment_schema.py
│   │   ├── utils/
│   │   │   ├── decorators.py    # CSRF, rate limiting
│   │   │   ├── error_handlers.py
│   │   │   └── sanitization.py
│   │   └── config.py
│   ├── migrations/              # Database migrations
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── company-logo.png     # User's company logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── FormError.jsx
│   │   │   ├── patient/
│   │   │   │   ├── PatientRegistration.jsx
│   │   │   │   ├── PatientLogin.jsx
│   │   │   │   ├── PatientDashboard.jsx
│   │   │   │   └── AppointmentBooking.jsx
│   │   │   └── doctor/
│   │   │       ├── DoctorRegistration.jsx
│   │   │       ├── DoctorLogin.jsx
│   │   │       ├── DoctorDashboard.jsx
│   │   │       └── PrescriptionForm.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx         # Info page explaining UI/architecture
│   │   │   ├── PatientPortal.jsx
│   │   │   └── DoctorPortal.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── utils/
│   │   │   ├── api.js            # Axios instance with interceptors
│   │   │   └── validation.js     # Zod schemas
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── navbar.css
│   │   │   └── forms.css
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── .env
│
├── docs/
│   ├── SECURITY_DESIGN.md       # The document we created
│   ├── API_DOCUMENTATION.md     # API endpoints reference
│   └── DEPLOYMENT_GUIDE.md
│
├── PROJECT_STATE.md             # This file
├── PROMPT_FOR_CLAUDE_CODE.md   # Instructions for Claude Code
└── README.md

---

## Database Schema

### Tables

**patients**
- id (PK)
- first_name, last_name
- email (unique), phone
- date_of_birth
- blood_group (optional)
- password_hash
- is_active, email_verified
- created_at, updated_at

**doctors**
- id (PK)
- first_name, last_name
- email (unique), phone
- specialization
- license_number (unique)
- years_experience
- password_hash
- is_active, email_verified
- created_at, updated_at

**appointments**
- id (PK)
- patient_id (FK → patients.id)
- doctor_id (FK → doctors.id)
- appointment_date, appointment_time
- reason
- status (scheduled, completed, cancelled)
- created_at, updated_at

**prescriptions**
- id (PK)
- appointment_id (FK → appointments.id)
- doctor_id (FK → doctors.id)
- patient_id (FK → patients.id)
- medication
- dosage
- instructions
- created_at

---

## Security Requirements (Non-Negotiable)

1. **Never store plaintext passwords** - Always hash with pbkdf2:sha256
2. **Validate on server** - Client validation is UX only
3. **CSRF tokens required** - For all state-changing requests
4. **JWT in localStorage** - With proper expiry (1 hour access, 30 day refresh)
5. **Rate limiting** - 5 registration/hour, 10 login/5min per IP
6. **Input sanitization** - Escape all user-generated content
7. **Parameterized queries** - SQLAlchemy ORM handles this
8. **HTTPS only** - In production (not enforced in dev)

---

## API Endpoints

### Authentication
- POST /api/auth/login - Login (patient or doctor)
- POST /api/auth/logout - Logout
- POST /api/auth/refresh - Refresh access token

### Patients
- POST /api/patients/register - Register new patient
- GET /api/patients/me - Get current patient info (requires JWT)
- PUT /api/patients/me - Update patient info
- GET /api/patients/appointments - Get patient's appointments

### Doctors
- POST /api/doctors/register - Register new doctor
- GET /api/doctors/me - Get current doctor info (requires JWT)
- PUT /api/doctors/me - Update doctor info
- GET /api/doctors - List all doctors (for appointment booking)
- GET /api/doctors/:id/appointments - Get doctor's appointments

### Appointments
- POST /api/appointments - Create appointment (patient)
- GET /api/appointments/:id - Get appointment details
- PUT /api/appointments/:id - Update appointment (doctor only)
- DELETE /api/appointments/:id - Cancel appointment

### Prescriptions
- POST /api/prescriptions - Create prescription (doctor only)
- GET /api/prescriptions/:id - Get prescription details

---

## Frontend Routes/ - Home page (landing)
/about - Info page (UI/architecture explanation)/patient/login - Patient login
/patient/register - Patient registration
/patient/dashboard - Patient dashboard (protected)
/patient/appointments - Book appointment (protected)/doctor/login - Doctor login
/doctor/register - Doctor registration
/doctor/dashboard - Doctor dashboard (protected)
/doctor/appointments - Manage appointments (protected)
/doctor/prescriptions/new - Create prescription (protected)

---

## UI Design Principles

1. **Professional Medical Theme**
   - Clean white/light blue color scheme
   - Sans-serif fonts (Open Sans or system fonts)
   - Ample whitespace
   - Clear visual hierarchy

2. **Accessibility**
   - Proper form labels
   - ARIA attributes
   - Keyboard navigation
   - High contrast text

3. **Responsive**
   - Mobile-first approach
   - Breakpoints: 768px (tablet), 1024px (desktop)

4. **Branding**
   - Company logo in top-right navbar
   - Consistent color scheme
   - Professional footer with links

---

## Known Issues / Technical Debt

### Current Limitations
- No email verification (would require email service)
- No forgot password flow (same reason)
- No real-time notifications (would require WebSockets)
- No file uploads (medical records) - out of scope for MVP
- No payment processing - future phase

### Future Improvements
- Add Redis caching for frequently accessed data
- Implement proper logging with log rotation
- Add comprehensive test coverage (currently none)
- Set up CI/CD pipeline
- Add API rate limiting per user (not just IP)
- Implement soft deletes instead of hard deletes

---

## Testing Strategy (When Time Permits)

### Priority Tests
1. Authentication flow (login/logout/token refresh)
2. Form validation (frontend and backend)
3. Protected route access
4. CSRF protection
5. SQL injection prevention

### Test Types
- Unit tests: Validation schemas, utility functions
- Integration tests: API endpoints
- E2E tests: User flows (registration → login → booking)

---

## Deployment Checklist

When ready to deploy:

- [ ] Set all environment variables (.env files not in git)
- [ ] Enable HTTPS (Let's Encrypt or platform default)
- [ ] Configure CORS properly (only allow production domain)
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Run database migrations
- [ ] Set up Redis instance
- [ ] Configure rate limiting
- [ ] Test all critical user flows
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Document API with Swagger/OpenAPI
- [ ] Create demo accounts for portfolio showcase

---

## Development Workflow

### Starting Development
```bashBackend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
flask runFrontend
cd frontend
npm install
npm start

### Environment Variables

**Backend (.env)**FLASK_ENV=development
DATABASE_URL=mysql://user:pass@localhost:3306/healthcare_db
JWT_SECRET_KEY=your-secret-key
CSRF_SECRET=your-csrf-secret
REDIS_URL=redis://localhost:6379/0

**Frontend (.env)**REACT_APP_API_URL=http://localhost:5000/api

---

## Questions to Ask Before Major Decisions

1. **Architecture changes:** "This change affects [X]. Alternatives are [Y, Z]. Trade-offs: ..."
2. **Security concerns:** "This could create vulnerability [X]. Should we add protection [Y]?"
3. **Scope creep:** "Feature [X] is interesting but adds [N] hours. Include in MVP?"
4. **Technical debt:** "Quick solution [X] works now but creates debt. Invest time in [Y]?"

---

## Success Metrics

**For Portfolio:**
- Clean, readable code
- Security best practices demonstrated
- Professional UI/UX
- Complete user flows working
- Well-documented
- Deployable demo

**Technical Goals:**
- <100ms API response time (P95)
- Zero security vulnerabilities (OWASP Top 10)
- 90%+ uptime in demo environment
- Mobile-responsive design

---

## Notes for Future Sessions

### Session 1 (Current):
- Created comprehensive security design document
- Defined architecture and tech stack
- Established validation patterns

### Session 2 (Next):
- Will implement full web application
- Both patient and doctor portals
- Complete with authentication and CRUD operations

---

## Update Log

| Date | Changes | Reason |
|------|---------|--------|
| 2025-12-19 | Initial state file created | Project kickoff |

---

**END OF PROJECT STATE**

When you say "update state", I'll append progress to this file with new version number.