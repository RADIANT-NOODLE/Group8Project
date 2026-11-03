from decimal import Decimal
from sqlalchemy import Select, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import undefer_group

from app.property.models.property import Property
from app.property.models.property_photo import PropertyPhoto

# Whether the database has been upgraded with property_photos.data
# (alembic e5a0c3b7d9f2). Once seen, it is remembered for the process.
_photo_data_column_seen = False

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

    async def _has_photo_data_column(self) -> bool:
        global _photo_data_column_seen
        if not _photo_data_column_seen:
            result = await self._db.execute(text(
                "SELECT 1 FROM information_schema.columns "
                "WHERE table_name = 'property_photos' AND column_name = 'data'"
            ))
            _photo_data_column_seen = result.first() is not None
        return _photo_data_column_seen

    async def list_photos_with_status(
        self, unit_ids: list[int]
    ) -> list[tuple[PropertyPhoto, bool]]:
        """Each photo with whether its image is stored in the database
        (checked in the same query, without downloading the images)."""
        if not unit_ids:
            return []
        if not await self._has_photo_data_column():
            return [(photo, False) for photo in await self.list_photos(unit_ids)]
        result = await self._db.execute(
            select(PropertyPhoto, PropertyPhoto.data.is_not(None))
            .where(PropertyPhoto.unit_id.in_(unit_ids))
            .order_by(PropertyPhoto.photo_id)
        )
        return [(photo, bool(stored)) for photo, stored in result.all()]

    async def get_photo_file(self, file_name: str) -> PropertyPhoto | None:
        """The photo with its image bytes loaded (used to serve the image)."""
        result = await self._db.execute(
            select(PropertyPhoto)
            .options(undefer_group("file"))
            .where(PropertyPhoto.file_name == file_name)
        )
        return result.scalar_one_or_none()

    async def add_photo(
        self, unit_id: int, file_name: str, data: bytes, content_type: str
    ) -> PropertyPhoto:
        photo = PropertyPhoto(
            unit_id=unit_id, file_name=file_name, data=data, content_type=content_type
        )
        self._db.add(photo)
        await self._db.commit()
        return photo

    async def delete_photo(self, photo: PropertyPhoto) -> None:
        await self._db.delete(photo)
        await self._db.commit()
