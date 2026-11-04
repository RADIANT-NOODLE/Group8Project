"""Notification schemas — Pydantic models for the inbox API."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    notification_id: int
    category: str
    title: str
    body: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    total: int
    unread: int
    items: list[NotificationResponse]


class MarkReadRequest(BaseModel):
    notification_ids: list[int]


class NotificationPreferenceResponse(BaseModel):
    inbox_enabled: bool
    email_enabled: bool
    complaints: bool
    work_orders: bool
    announcements: bool
    approvals: bool

    model_config = {"from_attributes": True}


class UpdateNotificationPreferenceRequest(BaseModel):
    inbox_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    complaints: Optional[bool] = None
    work_orders: Optional[bool] = None
    announcements: Optional[bool] = None
    approvals: Optional[bool] = None
