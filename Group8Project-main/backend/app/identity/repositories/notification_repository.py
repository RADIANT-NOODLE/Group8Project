"""NotificationRepository — data-access layer for the notification inbox."""
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.identity.models.notification import Notification
from app.identity.models.notification_preference import NotificationPreference


class NotificationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ------------------------------------------------------------------
    # Inbox
    # ------------------------------------------------------------------

    async def list_for_user(self, user_id: int, limit: int = 50) -> list[Notification]:
        result = await self._db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def unread_count(self, user_id: int) -> int:
        result = await self._db.execute(
            select(func.count()).where(
                Notification.user_id == user_id, Notification.is_read == False  # noqa: E712
            )
        )
        return result.scalar_one()

    async def mark_read(self, user_id: int, notification_ids: list[int]) -> int:
        """Mark specific notifications as read. Returns count updated."""
        from datetime import datetime, timezone
        result = await self._db.execute(
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.notification_id.in_(notification_ids),
            )
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        await self._db.commit()
        return result.rowcount

    async def mark_all_read(self, user_id: int) -> int:
        from datetime import datetime, timezone
        result = await self._db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)  # noqa: E712
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        await self._db.commit()
        return result.rowcount

    async def create(
        self,
        user_id: int,
        category: str,
        title: str,
        body: str,
        entity_type: str | None = None,
        entity_id: int | None = None,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            category=category,
            title=title,
            body=body,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        self._db.add(notif)
        await self._db.commit()
        await self._db.refresh(notif)
        return notif

    # ------------------------------------------------------------------
    # Preferences
    # ------------------------------------------------------------------

    async def get_preferences(self, user_id: int) -> NotificationPreference:
        result = await self._db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        prefs = result.scalar_one_or_none()
        if prefs is None:
            # Auto-create with defaults
            prefs = NotificationPreference(user_id=user_id)
            self._db.add(prefs)
            await self._db.commit()
            await self._db.refresh(prefs)
        return prefs

    async def update_preferences(
        self, user_id: int, **kwargs: bool
    ) -> NotificationPreference:
        prefs = await self.get_preferences(user_id)
        for key, value in kwargs.items():
            if value is not None and hasattr(prefs, key):
                setattr(prefs, key, value)
        await self._db.commit()
        await self._db.refresh(prefs)
        return prefs
