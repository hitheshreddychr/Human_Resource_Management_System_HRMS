from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import list_notifications


router = APIRouter(prefix="/notifications", tags=["Notifications"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/", response_model=list[NotificationResponse])
def read_notifications(
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    return list_notifications(db, user)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: DatabaseSession,
    user: Annotated[User, Depends(get_current_user)],
):
    notification = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        )
    )

    if notification is None:
        raise HTTPException(404, "Notification not found.")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
