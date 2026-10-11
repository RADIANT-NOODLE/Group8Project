from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser
from app.providers.schemas.review import ReviewListResponse, ReviewResponse, ReviewUpdate
from app.providers.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("", response_model=ReviewListResponse)
async def list_reviews(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    provider_id: Annotated[int | None, Query(ge=1)] = None,
    user_id: Annotated[int | None, Query(ge=1, description="HOA admins only: filter by author")] = None,
) -> ReviewListResponse:
    """Your own reviews. HOA admins see every review and may filter by author."""
    return await ReviewService(db).list_my_reviews(
        current_user,
        page=page,
        page_size=page_size,
        provider_id=provider_id,
        author_id=user_id,
    )


@router.patch("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ReviewResponse:
    return await ReviewService(db).update_review(review_id, payload, current_user)


@router.delete("/{review_id}", status_code=204)
async def delete_review(
    review_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> Response:
    await ReviewService(db).delete_review(review_id, current_user)
    return Response(status_code=204)
