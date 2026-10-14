import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./ResidentComplaints.css";

const STORAGE_KEY = "valoraComplaints";
const UPDATED_EVENT = "valoraComplaintsUpdated";

const STATUSES = [
    "Submitted",
    "Acknowledged",
    "In Progress",
    "Resolved",
    "Cancelled",
];

function readUser() {
    try {
        return JSON.parse(localStorage.getItem("valoraUser") || "null");
    } catch {
        return null;
    }
}

function normaliseRole(value = "") {
    const role = String(value).trim().toLowerCase();

    if (role.includes("head admin")) return "Head Admin";

    if (
        role.includes("hoa") ||
        role.includes("homeowners association") ||
        role === "administrator"
    ) {
        return "HOA Admin";
    }

    return value || "User";
}

function getUserRole(user) {
    return normaliseRole(
        user?.role || user?.userType || user?.accountType || ""
    );
}

function getUserName(user) {
    if (!user) return "Administrator";

    return (
        user.fullName ||
        user.name ||
        [user.firstName || user.firstname, user.lastName || user.lastname]
            .filter(Boolean)
            .join(" ") ||
        user.email ||
        "Administrator"
    ).trim();
}

function loadComplaints() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) return [];

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) return [];

        return parsed.filter(
            (complaint) =>
                complaint &&
                typeof complaint === "object" &&
                complaint.id
        );
    } catch {
        return [];
    }
}

function saveComplaints(complaints) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    window.dispatchEvent(new Event(UPDATED_EVENT));
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getStatusClass(status) {
    const classes = {
        Submitted: "resident-complaints-status-submitted",
        Acknowledged: "resident-complaints-status-acknowledged",
        "In Progress": "resident-complaints-status-progress",
        Resolved: "resident-complaints-status-resolved",
        Cancelled: "resident-complaints-status-cancelled",
    };

    return classes[status] || classes.Submitted;
}

function getPriorityClass(priority) {
    return ["High", "Urgent"].includes(priority)
        ? "resident-complaints-priority-high"
        : "resident-complaints-priority-normal";
}

function Icon({ name, size = 19 }) {
    const icons = {
        total: (
            <>
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" />
            </>
        ),
        active: (
            <>
                <path d="M12 3 21 19H3L12 3Z" />
                <path d="M12 9v4" />
                <circle
                    cx="12"
                    cy="16"
                    r=".7"
                    fill="currentColor"
                    stroke="none"
                />
            </>
        ),
        resolved: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m7.5 12 3 3 6-6" />
            </>
        ),
        urgent: (
            <>
                <path d="M12 3 21 19H3L12 3Z" />
                <path d="M12 9v4" />
                <circle
                    cx="12"
                    cy="16"
                    r=".7"
                    fill="currentColor"
                    stroke="none"
                />
            </>
        ),
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icons[name] || icons.total}
        </svg>
    );
}

