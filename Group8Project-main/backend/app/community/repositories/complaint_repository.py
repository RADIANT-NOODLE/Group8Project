from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.community.models.complaint import Complaint, ComplaintPhoto
from app.community.models.maintenance_work_order import MaintenanceworkOrder


class ComplaintRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[Complaint]:
        result = await self._db.execute(select(Complaint))
        return list(result.scalars().all())

    @staticmethod
    def _apply_filters(
        stmt: Select,
        *,
        user_id: int | None,
        unit_id: int | None,
        status: str | None,
        category: str | None,
    ) -> Select:
        if user_id is not None:
            stmt = stmt.where(Complaint.user_id == user_id)
        if unit_id is not None:
            stmt = stmt.where(Complaint.unit_id == unit_id)
        if status is not None:
            stmt = stmt.where(Complaint.status == status)
        if category is not None:
            stmt = stmt.where(Complaint.category == category)
        return stmt

    async def search(
        self,
        *,
        offset: int,
        limit: int,
        user_id: int | None = None,
        unit_id: int | None = None,
        status: str | None = None,
        category: str | None = None,
    ) -> list[Complaint]:
        stmt = select(Complaint).order_by(Complaint.created_at.desc(), Complaint.complaint_id.desc())
        stmt = self._apply_filters(
            stmt, user_id=user_id, unit_id=unit_id, status=status, category=category
        )
        result = await self._db.execute(stmt.offset(offset).limit(limit))
        return list(result.scalars().all())

    async def count(
        self,
        *,
        user_id: int | None = None,
        unit_id: int | None = None,
        status: str | None = None,
        category: str | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(Complaint)
        stmt = self._apply_filters(
            stmt, user_id=user_id, unit_id=unit_id, status=status, category=category
        )
        result = await self._db.execute(stmt)
        return int(result.scalar_one())

    async def get_by_id(self, complaint_id: int) -> Complaint | None:
        result = await self._db.execute(
            select(Complaint).where(Complaint.complaint_id == complaint_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        user_id: int,
        unit_id: int,
        category: str,
        description: str,
        is_anonymous: bool,
        photo_url: str | None,
    ) -> Complaint:
        complaint = Complaint(
            user_id=user_id,
            unit_id=unit_id,
            category=category,
            description=description,
            is_anonymous=is_anonymous,
            status="submitted",
            photo_url=photo_url,
        )
        self._db.add(complaint)
        await self._db.commit()
        await self._db.refresh(complaint)
        return complaint

    async def get_photo(self, complaint_id: int) -> ComplaintPhoto | None:
        return await self._db.get(ComplaintPhoto, complaint_id)

    async def save_photo(
        self, complaint: Complaint, data: bytes, content_type: str, photo_url: str
    ) -> Complaint:
        """Add the complaint's photo, or replace the one it has."""
        photo = await self.get_photo(complaint.complaint_id)
        if photo is None:
            photo = ComplaintPhoto(complaint_id=complaint.complaint_id)
            self._db.add(photo)
        photo.data = data
        photo.content_type = content_type
        complaint.photo_url = photo_url
        return await self.save(complaint)

    async def rated_provider_ids(self, complaint_id: int) -> list[int]:
        """Providers whose rating includes a job done on this complaint."""
        result = await self._db.execute(
            select(MaintenanceworkOrder.provider_id)
            .where(
                MaintenanceworkOrder.complaint_id == complaint_id,
                MaintenanceworkOrder.resident_rating.is_not(None),
            )
            .distinct()
        )
        return list(result.scalars().all())

    async def delete(self, complaint: Complaint) -> None:
        """Not committed yet. The database removes its work orders and photo with it."""
        await self._db.delete(complaint)
        await self._db.flush()

    async def commit(self) -> None:
        await self._db.commit()

    async def save(self, complaint: Complaint) -> Complaint:
        await self._db.commit()
        await self._db.refresh(complaint)
        return complaint
