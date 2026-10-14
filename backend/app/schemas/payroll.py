from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PayrollGenerate(BaseModel):
    employee_id: int = Field(gt=0)
    payroll_month: date


class PayrollResponse(BaseModel):
    id: int
    employee_id: int
    payroll_month: date
    basic_salary: int
    lop_deduction: int
    net_salary: int
    status: str
    is_locked: bool
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
