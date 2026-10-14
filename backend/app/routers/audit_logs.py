from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.database.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User


router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/")
def read_audit_logs(
    db: DatabaseSession,
    user: Annotated[User, Depends(require_roles("admin"))],
):
    return db.scalars(
        select(AuditLog).order_by(AuditLog.created_at.desc())
    ).all()
