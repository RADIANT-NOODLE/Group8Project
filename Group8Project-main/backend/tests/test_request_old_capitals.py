"""Older requests were saved as 'Assigned' and 'Sell'. They must still move through the pipeline.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio
from types import SimpleNamespace

import pytest

pytest.importorskip("aiosqlite")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402  (loads every model and route)
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.api.dependencies import get_current_user  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.property.models.inquiry import Inquiry  # noqa: E402
from app.property.models.listing import Listing  # noqa: E402
from app.property.models.property import Property  # noqa: E402
from app.property.models.property_request import PropertyRequest  # noqa: E402
from app.property.repositories.property_request_repository import PropertyRequestRepository  # noqa: E402

AGENT, RESIDENT, UNIT, REQUEST = 3, 4, 10, 1


@pytest.fixture()
def maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        tables = [t.__table__ for t in (User, Property, PropertyRequest, Listing, Inquiry)]
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=tables)
        async with sessions() as db:
            for user_id, role in ((AGENT, "estate_agent"), (RESIDENT, "resident")):
                db.add(User(user_id=user_id, full_name=f"User {user_id}", email=f"u{user_id}@example.com",
                            password_hash="x", role=role, hoa_approved=True))
            db.add(Property(unit_id=UNIT, unit_no="101", complex_name="Estate", street_address="1 Road"))
            db.add(PropertyRequest(request_id=REQUEST, requester_id=RESIDENT, unit_id=UNIT, request_type="Sell",
                                   asking_price=100, status="Assigned", assigned_agent_id=AGENT))
            await db.commit()

    asyncio.run(build())

    async def override_db():
        async with sessions() as db:
            yield db

    app.main.app.dependency_overrides[get_db] = override_db
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        user_id=AGENT, role="estate_agent", hoa_approved=True
    )
    yield sessions
    app.main.app.dependency_overrides.clear()
    asyncio.run(engine.dispose())


def progress(status):
    return TestClient(app.main.app).post(f"/api/v1/property-requests/{REQUEST}/progress", json={"status": status})


def stored_status(maker):
    async def read():
        async with maker() as db:
            return (await db.get(PropertyRequest, REQUEST)).status

    return asyncio.run(read())


def test_an_old_request_moves_on_to_listed_and_then_sold(maker):
    assert progress("listed").status_code == 200
    assert stored_status(maker) == "listed"
    assert progress("sold").status_code == 200
    assert stored_status(maker) == "sold"


def test_an_old_sale_request_still_cannot_be_rented(maker):
    assert progress("listed").status_code == 200
    assert progress("rented").status_code == 409


def test_an_old_request_still_counts_as_open(maker):
    async def read():
        async with maker() as db:
            return await PropertyRequestRepository(db).get_active_for_unit(UNIT)

    assert asyncio.run(read()) is not None


def test_a_sold_inquiry_completes_an_old_request(maker):
    async def seed():
        async with maker() as db:
            db.add(Listing(unit_id=UNIT, agent_id=AGENT, price=100, listing_type="sale", status="active"))
            db.add(Inquiry(inquiry_id=1, property_id=UNIT, agent_id=AGENT, buyer_name="B", buyer_email="b@example.com", status="New"))
            await db.commit()

    asyncio.run(seed())
    response = TestClient(app.main.app).patch("/api/v1/inquiries/1", json={"status": "Sold"})
    assert response.status_code == 200
    assert stored_status(maker) == "sold"


def test_a_listed_old_request_cannot_be_deleted(maker):
    async def seed():
        async with maker() as db:
            (await db.get(PropertyRequest, REQUEST)).status = "Listed"
            await db.commit()

    asyncio.run(seed())
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        user_id=99, role="hoa_admin", hoa_approved=True
    )
    assert TestClient(app.main.app).delete(f"/api/v1/property-requests/{REQUEST}").status_code == 409
