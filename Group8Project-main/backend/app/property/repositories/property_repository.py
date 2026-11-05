from decimal import Decimal
from sqlalchemy import Select, delete, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import undefer_group

from app.analytics.models.ai_analytic import AIAnalytic
from app.community.models.complaint import Complaint
from app.community.models.resident_directory import ResidentDirectory
from app.property.models.inquiry import Inquiry
from app.property.models.listing import Listing
from app.property.models.property import Property
from app.property.models.property_photo import PropertyPhoto
from app.property.models.property_request import PropertyRequest
from app.property.models.sale import Sale

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

    async def delete_blockers(self, unit_id: int) -> dict[str, int]:
        """What must be dealt with before this unit can be deleted, with how many of each."""
        checks = {
            "resident": select(func.count()).select_from(ResidentDirectory).where(ResidentDirectory.property_id == unit_id),
            "live listing": select(func.count()).select_from(Listing).where(
                Listing.unit_id == unit_id, func.lower(Listing.status) == "active"
            ),
            "complaint": select(func.count()).select_from(Complaint).where(Complaint.unit_id == unit_id),
            "sale record": select(func.count()).select_from(Sale).where(Sale.unit_id == unit_id),
        }
        return {word: (await self._db.execute(query)).scalar_one() for word, query in checks.items()}

    async def delete_with_history(self, property_: Property) -> list[str]:
        """Delete the unit and its photos, old listings, requests and inquiries, all or nothing.
        Returns the photos' file names. Listings have no database link to the unit, and the
        database can't clear ai_analytics by itself, so each table is cleared here."""
        unit_id = property_.unit_id
        file_names = list(
            (await self._db.execute(select(PropertyPhoto.file_name).where(PropertyPhoto.unit_id == unit_id))).scalars()
        )
        await self._db.execute(delete(AIAnalytic).where(AIAnalytic.property_id == unit_id))
        await self._db.execute(delete(Inquiry).where(Inquiry.property_id == unit_id))
        await self._db.execute(delete(Listing).where(Listing.unit_id == unit_id))
        await self._db.execute(delete(PropertyRequest).where(PropertyRequest.unit_id == unit_id))
        await self._db.execute(delete(PropertyPhoto).where(PropertyPhoto.unit_id == unit_id))
        await self._db.delete(property_)
        await self._db.commit()
        return file_names

    async def delete_photo(self, photo: PropertyPhoto) -> None:
        await self._db.delete(photo)
        await self._db.commit()
