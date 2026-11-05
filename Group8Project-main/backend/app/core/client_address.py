"""Where a request came from, for limits such as login attempts and enquiries."""
from fastapi import Request

from app.core.config import RUNNING_ON_LAMBDA


def client_address(request: Request) -> str:
    """On AWS every request arrives through CloudFront, which states the visitor's address.

    The header is only trusted there: anywhere else a caller could simply make it up.
    """
    if RUNNING_ON_LAMBDA and request.headers.get("x-valora-viewer-ip"):
        return request.headers["x-valora-viewer-ip"]
    return request.client.host if request.client else "unknown"
