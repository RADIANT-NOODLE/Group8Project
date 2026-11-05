"""Deleting a property: admins only, refused while in use, and it leaves nothing behind.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio
from datetime import datetime
from types import SimpleNamespace

import pytest

pytest.importorskip("aiosqlite")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import func, select  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402  (loads every model and route)
from app.analytics.models.ai_analytic import AIAnalytic  # noqa: E402
from app.community.models.complaint import Complaint  # noqa: E402
from app.community.models.resident_directory import ResidentDirectory  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.api.dependencies import get_current_user  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.property.models.inquiry import Inquiry  # noqa: E402
from app.property.models.listing import Listing  # noqa: E402
from app.property.models.property import Property  # noqa: E402
from app.property.models.property_photo import PropertyPhoto  # noqa: E402
from app.property.models.property_request import PropertyRequest  # noqa: E402
from app.property.models.sale import Sale  # noqa: E402

ADMIN, HEAD, AGENT, RESIDENT = 1, 2, 3, 4
UNIT, OTHER_UNIT = 10, 11
TABLES = (User, Property, PropertyPhoto, Listing, Inquiry, PropertyRequest, ResidentDirectory, Complaint, Sale, AIAnalytic)


@pytest.fixture()
def sessions():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    maker = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=[t.__table__ for t in TABLES])
        async with maker() as db:
            for user_id, role in ((ADMIN, "hoa_admin"), (HEAD, "head_admin"), (AGENT, "estate_agent"), (RESIDENT, "resident")):
                db.add(User(user_id=user_id, full_name=f"User {user_id}", email=f"u{user_id}@example.com",
                            password_hash="x", role=role, hoa_approved=True))
            for unit_id, unit_no in ((UNIT, "104"), (OTHER_UNIT, "105")):
                db.add(Property(unit_id=unit_id, unit_no=unit_no, complex_name="Test Estate", street_address="1 Road"))
                db.add(PropertyPhoto(unit_id=unit_id, file_name=f"{unit_id}.jpg", data=b"x", content_type="image/jpeg"))
                db.add(Listing(unit_id=unit_id, agent_id=AGENT, price=100, status="withdrawn"))
                db.add(Inquiry(property_id=unit_id, agent_id=AGENT, buyer_name="B", buyer_email="b@example.com", status="New"))
                db.add(PropertyRequest(requester_id=RESIDENT, unit_id=unit_id, request_type="sell", asking_price=100, status="assigned"))
            await db.commit()

    asyncio.run(build())

    async def override_db():
        async with maker() as db:
            yield db

    app.main.app.dependency_overrides[get_db] = override_db
    yield maker
    app.main.app.dependency_overrides.clear()
    asyncio.run(engine.dispose())


def remove(actor, unit=UNIT):
    role = {ADMIN: "hoa_admin", HEAD: "head_admin", AGENT: "estate_agent", RESIDENT: "resident"}[actor]
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(user_id=actor, role=role, hoa_approved=True)
    return TestClient(app.main.app).delete(f"/api/v1/properties/{unit}")


def add(sessions, row):
    async def save():
        async with sessions() as db:
            db.add(row)
            await db.commit()

    asyncio.run(save())


def count(sessions, column, value):
    async def read():
        async with sessions() as db:
            return (await db.execute(select(func.count()).where(column == value))).scalar_one()

    return asyncio.run(read())


@pytest.mark.parametrize("actor", [ADMIN, HEAD])
def test_an_admin_deletes_a_property_and_its_history(sessions, actor):
    assert remove(actor).status_code == 204

    for column in (Property.unit_id, PropertyPhoto.unit_id, Listing.unit_id, Inquiry.property_id, PropertyRequest.unit_id):
        assert count(sessions, column, UNIT) == 0, column
        assert count(sessions, column, OTHER_UNIT) == 1, column  # another unit is untouched


@pytest.mark.parametrize("actor", [AGENT, RESIDENT])
def test_others_cannot_delete_a_property(sessions, actor):
    assert remove(actor).status_code == 403
    assert count(sessions, Property.unit_id, UNIT) == 1


def test_a_missing_property_is_reported(sessions):
    assert remove(ADMIN, 999).status_code == 404


@pytest.mark.parametrize(
    "blocker, wording",
    [
        (lambda: ResidentDirectory(user_id=RESIDENT, property_id=UNIT), "1 resident"),
        (lambda: Listing(unit_id=UNIT, agent_id=AGENT, price=100, status="active"), "1 live listing"),
        (lambda: Complaint(unit_id=UNIT, user_id=RESIDENT, category="Noise", description="Loud"), "1 complaint"),
        (lambda: Sale(unit_id=UNIT, price=100, sale_date=datetime(2026, 11, 1)), "1 sale record"),
    ],
)
def test_a_property_in_use_is_refused_and_nothing_is_removed(sessions, blocker, wording):
    add(sessions, blocker())

    response = remove(ADMIN)

    assert response.status_code == 409
    assert wording in str(response.json())
    assert "Unit 104" in str(response.json())
    for column in (Property.unit_id, PropertyPhoto.unit_id, Inquiry.property_id, PropertyRequest.unit_id):
        assert count(sessions, column, UNIT) == 1, column
