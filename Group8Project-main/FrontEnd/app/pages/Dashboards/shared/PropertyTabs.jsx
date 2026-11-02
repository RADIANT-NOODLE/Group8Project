import React from "react";
import { NavLink } from "react-router-dom";
import "./PropertyTabs.css";

/* =========================================================
   PROPERTY TABS
   Properties, Property Requests and Property Approvals share
   one sidebar entry; these tabs switch between the three pages.
========================================================= */

export const PROPERTY_TAB_PATHS = [
    "/property-management",
    "/property-requests",
    "/property-approvals",
];

const tabs = [
    { label: "Properties", path: "/property-management" },
    { label: "Requests", path: "/property-requests" },
    { label: "Approvals", path: "/property-approvals" },
];

function PropertyTabs() {
    return (
        <nav className="property-tabs" aria-label="Property sections">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.path}
                    to={tab.path}
                    className={({ isActive }) =>
                        `property-tab ${isActive ? "active" : ""}`
                    }
                >
                    {tab.label}
                </NavLink>
            ))}
        </nav>
    );
}

export default PropertyTabs;
