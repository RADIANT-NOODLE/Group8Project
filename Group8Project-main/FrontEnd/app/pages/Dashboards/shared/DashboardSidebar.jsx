import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { PROPERTY_TAB_PATHS } from "./PropertyTabs";
import ValoraLogo from "../../../components/ValoraLogo";
import "./DashboardSidebar.css";
import { readStoredItem, writeStoredItem } from "../../../services/browserStorage";
import { getStoredUser, logout } from "../../../services/session";

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
            "head_admin",
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
            "hoa_admin",
        ].includes(role)
    ) {
        return "HOA Admin";
    }

    if (["property owner", "resident"].includes(role)) {
        return "Resident";
    }

    if (role === "estate agent" || role === "estate_agent") {
        return "Estate Agent";
    }

    return value || "";
}

function getCurrentUser() {
    try {
        const user = getStoredUser();

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

        profile: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6" />
            </>
        ),

        collapse: (
            <>
                <path d="M15 6l-6 6 6 6" />
            </>
        ),

        expand: (
            <>
                <path d="M9 6l6 6-6 6" />
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
    };

    return <svg {...props}>{icons[type] || icons.request}</svg>;
}

/* =========================================================
   ROLE-BASED NAVIGATION
========================================================= */

const navigation = {
    Resident: [
        { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
        { label: "Request to Sell/Rent", path: "/request-to-sell", icon: "request" },
        { label: "My Complaints", path: "/complaints", icon: "complaint" },
        { label: "Service Provider Directory", path: "/providers", icon: "providers" },
        { label: "Community Announcements", path: "/announcements", icon: "announcement" },
    ],

    "Estate Agent": [
        { label: "Dashboard", path: "/agent-dashboard", icon: "dashboard" },
        { label: "My Listings", path: "/agent-listings", icon: "property" },
        { label: "Edit Listings", path: "/agent-edit-listings", icon: "request" },
        { label: "Inquiries", path: "/agent-inquiries", icon: "complaint" },
    ],

    "HOA Admin": [
        { label: "Dashboard", path: "/hoa-admin", icon: "dashboard" },
        { label: "Registration Requests", path: "/registration-requests", icon: "registration" },
        { label: "Create Agent Account", path: "/create-agent", icon: "registration" },
        { label: "Properties", path: "/property-management", icon: "property", activePaths: PROPERTY_TAB_PATHS },
        { label: "Resident Directory", path: "/resident-directory", icon: "users" },
        { label: "Resident Complaints", path: "/resident-complaints", icon: "complaint" },
        { label: "Inquiries", path: "/agent-inquiries", icon: "request" },
        { label: "Maintenance", path: "/maintenance", icon: "maintenance" },
        { label: "Service Provider Directory", path: "/providers", icon: "providers" },
        { label: "Community Announcements", path: "/community-announcements", icon: "announcement" },
    ],

    /* =====================================================
       HEAD ADMIN NAVIGATION
       Properties opens internal property management.
    ===================================================== */

    "Head Admin": [
        { label: "Head Admin Dashboard", path: "/head-admin", icon: "dashboard" },
        { label: "Registration Requests", path: "/registration-requests", icon: "registration" },
        { label: "Create Agent Account", path: "/create-agent", icon: "registration" },
        { label: "User Management", path: "/user-management", icon: "users" },
        { label: "Properties", path: "/property-management", icon: "property", activePaths: PROPERTY_TAB_PATHS },
        { label: "Resident Directory", path: "/resident-directory", icon: "users" },
        { label: "Resident Complaints", path: "/resident-complaints", icon: "complaint" },
        { label: "Inquiries", path: "/agent-inquiries", icon: "request" },
        { label: "Maintenance", path: "/maintenance", icon: "maintenance" },
        { label: "Service Provider Directory", path: "/providers", icon: "providers" },
        { label: "Community Announcements", path: "/community-announcements", icon: "announcement" },
    ],
};

/* =========================================================
   COLLAPSED STATE
   Remembered across pages, since each page mounts its own sidebar.
========================================================= */

const COLLAPSED_STORAGE_KEY = "valoraSidebarCollapsed";

function getStoredCollapsed() {
    return readStoredItem(COLLAPSED_STORAGE_KEY) === "true";
}

/* How far a finger must travel to count as pulling the drawer out or pushing it back. */
const SWIPE_DISTANCE = 30;

/* =========================================================
   SIDEBAR COMPONENT
========================================================= */

function DashboardSidebar({ suppliedUser = null }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const currentUser = suppliedUser || getCurrentUser();
    const [collapsed, setCollapsed] = useState(getStoredCollapsed);

    // Phones only (see MOBILE in the stylesheet). Starts closed on every page.
    const [mobileOpen, setMobileOpen] = useState(false);
    const touchStartX = useRef(null);

    useEffect(() => {
        if (!mobileOpen) return undefined;

        function closeOnEscape(event) {
            if (event.key === "Escape") setMobileOpen(false);
        }

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [mobileOpen]);

    function rememberTouch(event) {
        touchStartX.current = event.touches[0].clientX;
    }

    function swipeDistance(event) {
        return event.changedTouches[0].clientX - (touchStartX.current ?? 0);
    }

    function toggleCollapsed() {
        const next = !collapsed;
        setCollapsed(next);

        // If storage is unavailable the toggle still works for this page.
        writeStoredItem(COLLAPSED_STORAGE_KEY, String(next));
    }

    if (!currentUser) return null;

    const role = normalizeRole(currentUser.role) || "Resident";
    const links = navigation[role] || navigation.Resident;

    // debug code to see what sidebar is reading
    console.log("SIDEBAR ROLE DEBUG:", role, "Current User:", currentUser);
    
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
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <>
        <aside
            id="dashboard-sidebar"
            className={`dashboard-sidebar ${
                collapsed ? "is-collapsed" : ""
            } ${mobileOpen ? "is-mobile-open" : ""}`}
            onTouchStart={rememberTouch}
            onTouchEnd={(event) => {
                if (swipeDistance(event) < -SWIPE_DISTANCE) setMobileOpen(false);
            }}
        >
            <div className="dashboard-sidebar-brand">
                <Link
                    to="/"
                    className="dashboard-logo-link"
                    title="Go to home page"
                >
                    <ValoraLogo alt="VALORA - go to home page" className="dashboard-logo" />
                </Link>

                <button
                    type="button"
                    className="dashboard-collapse-button"
                    onClick={toggleCollapsed}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!collapsed}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <Icon type={collapsed ? "expand" : "collapse"} />
                </button>

                <button
                    type="button"
                    className="dashboard-mobile-close-button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    title="Close menu"
                >
                    <Icon type="collapse" />
                </button>
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
                onClick={(event) => {
                    if (event.target.closest("a")) setMobileOpen(false);
                }}
            >
                <span className="dashboard-nav-section-title">
                    Main Menu
                </span>

                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        title={collapsed ? link.label : undefined}
                        end={
                            link.path === "/dashboard" ||
                            link.path === "/head-admin"
                        }
                        className={({ isActive }) =>
                            `dashboard-sidebar-link ${
                                isActive || link.activePaths?.includes(pathname)
                                    ? "active"
                                    : ""
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
                    title={collapsed ? "My Profile" : undefined}
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
                    title={collapsed ? "Logout" : undefined}
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

        <button
            type="button"
            className="dashboard-mobile-handle"
            onClick={() => setMobileOpen(true)}
            onTouchStart={rememberTouch}
            onTouchEnd={(event) => {
                if (swipeDistance(event) > SWIPE_DISTANCE) setMobileOpen(true);
            }}
            aria-label="Open menu"
            aria-controls="dashboard-sidebar"
            aria-expanded={mobileOpen}
            title="Open menu"
        >
            <Icon type="expand" />
        </button>

        {mobileOpen && (
            <div
                className="dashboard-mobile-backdrop"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />
        )}
        </>
    );
}

export default DashboardSidebar;
