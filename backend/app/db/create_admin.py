# app/db/create_admin.py
import asyncio
import sys
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.role import Role
from app.core.security import hash_password

async def create_admin(email: str, password: str):
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == email))
        if existing.scalar_one_or_none():
            print(f"User {email} already exists")
            return

        admin_role = (await db.execute(select(Role).where(Role.name == "admin"))).scalar_one_or_none()
        if not admin_role:
            print("Admin role not found — run seed script first")
            return

        user = User(email=email, hashed_password=hash_password(password))
        user.roles = [admin_role]
        db.add(user)
        await db.commit()
        print(f"Admin user created: {email}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python -m app.db.create_admin <email> <password>")
        sys.exit(1)
    asyncio.run(create_admin(sys.argv[1], sys.argv[2]))