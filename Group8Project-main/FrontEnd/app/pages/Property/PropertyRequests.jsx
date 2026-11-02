
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import PropertyTabs from "../Dashboards/shared/PropertyTabs";
import {
    getPropertyRequests,
    approvePropertyRequest,
    rejectPropertyRequest,
    assignEstateAgent,
} from "../../data/propertyRequests";
import { listUsers } from "../../services/userApi";
import "./PropertyRequests.css";
import { showConfirm } from "../../components/AppDialog";
import { roleLabel } from "../../services/roleMap";
import { getStoredUser } from "../../services/session";

/* =========================================================
   CURRENT USER
========================================================= */

function normalizeRole(value) {
    const role = String(value || "").trim().toLowerCase();

    if (
        ["head admin", "head administrator", "headadministrator", "head_admin"].includes(role)
    ) {
        return "head_admin";
    }

    if (
        ["hoa", "hoa admin", "hoa administrator", "administrator", "hoa_admin"].includes(role)
    ) {
        return "hoa_admin";
    }

    return value || "";
}

function getCurrentUser() {
    try {
        const user = getStoredUser();

        if (!user || typeof user !== "object") {
            return null;
        }

        const firstName =
            user.firstName || user.firstname || user.first_name || "";

        const lastName =
            user.lastName || user.lastname || user.last_name || "";

        const fullName =
            user.fullName ||
            user.name ||
            `${firstName} ${lastName}`.trim() ||
            "VALORA Administrator";

        return {
            ...user,
            role: normalizeRole(user.role),
            firstName,
            lastName,
            fullName,
            initials:
                user.initials ||
                fullName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part.charAt(0))
                    .join("")
                    .toUpperCase(),
        };
    } catch (error) {
        console.error("Unable to load current user:", error);
        return null;
    }
}

function isApproved(user) {
    return ["approved", "active"].includes(
        String(user?.status || "").trim().toLowerCase()
    );
}

/* =========================================================
   ICONS
========================================================= */

const Icon = ({ type }) => {
    const icons = {
        requests: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                <path d="M8 7h8M8 11h8M8 15h5" />
            </svg>
        ),
        approval: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="m8.5 12 2.3 2.3 4.7-5" />
            </svg>
        ),
        residents: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9" cy="8" r="3" />
                <path d="M3.5 20c.4-3.4 2.2-5 5.5-5s5.1 1.6 5.5 5" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M15.5 15c2.7-.1 4.4 1.5 5 4.5" />
            </svg>
        ),
        complaint: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4 20 19H4L12 4Z" />
                <path d="M12 9v5M12 17h.01" />
            </svg>
        ),
        maintenance: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.5 5.5a4 4 0 0 0 4.9 5l-7.8 7.8a2.1 2.1 0 1 1-3-3l7.8-7.8a4 4 0 0 0-1.9-2Z" />
                <path d="m5 5 4 4M4 9l5-5" />
            </svg>
        ),
        provider: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M8 12h8M12 8v8" />
            </svg>
        ),
        announcement: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 10h4l8-4v12l-8-4H4z" />
                <path d="M8 14v4M18 9c1.5 1.5 1.5 4.5 0 6" />
            </svg>
        ),
        analytics: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 19V9M12 19V5M19 19v-7" />
            </svg>
        ),
        ai: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="5" width="14" height="14" rx="3" />
                <path d="M9 9h6v6H9zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
            </svg>
        ),
        close: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" />
            </svg>
        ),
        pending: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7v5l3 2" />
            </svg>
        ),
        assigned: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="m8 12 2.5 2.5L16 9" />
            </svg>
        ),
        rejected: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="m9 9 6 6M15 9l-6 6" />
            </svg>
        ),
    };

    return (
        <span className="property-requests-nav-icon">
            {icons[type] || icons.requests}
        </span>
    );
};

/* =========================================================
   PROPERTY REQUESTS
   AVAILABLE TO HOA ADMIN AND HEAD ADMIN
========================================================= */

