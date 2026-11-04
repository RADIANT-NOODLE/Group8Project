"""One provider, one active work order per complaint.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio

import pytest

pytest.importorskip("aiosqlite")

from fastapi import HTTPException  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402, F401  (loads every model and route)
from app.common.enums import WorkOrderStatus  # noqa: E402
from app.community.models.complaint import Complaint  # noqa: E402
from app.community.models.maintenance_work_order import MaintenanceworkOrder  # noqa: E402
from app.community.schemas.work_order import WorkOrderCreate, WorkOrderUpdate  # noqa: E402
from app.community.services.work_order_service import WorkOrderService  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.providers.models.service_provider import ServiceProvider  # noqa: E402

COMPLAINT, OTHER_COMPLAINT = 1, 2
PROVIDER, OTHER_PROVIDER = 4, 5


@pytest.fixture()
def maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        tables = [t.__table__ for t in (User, Complaint, MaintenanceworkOrder, ServiceProvider)]
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=tables)
        async with sessions() as db:
            for complaint_id in (COMPLAINT, OTHER_COMPLAINT):
                db.add(Complaint(complaint_id=complaint_id, user_id=2, unit_id=1, category="Security", description="Gate broken", status="in_progress"))
            for provider_id in (PROVIDER, OTHER_PROVIDER):
                db.add(ServiceProvider(provider_id=provider_id, full_name=f"Provider {provider_id}", trade="security", phone="0821234567", email=f"p{provider_id}@example.invalid"))
            await db.commit()

    asyncio.run(build())
    return sessions


def add_existing(maker, status, provider_id=PROVIDER):
    async def run():
        async with maker() as db:
            order = MaintenanceworkOrder(complaint_id=COMPLAINT, provider_id=provider_id, status=status)
            db.add(order)
            await db.commit()
            return order.work_order_id

    return asyncio.run(run())


def create(maker, complaint_id=COMPLAINT, provider_id=PROVIDER):
    async def run():
        async with maker() as db:
            return await WorkOrderService(db).create_work_order(
                WorkOrderCreate(complaint_id=complaint_id, provider_id=provider_id)
            )

    return asyncio.run(run())


def set_status(maker, work_order_id, status):
    async def run():
        async with maker() as db:
            return await WorkOrderService(db).update_work_order(work_order_id, WorkOrderUpdate(status=status))

    return asyncio.run(run())


def count_orders(maker):
    async def run():
        async with maker() as db:
            from sqlalchemy import func, select

            return (await db.execute(select(func.count()).select_from(MaintenanceworkOrder))).scalar()

    return asyncio.run(run())


@pytest.mark.parametrize("status", ["assigned", "in_progress"])
def test_same_provider_is_refused_while_an_order_is_active(maker, status):
    add_existing(maker, status)
    with pytest.raises(HTTPException) as refused:
        create(maker)
    assert refused.value.status_code == 409
    assert "Provider 4" in refused.value.detail
    assert count_orders(maker) == 1


@pytest.mark.parametrize("status", ["completed", "cancelled"])
def test_same_provider_can_return_once_an_order_is_finished(maker, status):
    add_existing(maker, status)
    create(maker)
    assert count_orders(maker) == 2


def test_a_different_provider_is_allowed(maker):
    add_existing(maker, "in_progress")
    create(maker, provider_id=OTHER_PROVIDER)
    assert count_orders(maker) == 2


def test_the_same_provider_can_work_on_another_complaint(maker):
    add_existing(maker, "in_progress")
    create(maker, complaint_id=OTHER_COMPLAINT)
    assert count_orders(maker) == 2


def test_a_cancelled_order_cannot_be_revived_into_a_duplicate(maker):
    add_existing(maker, "in_progress")
    cancelled = add_existing(maker, "cancelled")
    for status in (WorkOrderStatus.assigned, WorkOrderStatus.in_progress):
        with pytest.raises(HTTPException) as refused:
            set_status(maker, cancelled, status)
        assert refused.value.status_code == 409


def test_a_cancelled_order_can_be_revived_when_nothing_else_is_active(maker):
    cancelled = add_existing(maker, "cancelled")
    assert set_status(maker, cancelled, WorkOrderStatus.assigned).status == "assigned"


def test_an_active_order_can_still_move_along(maker):
    order = add_existing(maker, "assigned")
    assert set_status(maker, order, WorkOrderStatus.in_progress).status == "in_progress"
    assert set_status(maker, order, WorkOrderStatus.completed).status == "completed"
