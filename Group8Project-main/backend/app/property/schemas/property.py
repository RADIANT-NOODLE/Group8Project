from typing import List
from decimal import Decimal

from pydantic import BaseModel, Field


class PropertyPhotoResponse(BaseModel):
    id: int
    url: str
    # False when the image is missing (uploaded on another computer before
    # photos were stored in the database); such photos can only be removed.
    available: bool = True


class PropertyResponse(BaseModel):
    unit_id: int = Field(..., serialization_alias="id")
    unit_no: str
    complex_name: str
    street_address: str
    suburb: str | None
    size_m2: Decimal | None
    bedrooms: int | None
    bathrooms: int | None
    # filled in by PropertyService; the first photo is the cover image
    image_url: str | None = None
    photos: list[PropertyPhotoResponse] = []

    model_config = {"from_attributes": True, "populate_by_name": True}


class PaginatedPropertiesResponse(BaseModel):
    count: int
    page: int
    page_size: int
    properties: list[PropertyResponse]


class PropertyCreate(BaseModel):
    unit_no: str = Field(..., min_length=1, max_length=10)
    complex_name: str = Field(..., min_length=1, max_length=255)
    street_address: str = Field(..., min_length=1, max_length=255)
    suburb: str | None = Field(default=None, max_length=255)
    size_m2: Decimal | None = Field(default=None, gt=0, max_digits=8, decimal_places=2)
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=0)
    photos: List[str] = Field(default=[], max_items=50)

class PropertyUpdate(BaseModel):
    unit_no: str | None = Field(default=None, max_length=10)
    complex_name: str | None = Field(default=None, max_length=255)
    street_address: str | None = Field(default=None, max_length=255)
    suburb: str | None = Field(default=None, max_length=255)
    size_m2: Decimal | None = Field(default=None, gt=0, max_digits=8, decimal_places=2)
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=0)
    photos: List[str] = Field(default=[], max_items=50)
