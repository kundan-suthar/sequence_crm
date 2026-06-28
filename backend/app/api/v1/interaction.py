import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import require_permission, is_admin
from app.db.session import get_db
from app.models.interaction import Interaction
from app.models.customer import Customer
from app.models.user import User
from app.schemas.interaction import (
    InteractionCreate,
    InteractionUpdate,
    InteractionOut,
    InteractionWithInsightOut,
)
from app.services.ai_service import generate_ai_insight

logger = logging.getLogger("app.api.interaction")

router = APIRouter(prefix="/interactions", tags=["interactions"])


# @router.get("", response_model=list[InteractionOut])
# async def list_interactions(
#     customer_id: int | None = Query(None, description="Filter by customer ID"),
#     type: str | None = Query(None, description="Filter by interaction type (call, meeting, email)"),
#     db: AsyncSession = Depends(get_db),
#     user: User = Depends(require_permission("interaction:view")),
# ):
#     query = select(Interaction)

#     # Non-admin users can only see interactions they created
#     if not is_admin(user):
#         query = query.where(Interaction.created_by == user.id)

#     if customer_id is not None:
#         query = query.where(Interaction.customer_id == customer_id)

#     if type is not None:
#         query = query.where(Interaction.type == type)

#     query = query.order_by(Interaction.occurred_at.desc())

#     result = await db.execute(query)
#     return result.scalars().all()

@router.get("", response_model=list[InteractionWithInsightOut])
async def list_interactions(
    customer_id: int | None = Query(None, description="Filter by customer ID"),
    type: str | None = Query(None, description="Filter by interaction type (call, meeting, email)"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("interaction:view")),
):
    query = select(Interaction).options(selectinload(Interaction.ai_insight))

    # Non-admin users can only see interactions they created
    if not is_admin(user):
        query = query.where(Interaction.created_by == user.id)

    if customer_id is not None:
        query = query.where(Interaction.customer_id == customer_id)

    if type is not None:
        query = query.where(Interaction.type == type)

    query = query.order_by(Interaction.occurred_at.desc())

    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=InteractionWithInsightOut, status_code=status.HTTP_201_CREATED)
async def create_interaction(
    data: InteractionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("interaction:create")),
):
    # Verify the customer exists and the user has access to it
    result = await db.execute(select(Customer).where(Customer.id == data.customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    if not is_admin(user) and customer.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to create interactions for this customer",
        )

    interaction = Interaction(
        customer_id=data.customer_id,
        created_by=user.id,
        type=data.type,
        title=data.title,
        notes=data.notes,
        occurred_at=data.occurred_at,
    )
    db.add(interaction)
    await db.commit()
    await db.refresh(interaction)

    # Generate AI insight from the interaction notes
    logger.info(f"Generating AI insight for interaction {interaction.id}")
    ai_insight = await generate_ai_insight(interaction, db)

    # Reload interaction with the insight relationship populated
    result = await db.execute(
        select(Interaction)
        .options(selectinload(Interaction.ai_insight))
        .where(Interaction.id == interaction.id)
    )
    interaction = result.scalar_one()
    return interaction


@router.get("/{interaction_id}", response_model=InteractionWithInsightOut)
async def get_interaction(
    interaction_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("interaction:view")),
):
    result = await db.execute(
        select(Interaction)
        .options(selectinload(Interaction.ai_insight))
        .where(Interaction.id == interaction_id)
    )
    interaction = result.scalar_one_or_none()
    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interaction not found",
        )

    if not is_admin(user) and interaction.created_by != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to view this interaction",
        )

    return interaction


@router.patch("/{interaction_id}", response_model=InteractionOut)
async def update_interaction(
    interaction_id: int,
    data: InteractionUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("interaction:update")),
):
    result = await db.execute(
        select(Interaction).where(Interaction.id == interaction_id)
    )
    interaction = result.scalar_one_or_none()
    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interaction not found",
        )

    if not is_admin(user) and interaction.created_by != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update this interaction",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(interaction, key, value)

    await db.commit()
    await db.refresh(interaction)
    return interaction
