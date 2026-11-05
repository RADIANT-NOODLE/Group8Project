"""A property takes up to 20 photos, and the 21st is refused.

Runs the real queries against a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio

import pytest

pytest.importorskip("aiosqlite")

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402,F401  (loads every model and route)
from app.core.exceptions import ConflictException  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.property.models.property import Property  # noqa: E402
from app.property.models.property_photo import PropertyPhoto  # noqa: E402
from app.property.repositories.property_repository import PropertyRepository  # noqa: E402
from app.property.services.property_service import PropertyService  # noqa: E402

UNIT = 10
JPEG = b"\xff\xd8\xff\xe0" + b"0" * 20


@pytest.fixture(autouse=True)
def photo_column_exists(monkeypatch):
    # the real check reads a PostgreSQL catalogue that SQLite doesn't have
    async def yes(self):
        return True

    monkeypatch.setattr(PropertyRepository, "_has_photo_data_column", yes)


def run_uploads(count):
    async def scenario():
        engine = create_async_engine(
            "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
        )
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        async with engine.begin() as connection:
            await connection.run_sync(
                Base.metadata.create_all, tables=[Property.__table__, PropertyPhoto.__table__]
            )
        async with sessions() as db:
            db.add(Property(unit_id=UNIT, unit_no="104", complex_name="Test Estate", street_address="1 Road"))
            await db.commit()
            service = PropertyService(db)
            response = None
            for _ in range(count):
                response = await service.add_photo(UNIT, JPEG)
        await engine.dispose()
        return response

    return asyncio.run(scenario())


def test_twenty_photos_are_accepted():
    assert len(run_uploads(20).photos) == 20


def test_the_twenty_first_photo_is_refused():
    with pytest.raises(ConflictException, match="at most 20 photos"):
        run_uploads(21)
