from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.shared.config import get_settings

settings = get_settings()

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Declarative base for all SQLAlchemy models
Base = declarative_base()

# Dependency to yield database sessions
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
