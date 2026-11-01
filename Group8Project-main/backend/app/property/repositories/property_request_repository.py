from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.property.models.property_request import PropertyRequest

_ACTIVE_STATUSES = ("pending_review", "approved", "assigned")


class PropertyRequestRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    @staticmethod
    def _apply_filters(
        stmt: Select,
        *,
        requester_id: int | None,
        assigned_agent_id: int | None,
        status: str | None,
        unit_id: int | None,
    ) -> Select:
        if requester_id is not None:
            stmt = stmt.where(PropertyRequest.requester_id == requester_id)
        if assigned_agent_id is not None:
            stmt = stmt.where(PropertyRequest.assigned_agent_id == assigned_agent_id)
        if status is not None:
            stmt = stmt.where(PropertyRequest.status == status)
        if unit_id is not None:
            stmt = stmt.where(PropertyRequest.unit_id == unit_id)
        return stmt

    async def search(
        self,
        *,
        offset: int,
        limit: int,
        requester_id: int | None = None,
        assigned_agent_id: int | None = None,
        status: str | None = None,
        unit_id: int | None = None,
    ) -> list[PropertyRequest]:
        stmt = select(PropertyRequest).order_by(
            PropertyRequest.created_at.desc(), PropertyRequest.request_id.desc()
        )
        stmt = self._apply_filters(
            stmt,
            requester_id=requester_id,
            assigned_agent_id=assigned_agent_id,
            status=status,
            unit_id=unit_id,
        )
        result = await self._db.execute(stmt.offset(offset).limit(limit))
        return list(result.scalars().all())

    async def count(
        self,
        *,
        requester_id: int | None = None,
        assigned_agent_id: int | None = None,
        status: str | None = None,
        unit_id: int | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(PropertyRequest)
        stmt = self._apply_filters(
            stmt,
            requester_id=requester_id,
            assigned_agent_id=assigned_agent_id,
            status=status,
            unit_id=unit_id,
        )
        result = await self._db.execute(stmt)
        return int(result.scalar_one())

    async def get_by_id(self, request_id: int) -> PropertyRequest | None:
        result = await self._db.execute(
            select(PropertyRequest).where(PropertyRequest.request_id == request_id)
        )
        return result.scalar_one_or_none()

    async def get_active_for_unit_and_user(self, user_id: int, unit_id: int) -> PropertyRequest | None:
        result = await self._db.execute(
            select(PropertyRequest)
            .where(
                PropertyRequest.requester_id == user_id,
                PropertyRequest.unit_id == unit_id,
                PropertyRequest.status.in_(_ACTIVE_STATUSES),
            )
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def create(self, **fields) -> PropertyRequest:
        request = PropertyRequest(**fields)
        self._db.add(request)
        await self._db.commit()
        return await self._reload(request.request_id)

    async def save(self, request: PropertyRequest) -> PropertyRequest:
        await self._db.commit()
        return await self._reload(request.request_id)

    async def _reload(self, request_id: int) -> PropertyRequest:
        # populate_existing so the joined requester/agent/property rows are refreshed too
        result = await self._db.execute(
            select(PropertyRequest)
            .where(PropertyRequest.request_id == request_id)
            .execution_options(populate_existing=True)
        )
        return result.scalar_one()
