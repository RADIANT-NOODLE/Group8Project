from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.community.models.complaint import Complaint
from app.community.models.maintenance_work_order import MaintenanceworkOrder
from app.identity.models.user import User
from app.property.models.listing import Listing
from app.property.models.property import Property


class IntelligenceRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_unit_ids(self, actor: User) -> list[int]:
        query = select(Property.unit_id)
        if actor.role in {"hoa_admin", "head_admin"}:
            result = await self._db.execute(query.order_by(Property.unit_id))
            return list(result.scalars().all())

        if actor.role in {"resident", "investor"} and actor.unit_no:
            query = query.where(Property.unit_no == actor.unit_no)
        elif actor.role == "estate_agent":
            query = query.join(Listing, Listing.unit_id == Property.unit_id).where(
                Listing.agent_id == actor.user_id
            )
        else:
            return []

        result = await self._db.execute(query.distinct().order_by(Property.unit_id))
        return list(result.scalars().all())

    async def get_property_names(self, unit_ids: list[int]) -> list[str]:
        if not unit_ids:
            return []
        result = await self._db.execute(
            select(Property.complex_name)
            .where(Property.unit_id.in_(unit_ids))
            .distinct()
            .order_by(Property.complex_name)
        )
        return list(result.scalars().all())

    async def complaint_counts(self, unit_ids: list[int]) -> dict[str, int]:
        if not unit_ids:
            return {"total": 0, "open": 0, "resolved": 0}
        result = await self._db.execute(
            select(Complaint.status, func.count(Complaint.complaint_id))
            .where(Complaint.unit_id.in_(unit_ids))
            .group_by(Complaint.status)
        )
        counts = {"total": 0, "open": 0, "resolved": 0}
        for status, value in result.all():
            count = int(value)
            counts["total"] += count
            if status in {"submitted", "under_review", "in_progress"}:
                counts["open"] += count
            elif status in {"resolved", "closed"}:
                counts["resolved"] += count
        return counts

    async def work_order_counts(
        self, unit_ids: list[int], now: datetime
    ) -> dict[str, int]:
        if not unit_ids:
            return {"total": 0, "active": 0, "overdue": 0}

        result = await self._db.execute(
            select(
                MaintenanceworkOrder.status,
                MaintenanceworkOrder.estimated_completion_date,
                func.count(MaintenanceworkOrder.work_order_id),
            )
            .join(
                Complaint,
                Complaint.complaint_id == MaintenanceworkOrder.complaint_id,
            )
            .where(Complaint.unit_id.in_(unit_ids))
            .group_by(
                MaintenanceworkOrder.status,
                MaintenanceworkOrder.estimated_completion_date,
            )
        )
        counts = {"total": 0, "active": 0, "overdue": 0}
        for status, due_at, value in result.all():
            count = int(value)
            counts["total"] += count
            if status in {"assigned", "in_progress"}:
                counts["active"] += count
                if due_at is not None and due_at < now:
                    counts["overdue"] += count
        return counts

    async def recent_records(self, unit_ids: list[int]) -> list[dict]:
        if not unit_ids:
            return []

        complaint_rows = await self._db.execute(
            select(
                Complaint.complaint_id,
                Complaint.category,
                Complaint.status,
                Complaint.created_at,
                Property.unit_no,
            )
            .join(Property, Property.unit_id == Complaint.unit_id)
            .where(Complaint.unit_id.in_(unit_ids))
            .order_by(Complaint.created_at.desc(), Complaint.complaint_id.desc())
            .limit(6)
        )
        records = [
            {
                "id": row.complaint_id,
                "kind": "complaint",
                "title": f"{row.category} complaint",
                "status": row.status,
                "unit_no": row.unit_no,
                "created_at": row.created_at,
            }
            for row in complaint_rows
        ]

        work_order_rows = await self._db.execute(
            select(
                MaintenanceworkOrder.work_order_id,
                MaintenanceworkOrder.status,
                MaintenanceworkOrder.created_at,
                Complaint.category,
                Property.unit_no,
            )
            .join(
                Complaint,
                Complaint.complaint_id == MaintenanceworkOrder.complaint_id,
            )
            .join(Property, Property.unit_id == Complaint.unit_id)
            .where(Complaint.unit_id.in_(unit_ids))
            .order_by(
                MaintenanceworkOrder.created_at.desc(),
                MaintenanceworkOrder.work_order_id.desc(),
            )
            .limit(6)
        )
        records.extend(
            {
                "id": row.work_order_id,
                "kind": "work_order",
                "title": f"{row.category} work order",
                "status": row.status,
                "unit_no": row.unit_no,
                "created_at": row.created_at,
            }
            for row in work_order_rows
        )
        return sorted(
            records,
            key=lambda record: (
                record["created_at"].timestamp()
                if record["created_at"] is not None
                else float("-inf")
            ),
            reverse=True,
        )[:8]
