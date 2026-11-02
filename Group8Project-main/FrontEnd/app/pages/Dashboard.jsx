import React from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import "./Dashboard.css";
import { ROLES, toRole } from "../services/roleMap";
import { getStoredUser } from "../services/session";


/*
=========================================================
GET CURRENT USER
=========================================================
*/

function getCurrentUser() {

  const storedUser =
    getStoredUser();

  if (!storedUser) {
    return null;
  }

  try {

    const user =
      storedUser;

    /*
    -------------------------------------------------------
    NORMALISE LEGACY ROLES
    -------------------------------------------------------
    */

    const role = toRole(user.role) || user.role;


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
      "VALORA User";

    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`
        .toUpperCase() ||
      fullName
        .split(" ")
        .map((name) => name.charAt(0))
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
ICON COMPONENT
=========================================================

Professional SVG icons.
=========================================================
*/

function Icon({
  name,
  size = 18,
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

  switch (name) {

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
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );

    case "request":
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
          <path d="M8 15h4" />
          <path d="M16 14v5" />
          <path d="M13.5 16.5h5" />
        </svg>
      );

    case "complaint":
      return (
        <svg {...commonProps}>
          <path d="M12 3 21 6v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9V6l9-3Z" />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        </svg>
      );

    case "maintenance":
      return (
        <svg {...commonProps}>
          <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.2 2.2-2.8-.8-.8-2.8 2.8-2.2Z" />
        </svg>
      );

    case "announcement":
      return (
        <svg {...commonProps}>
          <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
          <path d="M20 9v6" />
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
          <path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6" />
        </svg>
      );

    case "logout":
      return (
        <svg {...commonProps}>
          <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
          <path d="M14 8l4 4-4 4" />
          <path d="M18 12H9" />
        </svg>
      );

    case "residents":
      return (
        <svg {...commonProps}>
          <circle
            cx="9"
            cy="8"
            r="3"
          />
          <path d="M3 20c.6-3.5 2.5-5 6-5s5.4 1.5 6 5" />
          <circle
            cx="17"
            cy="9"
            r="2.5"
          />
          <path d="M16 15c2.8.2 4.4 1.7 5 4" />
        </svg>
      );

    case "registration":
      return (
        <svg {...commonProps}>
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="2"
          />
          <path d="M8 8h8" />
          <path d="M8 12h5" />
          <path d="m8 16 2 2 5-5" />
        </svg>
      );

    case "approval":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );

    case "analytics":
      return (
        <svg {...commonProps}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-4 3 2 5-6" />
        </svg>
      );

    case "listing":
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
          <path d="M8 18h3" />
        </svg>
      );

    case "inquiry":
      return (
        <svg {...commonProps}>
          <path d="M4 5h16v12H8l-4 4V5Z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </svg>
      );

    case "roi":
      return (
        <svg {...commonProps}>
          <path d="M5 19 19 5" />
          <circle
            cx="7"
            cy="7"
            r="2.5"
          />
          <circle
            cx="17"
            cy="17"
            r="2.5"
          />
        </svg>
      );

    case "valuation":
      return (
        <svg {...commonProps}>
          <path d="M4 19h16" />
          <path d="M6 16V8" />
          <path d="M10 16V5" />
          <path d="M14 16v-6" />
          <path d="M18 16v-9" />
        </svg>
      );

    case "agent":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="8"
            r="3.5"
          />
          <path d="M5 21c.8-4.2 3.1-6.5 7-6.5s6.2 2.3 7 6.5" />
          <path d="M8 4.5 9.5 3h5L16 4.5" />
        </svg>
      );

    default:
      return null;
  }
}


/*
=========================================================
RESIDENT DASHBOARD
=========================================================
*/

function ResidentDashboard({
  user,
}) {

  return (
    <>

      <div className="main-dashboard-header">

        <div>

          <span className="main-dashboard-header-eyebrow">
            RESIDENT PORTAL
          </span>

          <h1>
            Welcome back, {user.firstName || "Resident"}
          </h1>

          <p>
            Manage your property and community activity.
          </p>

        </div>

        <div className="main-dashboard-header-user">

          <div className="main-dashboard-header-avatar">
            {user.initials}
          </div>

        </div>

      </div>


      {/* =================================================
          STATS
      ================================================= */}

      <div className="main-dashboard-stats-grid">

        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">
              <Icon
                name="property"
                size={20}
              />
            </div>

            <span className="main-dashboard-stat-label">
              My Property
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            {user.myProperty ? "1" : "0"}
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">
              <Icon
                name="complaint"
                size={20}
              />
            </div>

            <span className="main-dashboard-stat-label">
              Complaints
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">
              <Icon
                name="maintenance"
                size={20}
              />
            </div>

            <span className="main-dashboard-stat-label">
              Maintenance
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">
              <Icon
                name="announcement"
                size={20}
              />
            </div>

            <span className="main-dashboard-stat-label">
              Announcements
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="main-dashboard-content-grid">

        {/* =================================================
            MY PROPERTY
        ================================================= */}

        <div className="main-dashboard-card">

          <div className="main-dashboard-card-header">

            <div>

              <h2>
                My Property
              </h2>

              <p>
                Property information linked to your account.
              </p>

            </div>

            <Link
              to="/property"
              className="main-dashboard-view-all"
            >
              View Property
            </Link>

          </div>


          {user.myProperty ? (

            <div className="main-dashboard-property-summary">

              <div className="main-dashboard-property-summary-icon">

                <Icon
                  name="property"
                  size={24}
                />

              </div>

              <div className="main-dashboard-property-summary-content">

                <strong>
                  {user.myProperty}
                </strong>

                <span>
                  Your registered property
                </span>

              </div>

              <span className="main-dashboard-property-status">
                Registered
              </span>

            </div>

          ) : (

            <div className="main-dashboard-empty-state">

              <div className="main-dashboard-empty-icon">

                <Icon
                  name="property"
                  size={28}
                />

              </div>

              <h3>
                No property linked yet
              </h3>

              <p>
                Your property will appear here once it
                has been linked to your account.
              </p>

            </div>

          )}

        </div>


        {/* =================================================
            PROPERTY REQUEST
        ================================================= */}

        <div className="main-dashboard-card main-dashboard-request-card">

          <div className="main-dashboard-request-content">

            <div className="main-dashboard-request-icon">

              <Icon
                name="request"
                size={26}
              />

            </div>

            <div>

              <h2>
                Want to sell or rent your property?
              </h2>

              <p>
                Submit a request to the HOA for review.
              </p>

              <Link
                to="/request-to-sell"
                className="main-dashboard-primary-button"
              >
                Request to Sell/Rent
              </Link>

            </div>

          </div>

        </div>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="main-dashboard-card main-dashboard-quick-actions-card">

          <div className="main-dashboard-card-header">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Common resident actions.
              </p>

            </div>

          </div>


          <div className="main-dashboard-quick-actions">

            <Link
              to="/complaints"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="complaint"
                  size={20}
                />

              </span>

              <span>
                Complaints
              </span>

            </Link>


            <Link
              to="/maintenance"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="maintenance"
                  size={20}
                />

              </span>

              <span>
                Maintenance
              </span>

            </Link>


            <Link
              to="/announcements"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="announcement"
                  size={20}
                />

              </span>

              <span>
                Announcements
              </span>

            </Link>

          </div>

        </div>

      </div>

    </>
  );
}


/*
=========================================================
ESTATE AGENT DASHBOARD
=========================================================
*/

function AgentDashboard({
  user,
}) {

  return (
    <>

      <div className="main-dashboard-header">

        <div>

          <span className="main-dashboard-header-eyebrow">
            ESTATE AGENT PORTAL
          </span>

          <h1>
            Welcome back, {user.firstName || "Agent"}
          </h1>

          <p>
            Manage assigned listings and property inquiries.
          </p>

        </div>

        <div className="main-dashboard-header-user">

          <div className="main-dashboard-header-avatar">
            {user.initials}
          </div>

        </div>

      </div>


      <div className="main-dashboard-stats-grid">

        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">
              <Icon
                name="listing"
                size={20}
              />
            </div>

            <span className="main-dashboard-stat-label">
              My Listings
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">
              <Icon
                name="inquiry"
                size={20}
              />
            </div>

            <span className="main-dashboard-stat-label">
              Inquiries
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">
              <Icon
                name="approval"
                size={20}
              />
            </div>

            <span className="main-dashboard-stat-label">
              Pending Approval
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">
              <Icon
                name="property"
                size={20}
              />
            </div>

            <span className="main-dashboard-stat-label">
              Available Units
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            8
          </div>

        </div>

      </div>


      <div className="main-dashboard-content-grid">

        <div className="main-dashboard-card">

          <div className="main-dashboard-card-header">

            <div>

              <h2>
                My Listings
              </h2>

              <p>
                Properties assigned to you by the HOA.
              </p>

            </div>

            <Link
              to="/agent-listings"
              className="main-dashboard-view-all"
            >
              View Listings
            </Link>

          </div>


          <div className="main-dashboard-empty-state">

            <div className="main-dashboard-empty-icon">

              <Icon
                name="listing"
                size={28}
              />

            </div>

            <h3>
              No assigned listings yet
            </h3>

            <p>
              Approved property requests assigned to you
              will appear here.
            </p>

          </div>

        </div>


        <div className="main-dashboard-card main-dashboard-request-card">

          <div className="main-dashboard-request-content">

            <div className="main-dashboard-request-icon">

              <Icon
                name="inquiry"
                size={26}
              />

            </div>

            <div>

              <h2>
                Property Inquiries
              </h2>

              <p>
                Review enquiries from interested buyers
                and renters.
              </p>

              <Link
                to="/agent-inquiries"
                className="main-dashboard-primary-button"
              >
                View Inquiries
              </Link>

            </div>

          </div>

        </div>


        <div className="main-dashboard-card main-dashboard-quick-actions-card">

          <div className="main-dashboard-card-header">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Manage your estate agent activities.
              </p>

            </div>

          </div>


          <div className="main-dashboard-quick-actions">

            <Link
              to="/agent-listings"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="listing"
                  size={20}
                />

              </span>

              <span>
                My Listings
              </span>

            </Link>


            <Link
              to="/agent-inquiries"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="inquiry"
                  size={20}
                />

              </span>

              <span>
                Inquiries
              </span>

            </Link>


            <Link
              to="/announcements"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="announcement"
                  size={20}
                />

              </span>

              <span>
                Announcements
              </span>

            </Link>

          </div>

        </div>

      </div>

    </>
  );
}


/*
=========================================================
HOA ADMIN DASHBOARD
=========================================================
*/

function HOADashboard({
  user,
}) {

  return (
    <>

      <div className="main-dashboard-header">

        <div>

          <span className="main-dashboard-header-eyebrow">
            HOA ADMIN PORTAL
          </span>

          <h1>
            Welcome back, {user.firstName || "Administrator"}
          </h1>

          <p>
            Manage residents, property activity and
            community operations.
          </p>

        </div>

        <div className="main-dashboard-header-user">

          <div className="main-dashboard-header-avatar">
            {user.initials}
          </div>

        </div>

      </div>


      <div className="main-dashboard-stats-grid">

        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">

              <Icon
                name="registration"
                size={20}
              />

            </div>

            <span className="main-dashboard-stat-label">
              Registration Requests
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">

              <Icon
                name="request"
                size={20}
              />

            </div>

            <span className="main-dashboard-stat-label">
              Property Requests
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">

              <Icon
                name="approval"
                size={20}
              />

            </div>

            <span className="main-dashboard-stat-label">
              Listing Approvals
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>


        <div className="main-dashboard-stat-card">

          <div className="main-dashboard-stat-top">

            <div className="main-dashboard-stat-icon">

              <Icon
                name="complaint"
                size={20}
              />

            </div>

            <span className="main-dashboard-stat-label">
              Complaints
            </span>

          </div>

          <div className="main-dashboard-stat-number">
            0
          </div>

        </div>

      </div>


      <div className="main-dashboard-content-grid">

        {/* =================================================
            PROPERTY REQUESTS
        ================================================= */}

        <div className="main-dashboard-card main-dashboard-request-card">

          <div className="main-dashboard-request-content">

            <div className="main-dashboard-request-icon">

              <Icon
                name="request"
                size={26}
              />

            </div>

            <div>

              <h2>
                Property Requests
              </h2>

              <p>
                Review requests from residents who
                want to sell or rent their
                units.
              </p>

              <Link
                to="/property-requests"
                className="main-dashboard-primary-button"
              >
                Review Property Requests
              </Link>

            </div>

          </div>

        </div>


        {/* =================================================
            PROPERTY APPROVALS
        ================================================= */}

        <div className="main-dashboard-card main-dashboard-request-card">

          <div className="main-dashboard-request-content">

            <div className="main-dashboard-request-icon">

              <Icon
                name="approval"
                size={26}
              />

            </div>

            <div>

              <h2>
                Property Approvals
              </h2>

              <p>
                Review listing information and photos
                submitted by estate agents.
              </p>

              <Link
                to="/property-approvals"
                className="main-dashboard-primary-button"
              >
                Review Approvals
              </Link>

            </div>

          </div>

        </div>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="main-dashboard-card main-dashboard-quick-actions-card">

          <div className="main-dashboard-card-header">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Manage important community activities.
              </p>

            </div>

          </div>


          <div className="main-dashboard-quick-actions">

            <Link
              to="/property-requests"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="request"
                  size={20}
                />

              </span>

              <span>
                Property Requests
              </span>

            </Link>


            <Link
              to="/property-approvals"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="approval"
                  size={20}
                />

              </span>

              <span>
                Property Approvals
              </span>

            </Link>


            <Link
              to="/resident-directory"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="residents"
                  size={20}
                />

              </span>

              <span>
                Residents
              </span>

            </Link>


            <Link
              to="/community-analytics"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="analytics"
                  size={20}
                />

              </span>

              <span>
                Community Analytics
              </span>

            </Link>

          </div>

        </div>


        {/* =================================================
            COMMUNITY MANAGEMENT
        ================================================= */}

        <div className="main-dashboard-card">

          <div className="main-dashboard-card-header">

            <div>

              <h2>
                Community Management
              </h2>

              <p>
                Manage the development and its residents.
              </p>

            </div>

          </div>


          <div className="main-dashboard-quick-actions">

            <Link
              to="/resident-directory"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="residents"
                  size={20}
                />

              </span>

              <span>
                Resident Directory
              </span>

            </Link>


            <Link
              to="/resident-complaints"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="complaint"
                  size={20}
                />

              </span>

              <span>
                Complaints
              </span>

            </Link>


            <Link
              to="/maintenance"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="maintenance"
                  size={20}
                />

              </span>

              <span>
                Maintenance
              </span>

            </Link>


            <Link
              to="/community-announcements"
              className="main-dashboard-quick-action"
            >

              <span className="main-dashboard-quick-action-icon">

                <Icon
                  name="announcement"
                  size={20}
                />

              </span>

              <span>
                Announcements
              </span>

            </Link>

          </div>

        </div>

      </div>

    </>
  );
}


/*
=========================================================
MAIN DASHBOARD
=========================================================
*/

function Dashboard({
  role,
}) {

  const user =
    getCurrentUser();


  /*
  -------------------------------------------------------
  SAFETY
  -------------------------------------------------------
  */

  if (!user) {

    return (
      <div className="main-dashboard-layout">

        <main className="main-dashboard-main">

          <div className="main-dashboard-empty-state">

            <div className="main-dashboard-empty-icon">

              <Icon
                name="profile"
                size={30}
              />

            </div>

            <h3>
              User information unavailable
            </h3>

            <p>
              Please log in again to continue.
            </p>

          </div>

        </main>

      </div>
    );
  }


  /*
  -------------------------------------------------------
  DETERMINE ROLE
  -------------------------------------------------------
  */

  const normalizedRole =
    toRole(role || user.role);



  /*
  -------------------------------------------------------
  ROLE CONTENT
  -------------------------------------------------------
  */

  let dashboardContent;


  if (
    normalizedRole === ROLES.resident
  ) {

    dashboardContent = (
      <ResidentDashboard
        user={user}
      />
    );

  }

  else if (
    normalizedRole === ROLES.estateAgent
  ) {

    dashboardContent = (
      <AgentDashboard
        user={user}
      />
    );

  }

  else if (
    normalizedRole === ROLES.hoaAdmin ||
    normalizedRole === "head_admin"
  ) {

    dashboardContent = (
      <HOADashboard
        user={user}
      />
    );

  }

  else {

    dashboardContent = (
      <ResidentDashboard
        user={user}
      />
    );

  }


  return (

    <div className="main-dashboard-layout">

      {/* =================================================
          SHARED DASHBOARD SIDEBAR
          
          IMPORTANT:
          This is now the SAME sidebar used by
          Maintenance and the other dashboard pages.
      ================================================= */}

      <DashboardSidebar
        suppliedUser={user}
      />


      <main className="main-dashboard-main">

        {dashboardContent}

      </main>

    </div>

  );
}


export default Dashboard;
