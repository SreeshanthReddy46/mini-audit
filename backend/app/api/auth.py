from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import authenticate_user, generate_token_for_user

from app.seed import seed_database

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = generate_token_for_user(user)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=86400,
        path="/"
    )

    user_data = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        firm_id=user.firm_id,
        firm_name=user.firm.name if user.firm else None
    )

    return TokenResponse(access_token=access_token, user=user_data)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    try:
        seed_database()
    except Exception:
        pass
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        firm_id=current_user.firm_id,
        firm_name=current_user.firm.name if current_user.firm else None
    )
