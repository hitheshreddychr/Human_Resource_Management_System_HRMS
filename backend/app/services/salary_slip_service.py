from io import BytesIO
from pathlib import Path

from fastapi import HTTPException
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.payroll import Payroll
from app.models.salary_slip import SalarySlip


SLIP_DIR = (
    Path(__file__).resolve().parents[1]
    / "uploads"
    / "salary_slips"
)
SLIP_DIR.mkdir(parents=True, exist_ok=True)


def generate_salary_slip(db: Session, payroll_id: int):
    payroll = db.get(Payroll, payroll_id)

    if payroll is None:
        raise HTTPException(404, "Payroll record not found.")

    existing = db.scalar(
        select(SalarySlip).where(
            SalarySlip.payroll_id == payroll_id
        )
    )

    if existing:
        raise HTTPException(409, "Salary slip already exists.")

    employee = db.get(Employee, payroll.employee_id)

    if employee is None:
        raise HTTPException(404, "Employee not found.")

    filename = f"salary_slip_{payroll.id}.pdf"
    filepath = SLIP_DIR / filename

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle("HRMS Salary Slip")

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(60, 790, "HRMS - SALARY SLIP")

    pdf.setFont("Helvetica", 11)

    lines = [
        f"Employee Code: {employee.employee_code}",
        f"Employee Name: {employee.first_name} {employee.last_name}",
        f"Department: {employee.department}",
        f"Designation: {employee.designation}",
        f"Payroll Month: {payroll.payroll_month.strftime('%B %Y')}",
        "",
        f"Monthly Earnings: INR {payroll.basic_salary:,.2f}",
        f"LOP Deduction: INR {payroll.lop_deduction:,.2f}",
        f"Net Salary: INR {payroll.net_salary:,.2f}",
        "",
        f"Payroll Status: {payroll.status}",
    ]

    y = 740
    for line in lines:
        pdf.drawString(60, y, line)
        y -= 28

    pdf.save()
    filepath.write_bytes(buffer.getvalue())

    slip = SalarySlip(
        payroll_id=payroll.id,
        employee_id=payroll.employee_id,
        file_name=filename,
    )

    try:
        db.add(slip)
        db.commit()
        db.refresh(slip)
    except Exception:
        db.rollback()
        if filepath.exists():
            filepath.unlink()
        raise

    return slip, filepath
