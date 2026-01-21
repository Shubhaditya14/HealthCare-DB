# Database Readme

This project uses a hybrid persistence layer:
- **PostgreSQL** for core transactional data (patients, doctors, appointments, medical records, and structured prescription metadata).
- **MongoDB** for unstructured assets (patient photos, prescription images/PDFs, and any large binary artifacts) using GridFS.

## PostgreSQL (Primary Store)
- **Driver/ORM**: SQLAlchemy + Flask-Migrate (Alembic).
- **DSN**: `DATABASE_URL=postgresql+psycopg2://<user>:<password>@<host>:5432/healthcare_db`
- **Migrations**: `flask db migrate`, `flask db upgrade`
- **Key tables & relations**
  - `patients`: profile + auth fields; `email` unique; one-to-many `appointments`, `prescriptions`, `medical_records`.
  - `doctors`: profile + auth fields; `email` and `license_number` unique; one-to-many `appointments`, `prescriptions`.
  - `appointments`: links `patient_id` ↔ `doctor_id`; status enum (`scheduled/completed/cancelled`); one-to-one `prescriptions`.
  - `prescriptions`: ties to a single `appointment_id` (unique FK), plus `doctor_id`, `patient_id`, and textual dosage/instructions; referenced by Mongo assets for signed copies.
  - `medical_records`: dated clinical notes/results with optional embedding JSON; owned by `patient_id`.
- **Indexes**
  - Unique: `patients.email`, `doctors.email`, `doctors.license_number`, `prescriptions.appointment_id`
  - Foreign-key backed indexes via SQLAlchemy on `patient_id`, `doctor_id`, and `appointment_id` fields for join performance.
- **Recommended extras**
  - Add `GIN` index on `medical_records.embedding` if you store JSON metadata for vector lookups.
  - Use connection pooling env vars (`POOL_SIZE`, `MAX_OVERFLOW`) in production.

## MongoDB (Assets Store)
- **Driver**: `pymongo` with `gridfs` for large binary payloads.
- **DSN**: `MONGO_URI=mongodb://<user>:<password>@<host>:27017`; `MONGO_DB=healthcare_assets`
- **Collections**
  - `patient_photos`: stores profile photos; fields include `patient_id` (Postgres FK reference), `gridfs_id`, `content_type`, `uploaded_at`.
  - `prescription_files`: signed prescription artifacts (images/PDFs); fields include `prescription_id` (Postgres), `appointment_id`, `patient_id`, `doctor_id`, `gridfs_id`, `content_type`, `uploaded_at`.
  - `audit_logs` (optional): append-only logs for asset operations.
- **GridFS usage**
  - Binary data is streamed into GridFS; resulting `gridfs_id` is saved in the corresponding document.
  - Store a lightweight pointer (`asset_id` or `gridfs_id`) back on the Postgres row if you need quick cross-store lookup.
- **Indexes**
  - `patient_photos`: index on `patient_id`
  - `prescription_files`: compound index on `(patient_id, appointment_id)` plus single-field on `prescription_id`
  - Time-to-live (TTL) indexes can be added for temporary uploads or drafts.

## Data Flow
1) **Registration**: patient/doctor records land in Postgres (`patients`, `doctors`).
2) **Booking**: appointments created in Postgres linking patient ↔ doctor.
3) **Consultation**: doctor writes a prescription in Postgres (`prescriptions` row).
4) **Assets**: prescription PDF or photo is uploaded to Mongo GridFS; `prescription_files` document stores the GridFS handle and references the Postgres IDs.
5) **Profile Photo**: optional upload goes to GridFS with a `patient_photos` document pointing to the patient row.

## Operational Notes
- Keep Postgres as the source of truth for relational integrity and authorization decisions.
- MongoDB stores only large/unstructured blobs plus minimal pointers; avoid duplicating clinical truth outside Postgres.
- Backup strategy: regular Postgres dumps + Mongo `mongodump` (GridFS buckets included).
- Local development: run Postgres (e.g., `postgres:16-alpine`) and Mongo (`mongo:7`) containers; configure env vars accordingly before starting Flask.
