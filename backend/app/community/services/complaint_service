from collections import Counter
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import ComplaintStatus
from app.community.repositories.complaint_repository import ComplaintRepository
from app.community.schemas.complaint import ComplaintStatsResponse

_RESOLVED_STATUSES = (ComplaintStatus.resolved.value, ComplaintStatus.closed.value)


class ComplaintService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = ComplaintRepository(db)

    async def get_stats(self) -> ComplaintStatsResponse:
        complaints = await self._repo.get_all()
        total = len(complaints)

        by_status = Counter(c.status for c in complaints)
        by_category = Counter(c.category for c in complaints)

        resolved = [c for c in complaints if c.status in _RESOLVED_STATUSES]
        resolution_rate_pct = (
            (Decimal(len(resolved)) / Decimal(total) * Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            if total > 0
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
