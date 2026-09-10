from decimal import Decimal

from pydantic import BaseModel, Field


class ServiceProviderResponse(BaseModel):
    provider_id: int = Field(..., serialization_alias="id")
    full_name: str
    trade: str
    phone: str
    email: str
    avg_rating: Decimal | None
    total_reviews: int | None
    verified: bool
    emergency_available: bool

    model_config = {"from_attributes": True, "populate_by_name": True}


class PaginatedProvidersResponse(BaseModel):
    count: int
    providers: list[ServiceProviderResponse]
