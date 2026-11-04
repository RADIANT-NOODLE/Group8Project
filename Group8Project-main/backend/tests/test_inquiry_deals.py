"""Marking an enquiry Sold or Rented Out: who may, and what else it changes.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

pytest.importorskip("aiosqlite")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import select  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402, F401  (loads every model and route)
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.api.dependencies import get_current_user  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.property.models.inquiry import Inquiry  # noqa: E402
from app.property.models.listing import Listing  # noqa: E402
from app.property.models.property import Property  # noqa: E402
from app.property.models.property_request import PropertyRequest  # noqa: E402

AGENT, OTHER_AGENT, HOA, HEAD = 10, 11, 20, 21
ROLES = {AGENT: "estate_agent", OTHER_AGENT: "estate_agent", HOA: "hoa_admin", HEAD: "head_admin"}
SALE_UNIT, RENTAL_UNIT, OLD_UNIT = 1, 2, 3
NOW = datetime(2026, 11, 1, tzinfo=timezone.utc)


@pytest.fixture()
def sessions():
    engine = create_async_engine("sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False})
    maker = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        tables = [t.__table__ for t in (User, Property, Listing, PropertyRequest, Inquiry)]
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=tables)
        async with maker() as db:
            for user_id, role in ROLES.items():
                db.add(User(user_id=user_id, full_name=f"User {user_id}", email=f"u{user_id}@example.com", role=role, password_hash="x", hoa_approved=True))
            for unit in (SALE_UNIT, RENTAL_UNIT, OLD_UNIT):
                db.add(Property(unit_id=unit, unit_no=str(100 + unit), complex_name="Silverleaf", street_address="12 Main Road"))
            # the sale unit was published twice, as unit 104 really was
            db.add(Listing(listing_id=1, unit_id=SALE_UNIT, agent_id=AGENT, price=1, listing_type="sale", status="active", updated_at=NOW))
            db.add(Listing(listing_id=2, unit_id=SALE_UNIT, agent_id=AGENT, price=1, listing_type="sale", status="active", updated_at=NOW + timedelta(seconds=1)))
            db.add(Listing(listing_id=3, unit_id=RENTAL_UNIT, agent_id=OTHER_AGENT, price=1, listing_type="rent", status="active", updated_at=NOW))
            db.add(Listing(listing_id=4, unit_id=OLD_UNIT, agent_id=AGENT, price=1, listing_type=None, status="active", updated_at=NOW))
            db.add(PropertyRequest(request_id=1, requester_id=HOA, unit_id=SALE_UNIT, request_type="sell", asking_price=1, status="listed", assigned_agent_id=AGENT))
            db.add(PropertyRequest(request_id=2, requester_id=HOA, unit_id=SALE_UNIT, request_type="rent", asking_price=1, status="listed", assigned_agent_id=AGENT))
            db.add(PropertyRequest(request_id=3, requester_id=HOA, unit_id=RENTAL_UNIT, request_type="rent", asking_price=1, status="Assigned", assigned_agent_id=OTHER_AGENT))
            db.add(PropertyRequest(request_id=4, requester_id=HOA, unit_id=SALE_UNIT, request_type="sell", asking_price=1, status="rejected"))
            for inquiry_id, unit, agent in ((1, SALE_UNIT, AGENT), (2, RENTAL_UNIT, OTHER_AGENT), (3, OLD_UNIT, AGENT), (4, SALE_UNIT, AGENT)):
                db.add(Inquiry(inquiry_id=inquiry_id, property_id=unit, agent_id=agent, buyer_name="Sam", buyer_email="s@example.com", buyer_contact="0821234567", status="New", created_at=NOW.replace(tzinfo=None) + timedelta(minutes=inquiry_id)))
            await db.commit()

    asyncio.run(build())

    async def fake_db():
        async with maker() as db:
            yield db

    app.main.app.dependency_overrides[get_db] = fake_db
    yield maker
    app.main.app.dependency_overrides.clear()
    asyncio.run(engine.dispose())


def client_as(user_id):
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(user_id=user_id, role=ROLES[user_id])
    return TestClient(app.main.app)


def patch(user_id, inquiry_id, status):
    return client_as(user_id).patch(f"/api/v1/inquiries/{inquiry_id}", json={"status": status})


def rows(maker, model, key):
    async def read():
        async with maker() as db:
            found = (await db.execute(select(model))).scalars().all()
            return {getattr(row, key): row.status for row in found}

    return asyncio.run(read())


def test_sold_closes_every_live_listing_and_the_sale_request(sessions):
    assert patch(AGENT, 1, "Sold").status_code == 200
    listings = rows(sessions, Listing, "listing_id")
    requests = rows(sessions, PropertyRequest, "request_id")
    assert rows(sessions, Inquiry, "inquiry_id")[1] == "Sold"
    assert (listings[1], listings[2]) == ("sold", "sold")
    assert requests[1] == "sold"
    # other units, a rent request on this unit and a rejected request are left alone
    assert (listings[3], listings[4]) == ("active", "active")
    assert (requests[2], requests[3], requests[4]) == ("listed", "Assigned", "rejected")


def test_rented_out_closes_the_rental_and_older_status_spelling(sessions):
    assert patch(OTHER_AGENT, 2, "Rented Out").status_code == 200
    assert rows(sessions, Listing, "listing_id")[3] == "rented"
    assert rows(sessions, PropertyRequest, "request_id")[3] == "rented"


def test_an_ordinary_status_leaves_the_property_alone(sessions):
    assert patch(AGENT, 1, "Contacted").status_code == 200
    assert rows(sessions, Inquiry, "inquiry_id")[1] == "Contacted"
    assert rows(sessions, Listing, "listing_id")[1] == "active"


@pytest.mark.parametrize("inquiry_id, status", [(1, "Rented Out"), (2, "Sold")])
def test_outcome_must_match_how_the_unit_is_listed(sessions, inquiry_id, status):
    actor = AGENT if inquiry_id == 1 else OTHER_AGENT
    assert patch(actor, inquiry_id, status).status_code == 409
    assert rows(sessions, Inquiry, "inquiry_id")[inquiry_id] == "New"
    assert "active" in rows(sessions, Listing, "listing_id").values()


def test_listing_without_a_type_can_end_either_way(sessions):
    assert patch(AGENT, 3, "Rented Out").status_code == 200
    assert rows(sessions, Listing, "listing_id")[4] == "rented"


def test_a_finished_deal_is_locked(sessions):
    assert patch(AGENT, 1, "Sold").status_code == 200
    assert patch(AGENT, 1, "New").status_code == 409
    assert patch(HOA, 1, "Contacted").status_code == 409
    assert rows(sessions, Inquiry, "inquiry_id")[1] == "Sold"
    assert patch(AGENT, 1, "Sold").status_code == 200  # repeating it changes nothing


def test_a_unit_cannot_be_sold_twice(sessions):
    assert patch(AGENT, 1, "Sold").status_code == 200
    assert patch(AGENT, 4, "Sold").status_code == 409
    assert rows(sessions, Inquiry, "inquiry_id")[4] == "New"


def test_closed_is_no_longer_accepted(sessions):
    assert patch(AGENT, 1, "Closed").status_code == 422


def test_an_older_closed_enquiry_can_still_move_on(sessions):
    async def close():
        async with sessions() as db:
            (await db.get(Inquiry, 1)).status = "Closed"
            await db.commit()

    asyncio.run(close())
    assert patch(AGENT, 1, "Sold").status_code == 200


@pytest.mark.parametrize("actor", [HOA, HEAD])
def test_administrators_can_close_any_deal(sessions, actor):
    assert patch(actor, 2, "Rented Out").status_code == 200


def test_another_agent_cannot_close_a_deal(sessions):
    assert patch(OTHER_AGENT, 1, "Sold").status_code == 403
    assert rows(sessions, Listing, "listing_id")[1] == "active"


@pytest.mark.parametrize("actor, expected", [(AGENT, {1, 3, 4}), (OTHER_AGENT, {2}), (HOA, {1, 2, 3, 4}), (HEAD, {1, 2, 3, 4})])
def test_who_sees_which_enquiries(sessions, actor, expected):
    response = client_as(actor).get("/api/v1/inquiries")
    assert response.status_code == 200
    assert {item["inquiry_id"] for item in response.json()} == expected


def test_list_shows_the_agent_and_listing_type(sessions):
    items = {item["inquiry_id"]: item for item in client_as(HOA).get("/api/v1/inquiries").json()}
    assert (items[1]["agent_name"], items[1]["listing_type"]) == ("User 10", "sale")
    assert (items[2]["agent_name"], items[2]["listing_type"]) == ("User 11", "rent")
    assert items[3]["listing_type"] is None
