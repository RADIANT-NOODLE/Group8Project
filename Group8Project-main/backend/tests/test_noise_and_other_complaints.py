"""Noise complaints get no service provider, and "Other" complaints must say what they're about.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio

import pytest
from pydantic import ValidationError

pytest.importorskip("aiosqlite")

from sqlalchemy import func, select  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402,F401  (loads every model and route)
from app.community.models.complaint import Complaint  # noqa: E402
from app.community.models.maintenance_work_order import MaintenanceworkOrder  # noqa: E402
from app.community.schemas.complaint import ComplaintCreate  # noqa: E402
from app.community.schemas.work_order import WorkOrderCreate  # noqa: E402
from app.community.services.work_order_service import WorkOrderService  # noqa: E402
from app.core.exceptions import ConflictException  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.providers.models.service_provider import ServiceProvider  # noqa: E402

PROVIDER = 5


@pytest.fixture()
def maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        tables = [t.__table__ for t in (User, Complaint, ServiceProvider, MaintenanceworkOrder)]
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=tables)
        async with sessions() as db:
            db.add(User(user_id=1, full_name="Sam", email="sam@example.com", role="resident",
                        password_hash="x", hoa_approved=True))
            db.add(ServiceProvider(provider_id=PROVIDER, full_name="Fixit", trade="General", phone="0800000000",
                                   email="fixit@example.com"))
            categories = ("Noise", " noise ", "NOISE", "Security", "Other: Broken gate")
            for complaint_id, category in enumerate(categories, start=1):
                db.add(Complaint(complaint_id=complaint_id, user_id=1, unit_id=1, category=category, description="Details"))
            await db.commit()

    asyncio.run(build())
    yield sessions
    asyncio.run(engine.dispose())


def assign(maker, complaint_id):
    async def run():
        async with maker() as db:
            return await WorkOrderService(db).create_work_order(
                WorkOrderCreate(complaint_id=complaint_id, provider_id=PROVIDER)
            )

    return asyncio.run(run())


def orders(maker):
    async def run():
        async with maker() as db:
            return (await db.execute(select(func.count()).select_from(MaintenanceworkOrder))).scalar_one()

    return asyncio.run(run())


@pytest.mark.parametrize("complaint_id", [1, 2, 3])
def test_a_noise_complaint_cannot_get_a_service_provider(maker, complaint_id):
    with pytest.raises(ConflictException, match="Noise complaints"):
        assign(maker, complaint_id)
    assert orders(maker) == 0


@pytest.mark.parametrize("complaint_id", [4, 5])
def test_other_complaints_still_can(maker, complaint_id):
    assign(maker, complaint_id)
    assert orders(maker) == 1


def complaint(category):
    return ComplaintCreate(unit_id=1, category=category, description="Details here")


@pytest.mark.parametrize("category", ["Other", "other", " Other ", "Other:", "Other: "])
def test_other_must_say_what_it_is(category):
    with pytest.raises(ValidationError, match="what the complaint is about"):
        complaint(category)


@pytest.mark.parametrize("category", ["Other: Broken gate", "Noise", "Security", "Otherworldly smell"])
def test_a_described_category_is_accepted(category):
    assert complaint(category).category == category
