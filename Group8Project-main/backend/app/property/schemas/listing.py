from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.common.enums import ListingStatus
from app.common.validators import validate_image_reference


class ListingCreate(BaseModel):
    unit_id: int = Field(..., ge=1)
    price: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    listing_type: Literal["sale", "rent"] | None = None
    description: str | None = Field(default=None, max_length=5000)
    photo_url: str | None = None

    _image_only = field_validator("photo_url")(validate_image_reference)


class ListingUpdate(BaseModel):
    price: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    listing_type: Literal["sale", "rent"] | None = None
    description: str | None = Field(default=None, max_length=5000)
    photo_url: str | None = None
    status: ListingStatus | None = None

    _image_only = field_validator("photo_url")(validate_image_reference)


class ListingResponse(BaseModel):
    listing_id: int = Field(..., serialization_alias="id")
    unit_id: int
    agent_id: int
    price: Decimal
    listing_type: str | None = None
    description: str | None
    photo_url: str | None
    status: str | None
    views: int | None
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True, "populate_by_name": True}


class PaginatedListingsResponse(BaseModel):
    count: int
    page: int
    page_size: int
    listings: list[ListingResponse]
