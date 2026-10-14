import React from "react";
import { Link, useNavigate } from "react-router-dom";

import DashboardSidebar from "../shared/DashboardSidebar";
import "./HeadAdminDashboard.css";

/*
=========================================================
GET CURRENT USER
=========================================================
*/

function getCurrentUser() {
    const storedUser = localStorage.getItem("valoraUser");

    if (!storedUser) {
        return null;
    }

    try {
        const user = JSON.parse(storedUser);

        if (!user || typeof user !== "object") {
            return null;
        }

        const rawRole = String(user.role || "").trim().toLowerCase();

        let role = user.role || "";

        if (
            ["head admin", "head administrator", "headadministrator"].includes(
                rawRole
            )
        ) {
            role = "Head Admin";
        } else if (
            ["hoa", "hoa admin", "hoa administrator", "administrator"].includes(
                rawRole
            )
        ) {
            role = "HOA Admin";
        } else if (["property owner", "resident"].includes(rawRole)) {
            role = "Resident";
        } else if (["buyer", "investor"].includes(rawRole)) {
            role = "Investor";
        } else if (rawRole === "estate agent") {
            role = "Estate Agent";
        }

        const firstName =
            user.firstName ||
            user.firstname ||
            user.first_name ||
            "";

        const lastName =
            user.lastName ||
            user.lastname ||
            user.last_name ||
            "";

        const fullName =
            user.fullName ||
            user.name ||
            `${firstName} ${lastName}`.trim() ||
            "VALORA User";

        const initials =
            user.initials ||
            fullName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")
                .toUpperCase();

        return {
            ...user,
            role,
            firstName,
            lastName,
            fullName,
            initials,
        };
    } catch (error) {
        console.error("Unable to read VALORA user:", error);
        return null;
    }
}

/*
=========================================================
DASHBOARD ICONS
=========================================================
*/

function Icon({ type, size = 20 }) {
    const commonProps = {
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

    switch (type) {
        case "dashboard":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            );

        case "users":
            return (
                <svg {...commonProps}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );

        case "requests":
            return (
                <svg {...commonProps}>
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M8 7h8" />
                    <path d="M8 11h8" />
                    <path d="M8 15h5" />
                </svg>
            );

        case "property":
            return (
                <svg {...commonProps}>
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5.5 9.5V21h13V9.5" />
                    <path d="M9 21v-6h6v6" />
                </svg>
            );

        case "valuation":
            return (
                <svg {...commonProps}>
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M8 16v-5" />
                    <path d="M12 16V8" />
                    <path d="M16 16v-9" />
                </svg>
            );

        case "complaints":
            return (
                <svg {...commonProps}>
                    <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                    <path d="M20 9v6" />
                </svg>
            );

        case "providers":
            return (
                <svg {...commonProps}>
                    <path d="M4 20h16" />
                    <path d="M6 20V9l6-5 6 5v11" />
                    <path d="M9 20v-6h6v6" />
                    <path d="M9 9h.01" />
                    <path d="M12 9h.01" />
                    <path d="M15 9h.01" />
                </svg>
            );

        case "announcements":
            return (
                <svg {...commonProps}>
                    <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                    <path d="M20 9v6" />
                </svg>
            );

        case "maintenance":
            return (
                <svg {...commonProps}>
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-2.8-2.8Z" />
                    <path d="m16 4 4 4" />
                </svg>
            );

        case "ai":
            return (
                <svg {...commonProps}>
                    <path d="M12 3v4" />
                    <path d="M12 17v4" />
                    <path d="M3 12h4" />
                    <path d="M17 12h4" />
                    <path d="m5.6 5.6 2.8 2.8" />
                    <path d="m15.6 15.6 2.8 2.8" />
                    <path d="m18.4 5.6-2.8 2.8" />
                    <path d="m8.4 15.6-2.8 2.8" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );

        case "analytics":
            return (
                <svg {...commonProps}>
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M8 16v-5" />
                    <path d="M12 16V8" />
                    <path d="M16 16v-9" />
                </svg>
            );

        default:
            return (
                <svg {...commonProps}>
                    <circle cx="12" cy="12" r="9" />
                </svg>
            );
    }
}

/*
=========================================================
HEAD ADMIN DASHBOARD
=========================================================
*/

