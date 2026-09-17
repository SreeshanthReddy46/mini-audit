# Architecture Documentation

## System Architecture

The Mini Audit Document Review System is structured around a simple, robust 3-tier architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION TIER                              │
│  Next.js 14+ (App Router) + TypeScript + Tailwind CSS                   │
│  - Role-aware client-side components                                    │
│  - Document upload / preview / action interfaces                        │
│  - Pure REST API consumer                                               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / JSON & Multipart
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION TIER                               │
│  FastAPI (Python 3.12)                                                  │
│                                                                         │
│  ├── API Routers: /api/auth, /api/clients, /api/documents, /api/audit    │
│  ├── Security & Auth Guard: JWT verification, RBAC dependency checks    │
│  ├── State Machine: Strict transition verification & comment checks     │
│  ├── Audit Service: Append-only event logger                            │
│  └── Storage Service: Private filesystem & Supabase Storage abstraction │
└──────────────────────┬────────────────────────────┬─────────────────────┘
                       │                            │
                       ▼                            ▼
┌──────────────────────────────────┐  ┌───────────────────────────────────┐
│          DATA TIER               │  │       PRIVATE STORAGE TIER        │
│  SQLAlchemy 2.0 ORM              │  │  Private Storage                      │
│  PostgreSQL (or SQLite fallback) │  │  ./backend/storage/{firm_id}/         │
│  - Multi-tenant row isolation    │  │  - UUID filenames                     │
│  - Foreign keys & compound index │  │  - Authenticated streaming only       │
└──────────────────────────────────┘  └───────────────────────────────────┘
```

## Layer Responsibilities

1. **Presentation Layer (`frontend/`)**:
   - Manages UI states, user feedback, and form validations.
   - Strictly consumes backend REST endpoints.
   - UI role checks are for UX enhancement only; never treated as security boundaries.

2. **Application Layer (`backend/app/`)**:
   - `core/`: Application configuration, database session handling, JWT security, and dependency injection guards (`get_current_user`, `require_role`).
   - `models/`: Relational SQLAlchemy definitions using UUID primary keys.
   - `schemas/`: Pydantic models for strict request validation and response serialization.
   - `services/`: Business logic, state transitions, private file persistence, and audit event dispatching.
   - `api/`: Clean REST endpoints exposing the service functionality.

3. **Data Layer**:
   - Explicit `firm_id` foreign keys on every tenant-owned table (`users`, `clients`, `documents`, `audit_events`).
   - Atomic database transactions ensure that state changes and audit events are committed together.
