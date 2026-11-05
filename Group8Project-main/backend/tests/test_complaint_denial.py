"""Denying a complaint: the reason, and what else it changes.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio
from types import SimpleNamespace

import pytest

pytest.importorskip("aiosqlite")

from fastapi import HTTPException  # noqa: E402
from pydantic import ValidationError  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402, F401  (loads every model and route)
from app.analytics.services.living_score_service import LivingScoreService  # noqa: E402
from app.common.enums import ComplaintStatus, WorkOrderStatus  # noqa: E402
from app.community.models.complaint import Complaint  # noqa: E402
from app.community.models.maintenance_work_order import MaintenanceworkOrder  # noqa: E402
from app.community.schemas.complaint import ComplaintStatusUpdate  # noqa: E402
from app.community.schemas.work_order import WorkOrderCreate, WorkOrderUpdate  # noqa: E402
from app.community.services.complaint_service import ComplaintService  # noqa: E402
from app.community.services.work_order_service import WorkOrderService  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.identity.models.user import User  # noqa: E402

ADMIN = SimpleNamespace(user_id=1, role="hoa_admin")


@pytest.fixture()
def maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        tables = [t.__table__ for t in (User, Complaint, MaintenanceworkOrder)]
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=tables)
        async with sessions() as db:
            db.add(Complaint(complaint_id=1, user_id=2, unit_id=1, category="Security", description="Gate broken", status="in_progress", assigned_to="Apex"))
            db.add(Complaint(complaint_id=2, user_id=2, unit_id=1, category="Noise", description="Loud music", status="resolved"))
            db.add(MaintenanceworkOrder(work_order_id=1, complaint_id=1, provider_id=5, status="assigned"))
            db.add(MaintenanceworkOrder(work_order_id=2, complaint_id=1, provider_id=5, status="in_progress"))
            db.add(MaintenanceworkOrder(work_order_id=3, complaint_id=1, provider_id=5, status="completed"))
            db.add(MaintenanceworkOrder(work_order_id=4, complaint_id=2, provider_id=5, status="assigned"))
            await db.commit()

    asyncio.run(build())
    return sessions


def deny(maker, complaint_id=1, reason="Not an HOA matter"):
    async def run():
        async with maker() as db:
            return await ComplaintService(db).update_status(
                complaint_id,
                ComplaintStatusUpdate(status=ComplaintStatus.denied, denial_reason=reason),
                ADMIN,
            )

    return asyncio.run(run())


def stored(maker, model, key):
    async def run():
        async with maker() as db:
            return await db.get(model, key)

    return asyncio.run(run())


def test_closed_is_no_longer_a_status():
    with pytest.raises(ValidationError):
        ComplaintStatusUpdate(status="closed")


def test_denying_saves_the_trimmed_reason(maker):
    response = deny(maker, reason="  Not an HOA matter  ")
    assert response.status == "denied"
    assert response.denial_reason == "Not an HOA matter"
    complaint = stored(maker, Complaint, 1)
    assert complaint.denial_reason == "Not an HOA matter"
    assert complaint.resolved_at is None
    assert complaint.assigned_to is None


@pytest.mark.parametrize("reason", [None, "", "   "])
def test_denying_without_a_reason_is_refused_and_changes_nothing(maker, reason):
    with pytest.raises(HTTPException) as refused:
        deny(maker, reason=reason)
    assert refused.value.status_code == 400
    assert stored(maker, Complaint, 1).status == "in_progress"
    assert stored(maker, MaintenanceworkOrder, 1).status == "assigned"


def test_a_very_long_reason_is_refused():
    with pytest.raises(ValidationError):
        ComplaintStatusUpdate(status=ComplaintStatus.denied, denial_reason="x" * 1001)


def test_denying_cancels_only_this_complaints_active_work_orders(maker):
    deny(maker)
    statuses = {key: stored(maker, MaintenanceworkOrder, key).status for key in (1, 2, 3, 4)}
    assert statuses == {1: "cancelled", 2: "cancelled", 3: "completed", 4: "assigned"}


def test_moving_on_from_denied_clears_the_reason(maker):
    deny(maker)

    async def run():
        async with maker() as db:
            return await ComplaintService(db).update_status(
                1, ComplaintStatusUpdate(status=ComplaintStatus.under_review), ADMIN
            )

    assert asyncio.run(run()).denial_reason is None
    assert stored(maker, Complaint, 1).denial_reason is None


def test_finishing_old_work_does_not_undo_a_denial(maker):
    deny(maker)

    async def run(status):
        async with maker() as db:
            await WorkOrderService(db).update_work_order(1, WorkOrderUpdate(status=status))
            await db.commit()

    asyncio.run(run(WorkOrderStatus.completed))
    assert stored(maker, Complaint, 1).status == "denied"
    asyncio.run(run(WorkOrderStatus.in_progress))
    assert stored(maker, Complaint, 1).status == "denied"


def test_a_denied_complaint_cannot_get_a_new_work_order(maker):
    deny(maker)

    async def run():
        async with maker() as db:
            await WorkOrderService(db).create_work_order(WorkOrderCreate(complaint_id=1, provider_id=5))

    with pytest.raises(HTTPException) as refused:
        asyncio.run(run())
    assert refused.value.status_code == 409


def test_resolution_rate_leaves_denied_out(maker):
    deny(maker)

    async def run():
        async with maker() as db:
            return await ComplaintService(db).get_stats()

    stats = asyncio.run(run())
    assert stats.total == 2
    assert stats.by_status == {"denied": 1, "resolved": 1}
    assert stats.resolution_rate_pct == 100
    assert stats.avg_resolution_hours is None or stats.avg_resolution_hours >= 0


def test_only_denied_complaints_give_a_zero_rate_without_failing(maker):
    deny(maker, complaint_id=1)
    deny(maker, complaint_id=2)

    async def run():
        async with maker() as db:
            return await ComplaintService(db).get_stats()

    assert asyncio.run(run()).resolution_rate_pct == 0


def test_living_score_ignores_denied_complaints():
    service = LivingScoreService(None)
    make = lambda *statuses: [SimpleNamespace(status=status) for status in statuses]  # noqa: E731
    assert service._score_community_health(make("denied")) == 100
    assert service._score_community_health(make("resolved", "denied")) == service._score_community_health(make("resolved"))
    assert service._score_community_health(make("submitted", "denied")) == service._score_community_health(make("submitted"))
