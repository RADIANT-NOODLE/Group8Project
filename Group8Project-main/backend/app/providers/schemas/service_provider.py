from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.common.validators import validate_ten_digit_phone


class ServiceProviderCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    trade: str = Field(..., min_length=2, max_length=50)
    phone: str = Field(..., min_length=5, max_length=20)
    email: EmailStr
    verified: bool = False
    emergency_available: bool = False
    description: str | None = Field(default=None, max_length=1000)

    @field_validator("phone")
    @classmethod
    def _ten_digits(cls, value: str) -> str:
        return validate_ten_digit_phone(value)


class ServiceProviderUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    trade: str | None = Field(default=None, min_length=2, max_length=50)
    phone: str | None = Field(default=None, min_length=5, max_length=20)
    email: EmailStr | None = None
    verified: bool | None = None
    emergency_available: bool | None = None
    description: str | None = Field(default=None, max_length=1000)

    @field_validator("phone")
    @classmethod
    def _ten_digits(cls, value: str | None) -> str | None:
        return None if value is None else validate_ten_digit_phone(value)


class ServiceProviderResponse(BaseModel):
    provider_id: int = Field(..., serialization_alias="id")
    full_name: str
    trade: str
    phone: str
    email: str
    description: str | None = None
    avg_rating: Decimal | None
    total_reviews: int | None
    verified: bool
    emergency_available: bool

    model_config = {"from_attributes": True, "populate_by_name": True}


class PaginatedProvidersResponse(BaseModel):
    count: int
    providers: list[ServiceProviderResponse]