function PropertyRequests() {
    const currentUser = getCurrentUser();
    const [requests, setRequests] = useState([]);
    const [agents, setAgents] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    /* =====================================================
       LOAD REQUESTS AND APPROVED ESTATE AGENTS
    ===================================================== */

    async function loadData() {
        setLoading(true);

        try {
            const loadedRequests = await getPropertyRequests();
            setRequests(Array.isArray(loadedRequests) ? loadedRequests : []);

            // Estate agents come from the user list (HOA admins only); only
            // approved estate agent accounts can be assigned a request.
            try {
                const users = await listUsers();
                setAgents(
                    users.filter(
                        (user) =>
                            String(user.role || "").toLowerCase() === "estate_agent" &&
                            user.hoa_approved === true
                    )
                );
            } catch (agentError) {
                console.error("Unable to load estate agents:", agentError);
                setAgents([]);
            }

            setError("");
        } catch (loadError) {
            console.error("Unable to load property requests:", loadError);
            setError("Unable to load property requests.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    /* =====================================================
       ROLE ACCESS
    ===================================================== */

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isApproved(currentUser)) {
        return <Navigate to="/registration-pending" replace />;
    }

   // Convert role to lowercase to match backend ("hoa_admin")
const roleCheck = String(currentUser.role || "").toLowerCase();

    if (!["head admin", "hoa admin", "head_admin", "hoa_admin"].includes(roleCheck)) {
        return <Navigate to="/dashboard" replace />;
    }

    const isHeadAdmin = currentUser.role === "head_admin";

    /* =====================================================
       REQUEST COUNTS
    ===================================================== */

    const pendingRequests = requests.filter(
        (request) => request.status === "Pending HOA Review"
    );

    const approvedRequests = requests.filter(
        (request) =>
            request.status === "Approved - Awaiting Agent Assignment"
    );

    const assignedRequests = requests.filter(
        (request) => request.status === "Assigned to Estate Agent"
    );

    const rejectedRequests = requests.filter(
        (request) => request.status === "Rejected"
    );

    /* =====================================================
       REVIEW MODAL
    ===================================================== */

    function openReview(request) {
        setSelectedRequest(request);
        setRejectionReason("");
        setSelectedAgentId(request.assignedAgentId || "");
        setMessage("");
        setError("");
    }

    function closeReview() {
        setSelectedRequest(null);
        setRejectionReason("");
        setSelectedAgentId("");
        setMessage("");
        setError("");
    }

    /* =====================================================
       APPROVE REQUEST
    ===================================================== */

    async function handleApprove() {
        if (!selectedRequest) return;

        if (
            !await showConfirm(
                "Are you sure you want to approve this property request?"
            )
        ) {
            return;
        }

        try {
            await approvePropertyRequest(selectedRequest.id);
            setSelectedRequest(null);
            setMessage(
                "Property request approved successfully. An Estate Agent can now be assigned."
            );
            await loadData();
        } catch (approveError) {
            console.error("Unable to approve property request:", approveError);
            setError(approveError?.message || "Unable to approve the property request.");
        }
    }

    /* =====================================================
       REJECT REQUEST
    ===================================================== */

    async function handleReject() {
        if (!selectedRequest) return;

        const reason = rejectionReason.trim();

        if (!reason) {
            setError("Please enter a reason before rejecting this request.");
            return;
        }

        if (
            !await showConfirm(
                "Are you sure you want to reject this property request?"
            )
        ) {
            return;
        }

        try {
            await rejectPropertyRequest(selectedRequest.id, reason);
            setSelectedRequest(null);
            setRejectionReason("");
            setMessage("Property request rejected successfully.");
            await loadData();
        } catch (rejectError) {
            console.error("Unable to reject property request:", rejectError);
            setError(rejectError?.message || "Unable to reject the property request.");
        }
    }

    /* =====================================================
       ASSIGN ESTATE AGENT
    ===================================================== */

    async function handleAssignAgent() {
        if (!selectedRequest) return;

        if (!selectedAgentId) {
            setError("Please select an approved Estate Agent.");
            return;
        }

        const selectedAgent = agents.find(
            (agent) => String(agent.id) === String(selectedAgentId)
        );

        if (!selectedAgent) {
            setError("The selected Estate Agent could not be found.");
            return;
        }

        const agentName =
            selectedAgent.full_name ||
            selectedAgent.name ||
            selectedAgent.email ||
            "Estate Agent";

        if (
            !await showConfirm(
                `Assign ${agentName} to this property request?`
            )
        ) {
            return;
        }

        try {
            await assignEstateAgent(selectedRequest.id, selectedAgent.id);

            setSelectedRequest(null);
            setSelectedAgentId("");
            setMessage(`${agentName} has been assigned successfully.`);
            await loadData();
        } catch (assignError) {
            console.error("Unable to assign Estate Agent:", assignError);
            setError(assignError?.message || "Unable to assign the Estate Agent.");
        }
    }

    /* =====================================================
       DISPLAY HELPERS
    ===================================================== */

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function formatCurrency(value) {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        const numericValue = Number(
            String(value).replace(/[^0-9.-]/g, "")
        );

        if (Number.isNaN(numericValue)) return value;

        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            maximumFractionDigits: 0,
        }).format(numericValue);
    }

    function formatRequestType(type) {
        if (!type) return "—";

        const normalized = String(type).trim().toLowerCase();

        if (normalized === "sell") return "Sell";
        if (normalized === "rent") return "Rent";

        return type;
    }

    function getStatusClass(status) {
        switch (status) {
            case "Pending HOA Review":
                return "status-pending";
            case "Approved - Awaiting Agent Assignment":
                return "status-approved";
            case "Assigned to Estate Agent":
                return "status-assigned";
            case "Rejected":
                return "status-rejected";
            default:
                return "";
        }
    }

    function getRequestAction(request) {
        if (request.status === "Pending HOA Review") return "Review";

        if (
            request.status === "Approved - Awaiting Agent Assignment"
        ) {
            return "Assign Agent";
        }

        return "View";
    }

    /* =====================================================
       LOADING STATE
    ===================================================== */

    if (loading) {
        return (
            <div className="property-requests-page">
                <DashboardSidebar />

                <main className="property-requests-main property-requests-loading">
                    <div className="property-requests-loading-card">
                        <div className="property-requests-loading-spinner" />
                        <h2>Property Requests</h2>
                        <p>Loading property requests...</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       MAIN PAGE
    ===================================================== */

    return (
        <div className="property-requests-page">
            <DashboardSidebar />

            <main className="property-requests-main">
                <PropertyTabs />

                <header className="property-requests-topbar">
                    <div>
                        <p className="property-requests-eyebrow">
                            {isHeadAdmin
                                ? "HEAD ADMINISTRATION"
                                : "HOA ADMINISTRATION"}
                        </p>

                        <h1>Property Requests</h1>

                        <p>
                            Review resident requests to sell or
                            rent their units.
                        </p>
                    </div>

                    <div className="property-requests-header-user">
                        <div className="property-requests-header-avatar">
                            {currentUser.initials}
                        </div>

                        <div>
                            <strong>{currentUser.fullName}</strong>
                            <span>{roleLabel(currentUser.role)}</span>
                        </div>
                    </div>
                </header>

                <div className="property-requests-content">
                    {message && (
                        <div className="property-requests-message property-requests-message-success">
                            <div className="property-requests-message-icon">
                                <Icon type="assigned" />
                            </div>
                            <div>
                                <strong>Request Updated</strong>
                                <p>{message}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="property-requests-message property-requests-message-error">
                            <div className="property-requests-message-icon">
                                <Icon type="rejected" />
                            </div>
                            <div>
                                <strong>Action Required</strong>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* STATISTICS */}

                    <div className="property-requests-stats">
                        {[
                            {
                                label: "Pending Review",
                                count: pendingRequests.length,
                                description: "Requests awaiting review",
                                icon: "pending",
                                type: "pending",
                            },
                            {
                                label: "Awaiting Agent",
                                count: approvedRequests.length,
                                description: "Approved requests awaiting assignment",
                                icon: "approval",
                                type: "approved",
                            },
                            {
                                label: "Assigned",
                                count: assignedRequests.length,
                                description: "Requests assigned to agents",
                                icon: "assigned",
                                type: "assigned",
                            },
                            {
                                label: "Rejected",
                                count: rejectedRequests.length,
                                description: "Requests not approved",
                                icon: "rejected",
                                type: "rejected",
                            },
                        ].map((stat) => (
                            <div
                                className="property-requests-stat-card"
                                key={stat.label}
                            >
                                <div className="property-requests-stat-top">
                                    <span
                                        className={`property-requests-stat-icon ${stat.type}`}
                                    >
                                        <Icon type={stat.icon} />
                                    </span>
                                    <span>{stat.label}</span>
                                </div>

                                <strong>{stat.count}</strong>
                                <p>{stat.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* REQUEST TABLE */}

                    <section className="property-requests-panel">
                        <div className="property-requests-panel-heading">
                            <div>
                                <h2>Property Requests</h2>
                                <p>
                                    All sell and rent requests submitted by
                                    residents.
                                </p>
                            </div>

                            <span className="property-requests-total">
                                {requests.length} Total
                            </span>
                        </div>

                        {requests.length === 0 ? (
                            <div className="property-requests-empty">
                                <div className="property-requests-empty-icon">
                                    <Icon type="requests" />
                                </div>
                                <h3>No Property Requests</h3>
                                <p>
                                    There are currently no property requests
                                    to review.
                                </p>
                            </div>
                        ) : (
                            <div className="property-requests-table-container">
                                <table className="property-requests-table">
                                    <thead>
                                        <tr>
                                            <th>Request</th>
                                            <th>Owner / Requester</th>
                                            <th>Unit</th>
                                            <th>Request Type</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {requests.map((request, index) => (
                                            <tr
                                                key={
                                                    request.id ||
                                                    request.propertyId ||
                                                    index
                                                }
                                            >
                                                <td>
                                                    <strong className="property-requests-id">
                                                        {request.id || "—"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <div className="property-requests-owner">
                                                        <strong>
                                                            {request.requesterName ||
                                                                "Unknown"}
                                                        </strong>
                                                        <small>
                                                            {request.requesterRole ||
                                                                "—"}
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="property-requests-unit">
                                                        <strong>
                                                            {request.propertyAddress ||
                                                                request.propertyId ||
                                                                "—"}
                                                        </strong>
                                                        <small>
                                                            {request.propertyType ||
                                                                "—"}
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="property-requests-type">
                                                        {formatRequestType(
                                                            request.requestType
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="property-requests-date">
                                                        {formatDate(
                                                            request.createdAt
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`property-requests-status ${getStatusClass(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {request.status ||
                                                            "Unknown"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="property-requests-primary-btn"
                                                        onClick={() =>
                                                            openReview(request)
                                                        }
                                                    >
                                                        {getRequestAction(request)}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* REVIEW MODAL */}

            {selectedRequest && (
                <div
                    className="property-requests-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeReview();
                        }
                    }}
                >
                    <div className="property-requests-modal">
                        <div className="property-requests-modal-header">
                            <div>
                                <p className="property-requests-modal-eyebrow">
                                    PROPERTY REQUEST
                                </p>
                                <h2>Property Request Review</h2>
                                <p>
                                    Request ID: {selectedRequest.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="property-requests-close-btn"
                                onClick={closeReview}
                                aria-label="Close review"
                            >
                                <Icon type="close" />
                            </button>
                        </div>

                        <div className="property-requests-modal-body">
                            {/* REQUESTER */}

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon">
                                        <Icon type="residents" />
                                    </div>
                                    <div>
                                        <h3>Requester Information</h3>
                                        <p>
                                            Details of the resident
                                            who submitted the request.
                                        </p>
                                    </div>
                                </div>

                                <div className="property-requests-detail-grid">
                                    <div className="property-requests-detail-item">
                                        <span>Name</span>
                                        <strong>
                                            {selectedRequest.requesterName || "—"}
                                        </strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Email</span>
                                        <strong>
                                            {selectedRequest.requesterEmail || "—"}
                                        </strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Role</span>
                                        <strong>
                                            {selectedRequest.requesterRole || "—"}
                                        </strong>
                                    </div>
                                </div>
                            </section>

                            {/* PROPERTY */}

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon">
                                        <Icon type="requests" />
                                    </div>
                                    <div>
                                        <h3>Property Information</h3>
                                        <p>
                                            Unit and property details connected
                                            to this request.
                                        </p>
                                    </div>
                                </div>

                                <div className="property-requests-detail-grid">
                                    <div className="property-requests-detail-item">
                                        <span>Unit / Property</span>
                                        <strong>
                                            {selectedRequest.propertyAddress ||
                                                selectedRequest.propertyId ||
                                                "—"}
                                        </strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Property Type</span>
                                        <strong>
                                            {selectedRequest.propertyType || "—"}
                                        </strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Bedrooms</span>
                                        <strong>
                                            {selectedRequest.bedrooms ?? "—"}
                                        </strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Bathrooms</span>
                                        <strong>
                                            {selectedRequest.bathrooms ?? "—"}
                                        </strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Property Size</span>
                                        <strong>
                                            {selectedRequest.propertySize
                                                ? `${selectedRequest.propertySize} m²`
                                                : "—"}
                                        </strong>
                                    </div>
                                </div>
                            </section>

                            {/* REQUEST DETAILS */}

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon">
                                        <Icon type="approval" />
                                    </div>
                                    <div>
                                        <h3>Request Information</h3>
                                        <p>
                                            Details of the requested sale or
                                            rental listing.
                                        </p>
                                    </div>
                                </div>

                                <div className="property-requests-detail-grid">
                                    <div className="property-requests-detail-item">
                                        <span>Request Type</span>
                                        <strong>
                                            {formatRequestType(
                                                selectedRequest.requestType
                                            )}
                                        </strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Asking Price</span>
                                        <strong>
                                            {formatCurrency(
                                                selectedRequest.askingPrice
                                            )}
                                        </strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Rental Period</span>
                                        <strong>
                                            {selectedRequest.rentalPeriod || "—"}
                                        </strong>
                                    </div>
                                </div>
                            </section>

                            {/* FINANCIAL INFORMATION */}

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon">
                                        <Icon type="analytics" />
                                    </div>
                                    <div>
                                        <h3>Financial Information</h3>
                                    </div>
                                </div>

                                <div className="property-requests-text-box">
                                    <p>
                                        {selectedRequest.financialInformation ||
                                            "No financial information provided."}
                                    </p>
                                </div>
                            </section>

                            {/* ADDITIONAL DETAILS */}

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon">
                                        <Icon type="requests" />
                                    </div>
                                    <div>
                                        <h3>Additional Details</h3>
                                    </div>
                                </div>

                                <div className="property-requests-text-box">
                                    <p>
                                        {selectedRequest.additionalDetails ||
                                            "No additional details provided."}
                                    </p>
                                </div>
                            </section>

                            {/* CURRENT STATUS */}

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon">
                                        <Icon type="pending" />
                                    </div>
                                    <div>
                                        <h3>Current Status</h3>
                                    </div>
                                </div>

                                <div className="property-requests-current-status">
                                    <span
                                        className={`property-requests-status ${getStatusClass(
                                            selectedRequest.status
                                        )}`}
                                    >
                                        {selectedRequest.status || "Unknown"}
                                    </span>

                                    {selectedRequest.assignedAgentName && (
                                        <div className="property-requests-assigned-agent">
                                            <span>Assigned Estate Agent</span>
                                            <strong>
                                                {selectedRequest.assignedAgentName}
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* APPROVE OR REJECT */}

                            {selectedRequest.status === "Pending HOA Review" && (
                                <section className="property-requests-review-section property-requests-action-section">
                                    <div className="property-requests-section-heading">
                                        <div className="property-requests-section-icon">
                                            <Icon type="approval" />
                                        </div>
                                        <div>
                                            <h3>Administrator Decision</h3>
                                            <p>
                                                Approve the request or provide
                                                a reason for rejection.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="property-requests-action-buttons">
                                        <button
                                            type="button"
                                            className="property-requests-primary-btn"
                                            onClick={handleApprove}
                                        >
                                            Approve Request
                                        </button>
                                        <button
                                            type="button"
                                            className="property-requests-secondary-btn"
                                            onClick={handleReject}
                                        >
                                            Reject Request
                                        </button>
                                    </div>

                                    <div className="property-requests-form-group">
                                        <label htmlFor="rejectionReason">
                                            Rejection Reason
                                        </label>
                                        <textarea
                                            id="rejectionReason"
                                            value={rejectionReason}
                                            onChange={(event) =>
                                                setRejectionReason(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter a reason if the request is rejected."
                                            rows={4}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* ASSIGN ESTATE AGENT */}

                            {selectedRequest.status ===
                                "Approved - Awaiting Agent Assignment" && (
                                <section className="property-requests-review-section property-requests-action-section">
                                    <div className="property-requests-section-heading">
                                        <div className="property-requests-section-icon">
                                            <Icon type="assigned" />
                                        </div>
                                        <div>
                                            <h3>Assign Estate Agent</h3>
                                            <p>
                                                Select an approved Estate Agent
                                                to manage this property listing.
                                            </p>
                                        </div>
                                    </div>

                                    {agents.length === 0 ? (
                                        <div className="property-requests-no-agents">
                                            <Icon type="residents" />
                                            <p>
                                                There are currently no approved
                                                Estate Agents available for
                                                assignment.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="property-requests-form-group">
                                                <label htmlFor="estateAgent">
                                                    Select Estate Agent
                                                </label>
                                                <select
                                                    id="estateAgent"
                                                    value={selectedAgentId}
                                                    onChange={(event) =>
                                                        setSelectedAgentId(
                                                            event.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select an Estate Agent
                                                    </option>

                                                    {agents.map((agent) => {
                                                        const agentName =
                                                            agent.full_name ||
                                                            agent.name ||
                                                            agent.email ||
                                                            "Estate Agent";

                                                        return (
                                                            <option
                                                                key={agent.id}
                                                                value={agent.id}
                                                            >
                                                                {agentName}
                                                                {" — "}
                                                                {agent.email || ""}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            <div className="property-requests-action-buttons">
                                                <button
                                                    type="button"
                                                    className="property-requests-primary-btn"
                                                    onClick={handleAssignAgent}
                                                >
                                                    Assign Estate Agent
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </section>
                            )}

                            {/* ASSIGNED REQUEST */}

                            {selectedRequest.status ===
                                "Assigned to Estate Agent" && (
                                <section className="property-requests-review-section">
                                    <div className="property-requests-section-heading">
                                        <div className="property-requests-section-icon">
                                            <Icon type="assigned" />
                                        </div>
                                        <div>
                                            <h3>Assigned Estate Agent</h3>
                                        </div>
                                    </div>

                                    <div className="property-requests-assignment-card">
                                        <div>
                                            <span>Agent</span>
                                            <strong>
                                                {selectedRequest.assignedAgentName ||
                                                    "—"}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Assigned</span>
                                            <strong>
                                                {formatDate(
                                                    selectedRequest.assignedAt
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* REJECTED REQUEST */}

                            {selectedRequest.status === "Rejected" && (
                                <section className="property-requests-review-section">
                                    <div className="property-requests-section-heading">
                                        <div className="property-requests-section-icon">
                                            <Icon type="rejected" />
                                        </div>
                                        <div>
                                            <h3>Rejection Information</h3>
                                        </div>
                                    </div>

                                    <div className="property-requests-text-box property-requests-rejection-box">
                                        <p>
                                            {selectedRequest.rejectionReason ||
                                                "No rejection reason recorded."}
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* REQUEST DATES */}

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon">
                                        <Icon type="pending" />
                                    </div>
                                    <div>
                                        <h3>Request Dates</h3>
                                    </div>
                                </div>

                                <div className="property-requests-assignment-card">
                                    <div>
                                        <span>Created</span>
                                        <strong>
                                            {formatDate(
                                                selectedRequest.createdAt
                                            )}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Last Updated</span>
                                        <strong>
                                            {formatDate(
                                                selectedRequest.updatedAt
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="property-requests-modal-footer">
                            <button
                                type="button"
                                className="property-requests-secondary-btn"
                                onClick={closeReview}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PropertyRequests;
