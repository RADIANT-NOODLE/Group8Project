import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "../../services/authService.js";
import ConfirmPrompt from "../../components/ConfirmPrompt";
import InlineMessage from "../../components/InlineMessage";
import "./RegistrationRequests.css";


/* =========================================================
   ICONS
========================================================= */

function Icon({ name, size = 18 }) {

    const commonProps = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": "true",
    };

    const icons = {

        dashboard: (
            <svg {...commonProps}>
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
        ),

        requests: (
            <svg {...commonProps}>
                <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 3.5V5.5H15V3.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8.5 10H15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8.5 14H15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8.5 18H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),

        users: (
            <svg {...commonProps}>
                <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M3.5 20C3.8 16.6 5.7 14.5 9 14.5C12.3 14.5 14.2 16.6 14.5 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="17" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M15.5 14.8C18.2 14.7 20 16.4 20.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),

        property: (
            <svg {...commonProps}>
                <path d="M3 10.5L12 3L21 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.5 9.5V20H18.5V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 20V14H15V20" stroke="currentColor" strokeWidth="1.8" />
            </svg>
        ),

        valuation: (
            <svg {...commonProps}>
                <path d="M4 19L9 14L12 17L20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 8H20V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 21H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),

        complaints: (
            <svg {...commonProps}>
                <path d="M6 4H18C19.1 4 20 4.9 20 6V15C20 16.1 19.1 17 18 17H11L7 20V17H6C4.9 17 4 16.1 4 15V6C4 4.9 4.9 4 6 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M8 8H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8 12H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),

        providers: (
            <svg {...commonProps}>
                <path d="M14.5 6.5L17.5 3.5L20.5 6.5L17.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M13.5 7.5L16.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 20L9 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8 21L3 16L10.5 8.5C11.3 7.7 12.7 7.7 13.5 8.5L15.5 10.5C16.3 11.3 16.3 12.7 15.5 13.5L8 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
        ),

        announcements: (
            <svg {...commonProps}>
                <path d="M4 10V14C4 15.1 4.9 16 6 16H8L10 20H12L11 16H13L19 19V5L13 8H6C4.9 8 4 8.9 4 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
        ),

        maintenance: (
            <svg {...commonProps}>
                <path d="M14.5 5.5C13.7 4.7 12.5 4.3 11.3 4.5L14 7.2L11.2 10L8.5 7.3C8.3 8.5 8.7 9.7 9.5 10.5C10.6 11.6 12.3 11.9 13.7 11.3L19.5 17.1C20.3 17.9 20.3 19.1 19.5 19.9C18.7 20.7 17.5 20.7 16.7 19.9L10.9 14.1C10.3 15.5 8.6 16.2 7.2 15.6C5.8 15 5.2 13.3 5.8 11.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),

        ai: (
            <svg {...commonProps}>
                <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 2V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15 2V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9 19V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15 19V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M2 9H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M19 9H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M2 15H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M19 15H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="10" cy="11" r="1" fill="currentColor" />
                <circle cx="14" cy="11" r="1" fill="currentColor" />
                <path d="M9.5 14C10.2 14.7 13.8 14.7 14.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),

        analytics: (
            <svg {...commonProps}>
                <path d="M4 19V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M10 19V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M16 19V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M22 19V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M3 21H23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),

        profile: (
            <svg {...commonProps}>
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 20C5.5 16.2 8 14.5 12 14.5C16 14.5 18.5 16.2 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),

        logout: (
            <svg {...commonProps}>
                <path d="M10 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M14 8L18 12L14 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),

        check: (
            <svg {...commonProps}>
                <path d="M5 12.5L9.2 16.5L19 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),

        close: (
            <svg {...commonProps}>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),

    };

    return icons[name] || null;
}


/*
Account administration is served by the VALORA API in a later phase
(connection plan, Phase 4 item 1). No local account store exists.
*/
function loadManagedAccounts() {

    return [];

}


function RegistrationRequests() {

    const navigate = useNavigate();


    /* =========================================================
       LOAD USERS SAFELY
    ========================================================= */

    const getStoredUsers = () => {

        try {

            return loadManagedAccounts();

        } catch (error) {

            console.error(
                "Unable to load VALORA users:",
                error
            );

            return [];

        }

    };


    const [users, setUsers] = useState(
        getStoredUsers()
    );


    /* Result message and the request awaiting confirmation.
       Both used to be browser dialogs (alert/prompt). */

    const [notice, setNotice] = useState(null);

    const [pendingId, setPendingId] = useState(null);

    const [pendingReason, setPendingReason] = useState("");


    /* =========================================================
       PENDING USERS
    ========================================================= */

    const pendingUsers = users.filter(
        (user) => user.status === "Pending"
    );


    /* =========================================================
       UPDATE USERS
    ========================================================= */

    function updateUsers(updatedUsers) {

        setUsers(updatedUsers);

    }


    function showNotice(text, tone = "success") {

        setNotice({ text, tone });

    }


    /* =========================================================
       APPROVE USER
    ========================================================= */

    function approveUser(userId) {

        const updatedUsers = users.map((user) =>
            user.id === userId
                ? {
                      ...user,
                      status: "Approved",
                      approvedAt:
                          new Date().toISOString(),
                      rejectionReason: "",
                  }
                : user
        );

        updateUsers(updatedUsers);

        showNotice(
            "Registration approved successfully."
        );

    }


    /* =========================================================
       REJECT USER
    ========================================================= */

    function requestReject(userId) {

        setPendingId(userId);
        setPendingReason("");
        setNotice(null);

    }

    function confirmReject() {

        const reason = pendingReason.trim() ||
            "Registration request was not approved.";

        const updatedUsers = users.map((user) =>
            user.id === pendingId
                ? {
                      ...user,
                      status: "Rejected",
                      rejectionReason: reason,
                  }
                : user
        );

        updateUsers(updatedUsers);

        setPendingId(null);
        setPendingReason("");
        showNotice(
            "Registration rejected."
        );

    }


    /* =========================================================
       LOGOUT
    ========================================================= */

    function logout() {

        authService.logout();

        navigate("/login");

    }


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="registration-requests-page">

            {/* =================================================
                SIDEBAR
            ================================================== */}

            <aside className="registration-requests-sidebar">

                <div className="registration-requests-brand">

                    <img
                        src="/assets/valora-logo.svg"
                        alt="VALORA Logo"
                    />

                    <p>
                        Property & Community Intelligence
                    </p>

                </div>


                <nav className="registration-requests-nav">

                    <div className="registration-requests-nav-heading">
                        HEAD ADMIN
                    </div>

                    <Link to="/head-admin">

                        <Icon
                            name="dashboard"
                            size={18}
                        />

                        <span>
                            Dashboard
                        </span>

                    </Link>


                    <Link
                        to="/registration-requests"
                        className="active"
                    >

                        <Icon
                            name="requests"
                            size={18}
                        />

                        <span>
                            Registration Requests
                        </span>

                    </Link>


                    <Link to="/user-management">

                        <Icon
                            name="users"
                            size={18}
                        />

                        <span>
                            User Management
                        </span>

                    </Link>


                    <div className="registration-requests-nav-heading">
                        SYSTEM MANAGEMENT
                    </div>


                    <Link to="/property">

                        <Icon
                            name="property"
                            size={18}
                        />

                        <span>
                            Properties
                        </span>

                    </Link>


                    <Link to="/valuation">

                        <Icon
                            name="valuation"
                            size={18}
                        />

                        <span>
                            AI Valuation
                        </span>

                    </Link>


                    <Link to="/complaints">

                        <Icon
                            name="complaints"
                            size={18}
                        />

                        <span>
                            Complaints
                        </span>

                    </Link>


                    <Link to="/providers">

                        <Icon
                            name="providers"
                            size={18}
                        />

                        <span>
                            Service Providers
                        </span>

                    </Link>


                    <Link to="/announcements">

                        <Icon
                            name="announcements"
                            size={18}
                        />

                        <span>
                            Announcements
                        </span>

                    </Link>


                    <Link to="/maintenance">

                        <Icon
                            name="maintenance"
                            size={18}
                        />

                        <span>
                            Maintenance
                        </span>

                    </Link>


                    <Link to="/ai-training-data">

                        <Icon
                            name="ai"
                            size={18}
                        />

                        <span>
                            AI Training Data
                        </span>

                    </Link>


                    <Link to="/community-analytics">

                        <Icon
                            name="analytics"
                            size={18}
                        />

                        <span>
                            Community Analytics
                        </span>

                    </Link>


                    <Link to="/profile">

                        <Icon
                            name="profile"
                            size={18}
                        />

                        <span>
                            My Profile
                        </span>

                    </Link>

                </nav>


                <div className="registration-requests-logout">

                    <button onClick={logout}>

                        <Icon
                            name="logout"
                            size={18}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================== */}

            <main className="registration-requests-main">

                {/* =================================================
                    TOP BAR
                ================================================== */}

                <header className="registration-requests-topbar">

                    <div>

                        <p className="registration-requests-eyebrow">
                            HEAD ADMINISTRATION
                        </p>

                        <h1>
                            Registration Requests
                        </h1>

                        <p className="registration-requests-subtitle">
                            Review and manage requests from
                            users waiting for VALORA account
                            approval.
                        </p>

                    </div>


                    <div className="registration-requests-profile">

                        <div className="registration-requests-profile-avatar">
                            HA
                        </div>

                        <div>

                            <strong>
                                Head Administrator
                            </strong>

                            <span>
                                System Administrator
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    RESULT MESSAGE
                ================================================== */}

                <InlineMessage tone={notice?.tone}>
                    {notice?.text}
                </InlineMessage>


                {/* =================================================
                    STAT CARDS
                ================================================== */}

                <div className="registration-requests-stats">

                    <div className="registration-requests-stat-card">

                        <span>
                            Pending Requests
                        </span>

                        <strong>
                            {pendingUsers.length}
                        </strong>

                        <small>
                            Awaiting review
                        </small>

                    </div>


                    <div className="registration-requests-stat-card">

                        <span>
                            Approved Accounts
                        </span>

                        <strong>
                            {
                                users.filter(
                                    (user) =>
                                        user.status ===
                                        "Approved"
                                ).length
                            }
                        </strong>

                        <small>
                            Active users
                        </small>

                    </div>


                    <div className="registration-requests-stat-card">

                        <span>
                            Rejected Requests
                        </span>

                        <strong>
                            {
                                users.filter(
                                    (user) =>
                                        user.status ===
                                        "Rejected"
                                ).length
                            }
                        </strong>

                        <small>
                            Not approved
                        </small>

                    </div>


                    <div className="registration-requests-stat-card">

                        <span>
                            Total Registered
                        </span>

                        <strong>
                            {users.length}
                        </strong>

                        <small>
                            All registration records
                        </small>

                    </div>

                </div>


                {/* =================================================
                    REQUESTS PANEL
                ================================================== */}

                <section className="registration-requests-panel registration-requests-large-panel">

                    <div className="registration-requests-panel-heading">

                        <div>

                            <h2>
                                Pending Registration Requests
                            </h2>

                            <p>
                                Review the user's details and
                                selected VALORA role before
                                approving access.
                            </p>

                        </div>

                    </div>


                    {/* CONFIRMATION — replaces window.prompt */}

                    <ConfirmPrompt
                        open={pendingId !== null}
                        tone="danger"
                        title="Reject this registration?"
                        description="The applicant is told the registration was not approved."
                        confirmLabel="Reject registration"
                        reasonLabel="Reason (required)"
                        reasonPlaceholder="Explain why access is not approved"
                        reasonValue={pendingReason}
                        onReasonChange={setPendingReason}
                        onConfirm={confirmReject}
                        onCancel={() => {
                            setPendingId(null);
                            setPendingReason("");
                        }}
                    />


                    {pendingUsers.length === 0 ? (

                        <div className="registration-requests-empty">

                            <div className="registration-requests-empty-icon">

                                <Icon
                                    name="check"
                                    size={24}
                                />

                            </div>

                            <h3>
                                No pending registrations
                            </h3>

                            <p>
                                There are currently no
                                registration requests
                                waiting for approval.
                            </p>

                            <p>
                                Account administration is not
                                connected to the VALORA API yet,
                                so requests raised elsewhere in
                                the app do not appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="registration-requests-table-container">

                            <table className="registration-requests-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Applicant
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Requested Role
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {pendingUsers.map(
                                        (user) => (

                                            <tr
                                                key={user.id}
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            user.firstName
                                                        }{" "}
                                                        {
                                                            user.lastName
                                                        }
                                                    </strong>

                                                </td>


                                                <td>
                                                    {user.email}
                                                </td>


                                                <td>

                                                    <span className="registration-requests-role">
                                                        {
                                                            user.role
                                                        }
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
                                                            className="registration-requests-primary-btn"
                                                            onClick={() =>
                                                                approveUser(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                name="check"
                                                                size={15}
                                                            />

                                                            Approve
                                                        </button>


                                                        <button
                                                            className="registration-requests-secondary-btn"
                                                            onClick={() =>
                                                                requestReject(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                name="close"
                                                                size={15}
                                                            />

                                                            Reject
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================================
                    APPROVAL INFORMATION
                ================================================== */}

                <section className="registration-requests-information-grid">

                    <div className="registration-requests-panel">

                        <div className="registration-requests-panel-heading">

                            <div>

                                <h2>
                                    Approval Process
                                </h2>

                                <p>
                                    How registration approval
                                    works.
                                </p>

                            </div>

                        </div>


                        <div className="registration-requests-steps">

                            <div className="registration-requests-step">

                                <div className="registration-requests-step-number">
                                    1
                                </div>

                                <div>

                                    <strong>
                                        Registration
                                    </strong>

                                    <span>
                                        User submits their details
                                        and selects their requested
                                        role.
                                    </span>

                                </div>

                            </div>


                            <div className="registration-requests-step">

                                <div className="registration-requests-step-number">
                                    2
                                </div>

                                <div>

                                    <strong>
                                        Review
                                    </strong>

                                    <span>
                                        Head Administrator reviews
                                        the registration request.
                                    </span>

                                </div>

                            </div>


                            <div className="registration-requests-step">

                                <div className="registration-requests-step-number">
                                    3
                                </div>

                                <div>

                                    <strong>
                                        Decision
                                    </strong>

                                    <span>
                                        The request can be approved
                                        or rejected with a reason.
                                    </span>

                                </div>

                            </div>


                            <div className="registration-requests-step">

                                <div className="registration-requests-step-number">
                                    4
                                </div>

                                <div>

                                    <strong>
                                        Access
                                    </strong>

                                    <span>
                                        Approved users can sign in
                                        and access their selected
                                        dashboard.
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
