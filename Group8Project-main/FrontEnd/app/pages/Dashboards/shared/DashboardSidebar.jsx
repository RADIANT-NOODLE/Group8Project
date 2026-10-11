import React from "react";
import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import * as authService from "../../../services/authService.js";
import { roleLabel, toRole } from "../../../services/roleMap.js";
import { useSession } from "../../../services/session.js";
import { navigationForRole } from "../../../services/navigation.js";
import "./DashboardSidebar.css";




/*
=========================================================
ICON
=========================================================
*/

function Icon({
    type,
}) {

    const commonProps = {
        width: 18,
        height: 18,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
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


        case "property":

            return (
                <svg {...commonProps}>
                    <path d="M3 10.5L12 3l9 7.5" />

                    <path d="M5 9.5V21h14V9.5" />

                    <path d="M9 21v-6h6v6" />
                </svg>
            );


        case "valuation":

            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="12"
                        r="8.5"
                    />

                    <path d="M12 7v10" />

                    <path d="M15 9.5c-.7-1-1.7-1.5-3-1.5-1.7 0-3 .8-3 2s1.2 2 3 2 3 .8 3 2-1.3 2-3 2c-1.3 0-2.3-.5-3-1.5" />
                </svg>
            );


        case "request":

            return (
                <svg {...commonProps}>
                    <path d="M4 5h16v14H4z" />

                    <path d="M8 9h8" />

                    <path d="M8 13h5" />

                    <path d="M8 17h3" />
                </svg>
            );


        case "complaint":

            return (
                <svg {...commonProps}>
                    <path d="M4 4h16v12H8l-4 4z" />

                    <path d="M12 7v4" />

                    <circle
                        cx="12"
                        cy="14"
                        r=".5"
                        fill="currentColor"
                    />
                </svg>
            );


        case "maintenance":

            return (
                <svg {...commonProps}>
                    <path d="M14.5 6.5a4 4 0 0 1-5 5L4 17l3 3 5.5-5.5a4 4 0 0 1 5-5" />

                    <path d="M16 4l4 4" />
                </svg>
            );


        case "providers":

            return (
                <svg {...commonProps}>
                    <circle
                        cx="9"
                        cy="8"
                        r="3"
                    />

                    <path d="M3 20c0-3.3 2.4-5 6-5s6 1.7 6 5" />

                    <path d="M16 5.5a3 3 0 0 1 0 5.8" />

                    <path d="M18 15c2 .7 3 2.2 3 5" />
                </svg>
            );


        case "announcement":

            return (
                <svg {...commonProps}>
                    <path d="M4 11v2" />

                    <path d="M6 10h3l10-5v14L9 14H6z" />

                    <path d="M9 14l1.5 5h3L12 14" />

                    <path d="M19 9.5a3 3 0 0 1 0 5" />
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

                    <path d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6" />
                </svg>
            );


        case "logout":

            return (
                <svg {...commonProps}>
                    <path d="M10 17l5-5-5-5" />

                    <path d="M15 12H3" />

                    <path d="M14 4h5v16h-5" />
                </svg>
            );


        default:

            return null;
    }
}


/*
=========================================================
SIDEBAR
=========================================================
*/

function DashboardSidebar({
    suppliedUser = null,
}) {

    const navigate =
        useNavigate();

    const { user } =
        useSession();

    const currentUser =
        suppliedUser ||
        user;


    /*
    =====================================================
    NO USER
    =====================================================
    */

    if (!currentUser) {
        return null;
    }


    const role =
        toRole(currentUser.role);


    /*
    =====================================================
    NAVIGATION

    The menu lives in services/navigation.js and is
    checked against the route access matrix, so it can
    only offer screens this role may open.
    =====================================================
    */

    const links =
        navigationForRole(role);


    const fullName =
        currentUser.fullName ||
        "VALORA User";


    const initials =
        currentUser.initials ||
        fullName
            .split(" ")
            .map(
                (part) =>
                    part.charAt(0)
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();


    /*
    =====================================================
    LOGOUT
    =====================================================
    */

    function handleLogout() {

        authService.logout();

        navigate(
            "/login"
        );
    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <aside className="dashboard-sidebar">


            {/* =================================================
                VALORA BRAND
            ================================================= */}

            <div className="dashboard-sidebar-brand">

                <img
                    src="/assets/valora-logo.svg"
                    alt="VALORA"
                    className="dashboard-logo"
                />

            </div>


            {/* =================================================
                USER PROFILE
            ================================================= */}

            <div className="dashboard-sidebar-profile">

                <div className="dashboard-profile-avatar">

                    {initials}

                </div>


                <div className="dashboard-profile-details">

                    <strong>
                        {fullName}
                    </strong>

                    <span>
                        {roleLabel(role)}
                    </span>

                </div>

            </div>


            {/* =================================================
                MAIN MENU
            ================================================= */}

            <nav className="dashboard-sidebar-navigation">

                <span className="dashboard-nav-section-title">
                    Main Menu
                </span>


                {links.map(
                    (link) => (

                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `dashboard-sidebar-link ${
                                    isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                        >

                            <span className="dashboard-nav-icon">

                                <Icon
                                    type={link.icon}
                                />

                            </span>

                            <span className="dashboard-nav-label">
                                {link.label}
                            </span>

                        </NavLink>

                    )
                )}


                {/* =================================================
                    ACCOUNT
                ================================================= */}

                <span className="dashboard-account-section-title">
                    Account
                </span>


                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `dashboard-sidebar-link ${
                            isActive
                                ? "active"
                                : ""
                        }`
                    }
                >

                    <span className="dashboard-nav-icon">

                        <Icon
                            type="profile"
                        />

                    </span>

                    <span className="dashboard-nav-label">
                        My Profile
                    </span>

                </NavLink>

            </nav>


            {/* =================================================
                LOGOUT
            ================================================= */}

            <div className="dashboard-sidebar-bottom">

                <button
                    type="button"
                    className="dashboard-logout-button"
                    onClick={handleLogout}
                >

                    <span className="dashboard-logout-icon">

                        <Icon
                            type="logout"
                        />

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
