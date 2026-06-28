import logging
from typing import Optional

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_client: Optional[aioredis.Redis] = None

if settings.REDIS_URL:
    try:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            ssl=settings.REDIS_URL.startswith("rediss://"),
        )
        logger.info("Redis client initialised.")
    except Exception as exc:  # pragma: no cover
        logger.warning("Failed to initialise Redis client: %s", exc)
        _redis_client = None
else:
    logger.info("REDIS_URL not set — Redis caching disabled.")


def get_redis() -> Optional[aioredis.Redis]:
    """Return the module-level async Redis client, or None if unavailable."""
    return _redis_client
