from collections import Counter
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.datetime_utils import utcnow
from app.common.enums import ADMIN_ROLES, ComplaintStatus, UserRole, WorkOrderStatus
from app.community.models.complaint import Complaint, ComplaintPhoto
from app.community.models.maintenance_work_order import MaintenanceworkOrder
from app.community.repositories.complaint_repository import ComplaintRepository
from app.community.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatsResponse,
    ComplaintStatusUpdate,
    PaginatedComplaintsResponse,
)
from app.core.exceptions import ForbiddenException, NotFoundException, ValidationException
from app.identity.models.user import User
from app.property import storage
from app.property.repositories.property_repository import PropertyRepository
from app.providers.repositories.review_repository import ReviewRepository
from app.providers.repositories.service_provider_repository import ServiceProviderRepository

_RESOLVED_STATUSES = (ComplaintStatus.resolved.value,)
_ACTIVE_WORK_ORDERS = (WorkOrderStatus.assigned.value, WorkOrderStatus.in_progress.value)


class ComplaintService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = ComplaintRepository(db)
        self._property_repo = PropertyRepository(db)
        self._review_repo = ReviewRepository(db)
        self._provider_repo = ServiceProviderRepository(db)

    # ---- helpers -------------------------------------------------------

    @staticmethod
    def _is_admin(user: User) -> bool:
        return user.role in ADMIN_ROLES

    @staticmethod
    def _to_response(complaint: Complaint, viewer: User) -> ComplaintResponse:
        response = ComplaintResponse.model_validate(complaint)
        # anonymous complaints hide the author from everyone except the author
        if complaint.is_anonymous and complaint.user_id != viewer.user_id:
            response.user_id = None
        return response

    async def _get_or_404(self, complaint_id: int) -> Complaint:
        complaint = await self._repo.get_by_id(complaint_id)
        if complaint is None:
            raise NotFoundException(f"Complaint with id {complaint_id} was not found.")
        return complaint

    # ---- use cases -----------------------------------------------------

    async def create_complaint(self, payload: ComplaintCreate, user: User) -> ComplaintResponse:
        if await self._property_repo.get_by_id(payload.unit_id) is None:
            raise NotFoundException(f"Property with id {payload.unit_id} was not found.")
        complaint = await self._repo.create(
            user_id=user.user_id,
            unit_id=payload.unit_id,
            category=payload.category.strip(),
            description=payload.description.strip(),
            is_anonymous=payload.is_anonymous,
            photo_url=payload.photo_url,
        )
        return self._to_response(complaint, user)

    async def list_complaints(
        self,
        user: User,
        *,
        page: int,
        page_size: int,
        unit_id: int | None = None,
        status: str | None = None,
        category: str | None = None,
    ) -> PaginatedComplaintsResponse:
        # HOA admins see every complaint; everyone else only sees their own
        scope_user_id = None if self._is_admin(user) else user.user_id
        filters = dict(user_id=scope_user_id, unit_id=unit_id, status=status, category=category)
        complaints = await self._repo.search(
            offset=(page - 1) * page_size, limit=page_size, **filters
        )
        total = await self._repo.count(**filters)
        return PaginatedComplaintsResponse(
            count=total,
            page=page,
            page_size=page_size,
            complaints=[self._to_response(c, user) for c in complaints],
        )

    async def add_photo(self, complaint_id: int, data: bytes, user: User) -> ComplaintResponse:
        """Attach a photo (the author or an admin). A second photo replaces the first."""
        complaint = await self._get_or_404(complaint_id)
        if not self._is_admin(user) and complaint.user_id != user.user_id:
            raise ForbiddenException("You can only add a photo to your own complaints.")
        if len(data) > storage.MAX_PHOTO_BYTES:
            raise ValidationException("Photos can be at most 4 MB.")
        extension = storage.detect_image_extension(data)
        if extension is None:
            raise ValidationException("Only JPEG, PNG or WebP images are allowed.")

        complaint = await self._repo.save_photo(
            complaint,
            data,
            storage.CONTENT_TYPES[extension],
            f"/api/v1/complaints/{complaint.complaint_id}/photo",
        )
        return self._to_response(complaint, user)

    async def get_photo(self, complaint_id: int, user: User) -> ComplaintPhoto:
        """The same people who can view a complaint can view its photo."""
        complaint = await self._get_or_404(complaint_id)
        if not self._is_admin(user) and complaint.user_id != user.user_id:
            raise ForbiddenException("You can only view your own complaints.")
        photo = await self._repo.get_photo(complaint_id)
        if photo is None:
            raise NotFoundException(f"Complaint {complaint_id} has no photo.")
        return photo

    async def get_complaint(self, complaint_id: int, user: User) -> ComplaintResponse:
        complaint = await self._get_or_404(complaint_id)
        if not self._is_admin(user) and complaint.user_id != user.user_id:
            raise ForbiddenException("You can only view your own complaints.")
        return self._to_response(complaint, user)

    async def update_status(
        self, complaint_id: int, payload: ComplaintStatusUpdate, admin: User
    ) -> ComplaintResponse:
        complaint = await self._get_or_404(complaint_id)
        new_status = payload.status.value

        if new_status == ComplaintStatus.denied.value:
            reason = (payload.denial_reason or "").strip()
            if not reason:
                raise ValidationException("Give a reason for denying this complaint.")
            complaint.denial_reason = reason
            complaint.assigned_to = None
            # nobody should keep working on a denied complaint (saved in the same commit)
            await self._db.execute(
                update(MaintenanceworkOrder)
                .where(
                    MaintenanceworkOrder.complaint_id == complaint_id,
                    MaintenanceworkOrder.status.in_(_ACTIVE_WORK_ORDERS),
                )
                .values(status=WorkOrderStatus.cancelled.value)
            )
        else:
            complaint.denial_reason = None

        complaint.status = new_status
        if payload.assigned_to is not None:
            complaint.assigned_to = payload.assigned_to
        if new_status in _RESOLVED_STATUSES:
            if complaint.resolved_at is None:
                complaint.resolved_at = utcnow()
        else:
            complaint.resolved_at = None
        complaint = await self._repo.save(complaint)
        return self._to_response(complaint, admin)

    async def delete_complaint(self, complaint_id: int) -> None:
        complaint = await self._get_or_404(complaint_id)
        rated_provider_ids = await self._repo.rated_provider_ids(complaint_id)
        await self._repo.delete(complaint)

        # those ratings went with the work orders, so the cached averages follow (same commit)
        for provider_id in rated_provider_ids:
            provider = await self._provider_repo.get_by_id(provider_id)
            if provider is None:
                continue
            avg, count = await self._review_repo.rating_summary(provider_id)
            provider.total_reviews = count
            provider.avg_rating = (
                avg.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) if avg is not None else None
            )

        await self._repo.commit()

    async def get_stats(self) -> ComplaintStatsResponse:
        complaints = await self._repo.get_all()
        total = len(complaints)

        by_status = Counter(c.status for c in complaints)
        by_category = Counter(c.category for c in complaints)

        resolved = [c for c in complaints if c.status in _RESOLVED_STATUSES]
        # a denied complaint was never going to be resolved, so it does not lower the rate
        resolvable = total - by_status[ComplaintStatus.denied.value]
        resolution_rate_pct = (
            (Decimal(len(resolved)) / Decimal(resolvable) * Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            if resolvable > 0
            else Decimal("0.00")
        )

        resolution_hours = [
            Decimal((c.resolved_at - c.created_at).total_seconds()) / Decimal(3600)
            for c in resolved
            if c.resolved_at is not None and c.created_at is not None
        ]
        avg_resolution_hours = (
            (sum(resolution_hours) / Decimal(len(resolution_hours))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            if resolution_hours
            else None
        )

        return ComplaintStatsResponse(
            total=total,
            by_status=dict(by_status),
            by_category=dict(by_category),
            resolution_rate_pct=resolution_rate_pct,
            avg_resolution_hours=avg_resolution_hours,
        )

