# Mini Audit

A production-minded, multi-tenant Audit Document Review System designed specifically for small- to mid-sized Chartered Accountant (CA) firms.

---

## Overview

Chartered Accountant firms manage statutory audits requiring the collection, verification, iterative correction, and formal approval of regulatory compliance documents. The **Mini Audit Document Review System** automates this lifecycle while enforcing strict tenant isolation between competing accounting firms and maintaining an immutable, append-only audit trail.

---

## Problem

CA firms face key compliance challenges:
1. **Uncontrolled communication channels**: Audit records and queries exchanged over email or messaging apps lack traceability and version tracking.
2. **Cross-client data leakage**: Staff members working across multiple clients risk sharing confidential financial data.
3. **Audit trail tampering**: Without cryptographically secured append-only logs, proving who reviewed, requested changes to, or approved a statutory document is difficult during regulatory audits.

---

## Features

- **Strict Multi-Tenant Isolation**: Row-level database filtering ensures Firm A (e.g., *ABC & Co.*) can never see, modify, or discover resources belonging to Firm B (*XYZ & Co.*).
- **Enforced Document Workflow**: State machine validates transitions (`PENDING` → `UPLOADED` → `UNDER_REVIEW` → `CORRECTION_REQUIRED` / `APPROVED`).
- **Role-Based Access Control (RBAC)**: Clear segregation of duties between `STAFF` (upload and correction re-upload) and `REVIEWER` (review, comment-mandatory correction request, and approval).
- **Append-Only Audit Trail**: Every state change and compliance action atomically commits an immutable audit event in the same database transaction.
- **Private File Security**: Files are stored under server-generated UUIDs in a private directory outside the public web root and streamed only after verifying identity and tenant ownership.
- **Pre-Configured Statutory Checklist**: Pre-seeded with the 5 core CA compliance documents (*Bank Statement*, *Sales Register*, *Purchase Register*, *GST Return*, *Expense Summary*).
- **1-Click Evaluation Personas**: Built-in persona switcher allows evaluators to toggle between Staff and Reviewer across two firms instantly.

---

## Workflow

```
Client Created
      │
      ▼
Add Audit Documents (Checklist: Bank Statement, GST, etc.)
      │
      ▼
Staff Uploads Document (Status: UPLOADED, Version: v1)
      │
      ▼
Reviewer Starts Review (Status: UNDER_REVIEW)
      │
      ├───────────────────────────────┐
      ▼                               ▼
Request Correction               Approve Document
(Mandatory comment required)     (Status: APPROVED)
(Status: CORRECTION_REQUIRED)         │
      │                               ▼
      ▼                          Audit History
Staff Re-uploads Revised File     (Completed)
(Status: UPLOADED, Version: v2+)
      │
      └─► Re-review Cycle
```

---

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React icons.
- **Backend**: FastAPI (Python 3.12), Pydantic v2, SQLAlchemy 2.0.
- **Database**: PostgreSQL (Supabase PostgreSQL / local PostgreSQL) with SQLite zero-configuration fallback for local evaluation.
- **Authentication**: JWT authentication with modern `bcrypt` password hashing, delivered via secure `HttpOnly` cookies and Bearer token fallback.
- **Storage**: Private scoped storage (Supabase Storage / local private filesystem storage).
- **Testing**: Pytest with FastAPI `TestClient` (22 automated tests covering RBAC, state transitions, and tenant isolation).

---

## Architecture

```
┌──────────────────┐
│    Next.js UI    │
└────────┬─────────┘
         │
         │ REST API (Bearer JWT / HttpOnly Cookie)
         ▼
┌──────────────────┐
│     FastAPI      │
│                  │
│ Auth             │
│ Authorization    │
│ Workflow Logic   │
│ Audit Logging    │
└────────┬─────────┘
         │
┌────────▼─────────┐
│   PostgreSQL     │
│                  │
│ Firms            │
│ Users            │
│ Clients          │
│ Documents        │
│ Audit Events     │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ Private Storage  │
│ Audit Documents  │
└──────────────────┘
```

---

## Database Design

All primary keys use UUIDs. Every tenant-owned table explicitly includes `firm_id` to establish unambiguous row-level isolation boundaries.

```
Firm
 ├── Users (firm_id FK)
 ├── Clients (firm_id FK)
 │      └── Documents (firm_id FK, client_id FK, uploaded_by FK)
 │             └── Audit Events (firm_id FK, document_id FK, actor_id FK)
 └── Audit Events (firm_id FK)
```

