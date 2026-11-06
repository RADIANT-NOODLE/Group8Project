from fastapi import APIRouter

from app.analytics.api.living_score import router as living_score_router

router = APIRouter(prefix="/analytics", tags=["analytics"])
router.include_router(living_score_router)


@router.get("/status")
async def analytics_status():
    return {
        "module": "analytics",
        "status": "active",
        "endpoints": ["living-score"],
    }
