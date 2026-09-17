import uuid
from typing import Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# Optional bearer token scheme (so we can also read from HttpOnly cookies)
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    token: Optional[str] = None

    # 1. Try extracting Bearer token from Authorization header
    if auth_credentials:
        token = auth_credentials.credentials
    
    # 2. Try extracting from HttpOnly cookie
    if not token and "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Bearer token or session cookie required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format for user ID.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists.",
        )

    # Attach firm_name for convenient response serialization
    if user.firm:
        user.firm_name = user.firm.name

    return user


def require_role(allowed_roles: List[str]):
    """Enforce Role-Based Access Control (RBAC)."""
    def role_dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: role '{current_user.role}' is not permitted to perform this action. Required: {', '.join(allowed_roles)}."
            )
        return current_user
    return role_dependency


# Pre-defined convenience role guards
require_staff = require_role(["STAFF"])
require_reviewer = require_role(["REVIEWER"])
