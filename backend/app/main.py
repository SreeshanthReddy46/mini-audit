from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import MiniAuditException, format_error_response
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.api import auth, clients, documents, audit

setup_logging()

app = FastAPI(
    title="Mini Audit Document Review System API",
    version="1.0.0",
    description="Multi-tenant Audit Document Review System for CA Firms",
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=500)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
)

from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(MiniAuditException)
async def mini_audit_exception_handler(request: Request, exc: MiniAuditException):
    logger.warning(f"[{exc.code}] {exc.message} (path: {request.url.path})")
    return format_error_response(
        request=request,
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
    )


@app.exception_handler(StarletteHTTPException)
async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        422: "INVALID_DOCUMENT_STATE",
        429: "RATE_LIMIT_EXCEEDED",
    }
    code = code_map.get(exc.status_code, f"HTTP_{exc.status_code}")
    message = str(exc.detail)
    logger.info(f"[{code}] {message} (status: {exc.status_code}, path: {request.url.path})")
    return format_error_response(
        request=request,
        status_code=exc.status_code,
        code=code,
        message=message,
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return await starlette_http_exception_handler(request, exc)


from app.api import auth, clients, documents, audit, reviews, ai

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(documents.router)
app.include_router(reviews.router)
app.include_router(audit.router)
app.include_router(ai.router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "mini-audit-backend",
        "database_configured": bool(settings.DATABASE_URL),
        "storage_mode": "supabase" if settings.SUPABASE_URL else "local_private",
    }
