import React from "react";
import "./CommunityAnalytics.css";

function CommunityAnalytics() {

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };


  /* =========================================================
     VIEW MESSAGE
  ========================================================= */

  const handleView = (message) => {
    alert(message);
  };


  /* =========================================================
     SVG ICONS
  ========================================================= */

  const DashboardIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
    </svg>
  );

  const UsersIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4ZM8 13c-.29 0-.62.02-.97.05C4.69 13.34 1 14.54 1 17v2h5v-2c0-1.56.93-2.79 2.42-3.74A7.25 7.25 0 0 0 8 13Z" />
    </svg>
  );

  const ComplaintsIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6.59L9 21.41V18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4v2h12V7H6Zm0 4v2h8v-2H6Z" />
    </svg>
  );

  const MaintenanceIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21.7 19.3-5.2-5.2a6.02 6.02 0 0 0-7.55-7.55L12 9.6l-2.4 2.4-3.05-3.05a6.02 6.02 0 0 0 7.55 7.55l5.2 5.2a1.7 1.7 0 0 0 2.4-2.4ZM5.5 6.5a3.9 3.9 0 0 1 1.1-.77l3.15 3.15-1.46 1.46L5.14 7.2c.1-.24.22-.47.36-.7Z" />
    </svg>
  );

  const AnnouncementIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4a2 2 0 0 0 2 2h2l2 5h2l-2-5h2l7 3V5l-7 3H6a2 2 0 0 0-2 2Zm15-2.94v9.88A2 2 0 0 0 21 15V9a2 2 0 0 0-2-1.94Z" />
    </svg>
  );

  const AIIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a3 3 0 0 1 3 3v1.1a7 7 0 0 1 3.9 3.9H20a2 2 0 1 1 0 4h-1.1a7 7 0 0 1-3.9 3.9V19a3 3 0 1 1-6 0v-1.1A7 7 0 0 1 5.1 14H4a2 2 0 1 1 0-4h1.1A7 7 0 0 1 9 6.1V5a3 3 0 0 1 3-3Zm0 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 3a2 2 0 1 1 0 0 2 2 0 0 1 0-2Z" />
    </svg>
  );

  const AnalyticsIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19h16v2H2V3h2v16Zm2-2V9h3v8H6Zm5 0V5h3v12h-3Zm5 0v-6h3v6h-3Z" />
    </svg>
  );

  const ProfileIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5Z" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5v-2H5V6h5V4Zm6 3-1.41 1.41L17.17 11H9v2h8.17l-2.58 2.59L16 17l5-5-5-5Z" />
    </svg>
  );

  const TrendIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 16 6-6 4 4 6-7 1.5 1.3-7.5 8.7-4-4-4.5 4.5L4 16Z" />
    </svg>
  );


  return (
    <div className="community-analytics-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="community-analytics-sidebar">

        <div className="community-analytics-logo-area">

          <img
            src="/ValoraLogo.jpeg"
            alt="VALORA Logo"
          />

          <p>
            Property Intelligence
          </p>

        </div>


        <nav className="community-analytics-side-nav">

          <a href="/dashboard">
            <DashboardIcon />
            <span>Dashboard</span>
          </a>

          <a href="/resident-directory">
            <UsersIcon />
            <span>Resident Directory</span>
          </a>

          <a href="/resident-complaints">
            <ComplaintsIcon />
            <span>Resident Complaints</span>
          </a>

          <a href="/maintenance">
            <MaintenanceIcon />
            <span>Maintenance</span>
          </a>

          <a href="/community-announcements">
            <AnnouncementIcon />
            <span>Community Announcements</span>
          </a>

          <a href="/ai-training-data">
            <AIIcon />
            <span>AI Training Data</span>
          </a>

          <a
            href="/community-analytics"
            className="active"
          >
            <AnalyticsIcon />
            <span>Community Analytics</span>
          </a>

          <a href="/profile">
            <ProfileIcon />
            <span>My Profile</span>
          </a>

        </nav>


        <div className="community-analytics-logout-area">

          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              handleLogout();
            }}
          >
            <LogoutIcon />
            <span>Logout</span>
          </a>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="community-analytics-main">

        {/* TOP BAR */}

        <div className="community-analytics-top-bar">

          <div>

            <h2>
              Community Analytics
            </h2>

            <p>
              Monitor community performance, property activity and resident trends.
            </p>

          </div>


          <div className="community-analytics-profile-small">

            <div className="community-analytics-profile-circle">
              <ProfileIcon />
            </div>

            <span>
              HOA Admin
            </span>

          </div>

        </div>


        {/* ===================================================
            STAT CARDS
        =================================================== */}

        <section className="community-analytics-stat-cards">

          <div className="community-analytics-stat-card">

            <span className="community-analytics-stat-icon">
              <UsersIcon />
            </span>

            <div>

              <p>
                Total Residents
              </p>

              <h3>
                128
              </h3>

              <small>
                Registered residents
              </small>

            </div>

          </div>


          <div className="community-analytics-stat-card">

            <span className="community-analytics-stat-icon">
              <AnalyticsIcon />
            </span>

            <div>

              <p>
                Occupied Properties
              </p>

              <h3>
                94
              </h3>

              <small>
                Currently occupied
              </small>

            </div>

          </div>


          <div className="community-analytics-stat-card">

            <span className="community-analytics-stat-icon">
              <MaintenanceIcon />
            </span>

            <div>

              <p>
                Open Requests
              </p>

              <h3>
                4
              </h3>

              <small>
                Maintenance issues
              </small>

            </div>

          </div>


          <div className="community-analytics-stat-card">

            <span className="community-analytics-stat-icon">
              <AnnouncementIcon />
            </span>

            <div>

              <p>
                Announcements
              </p>

              <h3>
                5
              </h3>

              <small>
                Published notices
              </small>

            </div>

          </div>

        </section>


        {/* ===================================================
            RESIDENT + PROPERTY OVERVIEW
        =================================================== */}

        <section className="community-analytics-grid">

          <div className="community-analytics-panel">

            <div className="community-analytics-panel-heading">

              <div>

                <h3>
                  Resident Overview
                </h3>

                <p>
                  Current community resident statistics.
                </p>

              </div>

              <button
                className="community-analytics-secondary-btn"
                onClick={() =>
                  handleView(
                    "Resident Directory contains 128 registered residents."
                  )
                }
              >
                View
              </button>

            </div>


            <div className="community-analytics-property-summary">

              <div>
                <span>Residents</span>
                <strong>128</strong>
              </div>

              <div>
                <span>Owners</span>
                <strong>76</strong>
              </div>

              <div>
                <span>Tenants</span>
                <strong>52</strong>
              </div>

              <div>
                <span>New This Month</span>
                <strong>6</strong>
              </div>

            </div>

          </div>


          <div className="community-analytics-panel">

            <div className="community-analytics-panel-heading">

              <div>

                <h3>
                  Property Overview
                </h3>

                <p>
                  Current property occupancy statistics.
                </p>

              </div>

              <button
                className="community-analytics-secondary-btn"
                onClick={() =>
                  handleView(
                    "There are currently 94 occupied properties and 12 vacant properties."
                  )
                }
              >
                View
              </button>

            </div>


            <div className="community-analytics-property-summary">

              <div>
                <span>Total Units</span>
                <strong>106</strong>
              </div>

              <div>
                <span>Occupied</span>
                <strong>94</strong>
              </div>

              <div>
                <span>Vacant</span>
                <strong>12</strong>
              </div>

              <div>
                <span>Occupancy</span>
                <strong>89%</strong>
              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            COMMUNITY PERFORMANCE
        =================================================== */}

        <section className="community-analytics-panel community-analytics-large-panel">

          <div className="community-analytics-panel-heading">

            <div>

              <h3>
                Community Performance
              </h3>

              <p>
                Overview of key community management indicators.
              </p>

            </div>

          </div>


          <div className="community-analytics-table-container">

            <table className="community-analytics-data-table">

              <thead>

                <tr>
                  <th>Category</th>
                  <th>Metric</th>
                  <th>Current</th>
                  <th>Previous Month</th>
                  <th>Trend</th>
                  <th>Status</th>
                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>Residents</td>

                  <td>Registered Residents</td>

                  <td>128</td>

                  <td>122</td>

                  <td className="community-analytics-positive-trend">
                    <TrendIcon />
                    ↑ 4.9%
                  </td>

                  <td>
                    <span className="community-analytics-status positive">
                      Positive
                    </span>
                  </td>

                </tr>


                <tr>

                  <td>Properties</td>

                  <td>Occupancy Rate</td>

                  <td>89%</td>

                  <td>87%</td>

                  <td className="community-analytics-positive-trend">
                    <TrendIcon />
                    ↑ 2.0%
                  </td>

                  <td>
                    <span className="community-analytics-status positive">
                      Positive
                    </span>
                  </td>

                </tr>


                <tr>

                  <td>Complaints</td>

                  <td>Open Complaints</td>

                  <td>7</td>

                  <td>10</td>

                  <td className="community-analytics-positive-trend">
                    <TrendIcon />
                    ↓ 30%
                  </td>

                  <td>
                    <span className="community-analytics-status positive">
                      Improved
                    </span>
                  </td>

                </tr>


                <tr>

                  <td>Maintenance</td>

                  <td>Active Requests</td>

                  <td>4</td>

                  <td>6</td>

                  <td className="community-analytics-positive-trend">
                    <TrendIcon />
                    ↓ 33%
                  </td>

                  <td>
                    <span className="community-analytics-status positive">
                      Improved
                    </span>
                  </td>

                </tr>


                <tr>

                  <td>Announcements</td>

                  <td>Published Notices</td>

                  <td>5</td>

                  <td>4</td>

                  <td className="community-analytics-positive-trend">
                    <TrendIcon />
                    ↑ 25%
                  </td>

                  <td>
                    <span className="community-analytics-status active">
                      Active
                    </span>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>


        {/* ===================================================
            COMPLAINT TRENDS + COMMUNITY HEALTH
        =================================================== */}

        <section className="community-analytics-grid">

          <div className="community-analytics-panel">

            <div className="community-analytics-panel-heading">

              <div>

                <h3>
                  Complaint Trends
                </h3>

                <p>
                  Monitor resident complaint activity.
                </p>

              </div>

            </div>


            <div className="community-analytics-quick-actions">

              <a href="/resident-complaints">
                <ComplaintsIcon />
                <span>View Complaints</span>
              </a>


              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();

                  alert(
                    "Most common complaint category: Maintenance."
                  );
                }}
              >
                <AnalyticsIcon />
                <span>View Complaint Trends</span>
              </a>


              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();

                  alert(
                    "Complaint analysis feature coming soon."
                  );
                }}
              >
                <AIIcon />
                <span>AI Analysis</span>
              </a>

            </div>

          </div>


          <div className="community-analytics-panel">

            <div className="community-analytics-panel-heading">

              <div>

                <h3>
                  Community Health
                </h3>

                <p>
                  Overall community performance indicator.
                </p>

              </div>

            </div>


            <div className="community-analytics-property-summary">

              <div>
                <span>Occupancy</span>
                <strong>89%</strong>
              </div>

              <div>
                <span>Complaints</span>
                <strong>7</strong>
              </div>

              <div>
                <span>Maintenance</span>
                <strong>4</strong>
              </div>

              <div>
                <span>Rating</span>
                <strong>4.6/5</strong>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CommunityAnalytics;
