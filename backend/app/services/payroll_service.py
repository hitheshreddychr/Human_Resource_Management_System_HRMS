import calendar
from datetime import date

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.leave import Leave
from app.models.payroll import Payroll


def generate_payroll(db: Session, employee_id: int, payroll_month: date):
    employee = db.get(Employee, employee_id)

    if employee is None:
        raise HTTPException(404, "Employee not found.")

    month = payroll_month.replace(day=1)

    existing = db.scalar(
        select(Payroll).where(
            Payroll.employee_id == employee_id,
            Payroll.payroll_month == month,
        )
    )
    if existing:
        raise HTTPException(409, "Payroll already exists for this month.")

    last_day = calendar.monthrange(month.year, month.month)[1]
    month_end = month.replace(day=last_day)

    approved_leave_days = db.scalar(
        select(Leave).where(
            Leave.employee_id == employee_id,
            Leave.status == "approved",
            Leave.leave_type != "unpaid",
            Leave.start_date <= month_end,
            Leave.end_date >= month,
        )
    )

    unpaid_days = 0
    unpaid_leaves = db.scalars(
        select(Leave).where(
            Leave.employee_id == employee_id,
            Leave.status == "approved",
            Leave.leave_type == "unpaid",
            Leave.start_date <= month_end,
            Leave.end_date >= month,
        )
    ).all()

    for leave in unpaid_leaves:
        overlap_start = max(leave.start_date, month)
        overlap_end = min(leave.end_date, month_end)
        unpaid_days += (overlap_end - overlap_start).days + 1

    attendance_records = db.scalars(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.attendance_date >= month,
            Attendance.attendance_date <= month_end,
        )
    ).all()

    lop_days = unpaid_days + sum(
        1 for record in attendance_records if record.status == "lop"
    )

    working_days = sum(
        1 for day in range(1, last_day + 1)
        if date(month.year, month.month, day).weekday() < 5
    )
    working_days = max(working_days, 1)

    monthly_salary = round(employee.annual_salary / 12)
    deduction = min(
        monthly_salary,
        round(monthly_salary * lop_days / working_days),
    )
    net_salary = max(0, monthly_salary - deduction)

    payroll = Payroll(
        employee_id=employee_id,
        payroll_month=month,
        basic_salary=monthly_salary,
        lop_deduction=deduction,
        net_salary=net_salary,
        status="generated",
        is_locked=True,
    )

    db.add(payroll)
    db.commit()
    db.refresh(payroll)
    return payroll


def list_payroll(db: Session):
    return db.scalars(
        select(Payroll).order_by(Payroll.payroll_month.desc())
    ).all()
