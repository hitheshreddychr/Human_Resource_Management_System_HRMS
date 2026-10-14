from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class LeaveCreate(BaseModel):
    leave_type: Literal["casual", "sick", "earned", "unpaid"]
    start_date: date
    end_date: date
    reason: str = Field(min_length=5, max_length=1000)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot precede start date.")
        return self


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    total_days: int
    reason: str
    status: str
    reviewed_by: int | None
    reviewed_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeaveReview(BaseModel):
    status: Literal["approved", "rejected"]
