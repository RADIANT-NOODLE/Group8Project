"""Where uploaded property photos live on disk and how they are validated."""
import uuid
from pathlib import Path

# backend/uploads/  (served by the API at /uploads)
UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
PROPERTY_PHOTO_DIR = UPLOAD_ROOT / "properties"

MAX_PHOTO_BYTES = 5 * 1024 * 1024
MAX_PHOTOS_PER_PROPERTY = 8


def ensure_dirs() -> None:
    PROPERTY_PHOTO_DIR.mkdir(parents=True, exist_ok=True)


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


def delete_file(file_name: str) -> None:
    try:
        (PROPERTY_PHOTO_DIR / file_name).unlink(missing_ok=True)
    except OSError:
        pass
