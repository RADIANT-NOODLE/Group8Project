"""Copy property photos from this computer's disk into the shared database.

Photos uploaded before images were stored in the database exist only in
backend/uploads/properties on the computer that uploaded them. Run this
once on that computer (after `python -m alembic upgrade head`):

    python -m app.property.backfill_photos

It only fills photos whose image is still missing from the database, so it
is safe to run more than once, and on several computers.
"""
import asyncio

from sqlalchemy import select
from sqlalchemy.orm import undefer_group

from app.db.session import AsyncSessionLocal, engine
from app.property import storage
from app.property.models.property_photo import PropertyPhoto


async def backfill() -> None:
    copied = missing = already = 0

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PropertyPhoto).options(undefer_group("file")).order_by(PropertyPhoto.photo_id)
        )
        photos = list(result.scalars().all())

        for photo in photos:
            if photo.data:
                already += 1
                continue

            path = storage.legacy_file(photo.file_name)
            if path is None:
                missing += 1
                continue

            data = path.read_bytes()
            extension = storage.detect_image_extension(data)
            if extension is None:
                print(f"  skipped {photo.file_name}: not a JPEG, PNG or WebP image")
                missing += 1
                continue

            photo.data = data
            photo.content_type = storage.CONTENT_TYPES[extension]
            await session.commit()  # one photo at a time, so an interruption keeps progress
            copied += 1
            print(f"  copied {photo.file_name} (unit {photo.unit_id}, {len(data) // 1024} KB)")

    await engine.dispose()

    print()
    print(f"Copied into the database:      {copied}")
    print(f"Already in the database:       {already}")
    print(f"Not on this computer (left):   {missing}")
    if missing:
        print("Run this again on the computer that uploaded the remaining photos.")


if __name__ == "__main__":
    asyncio.run(backfill())
