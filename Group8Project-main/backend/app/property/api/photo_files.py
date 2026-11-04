"""Serves property photo images at /uploads/properties/<file_name>.

The image comes from the shared database, so a photo uploaded on one
computer shows on every other. A photo uploaded before photos were stored
in the database falls back to this computer's backend/uploads folder.
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse, Response
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.property import storage
from app.property.repositories.property_repository import PropertyRepository

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Property photos"])

# A photo's name is random and its image never changes, so browsers may keep it
# for a year: each photo crosses the slow database link once per device.
CACHE_HEADERS = {"Cache-Control": "public, max-age=31536000, immutable"}


@router.get("/uploads/properties/{file_name}", include_in_schema=False)
async def property_photo_file(
    file_name: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        photo = await PropertyRepository(db).get_photo_file(file_name)
    except DBAPIError:
        # e.g. the database has not been upgraded yet (alembic upgrade head)
        logger.warning("Could not read photo %s from the database", file_name, exc_info=True)
        await db.rollback()
        photo = None

    if photo is not None and photo.data:
        return Response(
            content=photo.data,
            media_type=photo.content_type or "application/octet-stream",
            headers=CACHE_HEADERS,
        )

    legacy = storage.legacy_file(file_name)
    if legacy is not None:
        return FileResponse(legacy, headers=CACHE_HEADERS)

    return Response(status_code=404)
