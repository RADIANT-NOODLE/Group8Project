import React from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../shared/DashboardSidebar";
import "./HOAAdminDashboard.css";


/*
=========================================================
VALORA HOA ADMIN DASHBOARD
=========================================================
*/

function HOAAdminDashboard({ user }) {

  return (
    <div className="hoa-admin-dashboard-layout">

      <DashboardSidebar
        suppliedUser={user}
      />


      <main className="hoa-admin-dashboard-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="hoa-admin-dashboard-header">

          <div>

            <span className="hoa-admin-dashboard-eyebrow">
              HOA ADMIN PORTAL
            </span>

            <h1>
              Welcome back, {user.firstName || "Administrator"}
            </h1>

            <p>
              Manage residents, property requests, complaints
              and your community.
            </p>

          </div>

          <div className="hoa-admin-dashboard-avatar">
            {user.initials}
          </div>

        </div>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="hoa-admin-dashboard-stats">

          <div className="hoa-admin-dashboard-stat-card">

            <div className="hoa-admin-dashboard-stat-top">

              <div className="hoa-admin-dashboard-stat-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>

              </div>

              <span>
                Residents
              </span>

            </div>

            <strong>
              0
            </strong>

          </div>


          <div className="hoa-admin-dashboard-stat-card">

            <div className="hoa-admin-dashboard-stat-top">

              <div className="hoa-admin-dashboard-stat-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                  />
                  <path d="M7 8h10" />
                  <path d="M7 12h10" />
                  <path d="M7 16h6" />
                </svg>

              </div>

              <span>
                Property Requests
              </span>

            </div>

            <strong>
              0
            </strong>

          </div>


          <div className="hoa-admin-dashboard-stat-card">

            <div className="hoa-admin-dashboard-stat-top">

              <div className="hoa-admin-dashboard-stat-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                  <path d="M20 9v6" />
                </svg>

              </div>

              <span>
                Complaints
              </span>

            </div>

            <strong>
              0
            </strong>

          </div>


          <div className="hoa-admin-dashboard-stat-card">

            <div className="hoa-admin-dashboard-stat-top">

              <div className="hoa-admin-dashboard-stat-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V8l7-5 7 5v13" />
                  <path d="M9 21v-5h6v5" />
                  <path d="M9 10h6" />
                </svg>

              </div>

              <span>
                Properties
              </span>

            </div>

            <strong>
              8
            </strong>

          </div>

        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="hoa-admin-dashboard-content">


          {/* =================================================
              PROPERTY REQUESTS
          ================================================= */}

          <section className="hoa-admin-dashboard-card">

            <div className="hoa-admin-dashboard-card-header">

              <div>

                <h2>
                  Property Requests
                </h2>

                <p>
                  Review resident and investor requests to
                  sell or rent properties.
                </p>

              </div>

              <Link
                to="/property-requests"
                className="hoa-admin-dashboard-card-link"
              >
                View Requests
              </Link>

            </div>


            <div className="hoa-admin-dashboard-empty-state">

              <div className="hoa-admin-dashboard-empty-icon">

                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                  />
                  <path d="M7 8h10" />
                  <path d="M7 12h10" />
                  <path d="M7 16h6" />
                </svg>

              </div>

              <h3>
                No pending property requests
              </h3>

              <p>
                New requests submitted by residents and
                investors will appear here.
              </p>

            </div>

          </section>


          {/* =================================================
              RESIDENT DIRECTORY
          ================================================= */}

          <section className="hoa-admin-dashboard-card">

            <div className="hoa-admin-dashboard-card-header">

              <div>

                <h2>
                  Resident Directory
                </h2>

                <p>
                  View and manage residents within the
                  development.
                </p>

              </div>

              <Link
                to="/resident-directory"
                className="hoa-admin-dashboard-card-link"
              >
                View Directory
              </Link>

            </div>


            <div className="hoa-admin-dashboard-empty-state">

              <div className="hoa-admin-dashboard-empty-icon">

                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>

              </div>

              <h3>
                Resident directory
              </h3>

              <p>
                Registered residents and their property
                information will appear here.
              </p>

            </div>

          </section>


          {/* =================================================
              COMPLAINTS
          ================================================= */}

          <section className="hoa-admin-dashboard-card">

            <div className="hoa-admin-dashboard-card-header">

              <div>

                <h2>
                  Resident Complaints
                </h2>

                <p>
                  Monitor complaints and update their
                  resolution status.
                </p>

              </div>

              <Link
                to="/resident-complaints"
                className="hoa-admin-dashboard-card-link"
              >
                View Complaints
              </Link>

            </div>


            <div className="hoa-admin-dashboard-empty-state">

              <div className="hoa-admin-dashboard-empty-icon">

                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                  <path d="M20 9v6" />
                </svg>

              </div>

              <h3>
                No complaints to review
              </h3>

              <p>
                Resident complaints will appear here for
                administration and resolution.
              </p>

            </div>

          </section>


          {/* =================================================
              PROPERTY APPROVALS
          ================================================= */}

          <section className="hoa-admin-dashboard-card">

            <div className="hoa-admin-dashboard-card-header">

              <div>

                <h2>
                  Property Approvals
                </h2>

                <p>
                  Review estate agent listing changes before
                  they are published.
                </p>

              </div>

              <Link
                to="/property-approvals"
                className="hoa-admin-dashboard-card-link"
              >
                Review Approvals
              </Link>

            </div>


            <div className="hoa-admin-dashboard-empty-state">

              <div className="hoa-admin-dashboard-empty-icon">

                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>

              </div>

              <h3>
                No listing approvals pending
              </h3>

              <p>
                Estate agent listing submissions will appear
                here before publication.
              </p>

            </div>

          </section>


          {/* =================================================
              COMMUNITY MANAGEMENT
          ================================================= */}

          <section className="hoa-admin-dashboard-card hoa-admin-dashboard-wide-card">

            <div className="hoa-admin-dashboard-card-header">

              <div>

                <h2>
                  Community Management
                </h2>

                <p>
                  Access the main tools used to manage the
                  development.
                </p>

              </div>

            </div>


            <div className="hoa-admin-dashboard-actions">

              <Link
                to="/maintenance"
                className="hoa-admin-dashboard-action"
              >

                <span className="hoa-admin-dashboard-action-icon">

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-2.8-2.8Z" />
                    <path d="m16 4 4 4" />
                  </svg>

                </span>

                <span>
                  Maintenance
                </span>

              </Link>


              <Link
                to="/community-announcements"
                className="hoa-admin-dashboard-action"
              >

                <span className="hoa-admin-dashboard-action-icon">

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                    <path d="M20 9v6" />
                  </svg>

                </span>

                <span>
                  Announcements
                </span>

              </Link>


              <Link
                to="/providers"
                className="hoa-admin-dashboard-action"
              >

                <span className="hoa-admin-dashboard-action-icon">

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 7h-5l-2-2H9L7 7H4a2 2 0 0 0-2 2v9h20V9a2 2 0 0 0-2-2Z" />
                    <path d="M8 12h8" />
                    <path d="M12 9v6" />
                  </svg>

                </span>

                <span>
                  Service Providers
                </span>

              </Link>


              <Link
                to="/community-analytics"
                className="hoa-admin-dashboard-action"
              >

                <span className="hoa-admin-dashboard-action-icon">

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M8 16v-5" />
                    <path d="M12 16V8" />
                    <path d="M16 16v-9" />
                  </svg>

                </span>

                <span>
                  Community Analytics
                </span>

              </Link>


              <Link
                to="/ai-training-data"
                className="hoa-admin-dashboard-action"
              >

                <span className="hoa-admin-dashboard-action-icon">

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="5"
                      y="5"
                      width="14"
                      height="14"
                      rx="3"
                    />
                    <path d="M9 9h6v6H9z" />
                    <path d="M9 2v3" />
                    <path d="M15 2v3" />
                    <path d="M9 19v3" />
                    <path d="M15 19v3" />
                    <path d="M2 9h3" />
                    <path d="M2 15h3" />
                    <path d="M19 9h3" />
                    <path d="M19 15h3" />
                  </svg>

                </span>

                <span>
                  AI Training Data
                </span>

              </Link>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


export default HOAAdminDashboard;
