import asyncio

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.models.role import Role
from app.models.permission import Permission


PERMISSIONS = [
    "customer:create",
    "customer:update",
    "customer:delete",
    "customer:view",
    "interaction:create",
    "interaction:update",
    "interaction:view",
    "executive:view",
    "executive:update",
    "executive:delete",
]


ROLE_PERMISSIONS = {
    "admin": [
        "customer:create",
        "customer:update",
        "customer:delete",
        "customer:view",
        "interaction:create",
        "interaction:update",
        "interaction:view",
        "executive:view",
        "executive:update",
        "executive:delete",
    ],

    "executive": [
        "customer:create",
        "customer:update",
        "customer:view",
        "interaction:create",
        "interaction:update",
        "interaction:view",
    ],

    "user": [],
}


async def seed():

    async with AsyncSessionLocal() as db:


        # ------------------------
        # Permissions
        # ------------------------

        result = await db.execute(
            select(Permission)
        )

        existing_permissions = {
            p.name: p
            for p in result.scalars().all()
        }


        permission_objs = {}

        for name in PERMISSIONS:

            if name in existing_permissions:

                permission_objs[name] = existing_permissions[name]

            else:

                permission = Permission(
                    name=name
                )

                db.add(permission)

                permission_objs[name] = permission


        await db.flush()



        # ------------------------
        # Roles
        # ------------------------

        result = await db.execute(
            select(Role)
            .options(
                selectinload(Role.permissions)
            )
        )


        existing_roles = {
            role.name: role
            for role in result.scalars().all()
        }



        for role_name, permissions in ROLE_PERMISSIONS.items():


            if role_name in existing_roles:

                role = existing_roles[role_name]

            else:

                role = Role(
                    name=role_name
                )

                db.add(role)



            role.permissions = [
                permission_objs[p]
                for p in permissions
            ]


        await db.commit()


        print("Seed completed")


if __name__ == "__main__":
    asyncio.run(seed())