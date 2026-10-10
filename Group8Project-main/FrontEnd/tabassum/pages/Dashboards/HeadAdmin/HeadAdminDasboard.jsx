import React from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import "./HeadAdminDashboard.css";


/*
=========================================================
GET CURRENT USER
=========================================================
*/

function getCurrentUser() {

    const storedUser =
        localStorage.getItem("valoraUser");

    if (!storedUser) {
        return null;
    }

    try {

        const user =
            JSON.parse(storedUser);

        let role =
            user.role || "";

        if (
            role === "HOA" ||
            role === "HOA Admin"
        ) {
            role = "HOA Admin";
        }

        if (
            role === "Administrator"
        ) {
            role = "HOA Admin";
        }

        if (
            role === "Property Owner"
        ) {
            role = "Resident";
        }

        if (
            role === "Buyer"
        ) {
            role = "Investor";
        }

        const firstName =
            user.firstName ||
            user.first_name ||
            "";

        const lastName =
            user.lastName ||
            user.last_name ||
            "";

        const fullName =
            `${firstName} ${lastName}`.trim() ||
            user.name ||
            "Head Administrator";

        const initials =
            `${firstName.charAt(0)}${lastName.charAt(0)}`
                .toUpperCase() ||
            fullName
                .split(" ")
                .map(
                    (part) =>
                        part.charAt(0)
                )
                .join("")
                .substring(0, 2)
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

        console.error(
            "Unable to read VALORA user:",
            error
        );

        return null;
    }
}


/*
=========================================================
ICON
=========================================================
*/

