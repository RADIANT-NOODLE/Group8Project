
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./DashboardSidebar.css";

/* =========================================================
   GET CURRENT USER
========================================================= */

function normalizeRole(value) {
    const role = String(value || "").trim().toLowerCase();

    if (
        [
            "head admin",
            "head administrator",
            "headadministrator",
        ].includes(role)
    ) {
        return "Head Admin";
    }

    if (
        [
            "hoa",
            "hoa admin",
            "hoa administrator",
            "administrator",
        ].includes(role)
    ) {
        return "HOA Admin";
    }

    if (["property owner", "resident"].includes(role)) {
        return "Resident";
    }

    if (["buyer", "investor"].includes(role)) {
        return "Investor";
    }

    if (role === "estate agent") {
        return "Estate Agent";
    }

    return value || "";
}

function getCurrentUser() {
    try {
        const storedUser = localStorage.getItem("valoraUser");

        if (!storedUser) return null;

        const user = JSON.parse(storedUser);

        if (!user || typeof user !== "object") return null;

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
            role: normalizeRole(user.role),
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

/* =========================================================
   SIDEBAR ICONS
========================================================= */

function Icon({ type }) {
    const props = {
        width: 18,
        height: 18,
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
        dashboard: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
        ),

        property: (
            <>
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
                <path d="M9 21v-6h6v6" />
            </>
        ),

        valuation: (
            <>
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7v10" />
                <path d="M15 9.5c-.7-1-1.7-1.5-3-1.5-1.7 0-3 .8-3 2s1.2 2 3 2 3 .8 3 2-1.3 2-3 2c-1.3 0-2.3-.5-3-1.5" />
            </>
        ),

        roi: (
            <>
                <path d="M3 3v18h18" />
                <path d="m7 14 4-4 4 3 6-7" />
                <path d="M17 6h4v4" />
            </>
        ),

        request: (
            <>
                <path d="M4 5h16v14H4z" />
                <path d="M8 9h8M8 13h5M8 17h3" />
            </>
        ),

        registration: (
            <>
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <circle cx="12" cy="9" r="2.5" />
                <path d="M8 16c.7-1.7 2-2.5 4-2.5s3.3.8 4 2.5" />
            </>
        ),

        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.8.1 1.7 1.7 0 0 0-.9 1.5V22H9v-.4a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8-.1l-.2.1-1.8-3.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3v-3h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L6 4.9l.2.1a1.7 1.7 0 0 0 1.8-.1 1.7 1.7 0 0 0 1-1.5V3h6.1v.4a1.7 1.7 0 0 0 .9 1.5 1.7 1.7 0 0 0 1.8.1l.2-.1 1.8 3.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v3h-.1a1.7 1.7 0 0 0-1.5 1Z" />
            </>
        ),

        complaint: (
            <>
                <path d="M4 4h16v12H8l-4 4z" />
                <path d="M12 7v4" />
                <circle
                    cx="12"
                    cy="14"
                    r=".5"
                    fill="currentColor"
                />
            </>
        ),

        maintenance: (
            <>
                <path d="M14.5 6.5a4 4 0 0 1-5 5L4 17l3 3 5.5-5.5a4 4 0 0 1 5-5" />
                <path d="M16 4l4 4" />
            </>
        ),

        providers: (
            <>
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.3 2.4-5 6-5s6 1.7 6 5" />
                <path d="M16 5.5a3 3 0 0 1 0 5.8M18 15c2 .7 3 2.2 3 5" />
            </>
        ),

        announcement: (
            <>
                <path d="M4 11v2M6 10h3l10-5v14L9 14H6z" />
                <path d="M9 14l1.5 5h3L12 14M19 9.5a3 3 0 0 1 0 5" />
            </>
        ),

        analytics: (
            <>
                <path d="M3 3v18h18" />
                <rect x="6" y="12" width="3.5" height="6" rx=".5" />
                <rect x="11" y="8" width="3.5" height="10" rx=".5" />
                <rect x="16" y="4" width="3.5" height="14" rx=".5" />
            </>
        ),

        profile: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6" />
            </>
        ),

        logout: (
            <>
                <path d="M10 17l5-5-5-5M15 12H3M14 4h5v16h-5" />
            </>
        ),

        users: (
            <>
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.3 2.4-5 6-5s6 1.7 6 5" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M17 15c2.5 0 4 1.7 4 4" />
            </>
        ),

        ai: (
            <>
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <path d="M9 9h.01M15 9h.01M8 14c2.5 2 5.5 2 8 0M12 1v3M12 20v3" />
            </>
        ),
    };

    return <svg {...props}>{icons[type] || icons.request}</svg>;
}

/* =========================================================
   ROLE-BASED NAVIGATION
========================================================= */

