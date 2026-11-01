from decimal import Decimal
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.property.models.property import Property
from app.property.models.property_photo import PropertyPhoto

class PropertyRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    def _apply_filters(
        self,
        stmt: Select,
        *,
        bedrooms: int | None,
        bathrooms: int | None,
        min_size_m2: Decimal | None,
        max_size_m2: Decimal | None,
    ) -> Select:
        if bedrooms is not None:
            stmt = stmt.where(Property.bedrooms == bedrooms)
        if bathrooms is not None:
            stmt = stmt.where(Property.bathrooms == bathrooms)
        if min_size_m2 is not None:
            stmt = stmt.where(Property.size_m2 >= min_size_m2)
        if max_size_m2 is not None:
            stmt = stmt.where(Property.size_m2 <= max_size_m2)
        return stmt

    async def search(
        self,
        *,
        offset: int,
        limit: int,
        bedrooms: int | None = None,
        bathrooms: int | None = None,
        min_size_m2: Decimal | None = None,
        max_size_m2: Decimal | None = None,
    ) -> list[Property]:
        stmt = select(Property).order_by(Property.unit_id)
        stmt = self._apply_filters(
            stmt,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            min_size_m2=min_size_m2,
            max_size_m2=max_size_m2,
        )
        result = await self._db.execute(stmt.offset(offset).limit(limit))
        return list(result.scalars().all())

    async def count(
        self,
        *,
        bedrooms: int | None = None,
        bathrooms: int | None = None,
        min_size_m2: Decimal | None = None,
        max_size_m2: Decimal | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(Property)
        stmt = self._apply_filters(
            stmt,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            min_size_m2=min_size_m2,
            max_size_m2=max_size_m2,
        )
        result = await self._db.execute(stmt)
        return int(result.scalar_one())

    async def get_by_id(self, unit_id: int) -> Property | None:
        result = await self._db.execute(select(Property).where(Property.unit_id == unit_id))
        return result.scalar_one_or_none()

    async def get_by_unit_no(self, unit_no: str) -> Property | None:
        result = await self._db.execute(select(Property).where(Property.unit_no == unit_no))
        return result.scalar_one_or_none()

    async def create(self, **fields) -> Property:
        property_ = Property(**fields)
        self._db.add(property_)
        await self._db.commit()
        await self._db.refresh(property_)
        return property_


    # ---- photos --------------------------------------------------------

    async def list_photos(self, unit_ids: list[int]) -> list[PropertyPhoto]:
        if not unit_ids:
            return []
        result = await self._db.execute(
            select(PropertyPhoto)
            .where(PropertyPhoto.unit_id.in_(unit_ids))
            .order_by(PropertyPhoto.photo_id)
        )
        return list(result.scalars().all())

    async def get_photo(self, unit_id: int, photo_id: int) -> PropertyPhoto | None:
        result = await self._db.execute(
            select(PropertyPhoto).where(
                PropertyPhoto.unit_id == unit_id, PropertyPhoto.photo_id == photo_id
            )
        )
        return result.scalar_one_or_none()

    async def add_photo(self, unit_id: int, file_name: str) -> PropertyPhoto:
        photo = PropertyPhoto(unit_id=unit_id, file_name=file_name)
        self._db.add(photo)
        await self._db.commit()
        await self._db.refresh(photo)
        return photo

    async def delete_photo(self, photo: PropertyPhoto) -> None:
        await self._db.delete(photo)
        await self._db.commit()
