"""Registration needs the terms ticked, and keeps proof. Runs on a throwaway in-memory SQLite database (needs aiosqlite)."""
import asyncio

import pytest

pytest.importorskip("aiosqlite")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import func, select  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402  (loads every model and route)
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.models.terms_acceptance import CURRENT_TERMS_VERSION, TermsAcceptance  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.identity.repositories.user_repository import UserRepository  # noqa: E402

URL = "/api/v1/auth/register"
VALID = {
    "full_name": "Sam Smith",
    "email": "sam@example.com",
    "password": "Correct@Horse1",
    "phoneno": "082 123 4567",
    "role": "resident",
    "terms_accepted": True,
}


@pytest.fixture()
def maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=[User.__table__, TermsAcceptance.__table__])

    asyncio.run(build())

    async def override_db():
        async with sessions() as session:
            yield session

    app.main.app.dependency_overrides[get_db] = override_db
    yield sessions
    app.main.app.dependency_overrides.clear()


def count(maker, model):
    async def run():
        async with maker() as db:
            return (await db.execute(select(func.count()).select_from(model))).scalar()

    return asyncio.run(run())


def records(maker):
    async def run():
        async with maker() as db:
            return list((await db.execute(select(TermsAcceptance))).scalars().all())

    return asyncio.run(run())


def register(body):
    return TestClient(app.main.app).post(URL, json=body)


def test_registering_saves_who_agreed_to_which_version_and_when(maker):
    reply = register(VALID)
    assert reply.status_code == 201
    [record] = records(maker)
    assert record.user_id == reply.json()["user"]["id"]
    assert record.terms_version == CURRENT_TERMS_VERSION
    assert record.accepted_at is not None
    assert record.ip_address == "testclient"


@pytest.mark.parametrize("value", [False, None, "true", "yes", 1, 0])
def test_anything_but_a_real_yes_is_refused(maker, value):
    assert register({**VALID, "terms_accepted": value}).status_code == 422
    assert count(maker, User) == 0
    assert count(maker, TermsAcceptance) == 0


def test_leaving_it_out_is_refused(maker):
    body = {key: value for key, value in VALID.items() if key != "terms_accepted"}
    assert register(body).status_code == 422
    assert count(maker, User) == 0


def test_the_refusal_explains_itself(maker):
    reply = register({**VALID, "terms_accepted": False})
    assert "Terms and Conditions" in reply.text


def test_a_duplicate_email_adds_no_second_record(maker):
    register(VALID)
    assert register(VALID).status_code == 409
    assert count(maker, TermsAcceptance) == 1


def test_an_account_is_not_kept_if_its_record_cannot_be_saved(maker):
    """Both are saved together, so a failure leaves neither behind."""

    async def run():
        async with maker() as db:
            await db.run_sync(lambda session: TermsAcceptance.__table__.drop(session.connection()))
            await db.commit()

    asyncio.run(run())
    client = TestClient(app.main.app, raise_server_exceptions=False)
    assert client.post(URL, json=VALID).status_code == 500
    assert count(maker, User) == 0


def test_accounts_made_by_an_administrator_have_no_record(maker):
    async def run():
        async with maker() as db:
            await UserRepository(db).create(
                full_name="Agent", email="agent@example.com", password_hash="x", role="estate_agent", hoa_approved=True
            )

    asyncio.run(run())
    assert count(maker, User) == 1
    assert count(maker, TermsAcceptance) == 0


def test_the_address_comes_from_cloudfront_only_on_aws(maker, monkeypatch):
    from app.core import client_address as module

    monkeypatch.setattr(module, "RUNNING_ON_LAMBDA", True)
    reply = TestClient(app.main.app).post(URL, json=VALID, headers={"x-valora-viewer-ip": "9.9.9.9"})
    assert reply.status_code == 201
    assert records(maker)[0].ip_address == "9.9.9.9"
