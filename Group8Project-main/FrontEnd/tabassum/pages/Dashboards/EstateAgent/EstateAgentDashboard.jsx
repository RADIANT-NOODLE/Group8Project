import React from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../shared/DashboardSidebar";
import "./EstateAgentDashboard.css";


/*
=========================================================
VALORA ESTATE AGENT DASHBOARD
=========================================================
*/

function EstateAgentDashboard({ user }) {

  return (
    <div className="estate-agent-dashboard-layout">

      <DashboardSidebar
        suppliedUser={user}
      />


      <main className="estate-agent-dashboard-main">

        {/* =================================================
            DASHBOARD HEADER
        ================================================= */}

        <div className="estate-agent-dashboard-header">

          <div>

            <span className="estate-agent-dashboard-eyebrow">
              ESTATE AGENT PORTAL
            </span>

            <h1>
              Welcome back, {user.firstName || "Agent"}
            </h1>

            <p>
              Manage your assigned property listings and
              property inquiries.
            </p>

          </div>

          <div className="estate-agent-dashboard-avatar">
            {user.initials}
          </div>

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="estate-agent-dashboard-stats">

          <div className="estate-agent-dashboard-stat-card">

            <div className="estate-agent-dashboard-stat-top">

              <div className="estate-agent-dashboard-stat-icon">

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
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5.5 9.5V21h13V9.5" />
                  <path d="M9 21v-6h6v6" />
                </svg>

              </div>

              <span>
                My Listings
              </span>

            </div>

            <strong>
              0
            </strong>

          </div>


          <div className="estate-agent-dashboard-stat-card">

            <div className="estate-agent-dashboard-stat-top">

              <div className="estate-agent-dashboard-stat-icon">

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
                    x="4"
                    y="5"
                    width="16"
                    height="14"
                    rx="2"
                  />
                  <path d="M8 9h8" />
                  <path d="M8 13h5" />
                  <path d="M8 16h3" />
                </svg>

              </div>

              <span>
                Inquiries
              </span>

            </div>

            <strong>
              0
            </strong>

          </div>


          <div className="estate-agent-dashboard-stat-card">

            <div className="estate-agent-dashboard-stat-top">

              <div className="estate-agent-dashboard-stat-icon">

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
                  <path d="M4 19 10 13l4 4 6-8" />
                  <path d="M15 9h5v5" />
                  <path d="M4 5h16" />
                </svg>

              </div>

              <span>
                Valuations
              </span>

            </div>

            <strong>
              0
            </strong>

          </div>


          <div className="estate-agent-dashboard-stat-card">

            <div className="estate-agent-dashboard-stat-top">

              <div className="estate-agent-dashboard-stat-icon">

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
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8" />
                  <path d="M8 13h5" />
                  <path d="M8 17h3" />
                </svg>

              </div>

              <span>
                Announcements
              </span>

            </div>

            <strong>
              0
            </strong>

          </div>

        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="estate-agent-dashboard-content">

          {/* =================================================
              MY LISTINGS
          ================================================= */}

          <section className="estate-agent-dashboard-card">

            <div className="estate-agent-dashboard-card-header">

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
                className="estate-agent-dashboard-card-link"
              >
                View Listings
              </Link>

            </div>


            <div className="estate-agent-dashboard-empty-state">

              <div className="estate-agent-dashboard-empty-icon">

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
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5.5 9.5V21h13V9.5" />
                  <path d="M9 21v-6h6v6" />
                </svg>

              </div>

              <h3>
                No listings assigned yet
              </h3>

              <p>
                Properties assigned to you will appear here
                once the HOA approves a property request.
              </p>

            </div>

          </section>


          {/* =================================================
              PROPERTY INQUIRIES
          ================================================= */}

          <section className="estate-agent-dashboard-card">

            <div className="estate-agent-dashboard-card-header">

              <div>

                <h2>
                  Property Inquiries
                </h2>

                <p>
                  Review inquiries from potential buyers
                  and tenants.
                </p>

              </div>

              <Link
                to="/agent-inquiries"
                className="estate-agent-dashboard-card-link"
              >
                View Inquiries
              </Link>

            </div>


            <div className="estate-agent-dashboard-empty-state">

              <div className="estate-agent-dashboard-empty-icon">

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
                    x="4"
                    y="5"
                    width="16"
                    height="14"
                    rx="2"
                  />
                  <path d="M8 9h8" />
                  <path d="M8 13h5" />
                  <path d="M8 16h3" />
                </svg>

              </div>

              <h3>
                No inquiries yet
              </h3>

              <p>
                New property inquiries will appear here.
              </p>

            </div>

          </section>


          {/* =================================================
              AGENT ACTIONS
          ================================================= */}

          <section className="estate-agent-dashboard-card estate-agent-dashboard-actions-card">

            <div className="estate-agent-dashboard-card-header">

              <div>

                <h2>
                  Agent Tools
                </h2>

                <p>
                  Manage your property activity.
                </p>

              </div>

            </div>


            <div className="estate-agent-dashboard-actions">

              <Link
                to="/agent-listings"
                className="estate-agent-dashboard-action"
              >

                <span className="estate-agent-dashboard-action-icon">

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
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5.5 9.5V21h13V9.5" />
                    <path d="M9 21v-6h6v6" />
                  </svg>

                </span>

                <span>
                  My Listings
                </span>

              </Link>


              <Link
                to="/agent-edit-listings"
                className="estate-agent-dashboard-action"
              >

                <span className="estate-agent-dashboard-action-icon">

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
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                  </svg>

                </span>

                <span>
                  Edit Listings
                </span>

              </Link>


              <Link
                to="/agent-inquiries"
                className="estate-agent-dashboard-action"
              >

                <span className="estate-agent-dashboard-action-icon">

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
                      x="4"
                      y="5"
                      width="16"
                      height="14"
                      rx="2"
                    />
                    <path d="M8 9h8" />
                    <path d="M8 13h5" />
                    <path d="M8 16h3" />
                  </svg>

                </span>

                <span>
                  Property Inquiries
                </span>

              </Link>


              <Link
                to="/valuation"
                className="estate-agent-dashboard-action"
              >

                <span className="estate-agent-dashboard-action-icon">

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
                    <path d="M4 19 10 13l4 4 6-8" />
                    <path d="M15 9h5v5" />
                    <path d="M4 5h16" />
                  </svg>

                </span>

                <span>
                  AI Valuation
                </span>

              </Link>

            </div>

          </section>


          {/* =================================================
              ANNOUNCEMENTS
          ================================================= */}

          <section className="estate-agent-dashboard-card estate-agent-dashboard-announcements-card">

            <div className="estate-agent-dashboard-card-header">

              <div>

                <h2>
                  Announcements
                </h2>

                <p>
                  Important community and platform updates.
                </p>

              </div>

              <Link
                to="/announcements"
                className="estate-agent-dashboard-card-link"
              >
                View Announcements
              </Link>

            </div>


            <div className="estate-agent-dashboard-announcement-empty">

              <div className="estate-agent-dashboard-announcement-icon">

                <svg
                  width="24"
                  height="24"
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
                No new announcements
              </span>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


export default EstateAgentDashboard;
