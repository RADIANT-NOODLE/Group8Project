"""Notification inbox API — GET/POST /notifications."""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser
from app.identity.repositories.notification_repository import NotificationRepository
from app.identity.schemas.notification import (
    MarkReadRequest,
    NotificationListResponse,
    NotificationPreferenceResponse,
    UpdateNotificationPreferenceRequest,
)
from app.identity.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])
DbSession = Annotated[AsyncSession, Depends(get_db)]


def _svc(db: AsyncSession) -> NotificationService:
    return NotificationService(NotificationRepository(db))


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    db: DbSession,
    current_user: CurrentUser,
    limit: int = 50,
) -> NotificationListResponse:
    """Return the authenticated user's notification inbox (most recent first)."""
    return await _svc(db).list_inbox(current_user, limit=limit)


@router.post("/mark-read", response_model=dict)
async def mark_notifications_read(
    payload: MarkReadRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> dict:
    """Mark specific notifications as read."""
    return await _svc(db).mark_read(current_user, payload.notification_ids)


@router.post("/mark-all-read", response_model=dict)
async def mark_all_notifications_read(
    db: DbSession,
    current_user: CurrentUser,
) -> dict:
    """Mark all of the authenticated user's notifications as read."""
    return await _svc(db).mark_all_read(current_user)


@router.get("/preferences", response_model=NotificationPreferenceResponse)
async def get_notification_preferences(
    db: DbSession,
    current_user: CurrentUser,
) -> NotificationPreferenceResponse:
    """Return the user's notification channel preferences."""
    return await _svc(db).get_preferences(current_user)


@router.patch("/preferences", response_model=NotificationPreferenceResponse)
async def update_notification_preferences(
    payload: UpdateNotificationPreferenceRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> NotificationPreferenceResponse:
    """Update one or more notification preference toggles."""
    return await _svc(db).update_preferences(current_user, payload)
