from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.schemas.living_score import LivingScoreResponse
from app.analytics.services.living_score_service import LivingScoreService
from app.common.enums import UserRole
from app.db.session import get_db
from app.core.exceptions import ForbiddenException
from app.identity.api.dependencies import CurrentUser, require_roles
from app.identity.models.user import User
from app.property.models.property_request import PropertyRequest
from app.property.schemas.property import PaginatedPropertiesResponse, PropertyCreate, PropertyResponse, PropertyUpdate
from app.property.storage import MAX_PHOTO_BYTES
from app.property.services.property_service import PropertyService

router = APIRouter(prefix="/properties", tags=["property"])

# AdminOnly HERE SO THE PATCH ENDPOINT CAN USE IT
AdminOnly = Annotated[User, require_roles(UserRole.hoa_admin.value)]  # head admins pass too


@router.get("", response_model=PaginatedPropertiesResponse)
async def search_properties(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    bedrooms: Annotated[int | None, Query(ge=0, description="Exact number of bedrooms")] = None,
    bathrooms: Annotated[int | None, Query(ge=0, description="Exact number of bathrooms")] = None,
    min_size_m2: Annotated[Decimal | None, Query(ge=0, description="Minimum size in m²")] = None,
    max_size_m2: Annotated[Decimal | None, Query(ge=0, description="Maximum size in m²")] = None,
) -> PaginatedPropertiesResponse:
    """List properties, optionally filtered by bedrooms, bathrooms, and size range."""
    return await PropertyService(db).search_properties(
        page=page,
        page_size=page_size,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        min_size_m2=min_size_m2,
        max_size_m2=max_size_m2,
    )


@router.get("/{unit_id}", response_model=PropertyResponse)
async def get_property(
    unit_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PropertyResponse:
    """Fetch a single property by id."""
    return await PropertyService(db).get_property(unit_id)


@router.get("/{unit_id}/living-score", response_model=LivingScoreResponse)
async def get_living_score(
    unit_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LivingScoreResponse:
    """Compute the deterministic Living Score for a property."""
    return await LivingScoreService(db).get_living_score(unit_id)


@router.post("", response_model=PropertyResponse, status_code=201)
async def create_property(
    payload: PropertyCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,  
) -> PropertyResponse:
    """Register a new unit/property (HOA admins only)."""
    return await PropertyService(db).create_property(payload)


@router.patch("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    payload: PropertyUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,  # <--- Now this works
) -> PropertyResponse:
    """Update a property's details (HOA admins only)."""
    return await PropertyService(db).update_property(property_id, payload)


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
) -> None:
    """Delete a property and its history (HOA and head admins). Refused while it has
    residents, a live listing, complaints or sale records."""
    await PropertyService(db).delete_property(property_id)


async def _ensure_can_add_photos(db: AsyncSession, user: User, property_id: int) -> None:
    """Admins, or the estate agent currently handling this unit's sale/rental request."""
    if user.role in (UserRole.hoa_admin.value, UserRole.head_admin.value):
        return
    if user.role == UserRole.estate_agent.value:
        assigned = await db.execute(
            select(PropertyRequest.request_id)
            .where(
                PropertyRequest.unit_id == property_id,
                PropertyRequest.assigned_agent_id == user.user_id,
                PropertyRequest.status.in_(("assigned", "listed")),
            )
            .limit(1)
        )
        if assigned.scalar_one_or_none() is not None:
            return
    raise ForbiddenException("Only an admin or the estate agent assigned to this property can add photos.")


@router.post("/{property_id}/photos", response_model=PropertyResponse, status_code=201)
async def upload_property_photo(
    property_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    file: Annotated[UploadFile, File(description="JPEG, PNG or WebP, up to 4 MB")],
) -> PropertyResponse:
    """Add a photo to a property (HOA and head admins, or the unit's assigned estate agent).
    The first photo is the cover image."""
    await _ensure_can_add_photos(db, user, property_id)
    # read one byte past the limit so an oversized file is detected without loading all of it
    data = await file.read(MAX_PHOTO_BYTES + 1)
    return await PropertyService(db).add_photo(property_id, data)


@router.delete("/{property_id}/photos/{photo_id}", response_model=PropertyResponse)
async def delete_property_photo(
    property_id: int,
    photo_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
) -> PropertyResponse:
    """Remove a photo from a property (HOA and head admins)."""
    return await PropertyService(db).delete_photo(property_id, photo_id)
