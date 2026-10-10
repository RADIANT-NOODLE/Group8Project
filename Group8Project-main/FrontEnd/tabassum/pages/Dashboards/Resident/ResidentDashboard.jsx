import React from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../shared/DashboardSidebar";
import "./ResidentDashboard.css";


/*
=========================================================
RESIDENT DASHBOARD
=========================================================
*/

function ResidentDashboard({
  user,
}) {

  return (
    <div className="resident-dashboard-layout">

      <DashboardSidebar
        suppliedUser={user}
      />


      <main className="resident-dashboard-main">

        {/* =================================================
            DASHBOARD HEADER
        ================================================= */}

        <div className="resident-dashboard-header">

          <div>

            <span className="resident-dashboard-header-eyebrow">
              RESIDENT PORTAL
            </span>

            <h1>
              Welcome back, {user.firstName || "Resident"}
            </h1>

            <p>
              Manage your property and community activity.
            </p>

          </div>

          <div className="resident-dashboard-header-user">

            <div className="resident-dashboard-header-avatar">
              {user.initials}
            </div>

          </div>

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="resident-dashboard-stats-grid">

          <div className="resident-dashboard-stat-card">

            <div className="resident-dashboard-stat-top">

              <div className="resident-dashboard-stat-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5.5 9.5V21h13V9.5" />
                  <path d="M9 21v-6h6v6" />
                </svg>

              </div>

              <span className="resident-dashboard-stat-label">
                My Property
              </span>

            </div>

            <div className="resident-dashboard-stat-number">
              {user.myProperty ? "1" : "0"}
            </div>

          </div>


          <div className="resident-dashboard-stat-card">

            <div className="resident-dashboard-stat-top">

              <div className="resident-dashboard-stat-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3 21 6v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9V6l9-3Z" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>

              </div>

              <span className="resident-dashboard-stat-label">
                Complaints
              </span>

            </div>

            <div className="resident-dashboard-stat-number">
              0
            </div>

          </div>


          <div className="resident-dashboard-stat-card">

            <div className="resident-dashboard-stat-top">

              <div className="resident-dashboard-stat-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.2 2.2-2.8-.8-.8-2.8 2.8-2.2Z" />
                </svg>

              </div>

              <span className="resident-dashboard-stat-label">
                Maintenance
              </span>

            </div>

            <div className="resident-dashboard-stat-number">
              0
            </div>

          </div>


          <div className="resident-dashboard-stat-card">

            <div className="resident-dashboard-stat-top">

              <div className="resident-dashboard-stat-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                  <path d="M20 9v6" />
                </svg>

              </div>

              <span className="resident-dashboard-stat-label">
                Announcements
              </span>

            </div>

            <div className="resident-dashboard-stat-number">
              0
            </div>

          </div>

        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="resident-dashboard-content-grid">

          {/* =================================================
              MY PROPERTY
          ================================================= */}

          <div className="resident-dashboard-card">

            <div className="resident-dashboard-card-header">

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
                className="resident-dashboard-view-all"
              >
                View Property
              </Link>

            </div>


            {user.myProperty ? (

              <div className="resident-dashboard-property-summary">

                <div className="resident-dashboard-property-summary-icon">

                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5.5 9.5V21h13V9.5" />
                    <path d="M9 21v-6h6v6" />
                  </svg>

                </div>

                <div className="resident-dashboard-property-summary-content">

                  <strong>
                    {user.myProperty}
                  </strong>

                  <span>
                    Your registered property
                  </span>

                </div>

                <span className="resident-dashboard-property-status">
                  Registered
                </span>

              </div>

            ) : (

              <div className="resident-dashboard-empty-state">

                <div className="resident-dashboard-empty-icon">

                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5.5 9.5V21h13V9.5" />
                    <path d="M9 21v-6h6v6" />
                  </svg>

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

          <div className="resident-dashboard-card resident-dashboard-request-card">

            <div className="resident-dashboard-request-content">

              <div className="resident-dashboard-request-icon">

                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
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
                  className="resident-dashboard-primary-button"
                >
                  Request to Sell/Rent
                </Link>

              </div>

            </div>

          </div>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div className="resident-dashboard-card resident-dashboard-quick-actions-card">

            <div className="resident-dashboard-card-header">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Common resident actions.
                </p>

              </div>

            </div>


            <div className="resident-dashboard-quick-actions">

              <Link
                to="/complaints"
                className="resident-dashboard-quick-action"
              >

                <span className="resident-dashboard-quick-action-icon">

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3 21 6v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9V6l9-3Z" />
                    <path d="M12 8v5" />
                    <path d="M12 16h.01" />
                  </svg>

                </span>

                <span>
                  Complaints
                </span>

              </Link>


              <Link
                to="/maintenance"
                className="resident-dashboard-quick-action"
              >

                <span className="resident-dashboard-quick-action-icon">

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.2 2.2-2.8-.8-2.2.8-2.2 2.8Z" />
                  </svg>

                </span>

                <span>
                  Maintenance
                </span>

              </Link>


              <Link
                to="/announcements"
                className="resident-dashboard-quick-action"
              >

                <span className="resident-dashboard-quick-action-icon">

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                    <path d="M20 9v6" />
                  </svg>

                </span>

                <span>
                  Announcements
                </span>

              </Link>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


export default ResidentDashboard;
