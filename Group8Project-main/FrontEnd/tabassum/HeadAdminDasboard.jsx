import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function HeadAdminDashboard() {

  const navigate = useNavigate();

  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("valoraUsers")) || []
  );


  // =====================================================
  // USER STATISTICS
  // =====================================================

  const pendingUsers = users.filter(
    (user) => user.status === "Pending"
  );

  const approvedUsers = users.filter(
    (user) => user.status === "Approved"
  );

  const rejectedUsers = users.filter(
    (user) => user.status === "Rejected"
  );


  // =====================================================
  // REFRESH USERS
  // =====================================================

  function refreshUsers() {

    const updatedUsers =
      JSON.parse(localStorage.getItem("valoraUsers")) || [];

    setUsers(updatedUsers);
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {

    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUserEmail");
    localStorage.removeItem("valoraUser");

    navigate("/login");
  }


  return (
    <div className="dashboard-layout">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <div className="logo-area">

          <img
            src="/ValoraLogo.jpeg"
            alt="VALORA Logo"
          />

          <p>
            Property & Community Intelligence
          </p>

        </div>


        <nav className="side-nav">

          <div className="nav-heading">
            HEAD ADMIN
          </div>


          <Link
            to="/head-admin"
            className="active"
          >
            📊 Dashboard
          </Link>


          <Link to="/registration-requests">
            📝 Registration Requests
          </Link>


          <Link to="/user-management">
            👥 User Management
          </Link>


          <div className="nav-heading">
            SYSTEM MANAGEMENT
          </div>


          <Link to="/property">
            🏠 Properties
          </Link>


          <Link to="/valuation">
            🤖 AI Valuation
          </Link>


          <Link to="/complaints">
            📋 Complaints
          </Link>


          <Link to="/providers">
            🔧 Service Providers
          </Link>


          <Link to="/announcements">
            📢 Announcements
          </Link>


          <Link to="/maintenance">
            🛠 Maintenance
          </Link>


          <Link to="/ai-training-data">
            🧠 AI Training Data
          </Link>


          <Link to="/community-analytics">
            📊 Community Analytics
          </Link>


          <Link to="/profile">
            👤 My Profile
          </Link>

        </nav>


        <div className="logout-area">

          <button onClick={logout}>
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-main">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="top-bar">

          <div>

            <p className="page-eyebrow">
              HEAD ADMINISTRATION
            </p>

            <h1>
              Head Admin Dashboard
            </h1>

            <p className="page-subtitle">
              Manage VALORA users, registrations and
              overall system activity.
            </p>

          </div>


          <div className="profile-small">

            <div className="profile-circle">
              HA
            </div>

            <div>

              <strong>
                Head Administrator
              </strong>

              <span>
                System Administrator
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            USER STATISTICS
        ================================================= */}

        <div className="stat-cards">


          <div className="stat-card">

            <span>
              Pending Registrations
            </span>

            <strong>
              {pendingUsers.length}
            </strong>

            <small>
              Awaiting approval
            </small>

          </div>


          <div className="stat-card">

            <span>
              Approved Users
            </span>

            <strong>
              {approvedUsers.length}
            </strong>

            <small>
              Active accounts
            </small>

          </div>


          <div className="stat-card">

            <span>
              Rejected Requests
            </span>

            <strong>
              {rejectedUsers.length}
            </strong>

            <small>
              Registration decisions
            </small>

          </div>


          <div className="stat-card">

            <span>
              Total Users
            </span>

            <strong>
              {users.length}
            </strong>

            <small>
              Registered accounts
            </small>

          </div>


        </div>


        {/* =================================================
            PENDING REGISTRATION ALERT
        ================================================= */}

        {pendingUsers.length > 0 && (

          <section className="dashboard-panel large-panel">

            <div className="panel-heading">

              <div>

                <h2>
                  Registration Requests Require Attention
                </h2>

                <p>
                  There are currently{" "}
                  <strong>
                    {pendingUsers.length}
                  </strong>{" "}
                  registration request
                  {pendingUsers.length !== 1
                    ? "s"
                    : ""}{" "}
                  waiting for review.
                </p>

              </div>


              <Link
                to="/registration-requests"
                className="primary-btn"
                style={{
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Review Requests
              </Link>

            </div>


            <div className="table-container">

              <table className="data-table">

                <thead>

                  <tr>

                    <th>
                      Applicant
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Requested Role
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pendingUsers
                    .slice(0, 5)
                    .map((user) => (

                      <tr key={user.id}>

                        <td>

                          <strong>
                            {user.firstName}{" "}
                            {user.lastName}
                          </strong>

                        </td>


                        <td>
                          {user.email}
                        </td>


                        <td>
                          {user.role}
                        </td>


                        <td>

                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                              background: "#f3edf7",
                              color: "#563F6B",
                            }}
                          >
                            Pending
                          </span>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </section>

        )}


        {/* =================================================
            NO PENDING REQUESTS
        ================================================= */}

        {pendingUsers.length === 0 && (

          <section className="dashboard-panel large-panel">

            <div
              style={{
                textAlign: "center",
                padding: "30px 20px",
              }}
            >

              <h2>
                All registrations are up to date
              </h2>

              <p>
                There are currently no pending registration
                requests requiring your attention.
              </p>

            </div>

          </section>

        )}


        {/* =================================================
            ADMIN QUICK ACTIONS
        ================================================= */}

        <section className="dashboard-grid">


          {/* USER MANAGEMENT */}

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h2>
                  User Management
                </h2>

                <p>
                  Manage registered VALORA accounts.
                </p>

              </div>

            </div>


            <div className="quick-actions">

              <Link
                to="/registration-requests"
                className="quick-action"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >

                <strong>
                  Registration Requests
                </strong>

                <span>
                  Review pending user registrations
                  and approve or reject access.
                </span>

              </Link>


              <div className="quick-action">

                <strong>
                  Approved Users
                </strong>

                <span>
                  {approvedUsers.length} approved
                  account
                  {approvedUsers.length !== 1
                    ? "s"
                    : ""}{" "}
                  currently recorded.
                </span>

              </div>


              <div className="quick-action">

                <strong>
                  Rejected Requests
                </strong>

                <span>
                  {rejectedUsers.length} registration
                  request
                  {rejectedUsers.length !== 1
                    ? "s"
                    : ""}{" "}
                  rejected.
                </span>

              </div>

            </div>

          </div>


          {/* SYSTEM MANAGEMENT */}

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h2>
                  System Management
                </h2>

                <p>
                  Access all major VALORA system areas.
                </p>

              </div>

            </div>


            <div className="quick-actions">


              <Link
                to="/property"
                className="quick-action"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >

                <strong>
                  Property Management
                </strong>

                <span>
                  View and manage property information.
                </span>

              </Link>


              <Link
                to="/complaints"
                className="quick-action"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >

                <strong>
                  Complaints
                </strong>

                <span>
                  Monitor community complaints and
                  service issues.
                </span>

              </Link>


              <Link
                to="/community-analytics"
                className="quick-action"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >

                <strong>
                  Community Analytics
                </strong>

                <span>
                  Review community activity and
                  performance information.
                </span>

              </Link>


              <Link
                to="/ai-training-data"
                className="quick-action"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >

                <strong>
                  AI Training Data
                </strong>

                <span>
                  Review data used to support VALORA's
                  AI features.
                </span>

              </Link>


            </div>

          </div>


        </section>


        {/* =================================================
            ROLE OVERVIEW
        ================================================= */}

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h2>
                Registered Users by Role
              </h2>

              <p>
                Overview of the different user roles
                currently registered in VALORA.
              </p>

            </div>

          </div>


          <div className="stat-cards">


            <div className="stat-card">

              <span>
                Residents
              </span>

              <strong>
                {
                  users.filter(
                    (user) =>
                      user.role === "Resident"
                  ).length
                }
              </strong>

            </div>


            <div className="stat-card">

              <span>
                Investors
              </span>

              <strong>
                {
                  users.filter(
                    (user) =>
                      user.role === "Investor"
                  ).length
                }
              </strong>

            </div>


            <div className="stat-card">

              <span>
                Estate Agents
              </span>

              <strong>
                {
                  users.filter(
                    (user) =>
                      user.role === "Estate Agent"
                  ).length
                }
              </strong>

            </div>


            <div className="stat-card">

              <span>
                HOA Admins
              </span>

              <strong>
                {
                  users.filter(
                    (user) =>
                      user.role === "HOA Admin"
                  ).length
                }
              </strong>

            </div>


          </div>

        </section>


      </main>

    </div>
  );
}

export default HeadAdminDashboard;
