"""Async database session factory and dependency."""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import RUNNING_ON_LAMBDA, get_settings

settings = get_settings()

# Lambda freezes between requests and gives each one a new event loop, so a kept
# connection cannot be reused: each request opens its own.
pool_options = (
    {"poolclass": NullPool}
    if RUNNING_ON_LAMBDA
    else {
        # The hosted database is a long way off (~250 ms per round trip),
        # so no "is it alive?" ping before every request. Instead a
        # connection is replaced once it is 4 minutes old, before Neon's
        # 5-minute idle shutdown can leave it dead in the pool.
        "pool_pre_ping": False,
        "pool_recycle": 240,
        "pool_size": 5,
        "max_overflow": 10,
    }
)

# A local PostgreSQL install normally has no TLS; set DATABASE_SSL=true for hosted databases.
engine = create_async_engine(settings.DATABASE_URL,
                             connect_args={"ssl": settings.DATABASE_SSL,
                            "timeout":30,}, echo=False,
                            **pool_options,
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
