# app/core/logging_middleware.py
import time
import uuid
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging_config import request_id_var

logger = logging.getLogger("app.request")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Retrieve correlation ID from headers or generate new UUID
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        
        # Set correlation ID in contextvar
        token = request_id_var.set(correlation_id)
        
        start_time = time.perf_counter()
        client_host = request.client.host if request.client else "unknown"
        query_params = dict(request.query_params)
        
        logger.info(
            f"Request start: {request.method} {request.url.path} "
            f"from {client_host} | Query: {query_params}"
        )
        
        try:
            response = await call_next(request)
            process_time = (time.perf_counter() - start_time) * 1000
            
            logger.info(
                f"Request end: {request.method} {request.url.path} "
                f"-> Status: {response.status_code} | Duration: {process_time:.2f}ms"
            )
            
            # Inject correlation ID in the response headers
            response.headers["X-Correlation-ID"] = correlation_id
            return response
            
        except Exception as e:
            process_time = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"Request failed: {request.method} {request.url.path} "
                f"-> Exception: {str(e)} | Duration: {process_time:.2f}ms",
                exc_info=True
            )
            raise e
        finally:
            # Clean up token
            request_id_var.reset(token)
