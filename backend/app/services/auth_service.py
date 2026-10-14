from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.jwt import create_access_token
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, UserCreate


def authenticate_user(db: Session, credentials: LoginRequest) -> tuple[User, str]:
    user = db.scalar(
        select(User).where(User.email == credentials.email.lower())
    )

    if (
        user is None
        or not user.is_active
        or not verify_password(credentials.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(str(user.id), user.role)
    return user, token


def create_user(db: Session, data: UserCreate) -> User:
    email = data.email.lower()

    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="Email already exists.")

    if data.role == "employee":
        if data.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Employee ID is required for employee accounts.",
            )

        from app.models.employee import Employee

        employee = db.get(Employee, data.employee_id)

        if employee is None or not employee.is_active:
            raise HTTPException(
                status_code=400,
                detail="A valid active employee is required.",
            )

        if db.scalar(
            select(User).where(User.employee_id == data.employee_id)
        ):
            raise HTTPException(
                status_code=409,
                detail="This employee already has a user account.",
            )

        if employee.email.lower() != email:
            raise HTTPException(
                status_code=400,
                detail="User email must match the employee email.",
            )

    elif data.employee_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Only employee accounts can be linked to an employee record.",
        )

    user = User(
        email=email,
        hashed_password=hash_password(data.password),
        role=data.role,
        employee_id=data.employee_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
