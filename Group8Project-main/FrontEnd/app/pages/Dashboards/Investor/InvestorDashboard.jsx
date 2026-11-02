import React, { use } from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../shared/DashboardSidebar";
import "./InvestorDashboard.css";


/*
=========================================================
INVESTOR DASHBOARD
=========================================================
*/

function InvestorDashboard({ user}) {
  if (!user) {
    return<div>Loading...</div>;
  }

  return (
    <div className="investor-dashboard-layout">

      <DashboardSidebar
        suppliedUser={user}
      />


      <main className="investor-dashboard-main">

        {/* =================================================
            DASHBOARD HEADER
        ================================================= */}

        <div className="investor-dashboard-header">

          <div>

            <span className="investor-dashboard-header-eyebrow">
              INVESTOR PORTAL
            </span>

            <h1>
              Welcome back, {user?.firstName || "Investor"}
            </h1>

            <p>
              Review properties, valuations and investment
              opportunities.
            </p>

          </div>

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="investor-dashboard-stats-grid">

          <div className="investor-dashboard-stat-card">

            <div className="investor-dashboard-stat-top">

              <div className="investor-dashboard-stat-icon">

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

              <span className="investor-dashboard-stat-label">
                Properties
              </span>

            </div>

            <div className="investor-dashboard-stat-number">
              {user.myProperty ? "1" : "0"}
            </div>

          </div>


          <div className="investor-dashboard-stat-card">

            <div className="investor-dashboard-stat-top">

              <div className="investor-dashboard-stat-icon">

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
                  <path d="M5 19 19 5" />
                  <circle cx="7" cy="7" r="2.5" />
                  <circle cx="17" cy="17" r="2.5" />
                </svg>

              </div>

              <span className="investor-dashboard-stat-label">
                ROI Analysis
              </span>

            </div>

            <div className="investor-dashboard-stat-number">
              0
            </div>

          </div>


          <div className="investor-dashboard-stat-card">

            <div className="investor-dashboard-stat-top">

              <div className="investor-dashboard-stat-icon">

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

              <span className="investor-dashboard-stat-label">
                Sell/Rent
              </span>

            </div>

            <div className="investor-dashboard-stat-number">
              0
            </div>

          </div>


          <div className="investor-dashboard-stat-card">

            <div className="investor-dashboard-stat-top">

              <div className="investor-dashboard-stat-icon">

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

              <span className="investor-dashboard-stat-label">
                Announcements
              </span>

            </div>

            <div className="investor-dashboard-stat-number">
              0
            </div>

          </div>

        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="investor-dashboard-content-grid">

          {/* =================================================
              MY PROPERTIES
          ================================================= */}

          <div className="investor-dashboard-card">

            <div className="investor-dashboard-card-header">

              <div>

                <h2>
                  My Properties
                </h2>

                <p>
                  Properties linked to your investment profile.
                </p>

              </div>

              <Link
                to="/property"
                className="investor-dashboard-view-all"
              >
                View Properties
              </Link>

            </div>


            {user.myProperty ? (

              <div className="investor-dashboard-property-summary">

                <div className="investor-dashboard-property-summary-icon">

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

                <div className="investor-dashboard-property-summary-content">

                  <strong>
                    {user.myProperty}
                  </strong>

                  <span>
                    Investment property
                  </span>

                </div>

              </div>

            ) : (

              <div className="investor-dashboard-empty-state">

                <div className="investor-dashboard-empty-icon">

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
                  Properties associated with your account
                  will appear here.
                </p>

              </div>

            )}

          </div>


          {/* =================================================
              SELL / RENT
          ================================================= */}

          <div className="investor-dashboard-card investor-dashboard-request-card">

            <div className="investor-dashboard-request-content">

              <div className="investor-dashboard-request-icon">

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
                  Sell or rent a property
                </h2>

                <p>
                  Submit a request to the HOA for review.
                </p>

                <Link
                  to="/request-to-sell"
                  className="investor-dashboard-primary-button"
                >
                  Sell/Rent Property
                </Link>

              </div>

            </div>

          </div>


          {/* =================================================
              INVESTMENT TOOLS
          ================================================= */}

          <div className="investor-dashboard-card investor-dashboard-quick-actions-card">

            <div className="investor-dashboard-card-header">

              <div>

                <h2>
                  Investment Tools
                </h2>

                <p>
                  Review your investment information.
                </p>

              </div>

            </div>


            <div className="investor-dashboard-quick-actions">

              <Link
                to="/roi"
                className="investor-dashboard-quick-action"
              >

                <span className="investor-dashboard-quick-action-icon">

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
                    <path d="M5 19 19 5" />
                    <circle cx="7" cy="7" r="2.5" />
                    <circle cx="17" cy="17" r="2.5" />
                  </svg>

                </span>

                <span>
                  ROI &amp; Valuation
                </span>

              </Link>


              <Link
                to="/property"
                className="investor-dashboard-quick-action"
              >

                <span className="investor-dashboard-quick-action-icon">

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

                </span>

                <span>
                  Properties
                </span>

              </Link>


              <Link
                to="/announcements"
                className="investor-dashboard-quick-action"
              >

                <span className="investor-dashboard-quick-action-icon">

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


export default InvestorDashboard;
