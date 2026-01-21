# Database Options: MongoDB Add‑On vs. Switching to Postgres

## Current Stack
- Backend uses Flask + SQLAlchemy with a MySQL-compatible driver (`pymysql`) and Alembic migrations.
- AI and clinical features already assume relational storage for patients, appointments, records, and embeddings.

## Adding MongoDB (Sidecar Patterns)
1) **Document Store for Unstructured Data (recommended hybrid)**
   - Use MongoDB for large/unstructured blobs (uploads, AI prompts/results, audit logs) while keeping core clinical data in MySQL.
   - How:
     - Add dependency: `pip install pymongo` (or `motor` if you need async; current app is sync, so `pymongo` is simpler).
     - Add env vars: `MONGO_URI`, `MONGO_DB`.
     - Create a lightweight connector (e.g., `app/utils/mongo.py`) that instantiates a singleton client on first use.
     - Use typed collections: `db.ai_logs`, `db.uploads`, `db.events`.
   - Pros: Minimal blast radius; no ORM migration; best fit for semi-structured AI payloads; easy to scale independently.
   - Cons: Two data stores to operate/backup; eventual consistency across SQL/Mongo if you duplicate references.

2) **Event/Audit Log Sink**
   - Write append-only audit events, LLM conversations, and RAG traces to MongoDB.
   - Pattern: enqueue events in SQL transaction hooks and write to Mongo in a best-effort path (non-blocking).

3) **Feature Flags / Config Store**
   - Keep feature toggles or tuning parameters in a Mongo collection to avoid schema migrations for small config changes.

4) **Not Recommended: Full Domain Move to Mongo**
   - Replacing SQL for patients/appointments would require rewriting models, validation, and queries; loses relational integrity and existing Alembic migrations.

## Implementation Sketch (Hybrid)
- Config: extend `app/config.py` to read `MONGO_URI`/`MONGO_DB`.
- Client: `app/utils/mongo.py`
  ```python
  from pymongo import MongoClient
  from flask import current_app

  _client = None
  def get_mongo():
      global _client
      if _client is None:
          _client = MongoClient(current_app.config["MONGO_URI"])
      return _client[current_app.config["MONGO_DB"]]
  ```
- Usage: import `get_mongo()` inside AI routes/services for logging/upload metadata.
- Deploy: run `mongod` locally or via Docker Compose (`image: mongo:7`, expose `27017`).

## Feasibility of Switching to Postgres
- **Easy and recommended** if you want a single relational store with better JSON/FTS support.
- What to change:
  - Dependencies: replace `pymysql` with `psycopg2-binary` (or `psycopg`/`psycopg[binary,pool]`).
  - Config: update SQLALCHEMY_DATABASE_URI to `postgresql+psycopg2://user:pass@host:5432/dbname`.
  - Migrations: regenerate/rewind Alembic history against Postgres. If starting fresh, drop MySQL schema and run `flask db upgrade`. For live data, use `pgloader`/`ora2pg`-style tools or dump/import via CSV with transform scripts.
  - Text/search: Postgres offers `GIN` indexes on `jsonb` and built-in FTS; good fit if you plan to store embeddings metadata or AI logs relationally.
  - Deployment: add Postgres service to Docker Compose (`postgres:16`, init user/db via env or init SQL).
- Pros: Stronger JSON support, better migrations story, single store simplicity, fewer driver quirks than MySQL.
- Cons: Requires data migration and DSN changes; need new backups/monitoring; minor SQLAlchemy dialect differences (e.g., `Enum` vs `VARCHAR` enums, `JSON` vs `jsonb`).

## Recommendations
- Short term: keep MySQL for core clinical data; add MongoDB as a sidecar only for un/semistructured AI artifacts and logging (Pattern 1). Low risk, no schema rewrites.
- Medium term: consider moving the primary relational store to Postgres for richer JSON/FTS and to avoid MySQL limitations; do this before prod data grows large.
- Avoid moving core domain to MongoDB; use it as a complement, not a replacement.
