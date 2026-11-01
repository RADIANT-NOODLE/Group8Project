from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import PropertyRequestStatus, UserRole
from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser, require_roles
from app.identity.models.user import User
from app.property.schemas.property_request import (
    PaginatedPropertyRequestsResponse,
    PropertyRequestAssign,
    PropertyRequestCreate,
    PropertyRequestReject,
    PropertyRequestResponse,
)
from app.property.services.property_request_service import PropertyRequestService

router = APIRouter(prefix="/property-requests", tags=["property requests"])

AdminOnly = Annotated[
    User, require_roles(UserRole.hoa_admin.value, UserRole.head_admin.value)
]
OwnerOnly = Annotated[
    User, require_roles(UserRole.resident.value, UserRole.investor.value)
]


@router.get("", response_model=PaginatedPropertyRequestsResponse)
async def list_property_requests(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 50,
    status: Annotated[PropertyRequestStatus | None, Query()] = None,
    unit_id: Annotated[int | None, Query(ge=1)] = None,
) -> PaginatedPropertyRequestsResponse:
    """HOA admins see all requests, estate agents the ones assigned to them, others their own."""
    return await PropertyRequestService(db).list_requests(
        current_user,
        page=page,
        page_size=page_size,
        status=status.value if status else None,
        unit_id=unit_id,
    )


@router.get("/{request_id}", response_model=PropertyRequestResponse)
async def get_property_request(
    request_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> PropertyRequestResponse:
    return await PropertyRequestService(db).get_request(request_id, current_user)


@router.post("", response_model=PropertyRequestResponse, status_code=201)
async def create_property_request(
    payload: PropertyRequestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: OwnerOnly,
) -> PropertyRequestResponse:
    """A resident or investor asks the HOA to sell or rent a unit."""
    return await PropertyRequestService(db).create_request(payload, current_user)


@router.post("/{request_id}/approve", response_model=PropertyRequestResponse)
async def approve_property_request(
    request_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: AdminOnly,
) -> PropertyRequestResponse:
    return await PropertyRequestService(db).approve(request_id, admin)


@router.post("/{request_id}/reject", response_model=PropertyRequestResponse)
async def reject_property_request(
    request_id: int,
    payload: PropertyRequestReject,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: AdminOnly,
) -> PropertyRequestResponse:
    return await PropertyRequestService(db).reject(request_id, payload, admin)


@router.post("/{request_id}/assign-agent", response_model=PropertyRequestResponse)
async def assign_estate_agent(
    request_id: int,
    payload: PropertyRequestAssign,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: AdminOnly,
) -> PropertyRequestResponse:
    """Assign an approved estate agent to an approved request."""
    return await PropertyRequestService(db).assign_agent(request_id, payload, admin)
