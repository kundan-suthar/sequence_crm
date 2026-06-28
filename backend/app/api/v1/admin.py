# app/api/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserOut
from app.core.deps import require_role

router = APIRouter(prefix="/admin", tags=["admin"])


class UpdateRoleIn(BaseModel):
    role_name: str  # "admin", "executive", or "user"


@router.patch("/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: int,
    data: UpdateRoleIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),  # only admin can call this
):
    result = await db.execute(
        select(User).options(selectinload(User.roles)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")

    role = (await db.execute(select(Role).where(Role.name == data.role_name))).scalar_one_or_none()
    if not role:
        raise HTTPException(400, "Invalid role name")

    user.roles = [role]  # single role per user; use append if you want multi-role
    await db.commit()

    return UserOut(id=user.id, email=user.email, roles=[r.name for r in user.roles])


@router.get("/users", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    result = await db.execute(select(User).options(selectinload(User.roles)))
    users = result.scalars().all()
    return [UserOut(id=u.id, email=u.email, roles=[r.name for r in u.roles]) for u in users]