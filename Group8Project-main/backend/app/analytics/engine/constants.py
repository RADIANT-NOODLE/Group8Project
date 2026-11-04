"""Living Score v1.0.0 constants — copied verbatim from VANTAGE engine/constants.py.

Five pillars, 90-day rolling window, Decimal-only arithmetic.
The decisions D1-D6 are recorded in the VANTAGE ADR-005.
"""
from decimal import Decimal
from typing import Final

ENGINE_VERSION: Final[str] = "1.0.0"

COMPONENT_KEYS: Final[tuple[str, ...]] = (
    "resolution",
    "frequency",
    "security",
    "satisfaction",
    "infrastructure",
)

COMPONENT_WEIGHTS: Final[dict[str, Decimal]] = {
    "resolution": Decimal("0.30"),
    "frequency": Decimal("0.25"),
    "security": Decimal("0.20"),
    "satisfaction": Decimal("0.15"),
    "infrastructure": Decimal("0.10"),
}

# D1
WINDOW_DAYS: Final[int] = 90

# D5
ROUNDING: Final[Decimal] = Decimal("0.01")

RESOLUTION_BEST_DAYS: Final[Decimal] = Decimal("1")
RESOLUTION_WORST_DAYS: Final[Decimal] = Decimal("30")
FREQUENCY_WORST_PER_UNIT: Final[Decimal] = Decimal("5")
SECURITY_WORST_INCIDENTS: Final[Decimal] = Decimal("15")
SATISFACTION_MIN_RATING: Final[Decimal] = Decimal("1")
SATISFACTION_MAX_RATING: Final[Decimal] = Decimal("5")

# D4
INFRASTRUCTURE_COMPLETION_WEIGHT: Final[Decimal] = Decimal("0.70")
INFRASTRUCTURE_PROVIDER_WEIGHT: Final[Decimal] = Decimal("0.30")

# D2
MIN_RESOLVED_COMPLAINTS: Final[int] = 3
MIN_COVERAGE_DAYS: Final[int] = 30
MIN_UNITS: Final[int] = 1
MIN_RATINGS: Final[int] = 3
MIN_WORK_ORDERS: Final[int] = 1

# D3
MEASURED_WEIGHT_FLOOR: Final[Decimal] = Decimal("0.50")

RECOMMENDATION_BELOW: Final[Decimal] = Decimal("70")

BENCHMARKS: Final[dict[str, str]] = {
    "resolution": "1 day or less scores 100; 30 days or more scores 0.",
    "frequency": "0 complaints per unit scores 100; 5 or more per unit scores 0.",
    "security": "0 incidents in the window scores 100; 15 or more scores 0.",
    "satisfaction": "1 star scores 0; 5 stars scores 100.",
    "infrastructure": (
        "Completed work orders (70%) blended with the provider rating (30%); "
        "without provider ratings, completion alone is used."
    ),
}

RECOMMENDATIONS: Final[dict[str, str]] = {
    "resolution": (
        "Review how long complaints take to resolve: agree a target with the team "
        "and check which categories run past it."
    ),
    "frequency": (
        "Look for repeat complaint sources: a cluster in one unit or one category "
        "usually has a single fixable cause."
    ),
    "security": (
        "Review the incidents in this window with the security contractor and "
        "address the access points that recur."
    ),
    "satisfaction": (
        "Review closed work orders that residents rated poorly with the assigned "
        "providers before the next dispatch."
    ),
    "infrastructure": (
        "Follow up the work orders that are still open or stalled, and check the "
        "completion rate per provider."
    ),
}

COMPONENT_LABELS: Final[dict[str, str]] = {
    "resolution": "Resolution speed",
    "frequency": "Complaint frequency",
    "security": "Security",
    "satisfaction": "Resident satisfaction",
    "infrastructure": "Maintenance completion",
}
