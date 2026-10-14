import csv
from io import StringIO
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
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
    user: Annotated[User, Depends(get_current_user)],
):
    if user.role not in {"admin", "hr", "employee"}:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view dashboard statistics.",
        )

    # Admin and HR can view organization-wide statistics.
    if user.role in {"admin", "hr"}:
        employee_filter = None

        total_employees = db.scalar(
            select(func.count(Employee.id)).where(
                Employee.is_active.is_(True)
            )
        ) or 0

        attendance_records = db.scalar(
            select(func.count(Attendance.id))
        ) or 0

        pending_leaves = db.scalar(
            select(func.count(Leave.id)).where(
                Leave.status == "pending"
            )
        ) or 0

        payroll_records = db.scalar(
            select(func.count(Payroll.id))
        ) or 0

    else:
        # Employees can view only statistics associated with their account.
        employee_id = user.employee_id

        if employee_id is None:
            return {
                "total_employees": 0,
                "attendance_records": 0,
                "pending_leaves": 0,
                "payroll_records": 0,
            }

        employee = db.scalar(
            select(Employee).where(
                Employee.id == employee_id,
                Employee.is_active.is_(True),
            )
        )

        total_employees = 1 if employee else 0

        attendance_records = db.scalar(
            select(func.count(Attendance.id)).where(
                Attendance.employee_id == employee_id
            )
        ) or 0

        pending_leaves = db.scalar(
            select(func.count(Leave.id)).where(
                Leave.employee_id == employee_id,
                Leave.status == "pending",
            )
        ) or 0

        payroll_records = db.scalar(
            select(func.count(Payroll.id)).where(
                Payroll.employee_id == employee_id
            )
        ) or 0

    return {
        "total_employees": total_employees,
        "attendance_records": attendance_records,
        "pending_leaves": pending_leaves,
        "payroll_records": payroll_records,
    }


@router.get("/employees.csv")
def export_employees(
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Employee Code",
        "First Name",
        "Last Name",
        "Email",
        "Department",
        "Designation",
        "Annual Salary",
        "Active",
    ])

    employees = db.scalars(
        select(Employee).order_by(Employee.id)
    ).all()

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
        headers={
            "Content-Disposition": "attachment; filename=hrms_employees.csv"
        },
    )
