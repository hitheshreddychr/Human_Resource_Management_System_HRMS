from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import DatabaseSession, get_current_user, require_roles
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse
from app.services.auth_service import authenticate_user, create_user


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: DatabaseSession):
    user, token = authenticate_user(db, credentials)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_account(
    data: UserCreate,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles("admin"))],
):
    return create_user(db, data)


@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user
