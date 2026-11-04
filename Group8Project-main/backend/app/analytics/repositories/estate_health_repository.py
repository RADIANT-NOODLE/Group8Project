"""EstateHealthRepository — aggregates the window data the engine needs.

Queries the existing Group8 tables (complaints, maintenance_work_orders,
service_providers, properties) to build ``SystemScoreInputs`` for the
5-pillar engine. No ORM relationships required — plain select() calls only.

Security complaints (category == 'security') are counted as ``incidents``
for the Security pillar, mirroring the VANTAGE approach.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.engine.constants import WINDOW_DAYS
from app.analytics.engine.models import SystemScoreInputs
from app.community.models.complaint import Complaint
from app.community.models.maintenance_work_order import MaintenanceworkOrder
from app.property.models.property import Property
from app.providers.models.service_provider import ServiceProvider


class EstateHealthRepository:
    """Gather the window aggregates the engine needs — read-only."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def build_inputs(self, as_of: datetime | None = None) -> SystemScoreInputs:
        """Build SystemScoreInputs from the last 90 days ending at ``as_of``."""
        if as_of is None:
            as_of = datetime.now(timezone.utc)

        aof = as_of if as_of.tzinfo else as_of.replace(tzinfo=timezone.utc)
        window_start = aof - timedelta(days=WINDOW_DAYS)

        unit_count = await self._count_units()
        coverage_days = await self._coverage_days(aof)

        complaints_created = await self._complaints_created(window_start, aof)
        resolved_complaints, avg_resolution_days = await self._resolution_stats(window_start, aof)
        incidents = await self._security_incidents(window_start, aof)

        wo_in_window, wo_completed, rated_count, avg_rating = await self._work_order_stats(window_start, aof)
        provider_rating_count, avg_provider_rating = await self._provider_stats()

        return SystemScoreInputs(
            as_of=aof,
            coverage_days=coverage_days,
            unit_count=unit_count,
            complaints_created=complaints_created,
            resolved_complaints=resolved_complaints,
            avg_resolution_days=avg_resolution_days,
            work_orders_in_window=wo_in_window,
            work_orders_completed=wo_completed,
            rated_count=rated_count,
            avg_rating=avg_rating,
            provider_rating_count=provider_rating_count,
            avg_provider_rating=avg_provider_rating,
            incidents=incidents,
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _count_units(self) -> int:
        result = await self._db.execute(select(func.count()).select_from(Property))
        return result.scalar_one() or 0

    async def _coverage_days(self, as_of: datetime) -> int:
        """Days since the oldest activity record, capped at 90."""
        result = await self._db.execute(select(func.min(Complaint.created_at)))
        oldest_complaint = result.scalar_one_or_none()

        result2 = await self._db.execute(select(func.min(MaintenanceworkOrder.created_at)))
        oldest_wo = result2.scalar_one_or_none()

        candidates = [d for d in [oldest_complaint, oldest_wo] if d is not None]
        if not candidates:
            return 0

        oldest = min(candidates)
        if oldest.tzinfo is None:
            oldest = oldest.replace(tzinfo=timezone.utc)
        return min(WINDOW_DAYS, (as_of - oldest).days)

    async def _complaints_created(self, window_start: datetime, as_of: datetime) -> int:
        result = await self._db.execute(
            select(func.count()).where(
                Complaint.created_at >= window_start,
                Complaint.created_at <= as_of,
            )
        )
        return result.scalar_one() or 0

    async def _resolution_stats(
        self, window_start: datetime, as_of: datetime
    ) -> tuple[int, Decimal | None]:
        """Count resolved complaints and their average resolution time in days."""
        result = await self._db.execute(
            select(
                func.count(),
                func.avg(
                    func.extract(
                        "epoch",
                        Complaint.resolved_at - Complaint.created_at,
                    ) / 86400.0
                ),
            ).where(
                Complaint.created_at >= window_start,
                Complaint.created_at <= as_of,
                Complaint.resolved_at.isnot(None),
                Complaint.status.in_(["resolved", "closed"]),
            )
        )
        row = result.one()
        count = row[0] or 0
        avg_days = Decimal(str(round(float(row[1]), 4))) if row[1] is not None else None
        return count, avg_days

    async def _security_incidents(self, window_start: datetime, as_of: datetime) -> int:
        """Security-category complaints count as incidents (D6)."""
        result = await self._db.execute(
            select(func.count()).where(
                Complaint.created_at >= window_start,
                Complaint.created_at <= as_of,
                Complaint.category == "security",
            )
        )
        return result.scalar_one() or 0

    async def _work_order_stats(
        self, window_start: datetime, as_of: datetime
    ) -> tuple[int, int, int, Decimal | None]:
        """Work orders in window: total, completed, rated count, avg rating."""
        result = await self._db.execute(
            select(
                func.count(),
                func.sum(
                    case(
                        (MaintenanceworkOrder.status == "completed", 1),
                        else_=0,
                    )
                ),
                func.count(MaintenanceworkOrder.resident_rating),
                func.avg(MaintenanceworkOrder.resident_rating),
            ).where(
                MaintenanceworkOrder.created_at >= window_start,
                MaintenanceworkOrder.created_at <= as_of,
            )
        )
        row = result.one()
        total = row[0] or 0
        completed = int(row[1] or 0)
        rated_count = row[2] or 0
        avg_rating = Decimal(str(round(float(row[3]), 4))) if row[3] is not None else None
        return total, completed, rated_count, avg_rating

    async def _provider_stats(self) -> tuple[int, Decimal | None]:
        """All-time provider rating stats."""
        result = await self._db.execute(
            select(
                func.count(ServiceProvider.avg_rating),
                func.avg(ServiceProvider.avg_rating),
            ).where(ServiceProvider.avg_rating.isnot(None))
        )
        row = result.one()
        count = row[0] or 0
        avg = Decimal(str(round(float(row[1]), 4))) if row[1] is not None else None
        return count, avg
