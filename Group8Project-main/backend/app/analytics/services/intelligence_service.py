from datetime import datetime, timezone

from app.core.exceptions import ForbiddenException
from app.identity.models.user import User
from app.analytics.repositories.intelligence_repository import IntelligenceRepository
from app.analytics.schemas.intelligence import (
    AskIntelligenceResponse,
    IntelligenceFinding,
    IntelligenceResponse,
)


class IntelligenceService:
    def __init__(self, repository: IntelligenceRepository) -> None:
        self._repository = repository

    async def get_summary(self, actor: User) -> IntelligenceResponse:
        if actor.role == "service_provider":
            raise ForbiddenException(
                "A provider-to-user assignment is not available in this workspace."
            )
        if actor.role not in {"hoa_admin", "estate_agent", "resident", "investor"}:
            raise ForbiddenException("Your account cannot view property intelligence.")

        now = datetime.now(timezone.utc)
        unit_ids = await self._repository.get_unit_ids(actor)
        property_names = await self._repository.get_property_names(unit_ids)
        complaint_counts = await self._repository.complaint_counts(unit_ids)
        work_order_counts = await self._repository.work_order_counts(unit_ids, now)
        recent_records = await self._repository.recent_records(unit_ids)

        findings = self._findings(complaint_counts, work_order_counts)
        if actor.role == "resident":
            scope = f"Unit {actor.unit_no}" if unit_ids else "No linked unit"
        elif len(property_names) == 1:
            scope = property_names[0]
        else:
            scope = "Managed properties"

        return IntelligenceResponse(
            scope=scope,
            as_of=now,
            role=actor.role,
            units_count=len(unit_ids),
            complaints_total=complaint_counts["total"],
            open_complaints=complaint_counts["open"],
            resolved_complaints=complaint_counts["resolved"],
            work_orders_total=work_order_counts["total"],
            active_work_orders=work_order_counts["active"],
            overdue_work_orders=work_order_counts["overdue"],
            findings=findings,
            recent_records=recent_records,
        )

    @staticmethod
    def _findings(
        complaints: dict[str, int], work_orders: dict[str, int]
    ) -> list[IntelligenceFinding]:
        findings = []
        if work_orders["overdue"]:
            findings.append(
                IntelligenceFinding(
                    id="overdue-work-orders",
                    severity="urgent",
                    title=f"{work_orders['overdue']} work orders past their due date",
                    detail="Review the recorded completion dates with the assigned providers.",
                    evidence=(
                        f"{work_orders['overdue']} of {work_orders['active']} active "
                        "work orders have a due date before today."
                    ),
                )
            )
        if complaints["open"]:
            findings.append(
                IntelligenceFinding(
                    id="open-complaints",
                    severity="attention",
                    title=f"{complaints['open']} complaints still open",
                    detail="Review submitted, under-review and in-progress complaints.",
                    evidence=(
                        f"{complaints['open']} open complaints among "
                        f"{complaints['total']} recorded complaints."
                    ),
                )
            )
        return findings

    async def answer(self, actor: User, question: str) -> AskIntelligenceResponse:
        summary = await self.get_summary(actor)
        normalized = question.casefold()
        evidence = []

        if "complaint" in normalized:
            answer = (
                f"There are {summary.open_complaints} open complaints and "
                f"{summary.resolved_complaints} resolved or closed complaints "
                f"across {summary.units_count} units in {summary.scope}."
            )
            evidence.append(
                f"Complaint records: {summary.complaints_total} total; "
                f"{summary.open_complaints} open; {summary.resolved_complaints} resolved or closed."
            )
        elif "work order" in normalized or "maintenance" in normalized or "overdue" in normalized:
            answer = (
                f"There are {summary.active_work_orders} active work orders, including "
                f"{summary.overdue_work_orders} past their recorded due date, in {summary.scope}."
            )
            evidence.append(
                f"Work-order records: {summary.work_orders_total} total; "
                f"{summary.active_work_orders} active; {summary.overdue_work_orders} overdue."
            )
        elif "unit" in normalized or "property" in normalized or "estate" in normalized:
            answer = f"{summary.scope} includes {summary.units_count} units in your current access scope."
            evidence.append(f"Property records: {summary.units_count} units in scope.")
        else:
            answer = (
                f"In {summary.scope}, there are {summary.open_complaints} open complaints, "
                f"{summary.active_work_orders} active work orders and "
                f"{summary.overdue_work_orders} overdue work orders."
            )
            evidence.extend(
                [
                    f"Complaint records: {summary.open_complaints} open of {summary.complaints_total}.",
                    f"Work-order records: {summary.active_work_orders} active and "
                    f"{summary.overdue_work_orders} overdue of {summary.work_orders_total}.",
                ]
            )

        return AskIntelligenceResponse(answer=answer, evidence=evidence)
