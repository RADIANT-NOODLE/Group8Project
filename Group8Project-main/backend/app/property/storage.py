"""Property photo validation, naming and the legacy on-disk folder.

New photos are stored in the database (property_photos.data) so every
computer sharing it can show them. backend/uploads/properties is only read
for photos uploaded before that change, and by the backfill script that
copies them into the database.
"""
import uuid
from pathlib import Path

# backend/uploads/  (photos uploaded before they were stored in the database)
UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
PROPERTY_PHOTO_DIR = UPLOAD_ROOT / "properties"

MAX_PHOTO_BYTES = 4 * 1024 * 1024
MAX_PHOTOS_PER_PROPERTY = 20

CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def photo_url(file_name: str) -> str:
    return f"/uploads/properties/{file_name}"


def detect_image_extension(data: bytes) -> str | None:
    """Look at the file's first bytes, not its name or declared type."""
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return None


def new_file_name(extension: str) -> str:
    return f"{uuid.uuid4().hex}{extension}"


def legacy_file(file_name: str) -> Path | None:
    """The on-disk copy of an older photo, if this computer has it."""
    # file names are generated hex + extension; refuse anything that could leave the folder
    if Path(file_name).name != file_name:
        return None
    path = PROPERTY_PHOTO_DIR / file_name
    return path if path.is_file() else None


def delete_file(file_name: str) -> None:
    """Remove an older photo's on-disk copy, if there is one."""
    path = legacy_file(file_name)
    if path is None:
        return
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass
