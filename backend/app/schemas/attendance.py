from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    attendance_date: date
    check_in: datetime | None
    check_out: datetime | None
    working_minutes: int
    status: str

    model_config = ConfigDict(from_attributes=True)
