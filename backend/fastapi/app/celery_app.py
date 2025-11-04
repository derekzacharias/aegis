"""Celery application setup."""

from __future__ import annotations

from celery import Celery

from .config import get_settings

settings = get_settings()

celery_app = Celery(
    "aegis",
    broker=settings.celery_broker_url,
    backend=settings.celery_backend_url,
)
celery_app.conf.task_default_queue = settings.celery_task_queues[0]
celery_app.conf.worker_max_tasks_per_child = 20
celery_app.conf.worker_prefetch_multiplier = 1


@celery_app.task(name="assessments.run_inspec")
def run_inspec_task(assessment_id: int) -> str:
    """Placeholder Celery task for running an InSpec assessment."""

    return f"scheduled assessment {assessment_id}"
