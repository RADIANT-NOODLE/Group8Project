"""The Living Score v1.0.0 calculation: pure functions, Decimal only.

Adapted from VANTAGE engine/living_score.py for the Group8 unit-scoped
(property-scoped) architecture. The five pillars, weights and decisions
D1-D6 are identical to VANTAGE. The only difference is the input dataclass
name: ``SystemScoreInputs`` instead of ``EstateScoreInputs``, because
Group8 does not have an estates table.

Rules this module keeps deliberately:
* No clock. ``as_of`` is a parameter.
* No database. Aggregates in, a value object out.
* No float. Every intermediate is a ``Decimal``.
* No invention. D1-D6 are recorded in constants.py.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal

from app.analytics.engine.constants import (
    BENCHMARKS,
    COMPONENT_KEYS,
    COMPONENT_LABELS,
    COMPONENT_WEIGHTS,
    ENGINE_VERSION,
    FREQUENCY_WORST_PER_UNIT,
    INFRASTRUCTURE_COMPLETION_WEIGHT,
    INFRASTRUCTURE_PROVIDER_WEIGHT,
    MEASURED_WEIGHT_FLOOR,
    MIN_COVERAGE_DAYS,
    MIN_RATINGS,
    MIN_RESOLVED_COMPLAINTS,
    MIN_UNITS,
    MIN_WORK_ORDERS,
    RECOMMENDATIONS,
    RECOMMENDATION_BELOW,
    RESOLUTION_BEST_DAYS,
    RESOLUTION_WORST_DAYS,
    ROUNDING,
    SATISFACTION_MAX_RATING,
    SATISFACTION_MIN_RATING,
    SECURITY_WORST_INCIDENTS,
    WINDOW_DAYS,
)
from app.analytics.engine.models import (
    ComponentResult,
    ComponentStatus,
    ScoreResult,
    SystemScoreInputs,
)

_ZERO = Decimal("0")
_HUNDRED = Decimal("100")


def _aware(moment: datetime) -> datetime:
    """Treat a naive timestamp as UTC; normalise an aware one to UTC."""
    if moment.tzinfo is None or moment.utcoffset() is None:
        return moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(timezone.utc)


def window_bounds(as_of: datetime) -> tuple[datetime, datetime]:
    """The rolling 90-day window ``[start, end]``, both ends inclusive (D1)."""
    end = _aware(as_of)
    return end - timedelta(days=WINDOW_DAYS), end


def in_window(moment: datetime, as_of: datetime) -> bool:
    """Is ``moment`` inside the window? Boundary values count (D1)."""
    start, end = window_bounds(as_of)
    return start <= _aware(moment) <= end


def _clamp(value: Decimal) -> Decimal:
    return max(_ZERO, min(_HUNDRED, value))


def _round2(value: Decimal) -> Decimal:
    return value.quantize(ROUNDING, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class _Outcome:
    status: ComponentStatus
    unrounded: Decimal | None
    raw_inputs: dict
    explanation: str


def _insufficient(explanation: str, raw_inputs: dict) -> _Outcome:
    return _Outcome("insufficient_data", None, raw_inputs, explanation)


def _measured(unrounded: Decimal, raw_inputs: dict, explanation: str) -> _Outcome:
    return _Outcome("measured", unrounded, raw_inputs, explanation)


# ---------------------------------------------------------------------------
# The five components
# ---------------------------------------------------------------------------

def _resolution(inputs: SystemScoreInputs) -> _Outcome:
    raw = {
        "avg_resolution_days": inputs.avg_resolution_days,
        "resolved_complaints": inputs.resolved_complaints,
    }
    if inputs.resolved_complaints < MIN_RESOLVED_COMPLAINTS or inputs.avg_resolution_days is None:
        return _insufficient(
            f"Only {inputs.resolved_complaints} complaint(s) were resolved in the window; "
            f"at least {MIN_RESOLVED_COMPLAINTS} are needed before an average resolution time is meaningful.",
            raw,
        )
    days = inputs.avg_resolution_days
    unrounded = _HUNDRED * (RESOLUTION_WORST_DAYS - days) / (RESOLUTION_WORST_DAYS - RESOLUTION_BEST_DAYS)
    score = _clamp(unrounded)
    return _measured(
        score, raw,
        f"{inputs.resolved_complaints} complaints resolved, averaging {_round2(days)} days; "
        f"scores {_round2(score)} out of 100 ({BENCHMARKS['resolution']})",
    )


def _frequency(inputs: SystemScoreInputs) -> _Outcome:
    per_unit = (
        Decimal(inputs.complaints_created) / Decimal(inputs.unit_count)
        if inputs.unit_count
        else None
    )
    raw = {
        "complaints_created": inputs.complaints_created,
        "unit_count": inputs.unit_count,
        "coverage_days": inputs.coverage_days,
        "complaints_per_unit": _round2(per_unit) if per_unit is not None else None,
    }
    if inputs.coverage_days < MIN_COVERAGE_DAYS or inputs.unit_count < MIN_UNITS:
        return _insufficient(
            f"{inputs.coverage_days} day(s) of history over {inputs.unit_count} unit(s); "
            f"at least {MIN_COVERAGE_DAYS} days and {MIN_UNITS} unit are needed.",
            raw,
        )
    assert per_unit is not None
    unrounded = _HUNDRED * (Decimal("1") - per_unit / FREQUENCY_WORST_PER_UNIT)
    score = _clamp(unrounded)
    return _measured(
        score, raw,
        f"{inputs.complaints_created} complaints over {inputs.unit_count} units in "
        f"{inputs.coverage_days} days is {_round2(per_unit)} per unit; scores {_round2(score)} out of 100.",
    )


def _security(inputs: SystemScoreInputs) -> _Outcome:
    raw = {
        "incidents": inputs.incidents,
        "coverage_days": inputs.coverage_days,
        "unit_count": inputs.unit_count,
    }
    if inputs.coverage_days < MIN_COVERAGE_DAYS or inputs.unit_count < MIN_UNITS:
        return _insufficient(
            f"{inputs.coverage_days} day(s) of history over {inputs.unit_count} unit(s); "
            f"at least {MIN_COVERAGE_DAYS} days and {MIN_UNITS} unit are needed.",
            raw,
        )
    unrounded = _HUNDRED * (Decimal("1") - Decimal(inputs.incidents) / SECURITY_WORST_INCIDENTS)
    score = _clamp(unrounded)
    return _measured(
        score, raw,
        f"{inputs.incidents} incident(s) recorded in the window; scores {_round2(score)} out of 100.",
    )


def _satisfaction(inputs: SystemScoreInputs) -> _Outcome:
    raw = {"avg_rating": inputs.avg_rating, "rated_count": inputs.rated_count}
    if inputs.rated_count < MIN_RATINGS or inputs.avg_rating is None:
        return _insufficient(
            f"Only {inputs.rated_count} rated work order(s) in the window; "
            f"at least {MIN_RATINGS} are needed.",
            raw,
        )
    rating = inputs.avg_rating
    unrounded = _HUNDRED * (rating - SATISFACTION_MIN_RATING) / (SATISFACTION_MAX_RATING - SATISFACTION_MIN_RATING)
    score = _clamp(unrounded)
    return _measured(
        score, raw,
        f"{inputs.rated_count} rated work orders averaging {_round2(rating)} stars; "
        f"scores {_round2(score)} out of 100.",
    )


def _infrastructure(inputs: SystemScoreInputs) -> _Outcome:
    raw = {
        "work_orders_in_window": inputs.work_orders_in_window,
        "work_orders_completed": inputs.work_orders_completed,
        "avg_provider_rating": inputs.avg_provider_rating,
        "provider_rating_count": inputs.provider_rating_count,
    }
    if inputs.work_orders_in_window < MIN_WORK_ORDERS:
        return _insufficient(
            "No work orders were raised in the window, so there is nothing to say about maintenance throughput.",
            raw,
        )
    completed_pct = (
        Decimal(inputs.work_orders_completed) / Decimal(inputs.work_orders_in_window) * _HUNDRED
    )
    has_provider_data = inputs.provider_rating_count > 0 and inputs.avg_provider_rating is not None
    if has_provider_data:
        assert inputs.avg_provider_rating is not None
        provider_score = _HUNDRED * (inputs.avg_provider_rating - SATISFACTION_MIN_RATING) / (
            SATISFACTION_MAX_RATING - SATISFACTION_MIN_RATING
        )
        unrounded = (
            INFRASTRUCTURE_COMPLETION_WEIGHT * completed_pct
            + INFRASTRUCTURE_PROVIDER_WEIGHT * provider_score
        )
        note = (
            f"blended {int(INFRASTRUCTURE_COMPLETION_WEIGHT * 100)}% completion / "
            f"{int(INFRASTRUCTURE_PROVIDER_WEIGHT * 100)}% provider rating "
            f"({_round2(inputs.avg_provider_rating)} stars from {inputs.provider_rating_count} rating(s))"
        )
    else:
        unrounded = completed_pct
        note = "completion alone used (no provider rating data in this window)"
    score = _clamp(unrounded)
    return _measured(
        score, raw,
        f"{inputs.work_orders_completed} of {inputs.work_orders_in_window} work orders "
        f"completed ({_round2(completed_pct)}%); {note}; scores {_round2(score)} out of 100",
    )


_CALCULATORS = {
    "resolution": _resolution,
    "frequency": _frequency,
    "security": _security,
    "satisfaction": _satisfaction,
    "infrastructure": _infrastructure,
}


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------

def calculate_living_score(inputs: SystemScoreInputs) -> ScoreResult:
    """Score the system over the 90 days ending at ``inputs.as_of``.

    Pure and total: the same inputs always give the same result.
    A component with too little evidence is marked ``insufficient_data`` and
    contributes no weight. If the measurable weight is below 0.50 (D3) the
    overall score is ``None`` rather than a misleading number.
    """
    window_start, window_end = window_bounds(inputs.as_of)
    outcomes = {key: _CALCULATORS[key](inputs) for key in COMPONENT_KEYS}

    measured = [key for key in COMPONENT_KEYS if outcomes[key].status == "measured"]
    measured_weight = sum((COMPONENT_WEIGHTS[key] for key in measured), start=_ZERO)
    has_overall = measured_weight >= MEASURED_WEIGHT_FLOOR

    components: list[ComponentResult] = []
    for key in COMPONENT_KEYS:
        outcome = outcomes[key]
        weight = COMPONENT_WEIGHTS[key]
        label = COMPONENT_LABELS[key]
        if outcome.status != "measured" or outcome.unrounded is None:
            components.append(ComponentResult(
                key=key, label=label, weight=weight,
                status="insufficient_data", score=None,
                raw_inputs=outcome.raw_inputs,
                benchmark=BENCHMARKS[key],
                contribution=None, lost_points=None,
                explanation=outcome.explanation,
                recommendation=None,
            ))
            continue

        score = _round2(_clamp(outcome.unrounded))
        contribution = _round2(weight * outcome.unrounded / measured_weight)
        lost_points = _round2(weight * (_HUNDRED - outcome.unrounded) / measured_weight)
        components.append(ComponentResult(
            key=key, label=label, weight=weight,
            status="measured", score=score,
            raw_inputs=outcome.raw_inputs,
            benchmark=BENCHMARKS[key],
            contribution=contribution,
            lost_points=lost_points,
            explanation=outcome.explanation,
            recommendation=RECOMMENDATIONS[key] if score < RECOMMENDATION_BELOW else None,
        ))

    overall_score: Decimal | None = None
    if has_overall:
        weighted = sum(
            (COMPONENT_WEIGHTS[key] * outcomes[key].unrounded for key in measured),
            start=_ZERO,
        )
        overall_score = _round2(_clamp(weighted / measured_weight))

    drivers = tuple(sorted(
        (c for c in components if c.status == "measured"),
        key=lambda c: (-(c.lost_points or _ZERO), COMPONENT_KEYS.index(c.key)),
    ))

    return ScoreResult(
        engine_version=ENGINE_VERSION,
        window_start=window_start,
        window_end=window_end,
        overall_score=overall_score,
        status="scored" if has_overall else "insufficient_data",
        measured_weight=measured_weight,
        components=tuple(components),
        drivers=drivers,
    )
