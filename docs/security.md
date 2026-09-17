# Security & Multi-Tenant Isolation Specification

## 1. Multi-Tenant Isolation Strategy

Tenant isolation is the core security boundary of the Mini Audit platform. It guarantees that users belonging to Firm A cannot read, modify, or infer the existence of resources belonging to Firm B.

### Server-Side Enforcement (Never Trust the Client)
- The client NEVER supplies `firm_id` as an authoritative request parameter.
- The user's `firm_id` is extracted strictly from the validated JWT token by backend dependencies.
- Every database query for tenant resources enforces `firm_id`:
  ```python
  document = db.query(Document).filter(
      Document.id == document_id,
      Document.firm_id == current_user.firm_id
  ).first()
  ```
- If a document or client exists in another firm, the API returns `404 Not Found`. Returning `403 Forbidden` would confirm the existence of an IDOR target.

## 2. Role-Based Access Control (RBAC)

Two distinct roles are supported:
- `STAFF`: Can upload audit documents and respond to correction requests by re-uploading revised files. Cannot approve or request corrections.
- `REVIEWER`: Can review documents, approve documents, and request corrections with mandatory feedback comments.

RBAC is enforced declaratively using FastAPI dependency injection:
```python
@router.post("/documents/{document_id}/approve")
def approve_document(
    document_id: UUID,
    current_user: User = Depends(require_role(["REVIEWER"])),
    db: Session = Depends(get_db)
):
    ...
```

## 3. Append-Only Audit Integrity

- State changes and audit event creation occur within the exact same database transaction (`db.commit()`).
- Normal API users cannot modify or delete audit history. There are no `PUT`, `PATCH`, or `DELETE` endpoints for audit events.

## 4. Private File Storage

- Uploaded files are validated against allowed extensions (`.pdf`, `.csv`, `.xlsx`) and size limits.
- Stored files are assigned random UUID names on disk and stored in private directories scoped by tenant: `./backend/storage/{firm_id}/{uuid}`.
- Files are streamed to authorized users only after verifying tenant ownership and permissions.