function Icon({
    type,
    size = 20,
}) {

    const commonProps = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
    };

    switch (type) {

        case "dashboard":

            return (
                <svg {...commonProps}>
                    <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                    />
                    <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                    />
                    <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                    />
                    <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                    />
                </svg>
            );


        case "users":

            return (
                <svg {...commonProps}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle
                        cx="9"
                        cy="7"
                        r="4"
                    />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );


        case "requests":

            return (
                <svg {...commonProps}>
                    <rect
                        x="4"
                        y="3"
                        width="16"
                        height="18"
                        rx="2"
                    />
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
                    <circle
                        cx="12"
                        cy="12"
                        r="3"
                    />
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


        case "profile":

            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="8"
                        r="4"
                    />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
            );


        case "logout":

            return (
                <svg {...commonProps}>
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M21 3v18" />
                </svg>
            );


        default:

            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
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

    const navigate =
        useNavigate();

    const user =
        getCurrentUser();


    /*
    =====================================================
    REFRESH USERS
    =====================================================
    */

    function refreshUsers() {

        window.location.reload();
    }


    /*
    =====================================================
    LOGOUT
    =====================================================
    */

    function handleLogout() {

        localStorage.removeItem(
            "valoraUser"
        );

        navigate("/login");
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

                            <Icon
                                type="users"
                                size={26}
                            />

                        </div>

                        <h2>
                            Please log in to continue
                        </h2>

                        <p>
                            Your VALORA administrator
                            session could not be found.
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

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="head-admin-sidebar">

                <div className="head-admin-brand">

                    <Link
                        to="/head-admin"
                        className="head-admin-brand-link"
                    >

                        <img
                            src="/ValoraLogo.jpeg"
                            alt="VALORA"
                            className="head-admin-logo"
                        />

                    </Link>

                </div>


                <div className="head-admin-profile">

                    <div className="head-admin-avatar">
                        {user.initials}
                    </div>

                    <div className="head-admin-profile-details">

                        <strong>
                            {user.fullName}
                        </strong>

                        <span>
                            Head Administrator
                        </span>

                    </div>

                </div>


                <nav className="head-admin-navigation">

                    <span className="head-admin-section-title">
                        Main Menu
                    </span>


                    <NavItem
                        to="/head-admin"
                        icon="dashboard"
                        label="Dashboard"
                        end
                    />

                    <NavItem
                        to="/registration-requests"
                        icon="requests"
                        label="Registration Requests"
                    />

                    <NavItem
                        to="/user-management"
                        icon="users"
                        label="User Management"
                    />


                    <span className="head-admin-section-title head-admin-management-title">
                        System Management
                    </span>


                    <NavItem
                        to="/property"
                        icon="property"
                        label="Properties"
                    />

                    <NavItem
                        to="/valuation"
                        icon="valuation"
                        label="AI Valuation"
                    />

                    <NavItem
                        to="/complaints"
                        icon="complaints"
                        label="Complaints"
                    />

                    <NavItem
                        to="/providers"
                        icon="providers"
                        label="Service Providers"
                    />

                    <NavItem
                        to="/announcements"
                        icon="announcements"
                        label="Announcements"
                    />

                    <NavItem
                        to="/maintenance"
                        icon="maintenance"
                        label="Maintenance"
                    />

                    <NavItem
                        to="/ai-training-data"
                        icon="ai"
                        label="AI Training Data"
                    />

                    <NavItem
                        to="/community-analytics"
                        icon="analytics"
                        label="Community Analytics"
                    />

                </nav>


                <div className="head-admin-sidebar-bottom">

                    <NavItem
                        to="/profile"
                        icon="profile"
                        label="My Profile"
                    />

                    <button
                        type="button"
                        className="head-admin-logout"
                        onClick={handleLogout}
                    >

                        <span className="head-admin-nav-icon">

                            <Icon
                                type="logout"
                                size={17}
                            />

                        </span>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

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
                            Manage and monitor the complete
                            VALORA platform.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="head-admin-refresh"
                        onClick={refreshUsers}
                    >
                        Refresh
                    </button>

                </header>


                {/* =================================================
                    OVERVIEW
                ================================================= */}

                <section className="head-admin-stats">

                    <StatCard
                        label="Total Users"
                        value="0"
                        icon="users"
                    />

                    <StatCard
                        label="Registration Requests"
                        value="0"
                        icon="requests"
                    />

                    <StatCard
                        label="Properties"
                        value="8"
                        icon="property"
                    />

                    <StatCard
                        label="System Modules"
                        value="10"
                        icon="analytics"
                    />

                </section>


                {/* =================================================
                    MANAGEMENT
                ================================================= */}

                <section className="head-admin-content">

                    <div className="head-admin-panel">

                        <div className="head-admin-panel-header">

                            <div>

                                <span className="head-admin-panel-eyebrow">
                                    USER ADMINISTRATION
                                </span>

                                <h2>
                                    User Management
                                </h2>

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
                                description="View, approve, deactivate and manage VALORA users."
                            />

                        </div>

                    </div>


                    <div className="head-admin-panel">

                        <div className="head-admin-panel-header">

                            <div>

                                <span className="head-admin-panel-eyebrow">
                                    SYSTEM MANAGEMENT
                                </span>

                                <h2>
                                    Platform Modules
                                </h2>

                            </div>

                        </div>


                        <div className="head-admin-module-grid">

                            <ManagementCard
                                to="/property"
                                icon="property"
                                title="Properties"
                                description="Manage the development's property records and listings."
                            />

                            <ManagementCard
                                to="/valuation"
                                icon="valuation"
                                title="AI Valuation"
                                description="Review property valuation and investment calculations."
                            />

                            <ManagementCard
                                to="/complaints"
                                icon="complaints"
                                title="Complaints"
                                description="Monitor resident complaints across the community."
                            />

                            <ManagementCard
                                to="/providers"
                                icon="providers"
                                title="Service Providers"
                                description="Manage community service providers."
                            />

                            <ManagementCard
                                to="/announcements"
                                icon="announcements"
                                title="Announcements"
                                description="Manage platform and community announcements."
                            />

                            <ManagementCard
                                to="/maintenance"
                                icon="maintenance"
                                title="Maintenance"
                                description="Monitor maintenance activity and requests."
                            />

                            <ManagementCard
                                to="/ai-training-data"
                                icon="ai"
                                title="AI Training Data"
                                description="Manage data used to support VALORA intelligence."
                            />

                            <ManagementCard
                                to="/community-analytics"
                                icon="analytics"
                                title="Community Analytics"
                                description="Review community performance and platform insights."
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
NAV ITEM
=========================================================
*/

function NavItem({
    to,
    icon,
    label,
    end = false,
}) {

    return (

        <Link
            to={to}
            className="head-admin-nav-link"
        >

            <span className="head-admin-nav-icon">

                <Icon
                    type={icon}
                    size={17}
                />

            </span>

            <span>
                {label}
            </span>

        </Link>

    );
}


/*
=========================================================
STAT CARD
=========================================================
*/

function StatCard({
    label,
    value,
    icon,
}) {

    return (

        <div className="head-admin-stat-card">

            <div className="head-admin-stat-icon">

                <Icon
                    type={icon}
                    size={20}
                />

            </div>

            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

        </div>
    );
}


/*
=========================================================
MANAGEMENT CARD
=========================================================
*/

function ManagementCard({
    to,
    icon,
    title,
    description,
}) {

    return (

        <Link
            to={to}
            className="head-admin-management-card"
        >

            <div className="head-admin-management-icon">

                <Icon
                    type={icon}
                    size={20}
                />

            </div>

            <div className="head-admin-management-content">

                <h3>
                    {title}
                </h3>

                <p>
                    {description}
                </p>

            </div>

            <span className="head-admin-card-arrow">
                →
            </span>

        </Link>
    );
}


export default HeadAdminDashboard;
