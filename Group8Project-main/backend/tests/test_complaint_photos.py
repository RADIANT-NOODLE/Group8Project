"""Complaint photos: who may add or read them, and what counts as a photo.
Also covers creating a property, which used to crash on an unused field.

No database needed: the repository is replaced with an in-memory stand-in.
"""
import asyncio
from types import SimpleNamespace

import app.main  # noqa: F401  (loads every model, so they can be constructed)
from app.community.models.complaint import Complaint, ComplaintPhoto
from app.community.services.complaint_service import ComplaintService
from app.core.exceptions import ForbiddenException, NotFoundException, ValidationException
from app.property.models.property import Property
from app.property.schemas.property import PropertyCreate, PropertyUpdate
from app.property.storage import MAX_PHOTO_BYTES

JPEG = b"\xff\xd8\xff\xe0" + b"0" * 32
MP4 = b"\x00\x00\x00\x18ftypmp42" + b"0" * 32

AUTHOR = SimpleNamespace(user_id=1, role="resident")
STRANGER = SimpleNamespace(user_id=2, role="resident")
ADMIN = SimpleNamespace(user_id=3, role="hoa_admin")


class FakeRepo:
    def __init__(self):
        self.complaint = Complaint(
            complaint_id=7, user_id=1, unit_id=1, category="Noise", description="Too loud",
            is_anonymous=False, status="submitted",
        )
        self.photo = None

    async def get_by_id(self, complaint_id):
        return self.complaint if complaint_id == 7 else None

    async def get_photo(self, complaint_id):
        return self.photo

    async def save_photo(self, complaint, data, content_type, photo_url):
        self.photo = ComplaintPhoto(
            complaint_id=complaint.complaint_id, data=data, content_type=content_type
        )
        complaint.photo_url = photo_url
        return complaint


def service():
    svc = ComplaintService(None)
    svc._repo = FakeRepo()
    return svc


def raises(exception, coroutine):
    try:
        asyncio.run(coroutine)
    except exception:
        return True
    return False


def test_author_can_add_a_photo_and_read_it_back():
    svc = service()
    response = asyncio.run(svc.add_photo(7, JPEG, AUTHOR))
    assert response.photo_url == "/api/v1/complaints/7/photo"
    photo = asyncio.run(svc.get_photo(7, AUTHOR))
    assert photo.data == JPEG and photo.content_type == "image/jpeg"


def test_admin_can_add_and_read_but_a_stranger_cannot():
    svc = service()
    asyncio.run(svc.add_photo(7, JPEG, ADMIN))
    assert asyncio.run(svc.get_photo(7, ADMIN)).data == JPEG
    assert raises(ForbiddenException, svc.add_photo(7, JPEG, STRANGER))
    assert raises(ForbiddenException, svc.get_photo(7, STRANGER))


def test_video_and_oversized_files_are_refused():
    svc = service()
    assert raises(ValidationException, svc.add_photo(7, MP4, AUTHOR))
    too_big = JPEG + b"0" * MAX_PHOTO_BYTES
    assert raises(ValidationException, svc.add_photo(7, too_big, AUTHOR))
    assert svc._repo.photo is None and svc._repo.complaint.photo_url is None


def test_missing_complaint_or_photo_is_not_found():
    svc = service()
    assert raises(NotFoundException, svc.add_photo(99, JPEG, AUTHOR))
    assert raises(NotFoundException, svc.get_photo(7, AUTHOR))


def test_property_can_be_created_from_its_form_fields():
    payload = PropertyCreate(unit_no="201", complex_name="Silverleaf", street_address="12 Main Road")
    Property(**payload.model_dump())
    assert "photos" not in PropertyUpdate(unit_no="201", photos=["x"]).model_dump(exclude_unset=True)
