import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./RegistrationRequests.css";

/* =========================================================
   ROLE HELPERS
========================================================= */

function normalizeRole(value) {
    const role = String(value || "").trim().toLowerCase();

    if (
        ["head admin", "head administrator", "headadministrator"].includes(role)
    ) {
        return "Head Admin";
    }

    if (
        ["hoa", "hoa admin", "hoa administrator", "administrator"].includes(role)
    ) {
        return "HOA Admin";
    }

    return value || "";
}

/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {
    try {
        const storedUser = localStorage.getItem("valoraUser");

        if (!storedUser) return null;

        const user = JSON.parse(storedUser);

        if (!user || typeof user !== "object") return null;

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
        console.error("Unable to load current VALORA user:", error);
        return null;
    }
}

function isApproved(user) {
    const status = String(user?.status || "").trim().toLowerCase();
    return status === "approved" || status === "active";
}

/* =========================================================
   STORED REGISTRATION DATA
========================================================= */

function getStoredUsers() {
    try {
        const storedUsers = JSON.parse(
            localStorage.getItem("valoraUsers") || "[]"
        );

        return Array.isArray(storedUsers) ? storedUsers : [];
    } catch (error) {
        console.error("Unable to load VALORA users:", error);
        return [];
    }
}

/* =========================================================
   REGISTRATION REQUESTS
========================================================= */

