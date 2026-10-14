from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Payroll(Base):
    __tablename__ = "payroll"

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "payroll_month",
            name="uq_payroll_employee_month",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), index=True
    )
    payroll_month: Mapped[date] = mapped_column(Date, index=True)
    basic_salary: Mapped[int] = mapped_column(Integer, default=0)
    lop_deduction: Mapped[int] = mapped_column(Integer, default=0)
    net_salary: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        String(20), default="generated"
    )
    is_locked: Mapped[bool] = mapped_column(
        Boolean, default=True
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
