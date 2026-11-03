from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException, ValidationException
from app.property import storage
from app.property.models.property import Property
from app.property.repositories.property_repository import PropertyRepository
from app.property.schemas.property import (
    PaginatedPropertiesResponse,
    PropertyCreate,
    PropertyPhotoResponse,
    PropertyResponse,
    PropertyUpdate,
)


class PropertyService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self._repo = PropertyRepository(db)

    async def search_properties(
        self,
        *,
        page: int,
        page_size: int,
        bedrooms: int | None = None,
        bathrooms: int | None = None,
        min_size_m2: Decimal | None = None,
        max_size_m2: Decimal | None = None,
    ) -> PaginatedPropertiesResponse:
        offset = (page - 1) * page_size
        properties = await self._repo.search(
            offset=offset,
            limit=page_size,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            min_size_m2=min_size_m2,
            max_size_m2=max_size_m2,
        )
        total = await self._repo.count(
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            min_size_m2=min_size_m2,
            max_size_m2=max_size_m2,
        )
        return PaginatedPropertiesResponse(
            count=total,
            page=page,
            page_size=page_size,
            properties=await self._with_photos(properties),
        )

    async def get_property(self, unit_id: int) -> PropertyResponse:
        property_ = await self._get_or_404(unit_id)
        return (await self._with_photos([property_]))[0]

    async def _with_photos(self, properties: list[Property]) -> list[PropertyResponse]:
        """Build responses with each property's photos (one query for all of them)."""
        photos = await self._repo.list_photos([p.unit_id for p in properties])
        by_unit: dict[int, list[PropertyPhotoResponse]] = {}
        for photo in photos:
            by_unit.setdefault(photo.unit_id, []).append(
                PropertyPhotoResponse(id=photo.photo_id, url=storage.photo_url(photo.file_name))
            )

        responses = []
        for property_ in properties:
            own = by_unit.get(property_.unit_id, [])
            response = PropertyResponse.model_validate(property_)
            response.photos = own
            response.image_url = own[0].url if own else None
            responses.append(response)
        return responses

    async def add_photo(self, unit_id: int, data: bytes) -> PropertyResponse:
        property_ = await self._get_or_404(unit_id)

        if len(data) > storage.MAX_PHOTO_BYTES:
            raise ValidationException("Photos can be at most 5 MB.")
        extension = storage.detect_image_extension(data)
        if extension is None:
            raise ValidationException("Upload a JPEG, PNG or WebP image.")

        existing = await self._repo.list_photos([unit_id])
        if len(existing) >= storage.MAX_PHOTOS_PER_PROPERTY:
            raise ConflictException(
                f"A property can have at most {storage.MAX_PHOTOS_PER_PROPERTY} photos."
            )

        storage.ensure_dirs()
        file_name = storage.new_file_name(extension)
        (storage.PROPERTY_PHOTO_DIR / file_name).write_bytes(data)
        try:
            await self._repo.add_photo(unit_id, file_name)
        except Exception:
            storage.delete_file(file_name)
            raise

        return (await self._with_photos([property_]))[0]

    async def delete_photo(self, unit_id: int, photo_id: int) -> PropertyResponse:
        property_ = await self._get_or_404(unit_id)
        photo = await self._repo.get_photo(unit_id, photo_id)
        if photo is None:
            raise NotFoundException(f"Photo {photo_id} was not found for this property.")

        file_name = photo.file_name
        await self._repo.delete_photo(photo)
        storage.delete_file(file_name)
        return (await self._with_photos([property_]))[0]

    async def _get_or_404(self, unit_id: int) -> Property:
        property_ = await self._repo.get_by_id(unit_id)
        if property_ is None:
            raise NotFoundException(f"Property with id {unit_id} was not found.")
        return property_

    async def create_property(self, payload: PropertyCreate) -> PropertyResponse:
        if await self._repo.get_by_unit_no(payload.unit_no) is not None:
            raise ConflictException(f"A property with unit number {payload.unit_no} already exists.")
        property_ = await self._repo.create(**payload.model_dump())
        return (await self._with_photos([property_]))[0]

    async def update_property(self, property_id: int, payload: PropertyUpdate) -> PropertyResponse:
        property = await self._repo.get_by_id(property_id)
        if not property:
            raise NotFoundException(f"Property with id {property_id} was not found.")

        # Apply changes to the property object in memory
        changes = payload.model_dump(exclude_unset=True)
        for field, value in changes.items():
            setattr(property, field, value)

        # Commit the changes to the database
        await self.db.commit()
        await self.db.refresh(property)

        return (await self._with_photos([property]))[0]
