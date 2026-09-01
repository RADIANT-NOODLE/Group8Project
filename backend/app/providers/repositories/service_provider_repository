from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.providers.models.service_provider import ServiceProvider


class ServiceProviderRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[ServiceProvider]:
        result = await self._db.execute(select(ServiceProvider).order_by(ServiceProvider.provider_id))
        return list(result.scalars().all())

    async def get_by_id(self, provider_id: int) -> ServiceProvider | None:
        result = await self._db.execute(
            select(ServiceProvider).where(ServiceProvider.provider_id == provider_id)
        )
        return result.scalar_one_or_none()
