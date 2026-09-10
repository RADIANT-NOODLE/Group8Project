import React, { useState } from "react";

function Maintenance() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const maintenanceRequests = [
    {
      id: "MNT-001",
      issue: "Street Light Not Working",
      location: "Unit 12 / Main Road",
      reportedBy: "Ahmed Khan",
      provider: "Bright Electrical",
      priority: "High",
      status: "In Progress",
      date: "18 Aug 2026",
    },
    {
      id: "MNT-002",
      issue: "Water Leak",
      location: "Unit 24",
      reportedBy: "Fatima Ismail",
      provider: "AquaFix Plumbing",
      priority: "High",
      status: "Submitted",
      date: "17 Aug 2026",
    },
    {
      id: "MNT-003",
      issue: "Garden Maintenance",
      location: "Community Park",
      reportedBy: "HOA Admin",
      provider: "GreenScape Gardens",
      priority: "Medium",
      status: "Scheduled",
      date: "16 Aug 2026",
    },
    {
      id: "MNT-004",
      issue: "Gate Remote Issue",
      location: "Main Entrance",
      reportedBy: "Yusuf Patel",
      provider: "SecureAccess",
      priority: "Medium",
      status: "Resolved",
      date: "15 Aug 2026",
    },
    {
      id: "MNT-005",
      issue: "Broken Window",
      location: "Unit 08",
      reportedBy: "Ayesha Mohammed",
      provider: "GlassPro",
      priority: "Low",
      status: "Submitted",
      date: "14 Aug 2026",
    },
  ];

  const filteredRequests = maintenanceRequests.filter((request) => {
    const matchesStatus =
      statusFilter === "All" || request.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || request.priority === priorityFilter;

    return matchesStatus && matchesPriority;
  });

  const totalRequests = maintenanceRequests.length;

  const activeRequests = maintenanceRequests.filter(
    (request) =>
      request.status !== "Resolved"
  ).length;

  const scheduledRequests = maintenanceRequests.filter(
    (request) =>
      request.status === "Scheduled"
  ).length;

  const resolvedRequests = maintenanceRequests.filter(
    (request) =>
      request.status === "Resolved"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  const handleStatusChange = (id, newStatus) => {
    alert(
      `Maintenance request ${id} status changed to ${newStatus}.`
    );
  };

  return (
    <div className="dashboard-layout">

      {/* =================================================
          SIDEBAR
          SAME AS ORIGINAL HOA ADMIN DASHBOARD
          ================================================= */}

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

          <a
            href="/maintenance"
            className="active"
          >
            🔧 Maintenance
          </a>

          <a href="/community-announcements">
            📢 Community Announcements
          </a>

          <a href="/ai-training-data">
            🤖 AI Training Data
          </a>

          <a href="/community-analytics">
            📊 Community Analytics
          </a>

          <a href="/profile">
            👤 My Profile
          </a>

        </nav>


        {/* LOGOUT */}

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


      {/* =================================================
          MAIN DASHBOARD
          ================================================= */}

      <main className="dashboard-main">

        {/* TOP BAR */}

        <div className="top-bar">

          <div>

            <h2>
              Maintenance
            </h2>

            <p>
              Manage community maintenance requests and service providers.
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


        {/* =================================================
            STAT CARDS
            ================================================= */}

        <section className="stat-cards">

          <div className="stat-card">

            <span className="stat-icon">
              🔧
            </span>

            <div>

              <p>
                Total Requests
              </p>

              <h3>
                {totalRequests}
              </h3>

              <small>
                Maintenance requests
              </small>

            </div>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              ⏳
            </span>

            <div>

              <p>
                Active Requests
              </p>

              <h3>
                {activeRequests}
              </h3>

              <small>
                Require attention
              </small>

            </div>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              📅
            </span>

            <div>

              <p>
                Scheduled
              </p>

              <h3>
                {scheduledRequests}
              </h3>

              <small>
                Upcoming maintenance
              </small>

            </div>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              ✅
            </span>

            <div>

              <p>
                Resolved
              </p>

              <h3>
                {resolvedRequests}
              </h3>

              <small>
                Completed requests
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            MAINTENANCE MANAGEMENT
            ================================================= */}

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Maintenance Requests
              </h3>

              <p>
                Review and manage community maintenance issues.
              </p>

            </div>


            <button
              className="primary-btn"
              onClick={() =>
                alert(
                  "Add Maintenance Request feature coming soon."
                )
              }
            >
              + Add Request
            </button>

          </div>


          {/* FILTERS */}

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              style={{
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                minWidth: "180px",
              }}
            >

              <option value="All">
                All Statuses
              </option>

              <option value="Submitted">
                Submitted
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Scheduled">
                Scheduled
              </option>

              <option value="Resolved">
                Resolved
              </option>

            </select>


            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              style={{
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                minWidth: "180px",
              }}
            >

              <option value="All">
                All Priorities
              </option>

              <option value="High">
                High Priority
              </option>

              <option value="Medium">
                Medium Priority
              </option>

              <option value="Low">
                Low Priority
              </option>

            </select>

          </div>


          {/* MAINTENANCE TABLE */}

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Request
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Reported By
                  </th>

                  <th>
                    Service Provider
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRequests.length > 0 ? (

                  filteredRequests.map((request) => (

                    <tr key={request.id}>

                      <td>

                        <strong>
                          {request.issue}
                        </strong>

                        <small
                          style={{
                            display: "block",
                            color: "#777",
                            marginTop: "4px",
                          }}
                        >
                          {request.id}
                        </small>

                      </td>


                      <td>
                        {request.location}
                      </td>


                      <td>
                        {request.reportedBy}
                      </td>


                      <td>
                        {request.provider}
                      </td>


                      <td>

                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "15px",
                            background:
                              request.priority === "High"
                                ? "#fce8e6"
                                : request.priority === "Medium"
                                ? "#fff4d6"
                                : "#eee7f3",
                            color:
                              request.priority === "High"
                                ? "#b42318"
                                : request.priority === "Medium"
                                ? "#8a6500"
                                : "#563F6B",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {request.priority}
                        </span>

                      </td>


                      <td>

                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "15px",
                            background:
                              request.status === "Resolved"
                                ? "#e8f5e9"
                                : request.status === "In Progress"
                                ? "#eee7f3"
                                : request.status === "Scheduled"
                                ? "#e8f1fb"
                                : "#f1f1f1",
                            color:
                              request.status === "Resolved"
                                ? "#2e7d32"
                                : request.status === "In Progress"
                                ? "#563F6B"
                                : request.status === "Scheduled"
                                ? "#245a8d"
                                : "#666",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {request.status}
                        </span>

                      </td>


                      <td>
                        {request.date}
                      </td>


                      <td>

                        <button
                          className="secondary-btn"
                          onClick={() =>
                            alert(
                              `Viewing ${request.id}: ${request.issue}`
                            )
                          }
                        >
                          View
                        </button>

                        <select
                          defaultValue={request.status}
                          onChange={(event) =>
                            handleStatusChange(
                              request.id,
                              event.target.value
                            )
                          }
                          style={{
                            marginLeft: "6px",
                            padding: "7px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        >

                          <option value="Submitted">
                            Submitted
                          </option>

                          <option value="In Progress">
                            In Progress
                          </option>

                          <option value="Scheduled">
                            Scheduled
                          </option>

                          <option value="Resolved">
                            Resolved
                          </option>

                        </select>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No maintenance requests found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =================================================
            SERVICE PROVIDER MANAGEMENT
            ================================================= */}

        <section className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Service Providers
                </h3>

                <p>
                  Manage trusted community providers.
                </p>

              </div>

              <a href="/providers">
                Manage
              </a>

            </div>


            <div className="quick-actions">

              <a href="/providers">
                🔧 View Providers
              </a>

              <a href="/providers">
                ✅ Verify Providers
              </a>

              <a href="/providers">
                ⭐ View Ratings
              </a>

            </div>

          </div>


          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Maintenance Overview
                </h3>

                <p>
                  Current community maintenance activity.
                </p>

              </div>

            </div>


            <div className="property-summary">

              <div>

                <span>
                  High Priority
                </span>

                <strong>
                  2
                </strong>

              </div>


              <div>

                <span>
                  Scheduled
                </span>

                <strong>
                  1
                </strong>

              </div>


              <div>

                <span>
                  In Progress
                </span>

                <strong>
                  1
                </strong>

              </div>


              <div>

                <span>
                  Resolved
                </span>

                <strong>
                  1
                </strong>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Maintenance;
