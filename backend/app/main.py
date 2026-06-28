# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.admin import router as admin_router
from app.api.v1.customer import router as customer_router
from app.core.logging_config import setup_logging
from app.core.logging_middleware import LoggingMiddleware

# Initialize logging configuration
setup_logging()

app = FastAPI()

app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(customer_router)

@app.get("/health")
async def health():
    return {"status": "ok"}