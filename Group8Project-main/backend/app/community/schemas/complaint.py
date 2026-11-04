from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.common.enums import ComplaintStatus
from app.common.validators import validate_image_reference


class ComplaintStatsResponse(BaseModel):
    total: int
    by_status: dict[str, int]
    by_category: dict[str, int]
    resolution_rate_pct: Decimal
    avg_resolution_hours: Decimal | None


class ComplaintCreate(BaseModel):
    unit_id: int = Field(..., ge=1)
    category: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=5, max_length=5000)
    is_anonymous: bool = False
    photo_url: Optional[str] = None

    _image_only = field_validator("photo_url")(validate_image_reference)


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    assigned_to: str | None = Field(default=None, max_length=100)
    # required when the status is denied
    denial_reason: str | None = Field(default=None, max_length=1000)


class ComplaintResponse(BaseModel):
    complaint_id: int = Field(..., serialization_alias="id")
    # hidden (null) for anonymous complaints unless the viewer is the author
    user_id: int | None
    unit_id: int
    category: str
    description: str
    photo_url: Optional[str] = None
    is_anonymous: bool | None
    status: str | None
    assigned_to: str | None
    denial_reason: str | None = None
    resolved_at: datetime | None
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True, "populate_by_name": True}


class PaginatedComplaintsResponse(BaseModel):
    count: int
    page: int
    page_size: int
    complaints: list[ComplaintResponse]
