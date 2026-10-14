from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.database.session import get_db
from app.models.salary_slip import SalarySlip
from app.models.user import User
from app.services.salary_slip_service import generate_salary_slip


router = APIRouter(prefix="/salary-slips", tags=["Salary Slips"])

DatabaseSession = Annotated[Session, Depends(get_db)]

SLIP_DIR = (
    Path(__file__).resolve().parents[1]
    / "uploads"
    / "salary_slips"
)


@router.post("/generate/{payroll_id}")
def create_salary_slip(
    payroll_id: int,
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    slip, _ = generate_salary_slip(db, payroll_id)

    return {
        "message": "Salary slip generated successfully",
        "salary_slip_id": slip.id,
        "download_url": f"/api/v1/salary-slips/{slip.id}/download",
    }


@router.get("/")
def list_salary_slips(
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    query = select(SalarySlip).order_by(SalarySlip.created_at.desc())

    if user.role == "employee":
        if user.employee_id is None:
            return []
        query = query.where(
            SalarySlip.employee_id == user.employee_id
        )

    return db.scalars(query).all()


@router.get("/{slip_id}/download")
def download_salary_slip(
    slip_id: int,
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    slip = db.get(SalarySlip, slip_id)

    if slip is None:
        raise HTTPException(404, "Salary slip not found.")

    if (
        user.role == "employee"
        and user.employee_id != slip.employee_id
    ):
        raise HTTPException(
            403,
            "You cannot access another employee's salary slip.",
        )

    filepath = SLIP_DIR / slip.file_name

    if not filepath.is_file():
        raise HTTPException(
            404,
            "Salary slip PDF file not found.",
        )

    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=slip.file_name,
    )
