from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.community.models.maintenance_work_order import MaintenanceworkOrder
from app.providers.models.review import Review


class ReviewRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list_for_provider(self, provider_id: int) -> list[Review]:
        result = await self._db.execute(
            select(Review)
            .where(Review.provider_id == provider_id)
            .order_by(Review.created_at.desc(), Review.review_id.desc())
        )
        return list(result.scalars().all())

    async def get_by_user_and_provider(self, user_id: int, provider_id: int) -> Review | None:
        result = await self._db.execute(
            select(Review).where(Review.user_id == user_id, Review.provider_id == provider_id)
        )
        return result.scalar_one_or_none()

    async def add(
        self, *, user_id: int, provider_id: int, rating: int, comment: str | None
    ) -> Review:
        """Add a review and flush it (no commit) so the caller can update provider stats atomically."""
        review = Review(user_id=user_id, provider_id=provider_id, rating=rating, comment=comment)
        self._db.add(review)
        await self._db.flush()
        return review

    async def rating_summary(self, provider_id: int) -> tuple[Decimal | None, int]:
        """Average rating and rating count for a provider.

        Two sources feed a provider's rating: reviews residents leave in the
        directory, and the 1-5 rating a resident gives a completed work order.
        Every individual rating counts once, so the provider's cached
        `avg_rating` / `total_reviews` always reflect both.
        """
        reviews = await self._db.execute(
            select(func.coalesce(func.sum(Review.rating), 0), func.count(Review.review_id)).where(
                Review.provider_id == provider_id
            )
        )
        review_sum, review_count = reviews.one()

        jobs = await self._db.execute(
            select(
                func.coalesce(func.sum(MaintenanceworkOrder.resident_rating), 0),
                func.count(MaintenanceworkOrder.work_order_id),
            ).where(
                MaintenanceworkOrder.provider_id == provider_id,
                MaintenanceworkOrder.resident_rating.is_not(None),
            )
        )
        job_sum, job_count = jobs.one()

        count = int(review_count) + int(job_count)
        if count == 0:
            return None, 0
        average = (Decimal(str(review_sum)) + Decimal(str(job_sum))) / Decimal(count)
        return average, count

    async def get_by_id(self, review_id: int):
        result = await self._db.execute(
            select(Review).filter(Review.review_id == review_id)
        )
        return result.scalars().first()