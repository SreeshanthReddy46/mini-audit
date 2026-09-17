from typing import Any, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse


class MiniAuditException(Exception):
    """Base exception for all domain-specific application errors."""

    def __init__(
        self,
        message: str,
        code: str = "APPLICATION_ERROR",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Any] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class ResourceNotFoundError(MiniAuditException):
    """Raised when an entity does not exist."""

    def __init__(self, message: str = "Resource not found", code: str = "NOT_FOUND"):
        super().__init__(message=message, code=code, status_code=status.HTTP_404_NOT_FOUND)


class TenantIsolationError(MiniAuditException):
    """
    Raised when a resource is queried across tenant boundaries.
    Always mapped to HTTP 404 (Not Found) to prevent IDOR discovery and resource enumeration.
    """

    def __init__(self, message: str = "Resource not found", code: str = "RESOURCE_NOT_FOUND"):
        super().__init__(message=message, code=code, status_code=status.HTTP_404_NOT_FOUND)


class InvalidWorkflowStateError(MiniAuditException):
    """Raised when an illegal state transition is attempted on a document."""

    def __init__(
        self,
        message: str = "This document cannot transition in its current state.",
        code: str = "INVALID_DOCUMENT_STATE",
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


class PermissionDeniedError(MiniAuditException):
    """Raised when an authenticated user lacks the required role for an operation."""

    def __init__(
        self,
        message: str = "You do not have permission to perform this action.",
        code: str = "PERMISSION_DENIED",
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class AuthenticationError(MiniAuditException):
    """Raised when authentication fails or token is invalid/expired."""

    def __init__(
        self,
        message: str = "Invalid email or password.",
        code: str = "AUTHENTICATION_FAILED",
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class FileSecurityError(MiniAuditException):
    """Raised when an uploaded file violates safety, size, or extension policies."""

    def __init__(
        self,
        message: str = "File validation failed.",
        code: str = "FILE_SECURITY_VIOLATION",
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class RateLimitExceededError(MiniAuditException):
    """Raised when an IP or user exceeds allowed request thresholds."""

    def __init__(
        self,
        message: str = "Rate limit exceeded. Please try again shortly.",
        code: str = "RATE_LIMIT_EXCEEDED",
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        )


def format_error_response(
    request: Request,
    status_code: int,
    code: str,
    message: str,
    details: Optional[Any] = None,
) -> JSONResponse:
    """
    Standardized error envelope compliant with evaluation requirements.
    Provides both 'detail' (for backward-compatibility with tests/clients)
    and 'error' (structured with code, message, request_id).
    """
    request_id = getattr(request.state, "request_id", "req_unknown")
    content = {
        "detail": message,
        "error": {
            "code": code,
            "message": message,
            "request_id": request_id,
        },
    }
    if details:
        content["error"]["details"] = details

    return JSONResponse(status_code=status_code, content=content)