### Table Definitions

1. **`firms`**:
   - `id` (UUID PK), `name` (VARCHAR), `created_at` (TIMESTAMP)
2. **`users`**:
   - `id` (UUID PK), `firm_id` (UUID FK → firms.id), `name` (VARCHAR), `email` (VARCHAR UNIQUE), `password_hash` (VARCHAR), `role` (`STAFF` | `REVIEWER`), `created_at` (TIMESTAMP)
3. **`clients`**:
   - `id` (UUID PK), `firm_id` (UUID FK → firms.id), `name` (VARCHAR), `created_at` (TIMESTAMP)
4. **`documents`**:
   - `id` (UUID PK), `firm_id` (UUID FK → firms.id), `client_id` (UUID FK → clients.id), `name` (VARCHAR), `file_url` (VARCHAR), `status` (`PENDING` | `UPLOADED` | `UNDER_REVIEW` | `CORRECTION_REQUIRED` | `APPROVED`), `uploaded_by` (UUID FK → users.id), `version` (INT), `review_comment` (TEXT), `uploaded_at` (TIMESTAMP), `created_at` (TIMESTAMP), `updated_at` (TIMESTAMP)
5. **`audit_events`**:
   - `id` (UUID PK), `firm_id` (UUID FK → firms.id), `document_id` (UUID FK → documents.id), `actor_id` (UUID FK → users.id), `action` (VARCHAR), `comment` (TEXT), `created_at` (TIMESTAMP), `metadata_json` (JSONB)

---

## Authentication & Authorization

### Authentication
- Passwords hashed using `bcrypt` with unique salts.
- Session managed via signed JWT tokens stored in `HttpOnly`, `SameSite=Lax` cookies, with automatic fallback to `Authorization: Bearer <token>` for API test clients.

### Authorization & RBAC
| Operation | Allowed Role | Non-Permitted Response |
|---|:---:|:---:|
| View Clients & Documents | `STAFF`, `REVIEWER` | `401 Unauthorized` |
| Upload Initial File | `STAFF`, `REVIEWER` | `401 Unauthorized` |
| Start Review (`UNDER_REVIEW`) | `REVIEWER` | `403 Forbidden` |
| Request Correction (`CORRECTION_REQUIRED`) | `REVIEWER` | `403 Forbidden` |
| Approve Document (`APPROVED`) | `REVIEWER` | `403 Forbidden` |
| Re-upload Revised Document (`v2+`) | `STAFF` | `403 Forbidden` |
| Modify Audit History | **None** | `405 Method Not Allowed` |

---

## Tenant Isolation

Tenant isolation is enforced strictly on the backend across all database queries. The client never supplies `firm_id` as an authoritative request parameter.

```
SECURITY TEST

             ABC Reviewer
                  │
                  │
                  ▼
         Requests XYZ document
                  │
                  ▼
        Backend extracts firm_id
             from JWT
                  │
                  ▼
       document.firm_id != user.firm_id
                  │
                  ▼
                 404
```

> **Security Principle**: When a user from Firm A attempts to access an entity belonging to Firm B, the backend returns `404 Not Found` (never `403 Forbidden`), preventing resource enumeration and IDOR attacks.

---

## Audit Trail

### Same-Transaction Atomicity
Document state changes and audit event insertions are committed in the **exact same database transaction**:

```python
# Atomic Transaction
doc.status = "APPROVED"
db.add(AuditEvent(
    firm_id=firm_id,
    document_id=doc.id,
    actor_id=actor_id,
    action="DOCUMENT_APPROVED",
    comment=comment
))
db.commit() # Both succeed or both fail together
```

### Immutability
Audit events are strictly append-only. No `PUT`, `PATCH`, or `DELETE` endpoints exist for audit logs.

---

## Document State Machine

```
[PENDING] ──(Upload v1)──► [UPLOADED] ──(Start Review)──► [UNDER_REVIEW]
                                ▲                               │
                                │                               ├──(Approve)──► [APPROVED]
                           (Re-upload)                          │
                                │                               └──(Request Correction + Reason)
                                │                                       │
                                └────── [CORRECTION_REQUIRED] ◄─────────┘
```

Invalid state transitions (e.g., approving directly from `PENDING` or `UPLOADED`) are rejected with `400 Bad Request`.

---

