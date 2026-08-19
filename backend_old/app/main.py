import logging
from fastapi import FastAPI, Depends, HTTPException  # kai added depends and httpexception
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session # added - kai
from pydantic import BaseModel # added - kai

from app.shared.logging import configure_logging
from app.shared.config import get_settings

# Import database and models
from app.database import engine, Base, get_db # -kai
from app.routes import complaints_router, users_router, properties_router, providers_router, sales_router, reviews_router, listings_router, announcements_router, work_orders_router, ai_analytics_router, sessions_router, login_attempts_router
# -kai


# 1. Initialize logging before doing anything else
configure_logging()
logger = logging.getLogger(__name__)

# 2. Get environment settings
settings = get_settings()

# 3. Create database tables - kai added
Base.metadata.create_all(bind=engine)

# 4. create FASTAPI app
app = FastAPI(
    title="VALORA API",
    description="Property Health Intelligence Platform",
    version="1.0.0"
)

# add CORS middelware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting VALORA API in {settings.ENVIRONMENT} mode.")

# 7. root and health Endpoints - kai
@app.get("/")
def root():
    return {
        "message": "Welcome to VALORA API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

# API endpoints - kai
app.include_router(complaints_router)
app.include_router(users_router)
app.include_router(properties_router)
app.include_router(providers_router)
app.include_router(sales_router)
app.include_router(reviews_router)
app.include_router(listings_router)
app.include_router(announcements_router)
app.include_router(work_orders_router)
app.include_router(ai_analytics_router)
app.include_router(sessions_router)
app.include_router(login_attempts_router)
