"""Security helpers including JWT encoding/decoding stubs."""

from datetime import datetime, timedelta
from typing import Any, Dict

import jwt

from .config import get_settings

_settings = get_settings()


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    """Create a signed JWT access token."""

    expire_delta = timedelta(minutes=expires_minutes or _settings.access_token_expire_minutes)
    payload: Dict[str, Any] = {
        "sub": subject,
        "exp": datetime.utcnow() + expire_delta,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, _settings.jwt_secret_key, algorithm=_settings.jwt_algorithm)


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate an access token."""

    return jwt.decode(token, _settings.jwt_secret_key, algorithms=[_settings.jwt_algorithm])
