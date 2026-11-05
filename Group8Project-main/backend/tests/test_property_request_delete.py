"""Deleting a property request: admins only, and never one that is live on the market.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio
from types import SimpleNamespace

import pytest

pytest.importorskip("aiosqlite")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import select  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402  (loads every model and route)
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.api.dependencies import get_current_user  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.property.models.property import Property  # noqa: E402
from app.property.models.property_request import PropertyRequest  # noqa: E402

ROLES = {1: "hoa_admin", 2: "head_admin", 3: "estate_agent", 4: "resident"}
HOA, HEAD, AGENT, RESIDENT = ROLES
STATUSES = ["pending_review", "approved", "rejected", "assigned", "listed", "sold", "rented"]


@pytest.fixture()
def sessions():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    maker = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        async with engine.begin() as connection:
            await connection.run_sync(
                Base.metadata.create_all, tables=[User.__table__, Property.__table__, PropertyRequest.__table__]
            )
        async with maker() as db:
            for user_id, role in ROLES.items():
                db.add(User(user_id=user_id, full_name=f"User {user_id}", email=f"u{user_id}@example.com",
                            password_hash="x", role=role, hoa_approved=True))
            for index, status in enumerate(STATUSES, start=1):
                db.add(Property(unit_id=index, unit_no=f"10{index}", complex_name="Estate", street_address="1 Road"))
                db.add(PropertyRequest(request_id=index, requester_id=RESIDENT, unit_id=index, request_type="sell",
                                       asking_price=100, status=status))
            await db.commit()

    asyncio.run(build())

    async def override_db():
        async with maker() as db:
            yield db

    app.main.app.dependency_overrides[get_db] = override_db
    yield maker
    app.main.app.dependency_overrides.clear()
    asyncio.run(engine.dispose())


def remove(actor, request_id):
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        user_id=actor, role=ROLES[actor], hoa_approved=True
    )
    return TestClient(app.main.app).delete(f"/api/v1/property-requests/{request_id}")


def remaining(maker):
    async def read():
        async with maker() as db:
            return set((await db.execute(select(PropertyRequest.request_id))).scalars())

    return asyncio.run(read())


ALL = set(range(1, len(STATUSES) + 1))


@pytest.mark.parametrize("status", [s for s in STATUSES if s != "listed"])
@pytest.mark.parametrize("actor", [HOA, HEAD])
def test_an_admin_can_delete_it(sessions, actor, status):
    request_id = STATUSES.index(status) + 1
    assert remove(actor, request_id).status_code == 204
    assert remaining(sessions) == ALL - {request_id}


def test_a_live_request_is_refused_with_the_reason(sessions):
    response = remove(HOA, STATUSES.index("listed") + 1)
    assert response.status_code == 409
    assert "live on the market" in str(response.json())
    assert remaining(sessions) == ALL


@pytest.mark.parametrize("actor", [AGENT, RESIDENT])
def test_others_cannot_delete(sessions, actor):
    assert remove(actor, 1).status_code == 403
    assert remaining(sessions) == ALL


def test_a_missing_request_is_reported(sessions):
    assert remove(HOA, 999).status_code == 404
