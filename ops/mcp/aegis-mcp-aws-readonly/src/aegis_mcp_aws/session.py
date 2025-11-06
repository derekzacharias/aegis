from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from .exceptions import AWSToolError

DEFAULT_REGION = os.getenv("AWS_REGION", "us-east-1")


@lru_cache(maxsize=4)
def get_session(region: Optional[str] = None) -> boto3.Session:
    """Return a cached boto3 session configured for read-only operations."""

    try:
        return boto3.Session(region_name=region or DEFAULT_REGION)
    except (BotoCoreError, ClientError) as exc:
        raise AWSToolError(f"Failed to create AWS session: {exc}", service="sts") from exc


def client(service: str, *, region: Optional[str] = None):
    session = get_session(region)
    config = Config(retries={"max_attempts": 5, "mode": "adaptive"})
    try:
        return session.client(service, config=config, region_name=region or DEFAULT_REGION)
    except (BotoCoreError, ClientError) as exc:
        raise AWSToolError(f"Failed to create client for {service}: {exc}", service=service) from exc
