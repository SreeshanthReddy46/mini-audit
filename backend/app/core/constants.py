from enum import Enum


class UserRole(str, Enum):
    STAFF = "STAFF"
    REVIEWER = "REVIEWER"
    ADMIN = "ADMIN"


class DocumentStatus(str, Enum):
    PENDING = "PENDING"
    UPLOADED = "UPLOADED"
    UNDER_REVIEW = "UNDER_REVIEW"
    CORRECTION_REQUIRED = "CORRECTION_REQUIRED"
    APPROVED = "APPROVED"


class ReviewDecision(str, Enum):
    APPROVED = "APPROVED"
    CORRECTION_REQUIRED = "CORRECTION_REQUIRED"


class AIAnalysisStatus(str, Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AuditAction(str, Enum):
    USER_LOGIN = "USER_LOGIN"
    USER_LOGOUT = "USER_LOGOUT"
    CLIENT_CREATED = "CLIENT_CREATED"
    DOCUMENT_CREATED = "DOCUMENT_CREATED"
    DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED"
    DOCUMENT_VERSION_CREATED = "DOCUMENT_VERSION_CREATED"
    REVIEW_STARTED = "REVIEW_STARTED"
    CORRECTION_REQUESTED = "CORRECTION_REQUESTED"
    DOCUMENT_APPROVED = "DOCUMENT_APPROVED"
    AI_ANALYSIS_REQUESTED = "AI_ANALYSIS_REQUESTED"
    AI_ANALYSIS_COMPLETED = "AI_ANALYSIS_COMPLETED"
    DOCUMENT_DOWNLOADED = "DOCUMENT_DOWNLOADED"


class AuditEntity(str, Enum):
    USER = "user"
    CLIENT = "client"
    DOCUMENT = "document"
    DOCUMENT_VERSION = "document_version"
    REVIEW = "review"
    AI_ANALYSIS = "ai_analysis"


# Standard compliance audit documents checklist
STANDARD_AUDIT_CHECKLIST = [
    "Bank Statement",
    "Sales Register",
    "Purchase Register",
    "GST Return",
    "Expense Summary"
]

# File security constants
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".pdf", ".xlsx", ".xls", ".csv", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "image/png",
    "image/jpeg",
    "application/octet-stream"
}
