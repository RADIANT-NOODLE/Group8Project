import React, { useCallback, useEffect, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./Maintenance.css";

const MAINTENANCE_STORAGE_KEY = "valoraMaintenanceRequests";

const STATUS_OPTIONS = [
    "Submitted",
    "Acknowledged",
    "In Progress",
    "Scheduled",
    "Resolved",
    "Cancelled",
];

const CATEGORY_OPTIONS = [
    "General",
    "Plumbing",
    "Electrical",
    "Security",
    "Landscaping",
    "Cleaning",
    "Structural",
    "Other",
];

/* =========================================================
   USER AND ROLE HELPERS
========================================================= */

function normalizeRole(value) {
    const role = String(value || "").trim().toLowerCase();

    if (
        ["head admin", "head administrator", "headadministrator"].includes(role)
    ) {
        return "Head Admin";
    }

    if (
        ["hoa", "hoa admin", "hoa administrator", "administrator", "admin"].includes(role)
    ) {
        return "HOA Admin";
    }

    if (["resident", "property owner"].includes(role)) {
        return "Resident";
    }

    if (["investor", "buyer"].includes(role)) {
        return "Investor";
    }

    if (["estate agent", "agent"].includes(role)) {
        return "Estate Agent";
    }

    return value || "";
}

function getCurrentUser() {
    try {
        const stored = localStorage.getItem("valoraUser");

        if (!stored) return null;

        const user = JSON.parse(stored);

        if (!user || typeof user !== "object") return null;

        const firstName =
            user.firstName || user.firstname || user.first_name || "";

        const lastName =
            user.lastName || user.lastname || user.last_name || "";

        const fullName =
            user.fullName ||
            user.name ||
            `${firstName} ${lastName}`.trim() ||
            "VALORA User";

        return {
            ...user,
            role: normalizeRole(
                user.role || user.userType || user.accountType
            ),
            fullName,
            userId: String(
                user.id ||
                user.userId ||
                user.email ||
                user.username ||
                ""
            ).trim().toLowerCase(),
        };
    } catch (error) {
        console.error("Unable to read VALORA user:", error);
        return null;
    }
}

function getUserName(user) {
    if (!user) return "";

    return (
        user.fullName ||
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "VALORA User"
    );
}

function getRequestOwnerId(request) {
    return String(
        request.reportedById ||
        request.userId ||
        request.createdById ||
        ""
    ).trim().toLowerCase();
}

/* =========================================================
   SHARED MAINTENANCE STORAGE

   No hardcoded maintenance requests are created.
   All requests must come from shared localStorage.
========================================================= */

function loadMaintenanceRequests() {
    try {
        const stored = localStorage.getItem(MAINTENANCE_STORAGE_KEY);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
            return [];
        }

        // Remove the previous five demo records if they were saved.
        const demoIds = [
            "MNT-001",
            "MNT-002",
            "MNT-003",
            "MNT-004",
            "MNT-005",
        ];

        const actualRequests = parsed.filter(
            (request) => !demoIds.includes(request.id)
        );

        if (actualRequests.length !== parsed.length) {
            localStorage.setItem(
                MAINTENANCE_STORAGE_KEY,
                JSON.stringify(actualRequests)
            );
        }

        return actualRequests;
    } catch (error) {
        console.error("Unable to load maintenance requests:", error);
        return [];
    }
}

function saveMaintenanceRequests(requests) {
    try {
        localStorage.setItem(
            MAINTENANCE_STORAGE_KEY,
            JSON.stringify(requests)
        );

        // Notify other components in this same tab.
        window.dispatchEvent(
            new CustomEvent("valoraMaintenanceUpdated", {
                detail: requests,
            })
        );

        return true;
    } catch (error) {
        console.error("Unable to save maintenance requests:", error);
        alert("Unable to save maintenance changes. Please try again.");
        return false;
    }
}

function generateRequestId(requests) {
    const highest = requests.reduce((max, request) => {
        const number = parseInt(
            String(request.id || "").replace("MNT-", ""),
            10
        );

        return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);

    return `MNT-${String(highest + 1).padStart(3, "0")}`;
}

function getCurrentDate() {
    return new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, size = 19 }) {
    const props = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        focusable: false,
    };

    const icons = {
        wrench: (
            <>
                <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-6.4 6.4a2 2 0 0 0 2.8 2.8l6.4-6.4a4 4 0 0 0 5.6-5.6l-2.2 2.2-2.8-2.8z" />
            </>
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 9h18" />
            </>
        ),
        check: (
            <>
                <path d="M20 6L9 17l-5-5" />
            </>
        ),
        providers: (
            <>
                <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
            </>
        ),
        star: (
            <>
                <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14M5 12h14" />
            </>
        ),
        eye: (
            <>
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <circle cx="12" cy="12" r="2.5" />
            </>
        ),
        close: (
            <>
                <path d="M6 6l12 12M18 6L6 18" />
            </>
        ),
        send: (
            <>
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </>
        ),
    };

    return <svg {...props}>{icons[name] || null}</svg>;
}

