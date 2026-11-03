from enum import Enum


class UserRole(str, Enum):
    """VALORA user roles for RBAC."""
    casual_visitor = "casual_visitor"
    resident = "resident"
    estate_agent = "estate_agent"
    hoa_admin = "hoa_admin"
    service_provider = "service_provider"
    head_admin = "head_admin"


# A head admin can do everything an HOA admin can.
ADMIN_ROLES = (UserRole.hoa_admin.value, UserRole.head_admin.value)


class ComplaintStatus(str, Enum):
    submitted = "submitted"
    under_review = "under_review"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class WorkOrderStatus(str, Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class ListingStatus(str, Enum):
    active = "active"
    sold = "sold"
    rented = "rented"
    withdrawn = "withdrawn"


class PropertyRequestType(str, Enum):
    sell = "sell"
    rent = "rent"


class PropertyRequestStatus(str, Enum):
    pending_review = "pending_review"   # waiting for the HOA
    approved = "approved"               # HOA approved, no agent yet
    rejected = "rejected"
    assigned = "assigned"               # an estate agent is handling it
    listed = "listed"                   # the agent has published the listing
    sold = "sold"                       # a sale request that completed
    rented = "rented"                   # a rental request that completed
