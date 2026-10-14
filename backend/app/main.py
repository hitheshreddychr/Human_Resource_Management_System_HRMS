from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import Base, engine
from app import models
from app.routers.auth import router as auth_router
from app.routers.employees import router as employees_router
from app.routers.attendance import router as attendance_router
from app.routers.leaves import router as leaves_router
from app.routers.payroll import router as payroll_router
from app.routers.salary_slips import router as salary_slips_router
from app.routers.notifications import router as notifications_router
from app.routers.audit_logs import router as audit_logs_router
from app.routers.reports import router as reports_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Human Resource Management System API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.CORS_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def health_check():
    return {"message": "HRMS API is running", "status": "healthy"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(employees_router, prefix=settings.API_V1_PREFIX)
app.include_router(attendance_router, prefix=settings.API_V1_PREFIX)
app.include_router(leaves_router, prefix=settings.API_V1_PREFIX)
app.include_router(payroll_router, prefix=settings.API_V1_PREFIX)
app.include_router(salary_slips_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_logs_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
