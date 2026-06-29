# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from jose import JWTError

from app.db.session import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import RegisterIn, LoginIn, UserOut, TokenOut
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    REFRESH_EXPIRE_DAYS,
)
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
async def register(data: RegisterIn, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")

    default_role = await db.execute(select(Role).where(Role.name == "user"))
    default_role = default_role.scalar_one_or_none()
    if not default_role:
        raise HTTPException(500, "Default 'user' role not configured")

    user = User(email=data.email, hashed_password=hash_password(data.password))
    user.roles = [default_role]
    db.add(user)
    await db.commit()

    result = await db.execute(
        select(User).options(selectinload(User.roles)).where(User.id == user.id)
    )
    user = result.scalar_one()
    return UserOut(id=user.id, email=user.email, roles=[r.name for r in user.roles])


@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(403, "Account disabled")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",   # cross-origin (Vercel → Render) requires SameSite=None
        max_age=REFRESH_EXPIRE_DAYS * 24 * 3600,
        path="/auth",
    )
    return TokenOut(access_token=access_token)


@router.post("/refresh", response_model=TokenOut)
async def refresh(request: Request, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(401, "Invalid or expired refresh token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive")

    new_access = create_access_token(str(user.id))
    return TokenOut(access_token=new_access)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token", path="/auth", secure=True, samesite="none")
    return {"message": "logged out"}


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return UserOut(id=user.id, email=user.email, roles=[r.name for r in user.roles])