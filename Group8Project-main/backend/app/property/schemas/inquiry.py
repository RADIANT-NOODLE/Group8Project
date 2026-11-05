import re

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime

from app.common.validators import validate_required_phone

# Keep in step with validateContactName / validateContactEmail in services/validation.js.
_NAME_PATTERN = re.compile(r"[^\W\d_]+(?:[ '’.\-]+[^\W\d_]+)*\.?")
_EMAIL_PATTERN = re.compile(r"[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)*\.[A-Za-z]{2,}")

class InquiryCreate(BaseModel):
    """A public enquiry. The agent is worked out by the server, never sent by the browser."""

    model_config = ConfigDict(str_strip_whitespace=True)

    property_id: int = Field(..., ge=1)
    buyer_name: str = Field(..., min_length=2, max_length=100)
    buyer_email: str = Field(..., min_length=5, max_length=255)
    buyer_contact: str = Field(..., max_length=50)
    message: Optional[str] = Field(default=None, max_length=5000)

    @field_validator("buyer_name")
    @classmethod
    def _looks_like_a_name(cls, value: str) -> str:
        name = " ".join(value.split())
        if not _NAME_PATTERN.fullmatch(name) or sum(c.isalpha() for c in name) < 2:
            raise ValueError("Enter your name using letters only.")
        return name

    @field_validator("buyer_email")
    @classmethod
    def _looks_like_an_email(cls, value: str) -> str:
        if not _EMAIL_PATTERN.fullmatch(value):
            raise ValueError("Enter a valid email address, for example name@example.com.")
        return value

    @field_validator("buyer_contact")
    @classmethod
    def _is_a_phone_number(cls, value: str) -> str:
        return validate_required_phone(value)


INQUIRY_STATUSES = ("New", "Contacted", "Viewing Scheduled", "Sold", "Rented Out")


class InquiryUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def _known_status(cls, value: str) -> str:
        if value not in INQUIRY_STATUSES:
            raise ValueError("Status must be one of: " + ", ".join(INQUIRY_STATUSES))
        return value

class InquiryResponse(BaseModel):
    inquiry_id: int
    property_id: int
    agent_id: int
    buyer_name: str
    buyer_email: str
    buyer_contact: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: datetime
    
    # Joined fields for display
    property_unit: Optional[str] = None
    property_complex: Optional[str] = None
    agent_name: Optional[str] = None
    # "sale" or "rent": decides whether this enquiry can end as Sold or Rented Out
    listing_type: Optional[str] = None
    
    class Config:
        from_attributes = True