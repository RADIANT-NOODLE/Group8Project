from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import ADMIN_ROLES, UserRole
from app.core.exceptions import ForbiddenException, NotFoundException
from app.identity.models.user import User
from app.property.models.sale import Sale
from app.property.repositories.sale_repository import SaleRepository
from app.property.repositories.property_repository import PropertyRepository
from app.property.schemas.sale import (
    PaginatedSalesResponse,
    SaleCreate,
    SaleResponse,
)


class SaleService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = SaleRepository(db)
        self._property_repo = PropertyRepository(db)

    async def list_sales(
        self, *, page: int, page_size: int, unit_id: int | None = None
    ) -> PaginatedSalesResponse:
        sales = await self._repo.search(
            offset=(page - 1) * page_size, limit=page_size, unit_id=unit_id
        )
        total = await self._repo.count(unit_id=unit_id)
        return PaginatedSalesResponse(
            count=total,
            page=page,
            page_size=page_size,
            sales=[SaleResponse.model_validate(sale) for sale in sales],
        )

    async def get_sale(self, sale_id: int) -> SaleResponse:
        return SaleResponse.model_validate(await self._get_or_404(sale_id))

    async def create_sale(self, payload: SaleCreate, agent: User | None = None) -> SaleResponse:
        if await self._property_repo.get_by_id(payload.unit_id) is None:
            raise NotFoundException(f"Property with id {payload.unit_id} was not found.")
        
        sale = await self._repo.create(
            unit_id=payload.unit_id,
            price=payload.price,
            sale_date=payload.sale_date,
        )
        return SaleResponse.model_validate(sale)

    async def delete_sale(self, sale_id: int, actor: User) -> None:
        sale = await self._get_or_404(sale_id)
        if actor.role not in ADMIN_ROLES:
            raise ForbiddenException("Only admins can delete sales.")
        await self._repo.delete(sale)


    async def _get_or_404(self, sale_id: int) -> Sale:
        sale = await self._repo.get_by_id(sale_id)
        if sale is None:
            raise NotFoundException(f"Sale with id {sale_id} was not found.")
        return sale
