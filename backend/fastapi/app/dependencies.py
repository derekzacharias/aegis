"""Reusable dependency providers for FastAPI routes."""

from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, Header, HTTPException, status

from .security import decode_access_token


@dataclass
class UserContext:
    subject: str
    role: str = "analyst"


async def get_current_user(authorization: Optional[str] = Header(None)) -> UserContext:
    """Decode the Authorization header and return a user context."""

    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")

    payload = decode_access_token(token)
    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return UserContext(subject=subject)
