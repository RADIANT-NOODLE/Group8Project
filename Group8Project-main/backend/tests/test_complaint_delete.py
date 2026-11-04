"""Deleting a complaint: who may, and what goes with it.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio
from decimal import Decimal
from types import SimpleNamespace

import pytest

pytest.importorskip("aiosqlite")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import event, func, select  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402  (loads every model and route)
from app.community.models.complaint import Complaint, ComplaintPhoto  # noqa: E402
from app.community.models.maintenance_work_order import MaintenanceworkOrder  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.api.dependencies import get_current_user  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.providers.models.review import Review  # noqa: E402
from app.providers.models.service_provider import ServiceProvider  # noqa: E402

KEPT, DELETED = 1, 2
RATED_PROVIDER, UNRATED_PROVIDER = 4, 5


@pytest.fixture()
def sessions():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )

    # the real database enforces these; SQLite only does when asked
    @event.listens_for(engine.sync_engine, "connect")
    def _foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")

    maker = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        tables = [t.__table__ for t in (User, Complaint, ComplaintPhoto, MaintenanceworkOrder, ServiceProvider, Review)]
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=tables)
        async with maker() as db:
            db.add(User(user_id=2, full_name="Resident", email="r@example.invalid", role="resident", password_hash="x", hoa_approved=True))
            await db.flush()
            for complaint_id in (KEPT, DELETED):
                db.add(Complaint(complaint_id=complaint_id, user_id=2, unit_id=1, category="Security", description="Gate broken", status="in_progress"))
            await db.flush()
            db.add(ComplaintPhoto(complaint_id=DELETED, content_type="image/png", data=b"x"))
            db.add(ServiceProvider(provider_id=RATED_PROVIDER, full_name="Rated", trade="security", phone="0821234567", email="a@example.invalid", avg_rating=Decimal("3.00"), total_reviews=2))
            db.add(ServiceProvider(provider_id=UNRATED_PROVIDER, full_name="Unrated", trade="security", phone="0821234568", email="b@example.invalid", avg_rating=Decimal("4.50"), total_reviews=9))
            db.add(MaintenanceworkOrder(work_order_id=1, complaint_id=KEPT, provider_id=RATED_PROVIDER, status="completed", resident_rating=5))
            db.add(MaintenanceworkOrder(work_order_id=2, complaint_id=DELETED, provider_id=RATED_PROVIDER, status="completed", resident_rating=1))
            db.add(MaintenanceworkOrder(work_order_id=3, complaint_id=DELETED, provider_id=UNRATED_PROVIDER, status="assigned"))
            await db.commit()

    asyncio.run(build())

    async def override_db():
        async with maker() as session:
            yield session

    app.main.app.dependency_overrides[get_db] = override_db
    yield maker
    app.main.app.dependency_overrides.clear()


def delete_as(role, complaint_id=DELETED):
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(user_id=99, role=role)
    return TestClient(app.main.app).delete(f"/api/v1/complaints/{complaint_id}")


def query(maker, fn):
    async def run():
        async with maker() as db:
            return await fn(db)

    return asyncio.run(run())


def count(maker, model):
    return query(maker, lambda db: _count(db, model))


async def _count(db, model):
    return (await db.execute(select(func.count()).select_from(model))).scalar()


@pytest.mark.parametrize("role", ["hoa_admin", "head_admin"])
def test_administrators_can_delete(sessions, role):
    assert delete_as(role).status_code == 204
    assert query(sessions, lambda db: db.get(Complaint, DELETED)) is None
    assert query(sessions, lambda db: db.get(Complaint, KEPT)) is not None


@pytest.mark.parametrize("role", ["resident", "estate_agent", "service_provider"])
def test_everyone_else_is_refused_and_nothing_changes(sessions, role):
    assert delete_as(role).status_code == 403
    assert count(sessions, Complaint) == 2
    assert count(sessions, MaintenanceworkOrder) == 3


def test_its_work_orders_and_photo_go_with_it(sessions):
    delete_as("hoa_admin")
    assert count(sessions, ComplaintPhoto) == 0
    assert query(sessions, lambda db: db.get(MaintenanceworkOrder, 2)) is None
    assert query(sessions, lambda db: db.get(MaintenanceworkOrder, 3)) is None
    assert query(sessions, lambda db: db.get(MaintenanceworkOrder, 1)) is not None


def test_a_rated_providers_average_is_recalculated(sessions):
    delete_as("hoa_admin")
    provider = query(sessions, lambda db: db.get(ServiceProvider, RATED_PROVIDER))
    assert provider.avg_rating == Decimal("5.00")
    assert provider.total_reviews == 1


def test_a_provider_without_a_rating_here_is_left_alone(sessions):
    delete_as("hoa_admin")
    provider = query(sessions, lambda db: db.get(ServiceProvider, UNRATED_PROVIDER))
    assert provider.avg_rating == Decimal("4.50")
    assert provider.total_reviews == 9


def test_deleting_something_that_does_not_exist(sessions):
    assert delete_as("hoa_admin", 999).status_code == 404
    assert count(sessions, Complaint) == 2
