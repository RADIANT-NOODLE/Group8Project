from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.community.models.complaint import Complaint


class ComplaintRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[Complaint]:
        result = await self._db.execute(select(Complaint))
        return list(result.scalars().all())
