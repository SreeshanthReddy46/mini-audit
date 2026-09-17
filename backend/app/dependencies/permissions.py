from typing import List
from fastapi import Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from app.models.user import User


def require_role(allowed_roles: List[str]):
    """
    Enforces Role-Based Access Control (RBAC).
    Rejects unauthorized roles with HTTP 403 Forbidden.
    """
    def role_dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: role '{current_user.role}' is not permitted to perform this action. Required: {', '.join(allowed_roles)}.",
            )
        return current_user

    return role_dependency


# Pre-defined convenience role guards
require_staff = require_role(["STAFF", "ADMIN"])
require_reviewer = require_role(["REVIEWER", "ADMIN"])
require_admin = require_role(["ADMIN"])
