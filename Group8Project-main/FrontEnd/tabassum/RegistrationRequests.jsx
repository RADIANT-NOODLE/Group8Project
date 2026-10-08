import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function RegistrationRequests() {

  const navigate = useNavigate();

  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("valoraUsers")) || []
  );

  const pendingUsers = users.filter(
    (user) => user.status === "Pending"
  );

  function updateUsers(updatedUsers) {

    setUsers(updatedUsers);

    localStorage.setItem(
      "valoraUsers",
      JSON.stringify(updatedUsers)
    );
  }

  function approveUser(userId) {

    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: "Approved",
            approvedAt: new Date().toISOString(),
            rejectionReason: "",
          }
        : user
    );

    updateUsers(updatedUsers);

    alert(
      "Registration approved successfully."
    );
  }

  function rejectUser(userId) {

    const reason = window.prompt(
      "Please enter a reason for rejecting this registration:"
    );

    if (reason === null) {
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: "Rejected",
            rejectionReason:
              reason.trim() ||
              "Registration request was not approved.",
          }
        : user
    );

    updateUsers(updatedUsers);

    alert(
      "Registration rejected."
    );
  }

  function logout() {

    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUserEmail");
    localStorage.removeItem("valoraUser");

    navigate("/login");
  }

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

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

          <Link to="/head-admin">
            📊 Dashboard
          </Link>

          <Link
            to="/registration-requests"
            className="active"
          >
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


      {/* MAIN CONTENT */}

      <main className="dashboard-main">

        {/* TOP BAR */}

        <div className="top-bar">

          <div>

            <p className="page-eyebrow">
              HEAD ADMINISTRATION
            </p>

            <h1>
              Registration Requests
            </h1>

            <p className="page-subtitle">
              Review and manage requests from users
              waiting for VALORA account approval.
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


        {/* STAT CARDS */}

        <div className="stat-cards">

          <div className="stat-card">

            <span>
              Pending Requests
            </span>

            <strong>
              {pendingUsers.length}
            </strong>

            <small>
              Awaiting review
            </small>

          </div>


          <div className="stat-card">

            <span>
              Approved Accounts
            </span>

            <strong>
              {
                users.filter(
                  (user) =>
                    user.status === "Approved"
                ).length
              }
            </strong>

            <small>
              Active users
            </small>

          </div>


          <div className="stat-card">

            <span>
              Rejected Requests
            </span>

            <strong>
              {
                users.filter(
                  (user) =>
                    user.status === "Rejected"
                ).length
              }
            </strong>

            <small>
              Not approved
            </small>

          </div>


          <div className="stat-card">

            <span>
              Total Registered
            </span>

            <strong>
              {users.length}
            </strong>

            <small>
              All registration records
            </small>

          </div>

        </div>


        {/* REQUESTS PANEL */}

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h2>
                Pending Registration Requests
              </h2>

              <p>
                Review the user's details and selected
                VALORA role before approving access.
              </p>

            </div>

          </div>


          {pendingUsers.length === 0 ? (

            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
              }}
            >

              <h3>
                No pending registrations
              </h3>

              <p>
                There are currently no registration
                requests waiting for approval.
              </p>

            </div>

          ) : (

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

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pendingUsers.map((user) => (

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

                        <span>
                          {user.role}
                        </span>

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


                      <td>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >

                          <button
                            className="primary-btn"
                            onClick={() =>
                              approveUser(user.id)
                            }
                          >
                            Approve
                          </button>


                          <button
                            className="secondary-btn"
                            onClick={() =>
                              rejectUser(user.id)
                            }
                          >
                            Reject
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* APPROVAL INFORMATION */}

        <section className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h2>
                  Approval Process
                </h2>

                <p>
                  How registration approval works.
                </p>

              </div>

            </div>


            <div className="quick-actions">

              <div className="quick-action">

                <strong>
                  1. Registration
                </strong>

                <span>
                  User submits their details and
                  selects their requested role.
                </span>

              </div>


              <div className="quick-action">

                <strong>
                  2. Review
                </strong>

                <span>
                  Head Administrator reviews the
                  registration request.
                </span>

              </div>


              <div className="quick-action">

                <strong>
                  3. Decision
                </strong>

                <span>
                  The request can be approved or
                  rejected with a reason.
                </span>

              </div>


              <div className="quick-action">

                <strong>
                  4. Access
                </strong>

                <span>
                  Approved users can sign in and
                  access their selected dashboard.
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default RegistrationRequests;
