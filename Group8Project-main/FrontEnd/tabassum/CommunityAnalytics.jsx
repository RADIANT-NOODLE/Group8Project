import React from "react";

function CommunityAnalytics() {
  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  const handleView = (message) => {
    alert(message);
  };

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">

        <div className="logo-area">

          <img
            src="/ValoraLogo.jpeg"
            alt="VALORA Logo"
          />

          <p>
            Property Intelligence
          </p>

        </div>

        <nav className="side-nav">

          <a href="/dashboard">
            🏠 Dashboard
          </a>

          <a href="/resident-directory">
            👥 Resident Directory
          </a>

          <a href="/resident-complaints">
            📋 Resident Complaints
          </a>

          <a href="/maintenance">
            🔧 Maintenance
          </a>

          <a href="/community-announcements">
            📢 Community Announcements
          </a>

          <a href="/ai-training-data">
            🤖 AI Training Data
          </a>

          <a
            href="/community-analytics"
            className="active"
          >
            📊 Community Analytics
          </a>

          <a href="/profile">
            👤 My Profile
          </a>

        </nav>

        <div className="logout-area">

          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              handleLogout();
            }}
          >
            🚪 Logout
          </a>

        </div>

      </aside>

      <main className="dashboard-main">

        <div className="top-bar">

          <div>

            <h2>
              Community Analytics
            </h2>

            <p>
              Monitor community performance, property activity and resident trends.
            </p>

          </div>

          <div className="profile-small">

            <div className="profile-circle">
              HOA
            </div>

            <span>
              HOA Admin
            </span>

          </div>

        </div>

        <section className="stat-cards">

          <div className="stat-card">

            <span className="stat-icon">
              👥
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

          <div className="stat-card">

            <span className="stat-icon">
              🏠
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

          <div className="stat-card">

            <span className="stat-icon">
              🔧
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

          <div className="stat-card">

            <span className="stat-icon">
              📢
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

        <section className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Resident Overview
                </h3>

                <p>
                  Current community resident statistics.
                </p>

              </div>

              <button
                className="secondary-btn"
                onClick={() =>
                  handleView(
                    "Resident Directory contains 128 registered residents."
                  )
                }
              >
                View
              </button>

            </div>

            <div className="property-summary">

              <div>

                <span>
                  Residents
                </span>

                <strong>
                  128
                </strong>

              </div>

              <div>

                <span>
                  Owners
                </span>

                <strong>
                  76
                </strong>

              </div>

              <div>

                <span>
                  Tenants
                </span>

                <strong>
                  52
                </strong>

              </div>

              <div>

                <span>
                  New This Month
                </span>

                <strong>
                  6
                </strong>

              </div>

            </div>

          </div>

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Property Overview
                </h3>

                <p>
                  Current property occupancy statistics.
                </p>

              </div>

              <button
                className="secondary-btn"
                onClick={() =>
                  handleView(
                    "There are currently 94 occupied properties and 12 vacant properties."
                  )
                }
              >
                View
              </button>

            </div>

            <div className="property-summary">

              <div>

                <span>
                  Total Units
                </span>

                <strong>
                  106
                </strong>

              </div>

              <div>

                <span>
                  Occupied
                </span>

                <strong>
                  94
                </strong>

              </div>

              <div>

                <span>
                  Vacant
                </span>

                <strong>
                  12
                </strong>

              </div>

              <div>

                <span>
                  Occupancy
                </span>

                <strong>
                  89%
                </strong>

              </div>

            </div>

          </div>

        </section>

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Community Performance
              </h3>

              <p>
                Overview of key community management indicators.
              </p>

            </div>

          </div>

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Category
                  </th>

                  <th>
                    Metric
                  </th>

                  <th>
                    Current
                  </th>

                  <th>
                    Previous Month
                  </th>

                  <th>
                    Trend
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>
                    Residents
                  </td>

                  <td>
                    Registered Residents
                  </td>

                  <td>
                    128
                  </td>

                  <td>
                    122
                  </td>

                  <td>
                    ↑ 4.9%
                  </td>

                  <td>

                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "15px",
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Positive
                    </span>

                  </td>

                </tr>

                <tr>

                  <td>
                    Properties
                  </td>

                  <td>
                    Occupancy Rate
                  </td>

                  <td>
                    89%
                  </td>

                  <td>
                    87%
                  </td>

                  <td>
                    ↑ 2.0%
                  </td>

                  <td>

                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "15px",
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Positive
                    </span>

                  </td>

                </tr>

                <tr>

                  <td>
                    Complaints
                  </td>

                  <td>
                    Open Complaints
                  </td>

                  <td>
                    7
                  </td>

                  <td>
                    10
                  </td>

                  <td>
                    ↓ 30%
                  </td>

                  <td>

                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "15px",
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Improved
                    </span>

                  </td>

                </tr>

                <tr>

                  <td>
                    Maintenance
                  </td>

                  <td>
                    Active Requests
                  </td>

                  <td>
                    4
                  </td>

                  <td>
                    6
                  </td>

                  <td>
                    ↓ 33%
                  </td>

                  <td>

                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "15px",
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Improved
                    </span>

                  </td>

                </tr>

                <tr>

                  <td>
                    Announcements
                  </td>

                  <td>
                    Published Notices
                  </td>

                  <td>
                    5
                  </td>

                  <td>
                    4
                  </td>

                  <td>
                    ↑ 25%
                  </td>

                  <td>

                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "15px",
                        background: "#eee7f3",
                        color: "#563F6B",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Active
                    </span>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>

        <section className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Complaint Trends
                </h3>

                <p>
                  Monitor resident complaint activity.
                </p>

              </div>

            </div>

            <div className="quick-actions">

              <a href="/resident-complaints">
                📋 View Complaints
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
                📊 View Complaint Trends
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
                🤖 AI Analysis
              </a>

            </div>

          </div>

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Community Health
                </h3>

                <p>
                  Overall community performance indicator.
                </p>

              </div>

            </div>

            <div className="property-summary">

              <div>

                <span>
                  Occupancy
                </span>

                <strong>
                  89%
                </strong>

              </div>

              <div>

                <span>
                  Complaints
                </span>

                <strong>
                  7
                </strong>

              </div>

              <div>

                <span>
                  Maintenance
                </span>

                <strong>
                  4
                </strong>

              </div>

              <div>

                <span>
                  Rating
                </span>

                <strong>
                  4.6/5
                </strong>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CommunityAnalytics;
