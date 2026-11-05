"""Changing a property's estate agent: the live listing and open inquiries move too.

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

HOA, HEAD, OLD, NEW, PENDING_AGENT, RESIDENT = 1, 2, 3, 4, 5, 6
UNIT, OTHER_UNIT, REQUEST = 10, 11, 1


@pytest.fixture()
def make():
    created = []

    def build(status):
        engine = create_async_engine(
            "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
        )
        created.append(engine)
        sessions = async_sessionmaker(engine, expire_on_commit=False)

        async def seed():
            tables = [t.__table__ for t in (User, Property, PropertyRequest, Listing, Inquiry)]
            async with engine.begin() as connection:
                await connection.run_sync(Base.metadata.create_all, tables=tables)
            async with sessions() as db:
                people = ((HOA, "hoa_admin", True), (HEAD, "head_admin", True), (OLD, "estate_agent", True),
                          (NEW, "estate_agent", True), (PENDING_AGENT, "estate_agent", False), (RESIDENT, "resident", True))
                for user_id, role, approved in people:
                    db.add(User(user_id=user_id, full_name=f"User {user_id}", email=f"u{user_id}@example.com",
                                password_hash="x", role=role, hoa_approved=approved))
                for unit_id, unit_no in ((UNIT, "101"), (OTHER_UNIT, "102")):
                    db.add(Property(unit_id=unit_id, unit_no=unit_no, complex_name="Estate", street_address="1 Road"))
                db.add(PropertyRequest(request_id=REQUEST, requester_id=RESIDENT, unit_id=UNIT, request_type="sell",
                                       asking_price=100, status=status, assigned_agent_id=OLD))
                db.add(Listing(listing_id=1, unit_id=UNIT, agent_id=OLD, price=100, status="active"))
                db.add(Listing(listing_id=2, unit_id=UNIT, agent_id=OLD, price=100, status="withdrawn"))
                db.add(Listing(listing_id=3, unit_id=OTHER_UNIT, agent_id=OLD, price=100, status="active"))
                for inquiry_id, unit_id, inquiry_status in ((1, UNIT, "New"), (2, UNIT, "Viewing Scheduled"), (3, UNIT, "Sold"), (4, OTHER_UNIT, "New")):
                    db.add(Inquiry(inquiry_id=inquiry_id, property_id=unit_id, agent_id=OLD, buyer_name="B",
                                   buyer_email="b@example.com", status=inquiry_status))
                await db.commit()

        asyncio.run(seed())

        async def override_db():
            async with sessions() as db:
                yield db

        app.main.app.dependency_overrides[get_db] = override_db
        return sessions

    yield build
    app.main.app.dependency_overrides.clear()
    for engine in created:
        asyncio.run(engine.dispose())


def change(actor, role, agent_id=NEW):
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(user_id=actor, role=role, hoa_approved=True)
    return TestClient(app.main.app).post(
        f"/api/v1/property-requests/{REQUEST}/assign-agent", json={"agent_id": agent_id}
    )


def owners(maker):
    async def read():
        async with maker() as db:
            request = await db.get(PropertyRequest, REQUEST)
            return {
                "request": (request.assigned_agent_id, request.status),
                "listings": {i: (await db.get(Listing, i)).agent_id for i in (1, 2, 3)},
                "inquiries": {i: (await db.get(Inquiry, i)).agent_id for i in (1, 2, 3, 4)},
            }

    return asyncio.run(read())


@pytest.mark.parametrize("status", ["assigned", "listed", "Assigned"])
@pytest.mark.parametrize("actor, role", [(HOA, "hoa_admin"), (HEAD, "head_admin")])
def test_changing_the_agent_moves_live_work_only(make, status, actor, role):
    maker = make(status)
    response = change(actor, role)
    assert response.status_code == 200, response.text
    result = owners(maker)
    assert result["request"][0] == NEW
    assert result["listings"] == {1: NEW, 2: OLD, 3: OLD}  # withdrawn and other units stay
    assert result["inquiries"] == {1: NEW, 2: NEW, 3: OLD, 4: OLD}  # finished and other units stay


def test_a_listed_request_stays_listed(make):
    maker = make("listed")
    assert change(HOA, "hoa_admin").status_code == 200
    assert owners(maker)["request"][1] == "listed"


def test_an_assigned_request_stays_assigned(make):
    maker = make("assigned")
    assert change(HOA, "hoa_admin").status_code == 200
    assert owners(maker)["request"][1] == "assigned"


@pytest.mark.parametrize("status", ["sold", "rented", "rejected", "pending_review"])
def test_a_closed_or_undecided_request_cannot_change(make, status):
    maker = make(status)
    assert change(HOA, "hoa_admin").status_code == 409
    assert owners(maker)["request"][0] == OLD


@pytest.mark.parametrize("actor, role", [(OLD, "estate_agent"), (RESIDENT, "resident")])
def test_only_admins_can_change_it(make, actor, role):
    maker = make("assigned")
    assert change(actor, role).status_code == 403
    assert owners(maker)["request"][0] == OLD


@pytest.mark.parametrize("agent_id, code", [(PENDING_AGENT, 409), (RESIDENT, 404), (999, 404)])
def test_the_new_agent_must_be_an_approved_agent(make, agent_id, code):
    maker = make("assigned")
    assert change(HOA, "hoa_admin", agent_id).status_code == code
    result = owners(maker)
    assert result["request"][0] == OLD
    assert result["listings"][1] == OLD
