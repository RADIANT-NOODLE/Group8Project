from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.common.datetime_utils import ensure_utc
from app.common.validators import reject_control_characters


class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=10000)
    category: str = Field(default="General", min_length=1, max_length=50)
    is_published: bool = True
    expires_at: datetime | None = None

    @field_validator("title", "message", "category")
    @classmethod
    def _clean_text(cls, value: str) -> str:
        return reject_control_characters(value)

    @field_validator("expires_at")
    @classmethod
    def _utc(cls, value: datetime | None) -> datetime | None:
        return ensure_utc(value)


class AnnouncementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    message: str | None = Field(default=None, min_length=1, max_length=10000)
    category: str | None = Field(default=None, min_length=1, max_length=50)
    is_published: bool | None = None
    expires_at: datetime | None = None

    @field_validator("title", "message", "category")
    @classmethod
    def _clean_text(cls, value: str | None) -> str | None:
        return reject_control_characters(value)

    @field_validator("expires_at")
    @classmethod
    def _utc(cls, value: datetime | None) -> datetime | None:
        return ensure_utc(value)


class AnnouncementResponse(BaseModel):
    announcement_id: int = Field(..., serialization_alias="id")
    title: str
    message: str
    category: str | None = "General"
    is_published: bool | None = True
    created_by: int
    expires_at: datetime | None
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True, "populate_by_name": True}


class PaginatedAnnouncementsResponse(BaseModel):
    count: int
    page: int
    page_size: int
    announcements: list[AnnouncementResponse]
