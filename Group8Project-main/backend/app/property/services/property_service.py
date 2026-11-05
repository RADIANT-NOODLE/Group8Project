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
        """Build responses with each property's photos (one query for all of them).

        A photo is `available` when its image is in the database or, for older
        uploads, on this computer's disk. The cover (image_url) is the first
        available photo, so a lost image never hides a good one.
        """
        photos = await self._repo.list_photos_with_status([p.unit_id for p in properties])
        by_unit: dict[int, list[PropertyPhotoResponse]] = {}
        for photo, stored in photos:
            by_unit.setdefault(photo.unit_id, []).append(
                PropertyPhotoResponse(
                    id=photo.photo_id,
                    url=storage.photo_url(photo.file_name),
                    available=stored or storage.legacy_file(photo.file_name) is not None,
                )
            )

        responses = []
        for property_ in properties:
            own = by_unit.get(property_.unit_id, [])
            response = PropertyResponse.model_validate(property_)
            response.photos = own
            cover = next((photo for photo in own if photo.available), None)
            response.image_url = cover.url if cover else None
            responses.append(response)
        return responses

    async def add_photo(self, unit_id: int, data: bytes) -> PropertyResponse:
        property_ = await self._get_or_404(unit_id)

        if len(data) > storage.MAX_PHOTO_BYTES:
            raise ValidationException("Photos can be at most 4 MB.")
        extension = storage.detect_image_extension(data)
        if extension is None:
            raise ValidationException("Upload a JPEG, PNG or WebP image.")

        # Only photos that can actually be shown count toward the limit: the
        # image is in the database, or (older uploads) on this computer's disk.
        # A record whose image was lost must not block new uploads.
        existing = await self._repo.list_photos_with_status([unit_id])
        usable = [
            photo for photo, stored in existing
            if stored or storage.legacy_file(photo.file_name) is not None
        ]
        if len(usable) >= storage.MAX_PHOTOS_PER_PROPERTY:
            raise ConflictException(
                f"A property can have at most {storage.MAX_PHOTOS_PER_PROPERTY} photos."
            )

        # stored in the shared database, so every computer can show it
        await self._repo.add_photo(
            unit_id,
            storage.new_file_name(extension),
            data,
            storage.CONTENT_TYPES[extension],
        )

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

    async def delete_property(self, unit_id: int) -> None:
        property_ = await self._get_or_404(unit_id)

        blockers = await self._repo.delete_blockers(unit_id)
        held = [f"{count} {word}{'' if count == 1 else 's'}" for word, count in blockers.items() if count]
        if held:
            raise ConflictException(
                f"Unit {property_.unit_no} cannot be deleted because it still has {', '.join(held)}."
            )

        for file_name in await self._repo.delete_with_history(property_):
            storage.delete_file(file_name)

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
