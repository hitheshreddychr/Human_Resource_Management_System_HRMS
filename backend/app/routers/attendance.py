
from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import AttendanceResponse
from app.services.audit_service import record_audit

router = APIRouter(prefix="/attendance", tags=["Attendance"])
DatabaseSession = Annotated[Session, Depends(get_db)]


def get_employee_id(db: Session, user: User) -> int:
    if user.role == "employee":
        if user.employee_id is None:
            raise HTTPException(
                400, "Employee account is not linked to a profile."
            )
        return user.employee_id

    raise HTTPException(400, "Employee account required for this operation.")


@router.post("/check-in", response_model=AttendanceResponse)
def check_in(
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    employee_id = get_employee_id(db, user)
    employee = db.get(Employee, employee_id)

    if employee is None or not employee.is_active:
        raise HTTPException(404, "Active employee not found.")

    today = date.today()
    record = db.scalar(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.attendance_date == today,
        )
    )

    if record:
        raise HTTPException(409, "Attendance already checked in today.")

    record = Attendance(
        employee_id=employee_id,
        attendance_date=today,
        check_in=datetime.now(),
        status="present",
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    record_audit(
        db, user.id, "CHECK_IN", "attendance",
        record.id, f"Employee {employee_id} checked in",
    )
    return record


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    employee_id = get_employee_id(db, user)

    record = db.scalar(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.attendance_date == date.today(),
        )
    )

    if record is None or record.check_in is None:
        raise HTTPException(404, "Today's check-in was not found.")

    if record.check_out is not None:
        raise HTTPException(409, "Already checked out today.")

    now = datetime.now()
    if now < record.check_in:
        raise HTTPException(400, "Check-out cannot precede check-in.")

    record.check_out = now
    record.working_minutes = int(
        (now - record.check_in).total_seconds() // 60
    )
    db.commit()
    db.refresh(record)

    record_audit(
        db, user.id, "CHECK_OUT", "attendance",
        record.id, f"Employee {employee_id} checked out",
    )
    return record


@router.get("/my-history", response_model=list[AttendanceResponse])
def my_history(
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    employee_id = get_employee_id(db, user)
    return db.scalars(
        select(Attendance)
        .where(Attendance.employee_id == employee_id)
        .order_by(Attendance.attendance_date.desc())
    ).all()


@router.get("/", response_model=list[AttendanceResponse])
def all_attendance(
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    return db.scalars(
        select(Attendance).order_by(Attendance.attendance_date.desc())
    ).all()
