from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.datetime_utils import utcnow
from app.common.enums import PropertyRequestStatus, UserRole
from app.community.models.resident_directory import ResidentDirectory
from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from app.identity.models.user import User
from app.identity.repositories.user_repository import UserRepository
from app.property.models.property_request import PropertyRequest
from app.property.repositories.property_repository import PropertyRepository
from app.property.repositories.property_request_repository import PropertyRequestRepository
from app.property.schemas.property_request import (
    PaginatedPropertyRequestsResponse,
    PropertyRequestAssign,
    PropertyRequestCreate,
    PropertyRequestProgress,
    PropertyRequestReject,
    PropertyRequestResponse,
)

_ADMIN_ROLES = (UserRole.hoa_admin.value, UserRole.head_admin.value)


def to_response(request: PropertyRequest) -> PropertyRequestResponse:
    response = PropertyRequestResponse.model_validate(request)
    requester = request.requester
    if requester is not None:
        response.requester_name = requester.full_name
        response.requester_email = requester.email
        response.requester_role = requester.role
    unit = request.property
    if unit is not None:
        response.unit_no = unit.unit_no
        response.complex_name = unit.complex_name
        response.street_address = unit.street_address
        response.suburb = unit.suburb
        response.size_m2 = unit.size_m2
        response.bedrooms = unit.bedrooms
        response.bathrooms = unit.bathrooms
    if request.assigned_agent is not None:
        response.assigned_agent_name = request.assigned_agent.full_name
    return response


class PropertyRequestService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = PropertyRequestRepository(db)
        self._property_repo = PropertyRepository(db)
        self._user_repo = UserRepository(db)

    @staticmethod
    def _is_admin(user: User) -> bool:
        return user.role in _ADMIN_ROLES

    async def _get_or_404(self, request_id: int) -> PropertyRequest:
        request = await self._repo.get_by_id(request_id)
        if request is None:
            raise NotFoundException(f"Property request with id {request_id} was not found.")
        return request

    # ---- use cases -----------------------------------------------------

    async def create_request(
        self, payload: PropertyRequestCreate, user: User
    ) -> PropertyRequestResponse:
        if await self._property_repo.get_by_id(payload.unit_id) is None:
            raise NotFoundException(f"Property with id {payload.unit_id} was not found.")
        # A resident may only sell or rent the unit the HOA linked to them.
        linked_unit = await self._db.scalar(
            select(ResidentDirectory.property_id).where(ResidentDirectory.user_id == user.user_id)
        )
        if linked_unit != payload.unit_id:
            raise ForbiddenException("You can only request a sale or rental of your own property.")
        if await self._repo.get_active_for_unit_and_user(user.user_id, payload.unit_id) is not None:
            raise ConflictException("You already have an open request for this property.")
        # a unit shared by several residents can only be on the market once
        if await self._repo.get_active_for_unit(payload.unit_id) is not None:
            raise ConflictException("Another resident of this unit already has an open request for it.")

        request = await self._repo.create(
            requester_id=user.user_id,
            unit_id=payload.unit_id,
            request_type=payload.request_type.value,
            asking_price=payload.asking_price,
            rental_period=payload.rental_period,
            financial_information=(payload.financial_information or "").strip() or None,
            additional_details=(payload.additional_details or "").strip() or None,
            status=PropertyRequestStatus.pending_review.value,
        )
        return to_response(request)

    async def list_requests(
        self,
        user: User,
        *,
        page: int,
        page_size: int,
        status: str | None = None,
        unit_id: int | None = None,
    ) -> PaginatedPropertyRequestsResponse:
        # admins see everything; an estate agent sees what was assigned to them;
        # everyone else only sees their own requests
        scope: dict = {}
        if self._is_admin(user):
            pass
        elif user.role == UserRole.estate_agent.value:
            scope["assigned_agent_id"] = user.user_id
        else:
            scope["requester_id"] = user.user_id

        filters = dict(status=status, unit_id=unit_id, **scope)
        items = await self._repo.search(offset=(page - 1) * page_size, limit=page_size, **filters)
        total = await self._repo.count(**filters)
        return PaginatedPropertyRequestsResponse(
            count=total,
            page=page,
            page_size=page_size,
            requests=[to_response(item) for item in items],
        )

    async def get_request(self, request_id: int, user: User) -> PropertyRequestResponse:
        request = await self._get_or_404(request_id)
        allowed = (
            self._is_admin(user)
            or request.requester_id == user.user_id
            or request.assigned_agent_id == user.user_id
        )
        if not allowed:
            raise ForbiddenException("You can only view your own property requests.")
        return to_response(request)

    async def approve(self, request_id: int, admin: User) -> PropertyRequestResponse:
        request = await self._get_or_404(request_id)
        if request.status != PropertyRequestStatus.pending_review.value:
            raise ConflictException("Only requests that are pending review can be approved.")
        request.status = PropertyRequestStatus.approved.value
        request.rejection_reason = None
        request.decided_by = admin.user_id
        request.decided_at = utcnow()
        return to_response(await self._repo.save(request))

    async def reject(
        self, request_id: int, payload: PropertyRequestReject, admin: User
    ) -> PropertyRequestResponse:
        request = await self._get_or_404(request_id)
        if request.status != PropertyRequestStatus.pending_review.value:
            raise ConflictException("Only requests that are pending review can be rejected.")
        request.status = PropertyRequestStatus.rejected.value
        request.rejection_reason = payload.reason.strip()
        request.decided_by = admin.user_id
        request.decided_at = utcnow()
        return to_response(await self._repo.save(request))

    async def update_progress(
        self, request_id: int, payload: PropertyRequestProgress, user: User
    ) -> PropertyRequestResponse:
        """The assigned estate agent (or an administrator) records how the listing is going."""
        request = await self._get_or_404(request_id)
        if not (self._is_admin(user) or request.assigned_agent_id == user.user_id):
            raise ForbiddenException("Only the estate agent assigned to this request can update it.")

        current = request.status
        target = payload.status
        S = PropertyRequestStatus

        allowed_from = {
            S.listed.value: (S.assigned.value, S.listed.value),
            S.assigned.value: (S.listed.value,),  # listing withdrawn
            S.sold.value: (S.listed.value,),
            S.rented.value: (S.listed.value,),
        }
        if current not in allowed_from[target]:
            raise ConflictException(f"A request that is '{current}' cannot be marked '{target}'.")
        if target == S.sold.value and request.request_type != "sell":
            raise ConflictException("Only a sale request can be marked as sold.")
        if target == S.rented.value and request.request_type != "rent":
            raise ConflictException("Only a rental request can be marked as rented.")

        request.status = target
        return to_response(await self._repo.save(request))

    async def assign_agent(
        self, request_id: int, payload: PropertyRequestAssign, admin: User
    ) -> PropertyRequestResponse:
        request = await self._get_or_404(request_id)
        if request.status not in (
            PropertyRequestStatus.approved.value,
            PropertyRequestStatus.assigned.value,
        ):
            raise ConflictException("An estate agent can only be assigned to an approved request.")

        agent = await self._user_repo.get_by_id(payload.agent_id)
        if agent is None or agent.role != UserRole.estate_agent.value:
            raise NotFoundException(f"Estate agent with id {payload.agent_id} was not found.")
        if not agent.hoa_approved:
            raise ConflictException("This estate agent account has not been approved yet.")

        request.assigned_agent_id = agent.user_id
        request.assigned_at = utcnow()
        request.status = PropertyRequestStatus.assigned.value
        return to_response(await self._repo.save(request))
