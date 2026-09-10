from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Review

router = APIRouter()

class ReviewCreate(BaseModel):
    user_id: int
    provider_id: int
    rating: int
    comment: Optional[str] = None

@router.get("/api/reviews")
def get_all_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()
    return {"count": len(reviews), "reviews": reviews}

@router.get("/api/reviews/{review_id}")
def get_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.post("/api/reviews")
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    new_review = Review(
        user_id = review.user_id,
        provider_id = review.provider_id,
        rating = review.rating,
        comment = review.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return {"message": "Review created successfully", "review": new_review}
