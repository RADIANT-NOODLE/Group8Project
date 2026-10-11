import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getPropertyRequests,
    approvePropertyRequest,
    rejectPropertyRequest,
    assignEstateAgent,
} from "../../data/propertyRequests";

import ConfirmPrompt from "../../components/ConfirmPrompt";
import "./PropertyRequests.css";


/* =========================================================
   PROFESSIONAL SVG ICONS
========================================================= */

const Icon = ({ type }) => {

    const icons = {

        dashboard: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
        ),

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

        profile: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5.5 20c.6-4 2.7-6 6.5-6s5.9 2 6.5 6" />
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

        logout: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
                <path d="M14 8l4 4-4 4M9 12h9" />
            </svg>
        ),

    };

    return (
        <span className="property-requests-nav-icon">
            {icons[type] || icons.dashboard}
        </span>
    );
};


/* =========================================================
   VALORA PROPERTY REQUESTS
   HOA ADMIN
========================================================= */

function PropertyRequests() {

    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [agents, setAgents] = useState([]);

    const [selectedRequest, setSelectedRequest] = useState(null);

    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedAgentId, setSelectedAgentId] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(true);


    /* The action awaiting confirmation used to be a browser
       window.confirm dialog. */

    const [pendingAction, setPendingAction] = useState(null);


    /* =========================================================
       LOAD REQUESTS + ESTATE AGENTS
    ========================================================= */

    useEffect(() => {
        loadData();
    }, []);


    function loadData() {

        setLoading(true);

        try {

            const storedRequests = getPropertyRequests();

            setRequests(
                Array.isArray(storedRequests)
                    ? storedRequests
                    : []
            );


            /*
            =================================================
            ASSIGNABLE AGENTS

            Agent accounts are served by the API in a later
            phase (connection plan, Phase 4 items 1 and 2),
            so no assignable agents are listed yet.
            =================================================
            */

            setAgents([]);

        } catch (loadError) {

            console.error(
                "Unable to load VALORA property requests:",
                loadError
            );

            setError(
                "Unable to load property requests."
            );

        } finally {

            setLoading(false);
        }
    }


    /* =========================================================
       COUNTS
    ========================================================= */

    const pendingRequests =
        requests.filter(
            (request) =>
                request.status === "Pending HOA Review"
        );

    const approvedRequests =
        requests.filter(
            (request) =>
                request.status ===
                "Approved - Awaiting Agent Assignment"
        );

    const assignedRequests =
        requests.filter(
            (request) =>
                request.status ===
                "Assigned to Estate Agent"
        );

    const rejectedRequests =
        requests.filter(
            (request) =>
                request.status === "Rejected"
        );


    /* =========================================================
       REVIEW REQUEST
    ========================================================= */

    function openReview(request) {

        setSelectedRequest(request);

        setRejectionReason("");

        setSelectedAgentId(
            request.assignedAgentId || ""
        );

        setMessage("");

        setError("");
    }


    /* =========================================================
       CLOSE REVIEW
    ========================================================= */

    function closeReview() {

        setSelectedRequest(null);

        setRejectionReason("");

        setSelectedAgentId("");

        setMessage("");

        setError("");
    }


    /* =========================================================
       APPROVE REQUEST
    ========================================================= */

    function handleApprove() {

        if (!selectedRequest) {
            return;
        }

        setError("");

        setPendingAction({ type: "approve" });
    }


    function confirmApprove() {

        setPendingAction(null);

        try {

            approvePropertyRequest(
                selectedRequest.id
            );

            setMessage(
                "Property request approved successfully. An Estate Agent can now be assigned."
            );

            loadData();

            setSelectedRequest(null);

        } catch (approveError) {

            console.error(
                "Unable to approve property request:",
                approveError
            );

            setError(
                "Unable to approve the property request."
            );
        }
    }


    /* =========================================================
       REJECT REQUEST
    ========================================================= */

    function handleReject() {

        if (!selectedRequest) {
            return;
        }

        const reason =
            rejectionReason.trim();

        if (!reason) {

            setError(
                "Please enter a reason before rejecting this request."
            );

            return;
        }

        setError("");

        setPendingAction({ type: "reject" });
    }


    function confirmReject() {

        const reason =
            rejectionReason.trim();

        setPendingAction(null);

        try {

            rejectPropertyRequest(
                selectedRequest.id,
                reason
            );

            setMessage(
                "Property request rejected successfully."
            );

            loadData();

            setSelectedRequest(null);

            setRejectionReason("");

        } catch (rejectError) {

            console.error(
                "Unable to reject property request:",
                rejectError
            );

            setError(
                "Unable to reject the property request."
            );
        }
    }


    /* =========================================================
       ASSIGN ESTATE AGENT
    ========================================================= */

    function handleAssignAgent() {

        if (!selectedRequest) {
            return;
        }

        if (!selectedAgentId) {

            setError(
                "Please select an approved Estate Agent."
            );

            return;
        }

        const selectedAgent =
            agents.find(
                (agent) =>
                    agent.id === selectedAgentId
            );

        if (!selectedAgent) {

            setError(
                "The selected Estate Agent could not be found."
            );

            return;
        }

        const agentName =
            `${selectedAgent.firstName || ""} ${selectedAgent.lastName || ""}`
                .trim() ||
            selectedAgent.name ||
            selectedAgent.email ||
            "Estate Agent";

        setError("");

        setPendingAction({
            type: "assign",
            agentName,
        });
    }


    function confirmAssignAgent() {

        const agentName =
            pendingAction.agentName;

        setPendingAction(null);

        try {

            assignEstateAgent(
                selectedRequest.id,
                selectedAgent.id,
                agentName
            );

            setMessage(
                `${agentName} has been assigned successfully.`
            );

            loadData();

            setSelectedRequest(null);

            setSelectedAgentId("");

        } catch (assignError) {

            console.error(
                "Unable to assign Estate Agent:",
                assignError
            );

            setError(
                "Unable to assign the Estate Agent."
            );
        }
    }


    /* =========================================================
       FORMAT DATE
    ========================================================= */

    function formatDate(dateValue) {

        if (!dateValue) {
            return "—";
        }

        const date =
            new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-ZA",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }


    /* =========================================================
       FORMAT CURRENCY
    ========================================================= */

    function formatCurrency(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const numericValue =
            Number(
                String(value)
                    .replace(/[^0-9.-]/g, "")
            );

        if (Number.isNaN(numericValue)) {
            return value;
        }

        return new Intl.NumberFormat(
            "en-ZA",
            {
                style: "currency",
                currency: "ZAR",
                maximumFractionDigits: 0,
            }
        ).format(numericValue);
    }


    /* =========================================================
       STATUS CLASS
    ========================================================= */

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


    /* =========================================================
       REQUEST TYPE
    ========================================================= */

    function formatRequestType(type) {

        if (!type) {
            return "—";
        }

        const normalized =
            String(type)
                .trim()
                .toLowerCase();

        if (normalized === "sell") {
            return "Sell";
        }

        if (normalized === "rent") {
            return "Rent";
        }

        return type;
    }


    /* =========================================================
       REQUEST ACTION
    ========================================================= */

    function getRequestAction(request) {

        if (
            request.status ===
            "Pending HOA Review"
        ) {
            return "Review";
        }

        if (
            request.status ===
            "Approved - Awaiting Agent Assignment"
        ) {
            return "Assign Agent";
        }

        if (
            request.status ===
            "Assigned to Estate Agent"
        ) {
            return "View";
        }

        return "View";
    }


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (
            <div className="property-requests-page">

                <main className="property-requests-main property-requests-loading">

                    <div className="property-requests-loading-card">

                        <div className="property-requests-loading-spinner"></div>

                        <h2>
                            Property Requests
                        </h2>

                        <p>
                            Loading property requests...
                        </p>

                    </div>

                </main>

            </div>
        );
    }


    /* =========================================================
       MAIN UI
    ========================================================= */

    return (

        <div className="property-requests-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="property-requests-sidebar">

                <div className="property-requests-sidebar-brand">

                    <img
                        src="/assets/valora-logo.svg"
                        alt="VALORA"
                    />

                    <span>
                        COMMUNITY PLATFORM
                    </span>

                </div>


                <div className="property-requests-sidebar-user">

                    <div className="property-requests-profile-circle">
                        HA
                    </div>

                    <div>

                        <strong>
                            HOA Admin
                        </strong>

                        <span>
                            Property Management
                        </span>

                    </div>

                </div>


                <nav className="property-requests-navigation">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <Icon type="dashboard" />
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="active"
                        onClick={() =>
                            navigate("/property-requests")
                        }
                    >
                        <Icon type="requests" />
                        <span>Property Requests</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/property-approvals")
                        }
                    >
                        <Icon type="approval" />
                        <span>Property Approvals</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/resident-directory")
                        }
                    >
                        <Icon type="residents" />
                        <span>Resident Directory</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/complaints")
                        }
                    >
                        <Icon type="complaint" />
                        <span>Complaints</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/maintenance")
                        }
                    >
                        <Icon type="maintenance" />
                        <span>Maintenance</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/providers")
                        }
                    >
                        <Icon type="provider" />
                        <span>Service Providers</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/announcements")
                        }
                    >
                        <Icon type="announcement" />
                        <span>Announcements</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/ai-training-data")
                        }
                    >
                        <Icon type="ai" />
                        <span>AI Training Data</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/community-analytics")
                        }
                    >
                        <Icon type="analytics" />
                        <span>Community Analytics</span>
                    </button>

                </nav>


                <div className="property-requests-sidebar-bottom">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        <Icon type="profile" />
                        <span>Profile</span>
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="property-requests-main">

                <header className="property-requests-topbar">

                    <div>

                        <p className="property-requests-eyebrow">
                            HOA ADMINISTRATION
                        </p>

                        <h1>
                            Property Requests
                        </h1>

                        <p>
                            Review resident and investor requests to sell or rent their units.
                        </p>

                    </div>


                    <div className="property-requests-header-user">

                        <div className="property-requests-header-avatar">
                            HA
                        </div>

                        <div>

                            <strong>
                                HOA Admin
                            </strong>

                            <span>
                                Property Management
                            </span>

                        </div>

                    </div>

                </header>


                <div className="property-requests-content">

                    {/* =========================================
                        MESSAGES
                    ========================================= */}

                    {message && (

                        <div className="property-requests-message property-requests-message-success">

                            <div className="property-requests-message-icon">
                                <Icon type="assigned" />
                            </div>

                            <div>

                                <strong>
                                    Request Updated
                                </strong>

                                <p>
                                    {message}
                                </p>

                            </div>

                        </div>

                    )}


                    {error && (

                        <div className="property-requests-message property-requests-message-error">

                            <div className="property-requests-message-icon">
                                <Icon type="rejected" />
                            </div>

                            <div>

                                <strong>
                                    Action Required
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =========================================
                        STATISTICS
                    ========================================= */}

                    <div className="property-requests-stats">

                        <div className="property-requests-stat-card">

                            <div className="property-requests-stat-top">

                                <span className="property-requests-stat-icon pending">
                                    <Icon type="pending" />
                                </span>

                                <span>
                                    Pending Review
                                </span>

                            </div>

                            <strong>
                                {pendingRequests.length}
                            </strong>

                            <p>
                                Requests awaiting HOA review
                            </p>

                        </div>


                        <div className="property-requests-stat-card">

                            <div className="property-requests-stat-top">

                                <span className="property-requests-stat-icon approved">
                                    <Icon type="approval" />
                                </span>

                                <span>
                                    Awaiting Agent
                                </span>

                            </div>

                            <strong>
                                {approvedRequests.length}
                            </strong>

                            <p>
                                Approved requests awaiting assignment
                            </p>

                        </div>


                        <div className="property-requests-stat-card">

                            <div className="property-requests-stat-top">

                                <span className="property-requests-stat-icon assigned">
                                    <Icon type="assigned" />
                                </span>

                                <span>
                                    Assigned
                                </span>

                            </div>

                            <strong>
                                {assignedRequests.length}
                            </strong>

                            <p>
                                Requests assigned to agents
                            </p>

                        </div>


                        <div className="property-requests-stat-card">

                            <div className="property-requests-stat-top">

                                <span className="property-requests-stat-icon rejected">
                                    <Icon type="rejected" />
                                </span>

                                <span>
                                    Rejected
                                </span>

                            </div>

                            <strong>
                                {rejectedRequests.length}
                            </strong>

                            <p>
                                Requests not approved
                            </p>

                        </div>

                    </div>


                    {/* =========================================
                        REQUEST TABLE
                    ========================================= */}

                    <section className="property-requests-panel">

                        <div className="property-requests-panel-heading">

                            <div>

                                <h2>
                                    Property Requests
                                </h2>

                                <p>
                                    All sell and rent requests submitted by residents and investors.
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

                                <h3>
                                    No Property Requests
                                </h3>

                                <p>
                                    There are currently no property requests to review.
                                </p>

                            </div>

                        ) : (

                            <div className="property-requests-table-container">

                                <table className="property-requests-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Request
                                            </th>

                                            <th>
                                                Owner / Requester
                                            </th>

                                            <th>
                                                Unit
                                            </th>

                                            <th>
                                                Request Type
                                            </th>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {requests.map(
                                            (request) => (

                                                <tr
                                                    key={request.id}
                                                >

                                                    <td>

                                                        <strong className="property-requests-id">
                                                            {request.id}
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <div className="property-requests-owner">

                                                            <strong>
                                                                {
                                                                    request.requesterName ||
                                                                    "Unknown"
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    request.requesterRole ||
                                                                    "—"
                                                                }
                                                            </small>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="property-requests-unit">

                                                            <strong>
                                                                {
                                                                    request.propertyAddress ||
                                                                    request.propertyId ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    request.propertyType ||
                                                                    "—"
                                                                }
                                                            </small>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="property-requests-type">
                                                            {
                                                                formatRequestType(
                                                                    request.requestType
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="property-requests-date">
                                                            {
                                                                formatDate(
                                                                    request.createdAt
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`property-requests-status ${getStatusClass(
                                                                request.status
                                                            )}`}
                                                        >
                                                            {
                                                                request.status ||
                                                                "Unknown"
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="property-requests-primary-btn"
                                                            onClick={() =>
                                                                openReview(
                                                                    request
                                                                )
                                                            }
                                                        >
                                                            {
                                                                getRequestAction(
                                                                    request
                                                                )
                                                            }
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                </div>

            </main>


            {/* =================================================
                REVIEW MODAL
            ================================================= */}

            {selectedRequest && (

                <div
                    className="property-requests-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
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

                                <h2>
                                    Property Request Review
                                </h2>

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

                            {/* =====================================
                                CONFIRMATION
                            ===================================== */}

                            <ConfirmPrompt
                                open={Boolean(pendingAction)}
                                tone={
                                    pendingAction?.type === "reject"
                                        ? "danger"
                                        : "neutral"
                                }
                                title={
                                    pendingAction?.type === "approve"
                                        ? "Approve this property request?"
                                        : pendingAction?.type === "reject"
                                        ? "Reject this property request?"
                                        : "Assign this Estate Agent?"
                                }
                                description={
                                    pendingAction?.type === "assign"
                                        ? `Assign ${pendingAction?.agentName ?? "this Estate Agent"} to this property request?`
                                        : "The requester is notified of the decision."
                                }
                                confirmLabel={
                                    pendingAction?.type === "approve"
                                        ? "Approve request"
                                        : pendingAction?.type === "reject"
                                        ? "Reject request"
                                        : "Assign agent"
                                }
                                onConfirm={
                                    pendingAction?.type === "approve"
                                        ? confirmApprove
                                        : pendingAction?.type === "reject"
                                        ? confirmReject
                                        : confirmAssignAgent
                                }
                                onCancel={() =>
                                    setPendingAction(null)
                                }
                            />


                            {/* =====================================
                                REQUESTER INFORMATION
                            ===================================== */}

                            <section className="property-requests-review-section">

                                <div className="property-requests-section-heading">

                                    <div className="property-requests-section-icon">
                                        <Icon type="residents" />
                                    </div>

                                    <div>

                                        <h3>
                                            Requester Information
                                        </h3>

                                        <p>
                                            Details of the resident or investor who submitted the request.
                                        </p>

                                    </div>

                                </div>

                                <div className="property-requests-detail-grid">

                                    <div className="property-requests-detail-item">
                                        <span>Name</span>
                                        <strong>
                                            {
                                                selectedRequest.requesterName ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div className="property-requests-detail-item">
                                        <span>Email</span>
                                        <strong>
                                            {
                                                selectedRequest.requesterEmail ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div className="property-requests-detail-item">
                                        <span>Role</span>
                                        <strong>
                                            {
                                                selectedRequest.requesterRole ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </section>


                            {/* =====================================
                                PROPERTY INFORMATION
                            ===================================== */}

                            <section className="property-requests-review-section">

                                <div className="property-requests-section-heading">

                                    <div className="property-requests-section-icon">
                                        <Icon type="requests" />
                                    </div>

                                    <div>

                                        <h3>
                                            Property Information
                                        </h3>

                                        <p>
                                            Unit and property details connected to this request.
                                        </p>

                                    </div>

                                </div>

                                <div className="property-requests-detail-grid">

                                    <div className="property-requests-detail-item">
                                        <span>Unit / Property</span>
                                        <strong>
                                            {
                                                selectedRequest.propertyAddress ||
                                                selectedRequest.propertyId ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div className="property-requests-detail-item">
                                        <span>Property Type</span>
                                        <strong>
                                            {
                                                selectedRequest.propertyType ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div className="property-requests-detail-item">
                                        <span>Bedrooms</span>
                                        <strong>
                                            {
                                                selectedRequest.bedrooms ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div className="property-requests-detail-item">
                                        <span>Bathrooms</span>
                                        <strong>
                                            {
                                                selectedRequest.bathrooms ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div className="property-requests-detail-item">
                                        <span>Property Size</span>
                                        <strong>
                                            {
                                                selectedRequest.propertySize
                                                    ? `${selectedRequest.propertySize} m²`
                                                    : "—"
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </section>


                            {/* =====================================
                                REQUEST INFORMATION
                            ===================================== */}

                            <section className="property-requests-review-section">

                                <div className="property-requests-section-heading">

                                    <div className="property-requests-section-icon">
                                        <Icon type="approval" />
                                    </div>

                                    <div>

                                        <h3>
                                            Request Information
                                        </h3>

                                        <p>
                                            Details of the requested sale or rental listing.
                                        </p>

                                    </div>

                                </div>

                                <div className="property-requests-detail-grid">

                                    <div className="property-requests-detail-item">
                                        <span>Request Type</span>
                                        <strong>
                                            {
                                                formatRequestType(
                                                    selectedRequest.requestType
                                                )
                                            }
                                        </strong>
                                    </div>

                                    <div className="property-requests-detail-item">
                                        <span>Asking Price</span>
                                        <strong>
                                            {
                                                formatCurrency(
                                                    selectedRequest.askingPrice
                                                )
                                            }
                                        </strong>
                                    </div>

                                    <div className="property-requests-detail-item">
                                        <span>Rental Period</span>
                                        <strong>
                                            {
                                                selectedRequest.rentalPeriod ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </section>


                            {/* =====================================
                                FINANCIAL INFORMATION
                            ===================================== */}

                            <section className="property-requests-review-section">

                                <div className="property-requests-section-heading">

                                    <div className="property-requests-section-icon">
                                        <Icon type="analytics" />
                                    </div>

                                    <div>

                                        <h3>
                                            Financial Information
                                        </h3>

                                    </div>

                                </div>

                                <div className="property-requests-text-box">

                                    <p>
                                        {
                                            selectedRequest.financialInformation ||
                                            "No financial information provided."
                                        }
                                    </p>

                                </div>

                            </section>


                            {/* =====================================
                                ADDITIONAL DETAILS
                            ===================================== */}

                            <section className="property-requests-review-section">

                                <div className="property-requests-section-heading">

                                    <div className="property-requests-section-icon">
                                        <Icon type="requests" />
                                    </div>

                                    <div>

                                        <h3>
                                            Additional Details
                                        </h3>

                                    </div>

                                </div>

                                <div className="property-requests-text-box">

                                    <p>
                                        {
                                            selectedRequest.additionalDetails ||
                                            "No additional details provided."
                                        }
                                    </p>

                                </div>

                            </section>


                            {/* =====================================
                                CURRENT STATUS
                            ===================================== */}

                            <section className="property-requests-review-section">

                                <div className="property-requests-section-heading">

                                    <div className="property-requests-section-icon">
                                        <Icon type="pending" />
                                    </div>

                                    <div>

                                        <h3>
                                            Current Status
                                        </h3>

                                    </div>

                                </div>

                                <div className="property-requests-current-status">

                                    <span
                                        className={`property-requests-status ${getStatusClass(
                                            selectedRequest.status
                                        )}`}
                                    >
                                        {
                                            selectedRequest.status
                                        }
                                    </span>

                                    {selectedRequest.assignedAgentName && (

                                        <div className="property-requests-assigned-agent">

                                            <span>
                                                Assigned Estate Agent
                                            </span>

                                            <strong>
                                                {
                                                    selectedRequest.assignedAgentName
                                                }
                                            </strong>

                                        </div>

                                    )}

                                </div>

                            </section>


                            {/* =====================================
                                HOA DECISION
                            ===================================== */}

                            {selectedRequest.status ===
                                "Pending HOA Review" && (

                                <section className="property-requests-review-section property-requests-action-section">

                                    <div className="property-requests-section-heading">

                                        <div className="property-requests-section-icon">
                                            <Icon type="approval" />
                                        </div>

                                        <div>

                                            <h3>
                                                HOA Decision
                                            </h3>

                                            <p>
                                                Approve the request or provide a reason for rejection.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="property-requests-action-buttons">

                                        <button
                                            type="button"
                                            className="property-requests-primary-btn"
                                            onClick={
                                                handleApprove
                                            }
                                        >
                                            Approve Request
                                        </button>


                                        <button
                                            type="button"
                                            className="property-requests-secondary-btn"
                                            onClick={
                                                handleReject
                                            }
                                        >
                                            Reject Request
                                        </button>

                                    </div>


                                    <div className="property-requests-form-group">

                                        <label>
                                            Rejection Reason
                                        </label>

                                        <textarea
                                            value={
                                                rejectionReason
                                            }
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


                            {/* =====================================
                                ESTATE AGENT ASSIGNMENT
                            ===================================== */}

                            {selectedRequest.status ===
                                "Approved - Awaiting Agent Assignment" && (

                                <section className="property-requests-review-section property-requests-action-section">

                                    <div className="property-requests-section-heading">

                                        <div className="property-requests-section-icon">
                                            <Icon type="assigned" />
                                        </div>

                                        <div>

                                            <h3>
                                                Assign Estate Agent
                                            </h3>

                                            <p>
                                                Select an approved Estate Agent to manage this property listing.
                                            </p>

                                        </div>

                                    </div>

                                    {agents.length === 0 ? (

                                        <div className="property-requests-no-agents">

                                            <Icon type="residents" />

                                            <p>
                                                There are currently no approved Estate Agents available for assignment.
                                            </p>

                                        </div>

                                    ) : (

                                        <>

                                            <div className="property-requests-form-group">

                                                <label>
                                                    Select Estate Agent
                                                </label>

                                                <select
                                                    value={
                                                        selectedAgentId
                                                    }
                                                    onChange={(event) =>
                                                        setSelectedAgentId(
                                                            event.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="">
                                                        Select an Estate Agent
                                                    </option>

                                                    {agents.map(
                                                        (agent) => {

                                                            const agentName =
                                                                `${agent.firstName || ""} ${agent.lastName || ""}`
                                                                    .trim() ||
                                                                agent.name ||
                                                                agent.email ||
                                                                "Estate Agent";

                                                            return (

                                                                <option
                                                                    key={
                                                                        agent.id
                                                                    }
                                                                    value={
                                                                        agent.id
                                                                    }
                                                                >
                                                                    {
                                                                        agentName
                                                                    }
                                                                    {" — "}
                                                                    {
                                                                        agent.email ||
                                                                        ""
                                                                    }
                                                                </option>

                                                            );
                                                        }
                                                    )}

                                                </select>

                                            </div>


                                            <div className="property-requests-action-buttons">

                                                <button
                                                    type="button"
                                                    className="property-requests-primary-btn"
                                                    onClick={
                                                        handleAssignAgent
                                                    }
                                                >
                                                    Assign Estate Agent
                                                </button>

                                            </div>

                                        </>

                                    )}

                                </section>

                            )}


                            {/* =====================================
                                ASSIGNED REQUEST
                            ===================================== */}

                            {selectedRequest.status ===
                                "Assigned to Estate Agent" && (

                                <section className="property-requests-review-section">

                                    <div className="property-requests-section-heading">

                                        <div className="property-requests-section-icon">
                                            <Icon type="assigned" />
                                        </div>

                                        <div>

                                            <h3>
                                                Assigned Estate Agent
                                            </h3>

                                        </div>

                                    </div>

                                    <div className="property-requests-assignment-card">

                                        <div>
                                            <span>Agent</span>
                                            <strong>
                                                {
                                                    selectedRequest.assignedAgentName ||
                                                    "—"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Assigned</span>
                                            <strong>
                                                {
                                                    formatDate(
                                                        selectedRequest.assignedAt
                                                    )
                                                }
                                            </strong>
                                        </div>

                                    </div>

                                </section>

                            )}


                            {/* =====================================
                                REJECTED REQUEST
                            ===================================== */}

                            {selectedRequest.status ===
                                "Rejected" && (

                                <section className="property-requests-review-section">

                                    <div className="property-requests-section-heading">

                                        <div className="property-requests-section-icon">
                                            <Icon type="rejected" />
                                        </div>

                                        <div>

                                            <h3>
                                                Rejection Information
                                            </h3>

                                        </div>

                                    </div>

                                    <div className="property-requests-text-box property-requests-rejection-box">

                                        <p>
                                            {
                                                selectedRequest.rejectionReason ||
                                                "No rejection reason recorded."
                                            }
                                        </p>

                                    </div>

                                </section>

                            )}


                            {/* =====================================
                                REQUEST DATES
                            ===================================== */}

                            <section className="property-requests-review-section">

                                <div className="property-requests-section-heading">

                                    <div className="property-requests-section-icon">
                                        <Icon type="pending" />
                                    </div>

                                    <div>

                                        <h3>
                                            Request Dates
                                        </h3>

                                    </div>

                                </div>

                                <div className="property-requests-assignment-card">

                                    <div>
                                        <span>Created</span>
                                        <strong>
                                            {
                                                formatDate(
                                                    selectedRequest.createdAt
                                                )
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Last Updated</span>
                                        <strong>
                                            {
                                                formatDate(
                                                    selectedRequest.updatedAt
                                                )
                                            }
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
