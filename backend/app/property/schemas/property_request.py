from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.common.enums import PropertyRequestType
from app.common.validators import reject_control_characters


class PropertyRequestCreate(BaseModel):
    unit_id: int = Field(..., ge=1)
    request_type: PropertyRequestType
    asking_price: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    rental_period: str | None = Field(default=None, max_length=30)
    financial_information: str | None = Field(default=None, max_length=5000)
    additional_details: str | None = Field(default=None, max_length=5000)

    @field_validator("request_type", mode="before")
    @classmethod
    def _case_insensitive_type(cls, value):
        return value.strip().lower() if isinstance(value, str) else value

    @field_validator("rental_period", "financial_information", "additional_details")
    @classmethod
    def _clean_text(cls, value: str | None) -> str | None:
        return reject_control_characters(value)


class PropertyRequestReject(BaseModel):
    reason: str = Field(..., min_length=3, max_length=2000)

    @field_validator("reason")
    @classmethod
    def _clean_text(cls, value: str) -> str:
        return reject_control_characters(value)


class PropertyRequestAssign(BaseModel):
    agent_id: int = Field(..., ge=1)


class PropertyRequestProgress(BaseModel):
    """The assigned estate agent moves a request on: listed, then sold or rented
    (or back to assigned when a listing is withdrawn)."""

    status: Literal["assigned", "listed", "sold", "rented"]


class PropertyRequestResponse(BaseModel):
    request_id: int = Field(..., serialization_alias="id")
    requester_id: int
    requester_name: str | None = None
    requester_email: str | None = None
    requester_role: str | None = None
    unit_id: int
    unit_no: str | None = None
    complex_name: str | None = None
    street_address: str | None = None
    suburb: str | None = None
    size_m2: Decimal | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    request_type: str
    asking_price: Decimal
    rental_period: str | None
    financial_information: str | None
    additional_details: str | None
    status: str
    rejection_reason: str | None
    assigned_agent_id: int | None
    assigned_agent_name: str | None = None
    assigned_at: datetime | None
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True, "populate_by_name": True}


class PaginatedPropertyRequestsResponse(BaseModel):
    count: int
    page: int
    page_size: int
    requests: list[PropertyRequestResponse]
