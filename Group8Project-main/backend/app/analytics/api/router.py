from fastapi import APIRouter

from app.analytics.api.intelligence import router as intelligence_router


router = APIRouter(prefix="/analytics", tags=["analytics"])
router.include_router(intelligence_router)


@router.get("/status")
async def analytics_status():
    return {
        "module": "analytics",
        "status": "active",
        "endpoints": ["intelligence"],
    }
