from fastapi import FastAPI
from app.db.session import engine
from app.db.base import Base
from app.models import user  # import so it's registered with Base

app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
async def health():
    return {"status": "ok"}