"""FastAPI application factory."""

from __future__ import annotations

import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router
from .config import get_settings
from .database import engine
from .dependencies import UserContext, get_current_user
from .middleware import audit_logging_middleware
from .models import Base
from .schemas import TokenPair
from .security import create_access_token

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.middleware("http")(audit_logging_middleware)

    @app.on_event("startup")
    def _startup() -> None:
        logger.info("Creating database tables if missing")
        Base.metadata.create_all(bind=engine)

    @app.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.app_name}

    @app.post("/auth/token", tags=["auth"], response_model=TokenPair)
    async def issue_token(username: str) -> TokenPair:
        token = create_access_token(subject=username)
        return TokenPair(access_token=token, expires_in=settings.access_token_expire_minutes * 60)

    @app.get("/me", tags=["auth"])
    async def read_me(current_user: UserContext = Depends(get_current_user)) -> dict[str, str]:
        return {"subject": current_user.subject, "role": current_user.role}

    app.include_router(api_router)
    return app


app = create_app()
