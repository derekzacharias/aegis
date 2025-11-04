"""Application configuration using Pydantic settings."""

from functools import lru_cache
from typing import List, Optional

from pydantic import BaseSettings, Field, PostgresDsn, validator


class Settings(BaseSettings):
    """Runtime configuration for the FastAPI service."""

    app_name: str = Field("AegisGRC API", env="AEGIS_APP_NAME")
    environment: str = Field("development", env="AEGIS_ENV")
    debug: bool = Field(False, env="AEGIS_DEBUG")

    database_url: PostgresDsn = Field(..., env="DATABASE_URL")
    alembic_schema: str = Field("public", env="DATABASE_SCHEMA")

    celery_broker_url: str = Field("redis://queue:6379/0", env="CELERY_BROKER_URL")
    celery_backend_url: str = Field("redis://queue:6379/1", env="CELERY_BACKEND_URL")
    celery_task_queues: List[str] = Field(default_factory=lambda: ["default"], env="CELERY_TASK_QUEUES")

    jwt_secret_key: str = Field("dev-secret", env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(15, env="JWT_ACCESS_TOKEN_EXPIRE")

    minio_endpoint: str = Field("http://minio:9000", env="MINIO_ENDPOINT")
    minio_access_key: str = Field("minio", env="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field("minio123", env="MINIO_SECRET_KEY")
    minio_bucket: str = Field("aegis-evidence", env="MINIO_BUCKET")

    vault_addr: str = Field("http://vault:8200", env="VAULT_ADDR")
    vault_token: Optional[str] = Field(None, env="VAULT_TOKEN")

    class Config:
        env_file = ".env"
        case_sensitive = False

    @validator("celery_task_queues", pre=True)
    def _split_queues(cls, value: str | List[str]) -> List[str]:  # pylint: disable=no-self-argument
        if isinstance(value, list):
            return value
        return [queue.strip() for queue in value.split(",") if queue.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance."""

    return Settings()
