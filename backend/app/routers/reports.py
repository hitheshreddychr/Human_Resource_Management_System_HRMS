import csv
from io import StringIO
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.leave import Leave
from app.models.payroll import Payroll
from app.models.user import User


router = APIRouter(prefix="/reports", tags=["Reports"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/summary")
def report_summary(
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    return {
        "total_employees": db.scalar(
            select(func.count(Employee.id)).where(Employee.is_active.is_(True))
        ) or 0,
        "attendance_records": db.scalar(
            select(func.count(Attendance.id))
        ) or 0,
        "pending_leaves": db.scalar(
            select(func.count(Leave.id)).where(Leave.status == "pending")
        ) or 0,
        "payroll_records": db.scalar(
            select(func.count(Payroll.id))
        ) or 0,
    }


@router.get("/employees.csv")
def export_employees(
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Employee Code", "First Name", "Last Name", "Email",
        "Department", "Designation", "Annual Salary", "Active",
    ])

    employees = db.scalars(select(Employee).order_by(Employee.id)).all()

    for employee in employees:
        writer.writerow([
            employee.employee_code,
            employee.first_name,
            employee.last_name,
            employee.email,
            employee.department,
            employee.designation,
            employee.annual_salary,
            employee.is_active,
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hrms_employees.csv"},
    )