/* =========================================================
   MAINTENANCE PAGE
========================================================= */

function Maintenance() {
    const [currentUser, setCurrentUser] = useState(getCurrentUser);
    const [maintenanceRequests, setMaintenanceRequests] = useState(
        loadMaintenanceRequests
    );

    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [showAddRequest, setShowAddRequest] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [formData, setFormData] = useState({
        issue: "",
        category: "General",
        location: "",
        description: "",
        priority: "Medium",
    });

    const userRole = normalizeRole(
        currentUser?.role ||
        currentUser?.userType ||
        currentUser?.accountType
    );

    const isHOAAdmin = userRole === "HOA Admin";
    const isHeadAdmin = userRole === "Head Admin";
    const isAdmin = isHOAAdmin || isHeadAdmin;
    const isResident = userRole === "Resident";

    const currentUserName = getUserName(currentUser);

    /* =====================================================
       SYNCHRONIZE SHARED DATA
    ===================================================== */

    const refreshRequests = useCallback(() => {
        setMaintenanceRequests(loadMaintenanceRequests());
    }, []);

    useEffect(() => {
        function handleStorage(event) {
            if (event.key === MAINTENANCE_STORAGE_KEY) {
                refreshRequests();
            }

            if (event.key === "valoraUser") {
                setCurrentUser(getCurrentUser());
                refreshRequests();
            }
        }

        function handleSameTabUpdate(event) {
            const incoming = event.detail;

            if (Array.isArray(incoming)) {
                setMaintenanceRequests((previous) =>
                    JSON.stringify(previous) === JSON.stringify(incoming)
                        ? previous
                        : incoming
                );
            } else {
                refreshRequests();
            }
        }

        function handleFocus() {
            setCurrentUser(getCurrentUser());
            refreshRequests();
        }

        window.addEventListener("storage", handleStorage);
        window.addEventListener(
            "valoraMaintenanceUpdated",
            handleSameTabUpdate
        );
        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(
                "valoraMaintenanceUpdated",
                handleSameTabUpdate
            );
            window.removeEventListener("focus", handleFocus);
        };
    }, [refreshRequests]);

    /* =====================================================
       PERMISSIONS AND REQUEST VISIBILITY
    ===================================================== */

    const roleBasedRequests = isAdmin
        ? maintenanceRequests
        : isResident
            ? maintenanceRequests.filter((request) => {
                const ownerId = getRequestOwnerId(request);

                if (ownerId && currentUser?.userId) {
                    return ownerId === currentUser.userId;
                }

                return (
                    String(request.reportedBy || "").trim().toLowerCase() ===
                    currentUserName.trim().toLowerCase()
                );
            })
            : [];

    const filteredRequests = roleBasedRequests.filter((request) => {
        const matchesStatus =
            statusFilter === "All" || request.status === statusFilter;

        const matchesPriority =
            priorityFilter === "All" || request.priority === priorityFilter;

        return matchesStatus && matchesPriority;
    });

    const totalRequests = roleBasedRequests.length;

    const activeRequests = roleBasedRequests.filter(
        (request) =>
            request.status !== "Resolved" &&
            request.status !== "Cancelled"
    ).length;

    const scheduledRequests = roleBasedRequests.filter(
        (request) => request.status === "Scheduled"
    ).length;

    const resolvedRequests = roleBasedRequests.filter(
        (request) => request.status === "Resolved"
    ).length;

    const highPriorityRequests = roleBasedRequests.filter(
        (request) => request.priority === "High"
    ).length;

    const inProgressRequests = roleBasedRequests.filter(
        (request) => request.status === "In Progress"
    ).length;

    /* =====================================================
       FORM HANDLERS
    ===================================================== */

    function handleFormChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function handleOpenAddRequest() {
        setFormData({
            issue: "",
            category: "General",
            location: "",
            description: "",
            priority: "Medium",
        });

        setShowAddRequest(true);
    }

    function handleSubmitRequest(event) {
        event.preventDefault();

        if (!currentUser) {
            alert("Please log in before submitting a maintenance request.");
            return;
        }

        if (!isResident && !isAdmin) {
            alert("Only residents and administrators can submit maintenance requests.");
            return;
        }

        if (
            !formData.issue.trim() ||
            !formData.location.trim() ||
            !formData.description.trim()
        ) {
            alert("Please complete all required fields.");
            return;
        }

        // Load the latest shared list before adding a new request.
        const latestRequests = loadMaintenanceRequests();

        const newRequest = {
            id: generateRequestId(latestRequests),
            issue: formData.issue.trim(),
            location: formData.location.trim(),
            reportedBy: currentUserName,
            reportedById: currentUser.userId || "",
            userId: currentUser.userId || "",
            provider: "Not Assigned",
            priority: formData.priority,
            status: "Submitted",
            date: getCurrentDate(),
            category: formData.category,
            description: formData.description.trim(),
        };

        const updatedRequests = [newRequest, ...latestRequests];

        if (!saveMaintenanceRequests(updatedRequests)) return;

        setMaintenanceRequests(updatedRequests);
        setShowAddRequest(false);

        setFormData({
            issue: "",
            category: "General",
            location: "",
            description: "",
            priority: "Medium",
        });

        alert(`${newRequest.id} has been submitted successfully.`);
    }

    /* =====================================================
       ADMIN STATUS UPDATES
    ===================================================== */

    function handleStatusChange(id, newStatus) {
        if (!isAdmin) {
            alert("Only the HOA Admin or Head Admin can update request status.");
            return;
        }

        if (!STATUS_OPTIONS.includes(newStatus)) return;

        const latestRequests = loadMaintenanceRequests();

        const updatedRequests = latestRequests.map((request) =>
            request.id === id
                ? { ...request, status: newStatus }
                : request
        );

        if (!saveMaintenanceRequests(updatedRequests)) return;

        setMaintenanceRequests(updatedRequests);

        setSelectedRequest((previous) =>
            previous?.id === id
                ? { ...previous, status: newStatus }
                : previous
        );
    }

    function handleViewRequest(request) {
        setSelectedRequest(request);
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="maintenance-page">
            <DashboardSidebar />

            <main className="maintenance-main">
                <header className="maintenance-header">
                    <div>
                        <p className="maintenance-eyebrow">
                            {isHeadAdmin
                                ? "HEAD ADMINISTRATION"
                                : isHOAAdmin
                                    ? "HOA ADMINISTRATION"
                                    : "MY MAINTENANCE"}
                        </p>

                        <h1>Maintenance</h1>

                        <p>
                            {isAdmin
                                ? "Manage community maintenance requests and track resolution progress."
                                : "Submit and track your maintenance requests."}
                        </p>
                    </div>
                </header>

                {!currentUser && (
                    <div className="maintenance-panel maintenance-access-message">
                        Please log in to access maintenance services.
                    </div>
                )}

                {currentUser && !isAdmin && !isResident && (
                    <div className="maintenance-panel maintenance-access-message">
                        Maintenance requests are available to residents and administrators.
                        You can view the Service Provider Directory below.
                    </div>
                )}

                {/* STATISTICS */}

                <section className="maintenance-stat-grid">
                    <div className="maintenance-stat-card">
                        <div className="maintenance-stat-icon purple">
                            <Icon name="wrench" />
                        </div>

                        <div>
                            <span>Total Requests</span>
                            <strong>{totalRequests}</strong>
                            <small>
                                {isAdmin ? "Community requests" : "Your requests"}
                            </small>
                        </div>
                    </div>

                    <div className="maintenance-stat-card">
                        <div className="maintenance-stat-icon orange">
                            <Icon name="clock" />
                        </div>

                        <div>
                            <span>Active Requests</span>
                            <strong>{activeRequests}</strong>
                            <small>Require attention</small>
                        </div>
                    </div>

                    <div className="maintenance-stat-card">
                        <div className="maintenance-stat-icon blue">
                            <Icon name="calendar" />
                        </div>

                        <div>
                            <span>Scheduled</span>
                            <strong>{scheduledRequests}</strong>
                            <small>Upcoming maintenance</small>
                        </div>
                    </div>

                    <div className="maintenance-stat-card">
                        <div className="maintenance-stat-icon green">
                            <Icon name="check" />
                        </div>

                        <div>
                            <span>Resolved</span>
                            <strong>{resolvedRequests}</strong>
                            <small>Completed requests</small>
                        </div>
                    </div>
                </section>

                {/* REQUEST MANAGEMENT */}

                {(isAdmin || isResident) && (
                    <section className="maintenance-panel maintenance-large-panel">
                        <div className="maintenance-panel-heading">
                            <div>
                                <h2>Maintenance Requests</h2>
                                <p>
                                    {isAdmin
                                        ? "Review and manage community maintenance issues."
                                        : "View and track your submitted maintenance issues."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="maintenance-primary-btn"
                                onClick={handleOpenAddRequest}
                            >
                                <Icon name="plus" size={17} />
                                <span>Add Request</span>
                            </button>
                        </div>

                        {/* ADD REQUEST FORM */}

                        {showAddRequest && (
                            <div className="maintenance-add-form">
                                <div className="maintenance-form-header">
                                    <div>
                                        <p className="maintenance-eyebrow">
                                            NEW REQUEST
                                        </p>

                                        <h2>Submit Maintenance Request</h2>

                                        <p>
                                            Enter the details of the maintenance issue you want to report.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="maintenance-modal-close"
                                        onClick={() => setShowAddRequest(false)}
                                        aria-label="Close form"
                                    >
                                        <Icon name="close" size={18} />
                                    </button>
                                </div>

                                <form
                                    className="maintenance-form"
                                    onSubmit={handleSubmitRequest}
                                >
                                    <div className="maintenance-form-group">
                                        <label htmlFor="maintenance-issue">
                                            Issue *
                                        </label>

                                        <input
                                            id="maintenance-issue"
                                            name="issue"
                                            type="text"
                                            value={formData.issue}
                                            onChange={handleFormChange}
                                            placeholder="e.g. Water leak"
                                            required
                                        />
                                    </div>

                                    <div className="maintenance-form-row">
                                        <div className="maintenance-form-group">
                                            <label htmlFor="maintenance-category">
                                                Category *
                                            </label>

                                            <select
                                                id="maintenance-category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleFormChange}
                                            >
                                                {CATEGORY_OPTIONS.map((category) => (
                                                    <option
                                                        key={category}
                                                        value={category}
                                                    >
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="maintenance-form-group">
                                            <label htmlFor="maintenance-priority">
                                                Priority *
                                            </label>

                                            <select
                                                id="maintenance-priority"
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleFormChange}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="maintenance-form-group">
                                        <label htmlFor="maintenance-location">
                                            Location / Unit *
                                        </label>

                                        <input
                                            id="maintenance-location"
                                            name="location"
                                            type="text"
                                            value={formData.location}
                                            onChange={handleFormChange}
                                            placeholder="e.g. Unit 15 / Bathroom"
                                            required
                                        />
                                    </div>

                                    <div className="maintenance-form-group">
                                        <label htmlFor="maintenance-description">
                                            Description *
                                        </label>

                                        <textarea
                                            id="maintenance-description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            placeholder="Describe the issue..."
                                            rows="5"
                                            required
                                        />
                                    </div>

                                    <div className="maintenance-form-actions">
                                        <button
                                            type="button"
                                            className="maintenance-secondary-btn"
                                            onClick={() => setShowAddRequest(false)}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="maintenance-primary-btn"
                                        >
                                            <Icon name="send" size={16} />
                                            Submit Request
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* REQUEST TABLE */}

                        {!showAddRequest && (
                            <>
                                <div className="maintenance-filters">
                                    <div className="maintenance-filter-group">
                                        <label htmlFor="maintenance-status-filter">
                                            Status
                                        </label>

                                        <select
                                            id="maintenance-status-filter"
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(event.target.value)
                                            }
                                        >
                                            <option value="All">All Statuses</option>

                                            {STATUS_OPTIONS.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="maintenance-filter-group">
                                        <label htmlFor="maintenance-priority-filter">
                                            Priority
                                        </label>

                                        <select
                                            id="maintenance-priority-filter"
                                            value={priorityFilter}
                                            onChange={(event) =>
                                                setPriorityFilter(event.target.value)
                                            }
                                        >
                                            <option value="All">All Priorities</option>
                                            <option value="High">High Priority</option>
                                            <option value="Medium">Medium Priority</option>
                                            <option value="Low">Low Priority</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="maintenance-table-wrapper">
                                    <table className="maintenance-table">
                                        <thead>
                                            <tr>
                                                <th>Request</th>
                                                <th>Location</th>
                                                <th>Reported By</th>
                                                <th>Service Provider</th>
                                                <th>Priority</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredRequests.length > 0 ? (
                                                filteredRequests.map((request) => (
                                                    <tr key={request.id}>
                                                        <td>
                                                            <div className="maintenance-request-cell">
                                                                <strong>
                                                                    {request.issue}
                                                                </strong>

                                                                <small>{request.id}</small>
                                                            </div>
                                                        </td>

                                                        <td>{request.location}</td>
                                                        <td>{request.reportedBy}</td>

                                                        <td>
                                                            {request.provider || "Not Assigned"}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`maintenance-badge priority-${String(request.priority || "Medium").toLowerCase()}`}
                                                            >
                                                                {request.priority || "Medium"}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`maintenance-badge status-${String(request.status || "Submitted").toLowerCase().replace(/\s+/g, "-")}`}
                                                            >
                                                                {request.status || "Submitted"}
                                                            </span>
                                                        </td>

                                                        <td>{request.date}</td>

                                                        <td>
                                                            <div className="maintenance-actions">
                                                                <button
                                                                    type="button"
                                                                    className="maintenance-view-btn"
                                                                    onClick={() =>
                                                                        handleViewRequest(request)
                                                                    }
                                                                >
                                                                    <Icon name="eye" size={15} />
                                                                    View
                                                                </button>

                                                                {isAdmin && (
                                                                    <select
                                                                        className="maintenance-status-select"
                                                                        aria-label={`Update status for ${request.id}`}
                                                                        value={request.status}
                                                                        onChange={(event) =>
                                                                            handleStatusChange(
                                                                                request.id,
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                    >
                                                                        {STATUS_OPTIONS.map((status) => (
                                                                            <option
                                                                                key={status}
                                                                                value={status}
                                                                            >
                                                                                {status}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="8"
                                                        className="maintenance-empty"
                                                    >
                                                        {isResident
                                                            ? "You have no maintenance requests yet."
                                                            : "No maintenance requests found."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </section>
                )}

                
            </main>

            {/* REQUEST DETAILS MODAL */}

            {selectedRequest && (
                <div
                    className="maintenance-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedRequest(null);
                        }
                    }}
                >
                    <div
                        className="maintenance-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="maintenance-modal-title"
                    >
                        <div className="maintenance-form-header">
                            <div>
                                <p className="maintenance-eyebrow">
                                    {selectedRequest.id}
                                </p>

                                <h2 id="maintenance-modal-title">
                                    {selectedRequest.issue}
                                </h2>

                                <p>Maintenance request details</p>
                            </div>

                            <button
                                type="button"
                                className="maintenance-modal-close"
                                onClick={() => setSelectedRequest(null)}
                                aria-label="Close"
                            >
                                <Icon name="close" size={18} />
                            </button>
                        </div>

                        <div className="maintenance-request-details">
                            <div>
                                <span>Category</span>
                                <strong>{selectedRequest.category}</strong>
                            </div>

                            <div>
                                <span>Priority</span>
                                <strong>{selectedRequest.priority}</strong>
                            </div>

                            <div>
                                <span>Location</span>
                                <strong>{selectedRequest.location}</strong>
                            </div>

                            <div>
                                <span>Reported By</span>
                                <strong>{selectedRequest.reportedBy}</strong>
                            </div>

                            <div>
                                <span>Service Provider</span>
                                <strong>
                                    {selectedRequest.provider || "Not Assigned"}
                                </strong>
                            </div>

                            <div>
                                <span>Date</span>
                                <strong>{selectedRequest.date}</strong>
                            </div>

                            <div className="maintenance-request-detail-full">
                                <span>Status</span>
                                <strong>{selectedRequest.status}</strong>
                            </div>

                            <div className="maintenance-request-detail-full">
                                <span>Description</span>
                                <p>{selectedRequest.description}</p>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="maintenance-admin-status">
                                <label htmlFor="maintenance-view-status">
                                    Update Status
                                </label>

                                <select
                                    id="maintenance-view-status"
                                    value={selectedRequest.status}
                                    onChange={(event) =>
                                        handleStatusChange(
                                            selectedRequest.id,
                                            event.target.value
                                        )
                                    }
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="maintenance-form-actions">
                            <button
                                type="button"
                                className="maintenance-secondary-btn"
                                onClick={() => setSelectedRequest(null)}
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

export default Maintenance;
