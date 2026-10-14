
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.database.session import get_db
from app.models.user import User
from app.schemas.payroll import PayrollGenerate, PayrollResponse
from app.services.audit_service import record_audit
from app.services.payroll_service import generate_payroll, list_payroll

router = APIRouter(prefix="/payroll", tags=["Payroll"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post("/", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
def create_payroll(
    data: PayrollGenerate,
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    payroll = generate_payroll(db, data.employee_id, data.payroll_month)
    record_audit(
        db, user.id, "GENERATE", "payroll",
        payroll.id,
        f"Generated payroll for employee {data.employee_id}, "
        f"month {data.payroll_month}",
    )
    return payroll


@router.get("/", response_model=list[PayrollResponse])
def read_payroll(
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    return list_payroll(db)