function RegistrationRequests() {
    const currentUser = getCurrentUser();

    const [users, setUsers] = useState(getStoredUsers);

    /* =====================================================
       KEEP REGISTRATION DATA IN SYNC
    ===================================================== */

    useEffect(() => {
        const refreshUsers = () => {
            setUsers(getStoredUsers());
        };

        const handleStorage = (event) => {
            if (!event.key || event.key === "valoraUsers") {
                refreshUsers();
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener("valoraUsersUpdated", refreshUsers);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("valoraUsersUpdated", refreshUsers);
        };
    }, []);

    /* =====================================================
       UPDATE USERS
    ===================================================== */

    function updateUsers(updatedUsers) {
        try {
            localStorage.setItem(
                "valoraUsers",
                JSON.stringify(updatedUsers)
            );

            setUsers(updatedUsers);

            // Notify other VALORA pages in the same browser tab.
            window.dispatchEvent(new Event("valoraUsersUpdated"));
        } catch (error) {
            console.error("Unable to save VALORA users:", error);
            window.alert("Unable to save the changes. Please try again.");
        }
    }

    /* =====================================================
       DERIVED DATA
    ===================================================== */

    const pendingUsers = users.filter(
        (user) =>
            String(user.status || "").trim().toLowerCase() === "pending"
    );

    const approvedUsers = users.filter((user) =>
        ["approved", "active"].includes(
            String(user.status || "").trim().toLowerCase()
        )
    );

    const rejectedUsers = users.filter(
        (user) =>
            String(user.status || "").trim().toLowerCase() === "rejected"
    );

    /* =====================================================
       APPROVE USER
    ===================================================== */

    function approveUser(userId) {
        const selectedUser = users.find((user) => user.id === userId);

        if (!selectedUser) {
            window.alert("This registration request could not be found.");
            return;
        }

        if (
            !window.confirm(
                `Approve the registration for ${
                    selectedUser.firstName ||
                    selectedUser.name ||
                    "this user"
                }?`
            )
        ) {
            return;
        }

        const updatedUsers = users.map((user) =>
            user.id === userId
                ? {
                      ...user,
                      status: "Approved",
                      approvedAt: new Date().toISOString(),
                      approvedBy: currentUser.email || currentUser.role,
                      rejectionReason: "",
                  }
                : user
        );

        updateUsers(updatedUsers);
        window.alert("Registration approved successfully.");
    }

    /* =====================================================
       REJECT USER
    ===================================================== */

    function rejectUser(userId) {
        const selectedUser = users.find((user) => user.id === userId);

        if (!selectedUser) {
            window.alert("This registration request could not be found.");
            return;
        }

        const reason = window.prompt(
            "Please enter a reason for rejecting this registration:"
        );

        if (reason === null) return;

        const rejectionReason =
            reason.trim() || "Registration request was not approved.";

        const updatedUsers = users.map((user) =>
            user.id === userId
                ? {
                      ...user,
                      status: "Rejected",
                      rejectionReason,
                      rejectedAt: new Date().toISOString(),
                      rejectedBy: currentUser.email || currentUser.role,
                  }
                : user
        );

        updateUsers(updatedUsers);
        window.alert("Registration rejected.");
    }

    /* =====================================================
       ACCESS CONTROL
    ===================================================== */

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isApproved(currentUser)) {
        return <Navigate to="/registration-pending" replace />;
    }

    if (!["Head Admin", "HOA Admin"].includes(currentUser.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    const isHeadAdmin = currentUser.role === "Head Admin";

    /* =====================================================
       PAGE CONTENT
    ===================================================== */

    return (
        <div className="registration-requests-page">
            {/* SHARED VALORA SIDEBAR */}
            <DashboardSidebar suppliedUser={currentUser} />

            {/* MAIN CONTENT */}
            <main className="registration-requests-main">
                <header className="registration-requests-topbar">
                    <div>
                        <p className="registration-requests-eyebrow">
                            {isHeadAdmin
                                ? "HEAD ADMINISTRATION"
                                : "HOA ADMINISTRATION"}
                        </p>

                        <h1>Registration Requests</h1>

                        <p className="registration-requests-subtitle">
                            Review and manage requests from users waiting
                            for VALORA account approval.
                        </p>
                    </div>

                    <div className="registration-requests-profile">
                        <div className="registration-requests-profile-avatar">
                            {currentUser.initials}
                        </div>

                        <div>
                            <strong>{currentUser.fullName}</strong>
                            <span>{currentUser.role}</span>
                        </div>
                    </div>
                </header>

                {/* STATISTICS */}
                <section className="registration-requests-stats">
                    <div className="registration-requests-stat-card">
                        <span>Pending Requests</span>
                        <strong>{pendingUsers.length}</strong>
                        <small>Awaiting review</small>
                    </div>

                    <div className="registration-requests-stat-card">
                        <span>Approved Accounts</span>
                        <strong>{approvedUsers.length}</strong>
                        <small>Approved or active users</small>
                    </div>

                    <div className="registration-requests-stat-card">
                        <span>Rejected Requests</span>
                        <strong>{rejectedUsers.length}</strong>
                        <small>Not approved</small>
                    </div>

                    <div className="registration-requests-stat-card">
                        <span>Total Registered</span>
                        <strong>{users.length}</strong>
                        <small>All registration records</small>
                    </div>
                </section>

                {/* PENDING REQUESTS */}
                <section className="registration-requests-panel registration-requests-large-panel">
                    <div className="registration-requests-panel-heading">
                        <div>
                            <h2>Pending Registration Requests</h2>
                            <p>
                                Review the user's details and selected
                                VALORA role before approving access.
                            </p>
                        </div>
                    </div>

                    {pendingUsers.length === 0 ? (
                        <div className="registration-requests-empty">
                            <div className="registration-requests-empty-icon">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    aria-hidden="true"
                                >
                                    <path d="M5 12.5L9.2 16.5L19 6.5" />
                                </svg>
                            </div>

                            <h3>No pending registrations</h3>
                            <p>
                                There are currently no registration
                                requests waiting for approval.
                            </p>
                        </div>
                    ) : (
                        <div className="registration-requests-table-container">
                            <table className="registration-requests-table">
                                <thead>
                                    <tr>
                                        <th>Applicant</th>
                                        <th>Email</th>
                                        <th>Requested Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pendingUsers.map((user, index) => (
                                        <tr
                                            key={
                                                user.id ||
                                                user.email ||
                                                index
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {user.firstName ||
                                                        user.firstname ||
                                                        ""}{" "}
                                                    {user.lastName ||
                                                        user.lastname ||
                                                        ""}
                                                    {!user.firstName &&
                                                        !user.firstname &&
                                                        !user.lastName &&
                                                        !user.lastname &&
                                                        (user.name ||
                                                            "Unnamed applicant")}
                                                </strong>
                                            </td>

                                            <td>{user.email || "—"}</td>

                                            <td>
                                                <span className="registration-requests-role">
                                                    {normalizeRole(user.role) ||
                                                        "Not specified"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="registration-requests-status pending">
                                                    Pending
                                                </span>
                                            </td>

                                            <td>
                                                <div className="registration-requests-actions">
                                                    <button
                                                        type="button"
                                                        className="registration-requests-primary-btn"
                                                        onClick={() =>
                                                            approveUser(user.id)
                                                        }
                                                    >
                                                        <svg
                                                            width="15"
                                                            height="15"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M5 12.5L9.2 16.5L19 6.5" />
                                                        </svg>
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="registration-requests-secondary-btn"
                                                        onClick={() =>
                                                            rejectUser(user.id)
                                                        }
                                                    >
                                                        <svg
                                                            width="15"
                                                            height="15"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M6 6L18 18" />
                                                            <path d="M18 6L6 18" />
                                                        </svg>
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* APPROVAL PROCESS */}
                <section className="registration-requests-information-grid">
                    <div className="registration-requests-panel">
                        <div className="registration-requests-panel-heading">
                            <div>
                                <h2>Approval Process</h2>
                                <p>How registration approval works.</p>
                            </div>
                        </div>

                        <div className="registration-requests-steps">
                            <div className="registration-requests-step">
                                <div className="registration-requests-step-number">
                                    1
                                </div>
                                <div>
                                    <strong>Registration</strong>
                                    <span>
                                        User submits their details and
                                        selects their requested role.
                                    </span>
                                </div>
                            </div>

                            <div className="registration-requests-step">
                                <div className="registration-requests-step-number">
                                    2
                                </div>
                                <div>
                                    <strong>Review</strong>
                                    <span>
                                        {isHeadAdmin
                                            ? "The Head Admin reviews the registration request."
                                            : "The HOA Admin reviews the registration request."}
                                    </span>
                                </div>
                            </div>

                            <div className="registration-requests-step">
                                <div className="registration-requests-step-number">
                                    3
                                </div>
                                <div>
                                    <strong>Decision</strong>
                                    <span>
                                        The administrator approves or
                                        rejects the request.
                                    </span>
                                </div>
                            </div>

                            <div className="registration-requests-step">
                                <div className="registration-requests-step-number">
                                    4
                                </div>
                                <div>
                                    <strong>Access</strong>
                                    <span>
                                        Approved users can sign in and
                                        access their assigned dashboard.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default RegistrationRequests;
