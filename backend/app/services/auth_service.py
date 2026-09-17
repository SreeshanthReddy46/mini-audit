from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email.strip().lower()).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def generate_token_for_user(user: User) -> str:
    token_data = {
        "sub": str(user.id),
        "firm_id": str(user.firm_id),
        "role": user.role
    }
    return create_access_token(data=token_data)
