"""AegisGRC FastAPI application package."""

from importlib import import_module
from typing import Any


def create_app(*args: Any, **kwargs: Any):  # type: ignore[override]
    """Dynamically import and instantiate the FastAPI app."""

    module = import_module("backend.fastapi.app.main")
    return module.create_app(*args, **kwargs)


__all__ = ["create_app"]
