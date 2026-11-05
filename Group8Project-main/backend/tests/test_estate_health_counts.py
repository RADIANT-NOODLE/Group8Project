"""Which complaints Estate Health counts. Runs the real queries on a throwaway in-memory SQLite database."""
import asyncio
from datetime import datetime, timedelta, timezone

import pytest

pytest.importorskip("aiosqlite")

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402, F401  (loads every model and route)
from app.analytics.repositories.estate_health_repository import EstateHealthRepository  # noqa: E402
from app.community.models.complaint import Complaint  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.identity.models.user import User  # noqa: E402

NOW = datetime(2026, 11, 5, tzinfo=timezone.utc)
START = NOW - timedelta(days=90)


def count(rows, method):
    async def run():
        engine = create_async_engine(
            "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
        )
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=[User.__table__, Complaint.__table__])
        maker = async_sessionmaker(engine, expire_on_commit=False)
        async with maker() as db:
            for index, (category, status, when) in enumerate(rows, start=1):
                db.add(Complaint(complaint_id=index, user_id=1, unit_id=1, category=category, description="x", status=status, created_at=when))
            await db.commit()
            return await getattr(EstateHealthRepository(db), method)(START, NOW)

    return asyncio.run(run())


RECENT = NOW - timedelta(days=5)
OLD = NOW - timedelta(days=200)


@pytest.mark.parametrize("category", ["Security", "security", "SECURITY"])
def test_security_incidents_count_whatever_the_capitals(category):
    assert count([(category, "submitted", RECENT)], "_security_incidents") == 1


def test_other_categories_are_not_security_incidents():
    assert count([("Noise", "submitted", RECENT), ("Parking", "resolved", RECENT)], "_security_incidents") == 0


def test_a_denied_security_complaint_is_not_an_incident():
    rows = [("Security", "denied", RECENT), ("Security", "resolved", RECENT)]
    assert count(rows, "_security_incidents") == 1


def test_a_security_complaint_outside_the_window_does_not_count():
    assert count([("Security", "submitted", OLD)], "_security_incidents") == 0


def test_complaint_frequency_leaves_denied_out():
    rows = [("Noise", "submitted", RECENT), ("Noise", "denied", RECENT), ("Noise", "resolved", RECENT), ("Noise", "submitted", OLD)]
    assert count(rows, "_complaints_created") == 2


def test_a_complaint_with_no_status_still_counts():
    assert count([("Security", None, RECENT)], "_security_incidents") == 1
