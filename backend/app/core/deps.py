# app/core/deps.py
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.role import Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(401, "Invalid or expired token")

    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(Role.permissions))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive")
    return user


def require_role(*allowed_roles: str):
    def checker(user: User = Depends(get_current_user)):
        user_role_names = {role.name for role in user.roles}
        if not user_role_names.intersection(allowed_roles):
            raise HTTPException(403, "Not enough permissions")
        return user
    return checker


def require_permission(permission_name: str):
    def checker(user: User = Depends(get_current_user)):
        user_permissions = {
            perm.name for role in user.roles for perm in role.permissions
        }
        if permission_name not in user_permissions:
            raise HTTPException(403, "Not enough permissions")
        return user
    return checker

def is_admin(user: User) -> bool:
    return any(r.name == "admin" for r in user.roles)