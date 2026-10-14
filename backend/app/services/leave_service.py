from datetime import date, datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.leave import Leave
from app.models.user import User
from app.schemas.leave import LeaveCreate


def apply_leave(db: Session, user: User, data: LeaveCreate):
    if user.role != "employee" or user.employee_id is None:
        raise HTTPException(403, "An employee account is required.")

    employee = db.get(Employee, user.employee_id)
    if employee is None or not employee.is_active:
        raise HTTPException(404, "Active employee profile not found.")

    total_days = (data.end_date - data.start_date).days + 1

    overlap = db.scalar(
        select(Leave).where(
            Leave.employee_id == user.employee_id,
            Leave.status.in_(["pending", "approved"]),
            Leave.start_date <= data.end_date,
            Leave.end_date >= data.start_date,
        )
    )
    if overlap:
        raise HTTPException(409, "A leave request overlaps these dates.")

    leave = Leave(
        employee_id=user.employee_id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
        total_days=total_days,
        reason=data.reason,
        status="pending",
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


def list_my_leaves(db: Session, user: User):
    if user.role != "employee" or user.employee_id is None:
        raise HTTPException(403, "An employee account is required.")

    return db.scalars(
        select(Leave)
        .where(Leave.employee_id == user.employee_id)
        .order_by(Leave.created_at.desc())
    ).all()


def list_all_leaves(db: Session):
    return db.scalars(
        select(Leave).order_by(Leave.created_at.desc())
    ).all()


def review_leave(db: Session, leave_id: int, reviewer: User, decision: str):
    leave = db.get(Leave, leave_id)
    if leave is None:
        raise HTTPException(404, "Leave request not found.")

    if leave.status != "pending":
        raise HTTPException(409, "This leave request has already been reviewed.")

    leave.status = decision
    leave.reviewed_by = reviewer.id
    leave.reviewed_at = datetime.now()

    db.commit()
    db.refresh(leave)
    return leave
