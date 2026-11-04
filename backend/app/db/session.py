"""Async database session factory and dependency."""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

# A local PostgreSQL install normally has no TLS; set DATABASE_SSL=true for hosted databases.
engine = create_async_engine(settings.DATABASE_URL,
                             connect_args={"ssl": settings.DATABASE_SSL,
                            "timeout":30,}, echo=False,
                            # The hosted database is a long way off (~250 ms per round trip),
                            # so no "is it alive?" ping before every request. Instead a
                            # connection is replaced once it is 4 minutes old, before Neon's
                            # 5-minute idle shutdown can leave it dead in the pool.
                            pool_pre_ping=False,
                            pool_recycle=240,
                            pool_size=5,
                            max_overflow=10,
                            )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """FastAPI dependency that yields an async database session."""
    async with AsyncSessionLocal() as session:
        yield session
