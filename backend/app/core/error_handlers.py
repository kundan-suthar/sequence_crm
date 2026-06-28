# app/core/error_handlers.py
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("app.errors")

async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handler for 422 Request Validation errors.
    """
    errors = exc.errors()
    logger.warning(
        f"Validation error on {request.method} {request.url.path} | "
        f"Errors: {errors}"
    )
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "detail": errors,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request params or request body.",
                "details": errors,
            }
        },
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handler for standard HTTPExceptions.
    """
    logger.warning(
        f"HTTPException status={exc.status_code} on {request.method} {request.url.path} | "
        f"Detail={exc.detail}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "detail": exc.detail,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
            }
        },
    )

async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catch-all handler for unhandled exceptions (500 Internal Server Error).
    """
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path} | "
        f"Exception: {str(exc)}",
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "detail": "An unexpected error occurred on the server.",
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred on the server.",
            }
        },
    )

def register_error_handlers(app: FastAPI):
    app.add_exception_handler(RequestValidationError, request_validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
