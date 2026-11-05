"""Several residents can share a unit; each resident still has only one.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio
from types import SimpleNamespace

import pytest

pytest.importorskip("aiosqlite")

from fastapi import HTTPException  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import func, select  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402  (loads every model and route)
from app.community.models.resident_directory import ResidentDirectory  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.api.dependencies import get_current_user  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.property.models.property import Property  # noqa: E402
from app.property.models.property_request import PropertyRequest  # noqa: E402
from app.property.schemas.property_request import PropertyRequestCreate  # noqa: E402
from app.property.services.property_request_service import PropertyRequestService  # noqa: E402

ADMIN, ANNA, BEN, CARA, AGENT = 1, 2, 3, 4, 5
UNIT, OTHER_UNIT = 10, 11
URL = "/api/v1/resident-directory"


@pytest.fixture()
def maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        tables = [t.__table__ for t in (User, Property, ResidentDirectory, PropertyRequest)]
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=tables)
        async with sessions() as db:
            for user_id, name, role in (
                (ADMIN, "Admin", "hoa_admin"),
                (ANNA, "Anna", "resident"),
                (BEN, "Ben", "resident"),
                (CARA, "Cara", "resident"),
                (AGENT, "Agent", "estate_agent"),
            ):
                db.add(User(user_id=user_id, full_name=name, email=f"{user_id}@example.invalid", role=role, password_hash="x", hoa_approved=True))
            for unit in (UNIT, OTHER_UNIT):
                db.add(Property(unit_id=unit, unit_no=str(unit + 90), complex_name="Silverleaf", street_address="12 Main Road"))
            await db.commit()

    asyncio.run(build())

    async def override_db():
        async with sessions() as session:
            yield session

    app.main.app.dependency_overrides[get_db] = override_db
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(user_id=ADMIN, role="hoa_admin")
    yield sessions
    app.main.app.dependency_overrides.clear()


def client():
    return TestClient(app.main.app)


def assign(user_id, unit=UNIT):
    return client().post(URL, json={"user_id": user_id, "property_id": unit})


def count_records(maker):
    async def run():
        async with maker() as db:
            return (await db.execute(select(func.count()).select_from(ResidentDirectory))).scalar()

    return asyncio.run(run())


def test_several_residents_can_share_a_unit(maker):
    assert assign(ANNA).status_code == 201
    assert assign(BEN).status_code == 201
    assert assign(CARA).status_code == 201
    names = sorted(r["name"] for r in client().get(URL).json() if r["property_id"] == UNIT)
    assert names == ["Anna", "Ben", "Cara"]


def test_a_resident_still_cannot_have_two_records(maker):
    assign(ANNA)
    refused = assign(ANNA, OTHER_UNIT)
    assert refused.status_code == 400
    assert "already assigned" in refused.json()["detail"]
    assert count_records(maker) == 1


def test_only_residents_can_be_assigned(maker):
    assert assign(AGENT).status_code == 400
    assert count_records(maker) == 0


def test_a_missing_unit_is_refused(maker):
    assert assign(ANNA, 999).status_code == 404


def test_editing_keeps_the_person_and_adds_no_record(maker):
    record = assign(ANNA).json()
    assign(BEN)
    response = client().patch(f"{URL}/{record['id']}", json={"property_id": OTHER_UNIT, "occupancy": "Vacant", "status": "Inactive", "notes": "Moved"})
    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == ANNA and body["name"] == "Anna"
    assert body["property_id"] == OTHER_UNIT and body["unit_no"] == "101"
    assert (body["occupancy"], body["status"], body["notes"]) == ("Vacant", "Inactive", "Moved")
    assert count_records(maker) == 2


def test_editing_can_move_someone_into_a_shared_unit(maker):
    assign(ANNA)
    record = assign(BEN, OTHER_UNIT).json()
    assert client().patch(f"{URL}/{record['id']}", json={"property_id": UNIT}).json()["property_id"] == UNIT


def test_editing_to_a_missing_unit_changes_nothing(maker):
    record = assign(ANNA).json()
    assert client().patch(f"{URL}/{record['id']}", json={"property_id": 999}).status_code == 404
    assert client().get(URL).json()[0]["property_id"] == UNIT


def test_a_blank_unit_on_edit_leaves_the_unit_alone(maker):
    record = assign(ANNA).json()
    response = client().patch(f"{URL}/{record['id']}", json={"property_id": None, "notes": "Checked"})
    assert response.status_code == 200
    assert response.json()["property_id"] == UNIT and response.json()["notes"] == "Checked"


def test_residents_cannot_change_the_directory(maker):
    record = assign(ANNA).json()
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(user_id=BEN, role="resident")
    assert client().patch(f"{URL}/{record['id']}", json={"property_id": OTHER_UNIT}).status_code == 403
    assert assign(BEN).status_code == 403


def test_a_resident_sees_only_their_own_record_on_a_shared_unit(maker):
    assign(ANNA)
    assign(BEN)
    app.main.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(user_id=BEN, role="resident")
    records = client().get(URL).json()
    assert [r["name"] for r in records] == ["Ben"]


def request_sale(maker, user_id, unit=UNIT):
    async def run():
        async with maker() as db:
            return await PropertyRequestService(db).create_request(
                PropertyRequestCreate(unit_id=unit, request_type="sell", asking_price=1000),
                SimpleNamespace(user_id=user_id, role="resident"),
            )

    return asyncio.run(run())


def test_a_shared_unit_cannot_have_competing_requests(maker):
    assign(ANNA)
    assign(BEN)
    request_sale(maker, ANNA)
    with pytest.raises(HTTPException) as refused:
        request_sale(maker, BEN)
    assert refused.value.status_code == 409
    assert "Another resident" in refused.value.detail


def test_a_finished_request_does_not_block_the_other_resident(maker):
    assign(ANNA)
    assign(BEN)
    first = request_sale(maker, ANNA)

    async def reject():
        async with maker() as db:
            (await db.get(PropertyRequest, first.request_id)).status = "rejected"
            await db.commit()

    asyncio.run(reject())
    assert request_sale(maker, BEN).status == "pending_review"


def test_another_units_request_does_not_block(maker):
    assign(ANNA)
    assign(BEN, OTHER_UNIT)
    request_sale(maker, ANNA)
    assert request_sale(maker, BEN, OTHER_UNIT).status == "pending_review"