const navigation = {
    Resident: [
        { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
        { label: "My Property", path: "/property", icon: "property" },
        { label: "AI Valuation", path: "/valuation", icon: "valuation" },
        { label: "Request to Sell/Rent", path: "/request-to-sell", icon: "request" },
        { label: "My Complaints", path: "/complaints", icon: "complaint" },
        { label: "Maintenance", path: "/maintenance", icon: "maintenance" },
        { label: "Service Provider Directory", path: "/providers", icon: "providers" },
        { label: "Community Announcements", path: "/announcements", icon: "announcement" },
        { label: "VALORA Intelligence", path: "/intelligence", icon: "ai" },
    ],

    Investor: [
        { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
        { label: "My Property", path: "/property", icon: "property" },
        { label: "AI Valuation", path: "/valuation", icon: "valuation" },
        { label: "ROI Analysis", path: "/roi", icon: "roi" },
        { label: "Service Provider Directory", path: "/providers", icon: "providers" },
        { label: "Community Announcements", path: "/announcements", icon: "announcement" },
        { label: "VALORA Intelligence", path: "/intelligence", icon: "ai" },
    ],

    "Estate Agent": [
        { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
        { label: "My Listings", path: "/agent-listings", icon: "property" },
        { label: "Edit Listings", path: "/agent-edit-listings", icon: "request" },
        { label: "Inquiries", path: "/agent-inquiries", icon: "complaint" },
        { label: "AI Valuation", path: "/valuation", icon: "valuation" },
        { label: "Service Provider Directory", path: "/providers", icon: "providers" },
        { label: "Community Announcements", path: "/announcements", icon: "announcement" },
        { label: "VALORA Intelligence", path: "/intelligence", icon: "ai" },
    ],

    "HOA Admin": [
        { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
        { label: "Registration Requests", path: "/registration-requests", icon: "registration" },
        { label: "Property Requests", path: "/property-requests", icon: "property" },
        { label: "Property Approvals", path: "/property-approvals", icon: "property" },
        { label: "Resident Directory", path: "/resident-directory", icon: "users" },
        { label: "Resident Complaints", path: "/resident-complaints", icon: "complaint" },
        { label: "Maintenance", path: "/maintenance", icon: "maintenance" },
        { label: "Service Provider Directory", path: "/providers", icon: "providers" },
        { label: "Community Announcements", path: "/community-announcements", icon: "announcement" },
        { label: "Community Analytics", path: "/community-analytics", icon: "analytics" },
        { label: "VALORA Intelligence", path: "/intelligence", icon: "ai" },
        { label: "AI Training Data", path: "/ai-training-data", icon: "ai" },
        { label: "Landing Page Settings", path: "/landing-page-settings", icon: "settings" },
    ],

    /* =====================================================
       HEAD ADMIN NAVIGATION
       Properties opens internal property management.
    ===================================================== */

    "Head Admin": [
        { label: "Head Admin Dashboard", path: "/head-admin", icon: "dashboard" },
        { label: "Registration Requests", path: "/registration-requests", icon: "registration" },
        { label: "User Management", path: "/user-management", icon: "users" },
        { label: "Property Requests", path: "/property-requests", icon: "property" },
        { label: "Property Approvals", path: "/property-approvals", icon: "property" },
        { label: "Properties", path: "/property-management", icon: "property" },
        { label: "Resident Directory", path: "/resident-directory", icon: "users" },
        { label: "Resident Complaints", path: "/resident-complaints", icon: "complaint" },
        { label: "Maintenance", path: "/maintenance", icon: "maintenance" },
        { label: "Service Provider Directory", path: "/providers", icon: "providers" },
        { label: "Community Announcements", path: "/community-announcements", icon: "announcement" },
        { label: "Community Analytics", path: "/community-analytics", icon: "analytics" },
        { label: "VALORA Intelligence", path: "/intelligence", icon: "ai" },
        { label: "AI Training Data", path: "/ai-training-data", icon: "ai" },
        { label: "Landing Page Settings", path: "/landing-page-settings", icon: "settings" },
    ],
};

/* =========================================================
   SIDEBAR COMPONENT
========================================================= */

function DashboardSidebar({ suppliedUser = null }) {
    const navigate = useNavigate();
    const currentUser = suppliedUser || getCurrentUser();

    if (!currentUser) return null;

    const role = normalizeRole(currentUser.role) || "Resident";
    const links = navigation[role] || navigation.Resident;

    const fullName =
        currentUser.fullName ||
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        currentUser.name ||
        "VALORA User";

    const initials =
        currentUser.initials ||
        fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase();

    function handleLogout() {
        localStorage.removeItem("valoraUser");
        localStorage.removeItem("valoraLoggedIn");
        navigate("/login", { replace: true });
    }

    return (
        <aside className="dashboard-sidebar">
            <div className="dashboard-sidebar-brand">
                <img
                    src="/ValoraLogo.jpeg"
                    alt="VALORA"
                    className="dashboard-logo"
                />
            </div>

            <div className="dashboard-sidebar-profile">
                <div className="dashboard-profile-avatar">
                    {initials}
                </div>

                <div className="dashboard-profile-details">
                    <strong>{fullName}</strong>
                    <span>{role}</span>
                </div>
            </div>

            <nav
                className="dashboard-sidebar-navigation"
                aria-label="Main navigation"
            >
                <span className="dashboard-nav-section-title">
                    Main Menu
                </span>

                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={
                            link.path === "/dashboard" ||
                            link.path === "/head-admin"
                        }
                        className={({ isActive }) =>
                            `dashboard-sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="dashboard-nav-icon">
                            <Icon type={link.icon} />
                        </span>

                        <span className="dashboard-nav-label">
                            {link.label}
                        </span>
                    </NavLink>
                ))}

                <span className="dashboard-account-section-title">
                    Account
                </span>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `dashboard-sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="dashboard-nav-icon">
                        <Icon type="profile" />
                    </span>

                    <span className="dashboard-nav-label">
                        My Profile
                    </span>
                </NavLink>
            </nav>

            <div className="dashboard-sidebar-bottom">
                <button
                    type="button"
                    className="dashboard-logout-button"
                    onClick={handleLogout}
                >
                    <span className="dashboard-logout-icon">
                        <Icon type="logout" />
                    </span>

                    <span className="dashboard-nav-label">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}

export default DashboardSidebar;
