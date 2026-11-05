"""Deleting an estate agent: who may, and when it must be refused.

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

ADMIN, HEAD, RESIDENT, FREE_AGENT, BUSY_AGENT = 1, 2, 3, 4, 5
UNIT = 10


@pytest.fixture()
def maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        async with engine.begin() as connection:
            await connection.run_sync(
                Base.metadata.create_all,
                tables=[t.__table__ for t in (User, Property, Listing, Inquiry, PropertyRequest)],
            )
        async with sessions() as db:
            for user_id, name, role in (
                (ADMIN, "Admin", "hoa_admin"),
                (HEAD, "Head", "head_admin"),
                (RESIDENT, "Resident", "resident"),
                (FREE_AGENT, "Free Agent", "estate_agent"),
                (BUSY_AGENT, "Busy Agent", "estate_agent"),
            ):
                db.add(User(user_id=user_id, full_name=name, email=f"{user_id}@example.invalid", role=role, password_hash="x", hoa_approved=True))
            db.add(Property(unit_id=UNIT, unit_no="100", complex_name="Silverleaf", street_address="12 Main Road"))
            await db.commit()

    asyncio.run(build())

    async def override_db():
        async with sessions() as session:
            yield session

    app.main.app.dependency_overrides[get_db] = override_db
    yield sessions
    app.main.app.dependency_overrides.clear()


def delete_as(role, target, actor=ADMIN):
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(user_id=actor, role=role)
    return TestClient(app.main.app).delete(f"/api/v1/users/estate-agents/{target}")


def add(maker, *rows):
    async def run():
        async with maker() as db:
            db.add_all(rows)
            await db.commit()

    asyncio.run(run())


def user_exists(maker, user_id):
    async def run():
        async with maker() as db:
            return await db.get(User, user_id) is not None

    return asyncio.run(run())


def listing(status="active"):
    return Listing(unit_id=UNIT, agent_id=BUSY_AGENT, price=1, listing_type="sale", status=status)


def enquiry(status="New"):
    return Inquiry(property_id=UNIT, agent_id=BUSY_AGENT, buyer_name="Sam", buyer_email="s@example.com", buyer_contact="+27821234567", status=status)


def request(status):
    return PropertyRequest(requester_id=RESIDENT, unit_id=UNIT, request_type="sell", asking_price=1, status=status, assigned_agent_id=BUSY_AGENT)


@pytest.mark.parametrize("role, actor", [("hoa_admin", ADMIN), ("head_admin", HEAD)])
def test_administrators_can_delete_an_agent_with_no_work(maker, role, actor):
    assert delete_as(role, FREE_AGENT, actor).status_code == 204
    assert not user_exists(maker, FREE_AGENT)
    assert user_exists(maker, BUSY_AGENT)


@pytest.mark.parametrize("role", ["resident", "estate_agent", "service_provider"])
def test_everyone_else_is_refused(maker, role):
    assert delete_as(role, FREE_AGENT, RESIDENT).status_code == 403
    assert user_exists(maker, FREE_AGENT)


@pytest.mark.parametrize(
    "make_row, wording",
    [
        (lambda: listing(), "1 listing"),
        (lambda: listing("sold"), "1 listing"),
        (lambda: enquiry(), "1 enquiry"),
        (lambda: enquiry("Sold"), "1 enquiry"),
        (lambda: request("assigned"), "1 open request"),
        (lambda: request("Assigned"), "1 open request"),
        (lambda: request("listed"), "1 open request"),
    ],
)
def test_an_agent_with_work_is_refused_and_nothing_changes(maker, make_row, wording):
    add(maker, make_row())
    response = delete_as("hoa_admin", BUSY_AGENT)
    assert response.status_code == 409
    assert wording in response.json()["detail"] and "Busy Agent" in response.json()["detail"]
    assert user_exists(maker, BUSY_AGENT)


def test_the_refusal_lists_everything_they_hold(maker):
    add(maker, listing(), listing(), enquiry(), enquiry(), request("listed"), request("Assigned"))
    assert "2 listings, 2 enquiries, 2 open requests" in delete_as("hoa_admin", BUSY_AGENT).json()["detail"]


@pytest.mark.parametrize("status", ["sold", "rented", "rejected", "withdrawn"])
def test_a_finished_request_does_not_block(maker, status):
    add(maker, request(status))
    assert delete_as("hoa_admin", BUSY_AGENT).status_code == 204


@pytest.mark.parametrize("target", [ADMIN, HEAD, RESIDENT, 999])
def test_only_estate_agents_can_be_deleted_this_way(maker, target):
    assert delete_as("hoa_admin", target, BUSY_AGENT).status_code == 404
    if target != 999:
        assert user_exists(maker, target)