## Running Locally

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm

### 1. Quick Start (Windows)
Run the root PowerShell script:
```powershell
.\run.ps1
```

### 2. Quick Start (Linux / macOS)
```bash
chmod +x run.sh
./run.sh
```

### 3. Manual Step-by-Step

#### Backend
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\pip install -r requirements.txt
# On Linux/macOS:
source .venv/bin/activate && pip install -r requirements.txt

# Seed demo data
python -m app.seed

# Start backend
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)
```ini
DATABASE_URL=sqlite:///./audit.db
JWT_SECRET_KEY=mini-audit-secure-local-dev-jwt-key-2026-eval-32chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
STORAGE_DIR=./storage

# Optional Supabase integration (if blank, uses secure local private filesystem)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=audit-documents
```

### Frontend (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Demo Credentials

| Firm | Persona | Email | Password | Role |
|---|---|---|---|---|
| **Firm A (ABC & Co.)** | Rohit | `rohit@abc.com` | `password123` | STAFF |
| **Firm A (ABC & Co.)** | Aman | `aman@abc.com` | `password123` | REVIEWER |
| **Firm B (XYZ & Co.)** | Rahul | `rahul@xyz.com` | `password123` | STAFF |
| **Firm B (XYZ & Co.)** | Priya | `priya@xyz.com` | `password123` | REVIEWER |

---

## API Overview

| Method | Endpoint | Allowed Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates credentials and sets session cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clears session cookie |
| `GET` | `/api/auth/me` | Authenticated | Returns current user profile |
| `GET` | `/api/clients` | Firm Users | Lists all clients of current firm |
| `POST` | `/api/clients` | Firm Users | Creates a new client |
| `GET` | `/api/clients/{id}` | Firm Users | Returns client details (404 if other firm) |
| `GET` | `/api/clients/{id}/documents` | Firm Users | Lists client compliance documents |
| `POST` | `/api/documents/{id}/upload` | Firm Users | Uploads initial document file (v1) |
| `GET` | `/api/documents/{id}/file` | Firm Users | Securely streams private file |
| `POST` | `/api/documents/{id}/start-review` | `REVIEWER` | Sets status `UNDER_REVIEW` |
| `POST` | `/api/documents/{id}/request-correction` | `REVIEWER` | Sets status `CORRECTION_REQUIRED` (requires reason) |
| `POST` | `/api/documents/{id}/reupload` | `STAFF` | Re-uploads revised document (version increments) |
| `POST` | `/api/documents/{id}/approve` | `REVIEWER` | Sets status `APPROVED` |
| `GET` | `/api/documents/{id}/audit` | Firm Users | Returns chronological document audit history |
| `GET` | `/api/audit` | Firm Users | Returns firm-wide audit trail |

---

## Testing

The project includes 22 automated Pytest tests verifying functional workflow, RBAC boundaries, state transitions, and tenant isolation.

To run the full test suite:
```bash
cd backend
.\.venv\Scripts\pytest.exe
```

Test Results:
```text
tests\test_audit.py ...                                                  [ 13%]
tests\test_auth.py ........                                              [ 50%]
tests\test_clients.py ..                                                 [ 59%]
tests\test_documents.py ..                                               [ 68%]
tests\test_tenant_isolation.py ....                                      [ 86%]
tests\test_workflow.py ...                                               [100%]

======================= 22 passed in 22.51s =======================
```

---

## AI Usage

In adherence to academic integrity and transparency guidelines:
- **Architecture & System Design**: Collaborative pair-programming was used to outline the relational schema, multi-tenant compound query design, and state transition invariants.
- **Code Generation**: AI assistance was utilized to scaffold boilerplate components, type definitions, and test fixtures.
- **Verification**: Every module, state machine transition, and tenant isolation rule was reviewed, tested, and validated with automated test suites before committing.

---

## What I Would Improve With One More Week

1. **Row-Level Security (RLS) in PostgreSQL**: Complement backend application filtering with native PostgreSQL Row-Level Security policies as defense-in-depth.
2. **Virus / Malware Scanning**: Integrate ClamAV or a webhook to scan uploaded documents before marking them ready for review.
3. **Document Diffing & Side-by-Side Version Viewer**: Render a visual split-screen diff showing changes between revision v1 and revision v2.
4. **Automated End-to-End Browser Tests**: Implement Playwright tests simulating the 3-minute evaluation walkthrough.
