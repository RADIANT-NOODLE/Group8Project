import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.property.api.photo_files import router as photo_files_router


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

# add CORS middelware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "http://localhost:4173", 
        "http://127.0.0.1:4173",
        "http://localhost:5173", 
        "http://127.0.0.1:5173"],
    # the frontend opened from another device on the same home network (e.g. a phone at http://10.0.0.9:4173)
    allow_origin_regex=r"http://(10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2}):(4173|5173)",
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

# property photos (/uploads/properties/<name>), served from the shared database
app.include_router(photo_files_router)

app.include_router(api_router)
