"""The login attempt limit. Runs the real queries on a throwaway in-memory SQLite database (needs aiosqlite)."""
import asyncio
from datetime import timedelta

import pytest

pytest.importorskip("aiosqlite")

from fastapi import HTTPException  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import func, select  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402  (loads every model and route)
from app.common.datetime_utils import utcnow  # noqa: E402
from app.core.security import create_password_reset_token, hash_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.models.login_attempt import LoginAttempts  # noqa: E402
from app.identity.models.user import User  # noqa: E402
from app.identity.schemas.auth import LoginRequest, ResetPasswordRequest  # noqa: E402
from app.identity.services.auth_service import AuthService  # noqa: E402

EMAIL = "sam@example.com"
PASSWORD = "Correct@Horse1"
HOME = "10.0.0.1"
ELSEWHERE = "10.0.0.2"
PASSWORD_HASH = hash_password(PASSWORD)


@pytest.fixture()
def maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=[User.__table__, LoginAttempts.__table__])
        async with sessions() as db:
            db.add(User(user_id=1, full_name="Sam", email=EMAIL, role="resident", password_hash=PASSWORD_HASH, hoa_approved=True))
            db.add(User(user_id=2, full_name="Other", email="other@example.com", role="resident", password_hash=PASSWORD_HASH, hoa_approved=True))
            await db.commit()

    asyncio.run(build())

    async def override_db():
        async with sessions() as session:
            yield session

    app.main.app.dependency_overrides[get_db] = override_db
    yield sessions
    app.main.app.dependency_overrides.clear()


def login(maker, password=PASSWORD, email=EMAIL, address=HOME):
    async def run():
        async with maker() as db:
            return await AuthService(db).login(LoginRequest(email=email, password=password), address)

    return asyncio.run(run())


def status_of(maker, **kwargs):
    try:
        login(maker, **kwargs)
        return 200
    except HTTPException as error:
        return error.status_code


def add_failures(maker, count, email=EMAIL, address=HOME, age=timedelta(minutes=1)):
    async def run():
        async with maker() as db:
            for _ in range(count):
                db.add(LoginAttempts(email=email, ip_address=address, successful=False, attempted_at=utcnow() - age))
            await db.commit()

    asyncio.run(run())


def stored(maker):
    async def run():
        async with maker() as db:
            return (await db.execute(select(func.count()).select_from(LoginAttempts))).scalar()

    return asyncio.run(run())


def test_five_wrong_passwords_then_blocked_even_with_the_right_one(maker):
    for _ in range(5):
        assert status_of(maker, password="Wrong@Pass1") == 401
    assert status_of(maker) == 429


def test_four_wrong_then_the_right_password_works_and_forgets_them(maker):
    add_failures(maker, 4)
    assert status_of(maker) == 200
    assert stored(maker) == 0
    add_failures(maker, 4)
    assert status_of(maker) == 200


def test_the_block_message_and_wait_time(maker):
    add_failures(maker, 5)
    with pytest.raises(HTTPException) as blocked:
        login(maker)
    assert "15 minutes" in blocked.value.detail
    assert blocked.value.headers["Retry-After"] == "900"


def test_the_block_ends_after_fifteen_minutes(maker):
    add_failures(maker, 5, age=timedelta(minutes=16))
    assert status_of(maker) == 200


def test_the_real_owner_elsewhere_is_not_locked_out_by_a_few_failures(maker):
    add_failures(maker, 5, address=ELSEWHERE)
    assert status_of(maker) == 200


def test_many_failures_from_many_places_block_the_account(maker):
    for number in range(20):
        add_failures(maker, 1, address=f"10.1.0.{number}")
    assert status_of(maker) == 429


def test_one_place_guessing_many_accounts_is_blocked(maker):
    for number in range(30):
        add_failures(maker, 1, email=f"user{number}@example.com")
    assert status_of(maker) == 429
    assert status_of(maker, address=ELSEWHERE) == 200


def test_other_accounts_on_the_same_network_still_work(maker):
    add_failures(maker, 5)
    assert status_of(maker, email="other@example.com") == 200


def test_unknown_emails_behave_exactly_like_real_ones(maker):
    for _ in range(5):
        assert status_of(maker, email="nobody@example.com", password="Wrong@Pass1") == 401
    assert status_of(maker, email="nobody@example.com", password="Wrong@Pass1") == 429


def test_email_capitals_do_not_get_around_the_limit(maker):
    add_failures(maker, 5)
    assert status_of(maker, email="SAM@Example.COM") == 429


def test_a_blocked_try_is_not_counted_again(maker):
    add_failures(maker, 5)
    status_of(maker)
    assert stored(maker) == 5


def test_old_records_are_cleaned_up(maker):
    add_failures(maker, 3, age=timedelta(days=2))
    status_of(maker, password="Wrong@Pass1")
    assert stored(maker) == 1


def test_a_password_reset_lifts_the_block(maker):
    add_failures(maker, 5)
    add_failures(maker, 5, address=ELSEWHERE)
    new_password = "Brand@New123"

    async def reset():
        async with maker() as db:
            user = await db.get(User, 1)
            token = create_password_reset_token(user.user_id, user.password_hash)
            await AuthService(db).reset_password(ResetPasswordRequest(token=token, new_password=new_password))

    asyncio.run(reset())
    assert status_of(maker, password=new_password) == 200


@pytest.mark.parametrize(
    "path, send",
    [
        ("/api/v1/auth/login", lambda c, url, pw: c.post(url, json={"email": EMAIL, "password": pw})),
        ("/api/v1/auth/token", lambda c, url, pw: c.post(url, data={"username": EMAIL, "password": pw})),
    ],
)
def test_both_login_addresses_are_limited(maker, path, send):
    client = TestClient(app.main.app)
    for _ in range(5):
        assert send(client, path, "Wrong@Pass1").status_code == 401
    reply = send(client, path, PASSWORD)
    assert reply.status_code == 429
    assert reply.json()["detail"] == "Too many failed login attempts. Please try again in 15 minutes."
    assert reply.headers["retry-after"] == "900"
    assert "access_token" not in reply.text
