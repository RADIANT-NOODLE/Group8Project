from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.providers.repositories.service_provider_repository import ServiceProviderRepository
from app.providers.schemas.service_provider import (
    PaginatedProvidersResponse,
    ServiceProviderResponse,
)


class ServiceProviderService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = ServiceProviderRepository(db)

    async def list_providers(self) -> PaginatedProvidersResponse:
        providers = await self._repo.get_all()
        return PaginatedProvidersResponse(
            count=len(providers),
            providers=[ServiceProviderResponse.model_validate(p) for p in providers],
        )

    async def get_provider(self, provider_id: int) -> ServiceProviderResponse:
        provider = await self._repo.get_by_id(provider_id)
        if provider is None:
            raise NotFoundException(f"Service provider with id {provider_id} was not found.")
        return ServiceProviderResponse.model_validate(provider)
