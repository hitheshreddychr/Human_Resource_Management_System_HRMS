from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class SalarySlip(Base):
    __tablename__ = "salary_slips"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    payroll_id: Mapped[int] = mapped_column(
        ForeignKey("payroll.id"), unique=True
    )
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), index=True
    )
    file_name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
