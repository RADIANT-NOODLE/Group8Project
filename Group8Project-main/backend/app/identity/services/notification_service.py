"""NotificationService — business logic for the notification inbox."""
from app.identity.repositories.notification_repository import NotificationRepository
from app.identity.schemas.notification import (
    NotificationListResponse,
    NotificationPreferenceResponse,
    NotificationResponse,
    UpdateNotificationPreferenceRequest,
)
from app.identity.models.user import User


class NotificationService:
    def __init__(self, repo: NotificationRepository) -> None:
        self._repo = repo

    async def list_inbox(self, actor: User, limit: int = 50) -> NotificationListResponse:
        notifications = await self._repo.list_for_user(actor.user_id, limit=limit)
        unread = await self._repo.unread_count(actor.user_id)
        items = [NotificationResponse.model_validate(n) for n in notifications]
        return NotificationListResponse(total=len(items), unread=unread, items=items)

    async def mark_read(self, actor: User, notification_ids: list[int]) -> dict:
        count = await self._repo.mark_read(actor.user_id, notification_ids)
        return {"marked_read": count}

    async def mark_all_read(self, actor: User) -> dict:
        count = await self._repo.mark_all_read(actor.user_id)
        return {"marked_read": count}

    async def get_preferences(self, actor: User) -> NotificationPreferenceResponse:
        prefs = await self._repo.get_preferences(actor.user_id)
        return NotificationPreferenceResponse.model_validate(prefs)

    async def update_preferences(
        self, actor: User, payload: UpdateNotificationPreferenceRequest
    ) -> NotificationPreferenceResponse:
        updates = {k: v for k, v in payload.model_dump().items() if v is not None}
        prefs = await self._repo.update_preferences(actor.user_id, **updates)
        return NotificationPreferenceResponse.model_validate(prefs)
