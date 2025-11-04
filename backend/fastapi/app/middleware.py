"""Application middleware components."""

import json
import logging
from time import time
from typing import Callable

from fastapi import Request, Response

logger = logging.getLogger("aegis.audit")


async def audit_logging_middleware(request: Request, call_next: Callable[[Request], Response]) -> Response:
    """Record structured audit logs for every request."""

    start = time()
    response: Response | None = None
    try:
        response = await call_next(request)
        return response
    finally:
        duration = time() - start
        actor = request.headers.get("x-actor", "anonymous")
        log_payload = {
            "event": "http.request",
            "path": request.url.path,
            "method": request.method,
            "status": response.status_code if response else "error",
            "duration_ms": round(duration * 1000, 2),
            "actor": actor,
        }
        logger.info(json.dumps(log_payload))
