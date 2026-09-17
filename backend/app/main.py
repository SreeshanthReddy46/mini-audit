from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, clients

app = FastAPI(
    title="Mini Audit Document Review System API",
    version="1.0.0",
    description="Multi-tenant Audit Document Review System for CA Firms"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(clients.router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "mini-audit-backend",
        "database_configured": bool(settings.DATABASE_URL),
        "storage_mode": "supabase" if settings.SUPABASE_URL else "local_private"
    }
