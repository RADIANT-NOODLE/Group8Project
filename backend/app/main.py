import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.shared.logging import configure_logging
from app.shared.config import get_settings

# 1. Initialize logging before doing anything else
configure_logging()
logger = logging.getLogger(__name__)

# 2. Get environment settings
settings = get_settings()
app = FastAPI(
    title="VALORA API",
    description="Property Health Intelligence Platform",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting VALORA API in {settings.ENVIRONMENT} mode.")


@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

