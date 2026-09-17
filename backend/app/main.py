from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Mini Audit Document Review System API",
    version="1.0.0",
    description="Multi-tenant Audit Document Review System for CA Firms"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "mini-audit-backend",
        "database_configured": bool(settings.DATABASE_URL),
        "storage_mode": "supabase" if settings.SUPABASE_URL else "local_private"
    }