export default function ResidentComplaints() {
    const [user, setUser] = useState(readUser);
    const [complaints, setComplaints] = useState(loadComplaints);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const role = getUserRole(user);
    const userName = getUserName(user);
    const isAdmin = role === "HOA Admin" || role === "Head Admin";

    const refreshComplaints = useCallback(() => {
        setComplaints(loadComplaints());
    }, []);

    useEffect(() => {
        const refresh = () => {
            setUser(readUser());
            refreshComplaints();
        };

        window.addEventListener(UPDATED_EVENT, refresh);
        window.addEventListener("storage", refresh);
        window.addEventListener("focus", refresh);

        return () => {
            window.removeEventListener(UPDATED_EVENT, refresh);
            window.removeEventListener("storage", refresh);
            window.removeEventListener("focus", refresh);
        };
    }, [refreshComplaints]);

    const filteredComplaints = useMemo(() => {
        const term = search.trim().toLowerCase();

        const sorted = [...complaints].sort((a, b) => {
            const aDate = new Date(a.createdAt || a.date || 0).getTime();
            const bDate = new Date(b.createdAt || b.date || 0).getTime();

            return bDate - aDate;
        });

        if (!term) return sorted;

        return sorted.filter((complaint) =>
            [
                complaint.id,
                complaint.submitterName,
                complaint.submitterRole,
                complaint.unit,
                complaint.category,
                complaint.description,
                complaint.priority,
                complaint.status,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(term)
                )
        );
    }, [complaints, search]);

    const stats = useMemo(() => ({
        total: complaints.length,
        active: complaints.filter(
            (item) =>
                item.status !== "Resolved" &&
                item.status !== "Cancelled"
        ).length,
        resolved: complaints.filter(
            (item) => item.status === "Resolved"
        ).length,
        highPriority: complaints.filter(
            (item) => ["High", "Urgent"].includes(item.priority)
        ).length,
    }), [complaints]);

    function updateStatus(complaintId, nextStatus) {
        if (!isAdmin) {
            setError("You are not authorised to update complaint statuses.");
            return;
        }

        if (!STATUSES.includes(nextStatus)) return;

        const existing = loadComplaints();
        const targetExists = existing.some(
            (item) => item.id === complaintId
        );

        if (!targetExists) {
            setError(
                "This complaint could not be found. Refresh the page and try again."
            );
            refreshComplaints();
            return;
        }

        const timestamp = new Date().toISOString();

        const updated = existing.map((item) =>
            item.id === complaintId
                ? {
                    ...item,
                    status: nextStatus,
                    statusUpdatedAt: timestamp,
                    statusUpdatedBy: userName,
                }
                : item
        );

        try {
            saveComplaints(updated);
            setComplaints(loadComplaints());
            setError("");
            setNotice(
                `Complaint ${complaintId} updated to "${nextStatus}".`
            );
        } catch {
            setError(
                "The status could not be saved. Please check browser storage."
            );
        }
    }

    if (!user) {
        return (
            <div className="resident-complaints-layout">
                <DashboardSidebar />
                <main className="resident-complaints-main">
                    <section className="resident-complaints-panel resident-complaints-message">
                        <h2>Sign in required</h2>
                        <p>Please sign in to access community complaints.</p>
                    </section>
                </main>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="resident-complaints-layout">
                <DashboardSidebar />
                <main className="resident-complaints-main">
                    <section className="resident-complaints-panel resident-complaints-message">
                        <h2>Access restricted</h2>
                        <p>
                            This page is for HOA Admin and Head Admin users.
                        </p>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="resident-complaints-layout">
            <DashboardSidebar />

            <main className="resident-complaints-main">
                <header className="resident-complaints-top-bar">
                    <div>
                        <span className="resident-complaints-eyebrow">
                            COMMUNITY MANAGEMENT
                        </span>

                        <h2>Resident Complaints</h2>

                        <p>
                            Review complaints submitted across VALORA and
                            update their progress.
                        </p>
                    </div>

                    <div className="resident-complaints-admin-label">
                        <span className="resident-complaints-admin-avatar">
                            {userName
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part.charAt(0))
                                .join("")
                                .toUpperCase()}
                        </span>

                        <div>
                            <strong>{userName}</strong>
                            <span>{role}</span>
                        </div>
                    </div>
                </header>

                {notice && (
                    <div
                        className="resident-complaints-notice"
                        role="status"
                    >
                        <span>{notice}</span>
                        <button
                            type="button"
                            onClick={() => setNotice("")}
                            aria-label="Dismiss message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div
                        className="resident-complaints-error"
                        role="alert"
                    >
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                )}

                <section
                    className="resident-complaints-stat-cards"
                    aria-label="Complaint statistics"
                >
                    <StatCard
                        icon="total"
                        label="Total Complaints"
                        value={stats.total}
                        description="All submitted complaints"
                    />

                    <StatCard
                        icon="active"
                        label="Active Complaints"
                        value={stats.active}
                        description="Require attention"
                    />

                    <StatCard
                        icon="resolved"
                        label="Resolved"
                        value={stats.resolved}
                        description="Successfully resolved"
                    />

                    <StatCard
                        icon="urgent"
                        label="High Priority"
                        value={stats.highPriority}
                        description="High or urgent complaints"
                    />
                </section>

                <section className="resident-complaints-panel">
                    <div className="resident-complaints-panel-heading">
                        <div>
                            <h3>Complaint Management</h3>
                            <p>
                                Changes are saved to the shared complaint
                                records used by the other dashboards.
                            </p>
                        </div>

                        <span className="resident-complaints-record-count">
                            {complaints.length}{" "}
                            {complaints.length === 1 ? "Record" : "Records"}
                        </span>
                    </div>

                    <div className="resident-complaints-toolbar">
                        <label htmlFor="resident-complaints-search">
                            Search complaints
                        </label>

                        <input
                            id="resident-complaints-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search ID, submitter, category or status..."
                        />
                    </div>

                    <div className="resident-complaints-table-container">
                        <table className="resident-complaints-table">
                            <thead>
                                <tr>
                                    <th>Complaint ID</th>
                                    <th>Submitted By</th>
                                    <th>Unit</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Update Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredComplaints.map((complaint) => (
                                    <tr key={complaint.id}>
                                        <td>
                                            <strong className="resident-complaints-id">
                                                {complaint.id}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="resident-complaints-resident">
                                                <strong>
                                                    {complaint.submitterName ||
                                                        complaint.resident ||
                                                        "Unknown user"}
                                                </strong>

                                                <small>
                                                    {complaint.submitterRole ||
                                                        "Account role unavailable"}
                                                </small>
                                            </div>
                                        </td>

                                        <td>{complaint.unit || "—"}</td>

                                        <td>{complaint.category || "Other"}</td>

                                        <td>
                                            <span
                                                className={getPriorityClass(
                                                    complaint.priority
                                                )}
                                            >
                                                {complaint.priority || "Low"}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(
                                                complaint.createdAt ||
                                                complaint.date
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    complaint.status
                                                )}
                                            >
                                                {complaint.status || "Submitted"}
                                            </span>
                                        </td>

                                        <td>
                                            <select
                                                className="resident-complaints-status-select"
                                                aria-label={`Update status for ${complaint.id}`}
                                                value={
                                                    STATUSES.includes(
                                                        complaint.status
                                                    )
                                                        ? complaint.status
                                                        : "Submitted"
                                                }
                                                onChange={(event) =>
                                                    updateStatus(
                                                        complaint.id,
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                {STATUSES.map((status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}

                                {filteredComplaints.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="resident-complaints-empty"
                                        >
                                            {search
                                                ? "No complaints match your search."
                                                : "No complaints have been submitted yet. New submissions will appear here automatically."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="resident-complaints-panel">
                    <div className="resident-complaints-panel-heading">
                        <div>
                            <h3>Complaint Management Process</h3>
                            <p>
                                Monitor each complaint from submission through
                                resolution or cancellation.
                            </p>
                        </div>
                    </div>

                    <div className="resident-complaints-status-flow">
                        {[
                            {
                                number: "01",
                                title: "Submitted",
                                description: "A user submits a complaint.",
                            },
                            {
                                number: "02",
                                title: "Acknowledged",
                                description: "An administrator acknowledges it.",
                            },
                            {
                                number: "03",
                                title: "In Progress",
                                description: "The issue is being addressed.",
                            },
                            {
                                number: "04",
                                title: "Resolved",
                                description: "The reported issue is resolved.",
                            },
                        ].map((step, index, steps) => (
                            <React.Fragment key={step.number}>
                                <div className="resident-complaints-status-step">
                                    <div className="resident-complaints-step-number">
                                        {step.number}
                                    </div>

                                    <strong>{step.title}</strong>
                                    <p>{step.description}</p>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="resident-complaints-flow-line" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, description }) {
    return (
        <div className="resident-complaints-stat-card">
            <div className="resident-complaints-stat-icon">
                <Icon name={icon} />
            </div>

            <div className="resident-complaints-stat-content">
                <p>{label}</p>
                <h3>{value}</h3>
                <small>{description}</small>
            </div>
        </div>
    );
}