function HeadAdminDashboard() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    /*
    =====================================================
    REFRESH
    =====================================================
    */

    function refreshDashboard() {
        window.location.reload();
    }

    /*
    =====================================================
    LOGOUT
    =====================================================
    */

    function handleLogout() {
        localStorage.removeItem("valoraUser");
        localStorage.removeItem("valoraLoggedIn");
        localStorage.removeItem("valoraUserEmail");

        navigate("/login", { replace: true });
    }

    /*
    =====================================================
    NO USER
    =====================================================
    */

    if (!user) {
        return (
            <div className="head-admin-page">
                <main className="head-admin-main">
                    <section className="head-admin-empty">
                        <div className="head-admin-empty-icon">
                            <Icon type="users" size={26} />
                        </div>

                        <h2>Please log in to continue</h2>

                        <p>
                            Your VALORA administrator session could not
                            be found.
                        </p>

                        <Link
                            to="/login"
                            className="head-admin-primary-button"
                        >
                            Go to Login
                        </Link>
                    </section>
                </main>
            </div>
        );
    }

    /*
    =====================================================
    DASHBOARD
    =====================================================
    */

    return (
        <div className="head-admin-page">
            {/* SHARED SIDEBAR */}
            <DashboardSidebar suppliedUser={user} />

            {/* MAIN CONTENT */}
            <main className="head-admin-main">
                <header className="head-admin-header">
                    <div>
                        <span className="head-admin-eyebrow">
                            HEAD ADMINISTRATION
                        </span>

                        <h1>
                            Welcome, {user.firstName || "Administrator"}
                        </h1>

                        <p>
                            Manage and monitor the complete VALORA platform.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="head-admin-refresh"
                        onClick={refreshDashboard}
                    >
                        Refresh
                    </button>
                </header>

                {/* OVERVIEW */}
                <section className="head-admin-stats">
                    <StatCard
                        label="Total Users"
                        value="—"
                        icon="users"
                    />

                    <StatCard
                        label="Registration Requests"
                        value="—"
                        icon="requests"
                    />

                    <StatCard
                        label="Properties"
                        value="—"
                        icon="property"
                    />

                    <StatCard
                        label="System Modules"
                        value="—"
                        icon="analytics"
                    />
                </section>

                {/* MANAGEMENT */}
                <section className="head-admin-content">
                    <div className="head-admin-panel">
                        <div className="head-admin-panel-header">
                            <div>
                                <span className="head-admin-panel-eyebrow">
                                    USER ADMINISTRATION
                                </span>

                                <h2>User Management</h2>
                            </div>

                            <Link
                                to="/user-management"
                                className="head-admin-panel-link"
                            >
                                Manage Users
                            </Link>
                        </div>

                        <div className="head-admin-management-grid">
                            <ManagementCard
                                to="/registration-requests"
                                icon="requests"
                                title="Registration Requests"
                                description="Review and manage new user registration requests."
                            />

                            <ManagementCard
                                to="/user-management"
                                icon="users"
                                title="User Management"
                                description="View and manage VALORA user accounts."
                            />
                        </div>
                    </div>

                    <div className="head-admin-panel">
                        <div className="head-admin-panel-header">
                            <div>
                                <span className="head-admin-panel-eyebrow">
                                    SYSTEM MANAGEMENT
                                </span>

                                <h2>Platform Modules</h2>
                            </div>
                        </div>

                        <div className="head-admin-module-grid">
                            <ManagementCard
                                to="/properties"
                                icon="property"
                                title="Properties"
                                description="View the development's property records and listings."
                            />

                            <ManagementCard
                                to="/property-requests"
                                icon="requests"
                                title="Property Requests"
                                description="Review resident requests to sell or rent properties."
                            />

                            <ManagementCard
                                to="/property-approvals"
                                icon="property"
                                title="Property Approvals"
                                description="Review property submissions requiring approval."
                            />

                            <ManagementCard
                                to="/resident-directory"
                                icon="users"
                                title="Resident Directory"
                                description="View resident information managed by VALORA."
                            />

                            <ManagementCard
                                to="/resident-complaints"
                                icon="complaints"
                                title="Resident Complaints"
                                description="Review and monitor complaints submitted by residents."
                            />

                            <ManagementCard
                                to="/maintenance"
                                icon="maintenance"
                                title="Maintenance"
                                description="Monitor maintenance activity and requests."
                            />

                            <ManagementCard
                                to="/providers"
                                icon="providers"
                                title="Service Provider Directory"
                                description="View community service providers."
                            />

                            <ManagementCard
                                to="/community-announcements"
                                icon="announcements"
                                title="Community Announcements"
                                description="Manage community announcements."
                            />

                            <ManagementCard
                                to="/community-analytics"
                                icon="analytics"
                                title="Community Analytics"
                                description="Review available community and platform insights."
                            />

                            <ManagementCard
                                to="/ai-training-data"
                                icon="ai"
                                title="AI Training Data"
                                description="Access the platform's AI training data module."
                            />

                            <ManagementCard
                                to="/landing-page-settings"
                                icon="property"
                                title="Landing Page Settings"
                                description="Manage configurable VALORA landing-page content."
                            />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

/*
=========================================================
STAT CARD
=========================================================
*/

function StatCard({ label, value, icon }) {
    return (
        <div className="head-admin-stat-card">
            <div className="head-admin-stat-icon">
                <Icon type={icon} size={20} />
            </div>

            <div>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>
        </div>
    );
}

/*
=========================================================
MANAGEMENT CARD
=========================================================
*/

function ManagementCard({ to, icon, title, description }) {
    return (
        <Link to={to} className="head-admin-management-card">
            <div className="head-admin-management-icon">
                <Icon type={icon} size={20} />
            </div>

            <div className="head-admin-management-content">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>

            <span className="head-admin-card-arrow">→</span>
        </Link>
    );
}

export default HeadAdminDashboard;
