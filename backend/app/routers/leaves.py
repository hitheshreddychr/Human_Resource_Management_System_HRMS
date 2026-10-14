
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.database.session import get_db
from app.models.user import User
from app.schemas.leave import LeaveCreate, LeaveResponse, LeaveReview
from app.services.audit_service import record_audit
from app.services.leave_service import (
    apply_leave,
    list_all_leaves,
    list_my_leaves,
    review_leave,
)

router = APIRouter(prefix="/leaves", tags=["Leave Management"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post("/", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
def submit_leave(
    data: LeaveCreate,
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    leave = apply_leave(db, user, data)
    record_audit(
        db, user.id, "SUBMIT", "leave",
        leave.id, "Submitted a leave request",
    )
    return leave


@router.get("/my-requests", response_model=list[LeaveResponse])
def my_leave_requests(
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    return list_my_leaves(db, user)


@router.get("/", response_model=list[LeaveResponse])
def all_leave_requests(
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    return list_all_leaves(db)


@router.patch("/{leave_id}/review", response_model=LeaveResponse)
def review_leave_request(
    leave_id: int,
    data: LeaveReview,
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    leave = review_leave(db, leave_id, user, data.status)
    record_audit(
        db, user.id, "REVIEW", "leave",
        leave.id, f"Leave request reviewed: {data.status}",
    )
    return leave
