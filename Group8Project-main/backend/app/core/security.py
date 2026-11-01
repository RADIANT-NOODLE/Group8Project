import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta is not None:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT access token. Raises JWTError on failure."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


# --- Password reset tokens ------------------------------------------------
# A reset token is a short-lived signed JWT. It carries a fingerprint of the
# account's current password hash, so it stops working the moment the password
# changes (single use) without needing an extra database table.

_RESET_PURPOSE = "password_reset"


def _password_fingerprint(password_hash: str) -> str:
    return hashlib.sha256(password_hash.encode("utf-8")).hexdigest()[:32]


def create_password_reset_token(user_id: int, password_hash: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)
    return jwt.encode(
        {
            "sub": str(user_id),
            "purpose": _RESET_PURPOSE,
            "fp": _password_fingerprint(password_hash),
            "exp": expire,
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def read_password_reset_token(token: str) -> tuple[int, str]:
    """Return (user_id, fingerprint) or raise JWTError if the token is not a valid reset token."""
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    if payload.get("purpose") != _RESET_PURPOSE:
        raise JWTError("Not a password reset token.")
    try:
        return int(payload["sub"]), str(payload["fp"])
    except (KeyError, ValueError, TypeError) as exc:
        raise JWTError("Malformed password reset token.") from exc


def password_reset_token_matches(fingerprint: str, password_hash: str) -> bool:
    return fingerprint == _password_fingerprint(password_hash)
