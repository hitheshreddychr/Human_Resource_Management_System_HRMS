
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.database.session import get_db
from app.models.user import User
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
)
from app.services.audit_service import record_audit
from app.services.employee_service import (
    create_employee,
    deactivate_employee,
    get_employee,
    list_employees,
    update_employee,
)

router = APIRouter(prefix="/employees", tags=["Employees"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/", response_model=list[EmployeeResponse])
def read_employees(
    db: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
):
    return list_employees(db)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def read_employee(
    employee_id: int,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
):
    return get_employee(db, employee_id)


@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_employee(
    data: EmployeeCreate,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    employee = create_employee(db, data)
    record_audit(
        db, current_user.id, "CREATE", "employee",
        employee.id, f"Created employee {employee.employee_code}",
    )
    return employee


@router.patch("/{employee_id}", response_model=EmployeeResponse)
def edit_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    employee = update_employee(db, employee_id, data)
    record_audit(
        db, current_user.id, "UPDATE", "employee",
        employee.id, f"Updated employee {employee.employee_code}",
    )
    return employee


@router.patch("/{employee_id}/deactivate", response_model=EmployeeResponse)
def disable_employee(
    employee_id: int,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles("admin", "hr"))],
):
    employee = deactivate_employee(db, employee_id)
    record_audit(
        db, current_user.id, "DEACTIVATE", "employee",
        employee.id, f"Deactivated employee {employee.employee_code}",
    )
    return employee
