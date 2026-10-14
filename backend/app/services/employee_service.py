from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


def list_employees(db: Session):
    return db.scalars(
        select(Employee).order_by(Employee.id.desc())
    ).all()


def get_employee(db: Session, employee_id: int):
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found.")
    return employee


def create_employee(db: Session, data: EmployeeCreate):
    existing = db.scalar(
        select(Employee).where(
            (Employee.employee_code == data.employee_code)
            | (Employee.email == str(data.email).lower())
        )
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Employee code or email already exists.",
        )

    employee_data = data.model_dump()
    employee_data["email"] = str(data.email).lower()

    employee = Employee(**employee_data)
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def update_employee(db: Session, employee_id: int, data: EmployeeUpdate):
    employee = get_employee(db, employee_id)
    changes = data.model_dump(exclude_unset=True)

    if "email" in changes and changes["email"] is not None:
        changes["email"] = str(changes["email"]).lower()
        existing = db.scalar(
            select(Employee).where(
                Employee.email == changes["email"],
                Employee.id != employee_id,
            )
        )
        if existing:
            raise HTTPException(status_code=409, detail="Email already exists.")

    for field, value in changes.items():
        if value is not None:
            setattr(employee, field, value)

    db.commit()
    db.refresh(employee)
    return employee


def deactivate_employee(db: Session, employee_id: int):
    employee = get_employee(db, employee_id)
    employee.is_active = False

    db.commit()
    db.refresh(employee)
    return employee
