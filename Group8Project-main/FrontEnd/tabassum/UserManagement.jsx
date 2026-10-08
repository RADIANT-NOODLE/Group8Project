import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function UserManagement() {

  const navigate = useNavigate();

  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("valoraUsers")) || []
  );

  const [filter, setFilter] = useState("All");


  // =====================================================
  // REFRESH USER DATA
  // =====================================================

  function refreshUsers() {

    const updatedUsers =
      JSON.parse(localStorage.getItem("valoraUsers")) || [];

    setUsers(updatedUsers);
  }


  // =====================================================
  // UPDATE USER DATA
  // =====================================================

  function updateUsers(updatedUsers) {

    setUsers(updatedUsers);

    localStorage.setItem(
      "valoraUsers",
      JSON.stringify(updatedUsers)
    );
  }


  // =====================================================
  // APPROVE USER
  // =====================================================

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

    alert("User account approved successfully.");
  }


  // =====================================================
  // REJECT USER
  // =====================================================

  function rejectUser(userId) {

    const reason = window.prompt(
      "Please enter a reason for rejecting this account:"
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
              "Account access was not approved.",
          }
        : user
    );

    updateUsers(updatedUsers);

    alert("User account rejected.");
  }


  // =====================================================
  // REACTIVATE REJECTED USER
  // =====================================================

  function reactivateUser(userId) {

    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: "Pending",
            rejectionReason: "",
          }
        : user
    );

    updateUsers(updatedUsers);

    alert(
      "User account has been returned to Pending status."
    );
  }


  // =====================================================
  // REMOVE USER
  // =====================================================

  function removeUser(userId) {

    const userToRemove = users.find(
      (user) => user.id === userId
    );

    if (!userToRemove) {
      return;
    }


    // Do not allow the Head Admin to remove
    // the system Head Admin account.
    if (userToRemove.role === "Head Admin") {

      alert(
        "The system Head Admin account cannot be removed."
      );

      return;
    }


    const confirmed = window.confirm(
      `Are you sure you want to remove ${userToRemove.firstName} ${userToRemove.lastName} from VALORA?`
    );


    if (!confirmed) {
      return;
    }


    const updatedUsers = users.filter(
      (user) => user.id !== userId
    );

    updateUsers(updatedUsers);

    alert("User account removed.");
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


  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers =
    filter === "All"
      ? users
      : users.filter(
          (user) => user.status === filter
        );


  // =====================================================
  // COUNTS
  // =====================================================

  const pendingCount = users.filter(
    (user) => user.status === "Pending"
  ).length;

  const approvedCount = users.filter(
    (user) => user.status === "Approved"
  ).length;

  const rejectedCount = users.filter(
    (user) => user.status === "Rejected"
  ).length;


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


          <Link to="/head-admin">
            📊 Dashboard
          </Link>


          <Link to="/registration-requests">
            📝 Registration Requests
          </Link>


          <Link
            to="/user-management"
            className="active"
          >
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
              User Management
            </h1>

            <p className="page-subtitle">
              View and manage all VALORA user accounts
              and their access status.
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
            STATISTICS
        ================================================= */}

        <div className="stat-cards">


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


          <div className="stat-card">

            <span>
              Approved
            </span>

            <strong>
              {approvedCount}
            </strong>

            <small>
              Active accounts
            </small>

          </div>


          <div className="stat-card">

            <span>
              Pending
            </span>

            <strong>
              {pendingCount}
            </strong>

            <small>
              Awaiting approval
            </small>

          </div>


          <div className="stat-card">

            <span>
              Rejected
            </span>

            <strong>
              {rejectedCount}
            </strong>

            <small>
              Restricted accounts
            </small>

          </div>


        </div>


        {/* =================================================
            USER MANAGEMENT PANEL
        ================================================= */}

        <section className="dashboard-panel large-panel">


          <div className="panel-heading">

            <div>

              <h2>
                All Registered Users
              </h2>

              <p>
                Manage account status and review user
                roles across the VALORA system.
              </p>

            </div>


            <button
              className="secondary-btn"
              onClick={refreshUsers}
            >
              ↻ Refresh
            </button>

          </div>


          {/* FILTERS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >

            <button
              className={
                filter === "All"
                  ? "primary-btn"
                  : "secondary-btn"
              }
              onClick={() => setFilter("All")}
            >
              All Users
            </button>


            <button
              className={
                filter === "Approved"
                  ? "primary-btn"
                  : "secondary-btn"
              }
              onClick={() =>
                setFilter("Approved")
              }
            >
              Approved
            </button>


            <button
              className={
                filter === "Pending"
                  ? "primary-btn"
                  : "secondary-btn"
              }
              onClick={() =>
                setFilter("Pending")
              }
            >
              Pending
            </button>


            <button
              className={
                filter === "Rejected"
                  ? "primary-btn"
                  : "secondary-btn"
              }
              onClick={() =>
                setFilter("Rejected")
              }
            >
              Rejected
            </button>

          </div>


          {/* USER TABLE */}

          {filteredUsers.length === 0 ? (

            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
              }}
            >

              <h3>
                No users found
              </h3>

              <p>
                There are no accounts matching the
                selected filter.
              </p>

            </div>

          ) : (

            <div className="table-container">

              <table className="data-table">

                <thead>

                  <tr>

                    <th>
                      Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
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

                  {filteredUsers.map((user) => (

                    <tr key={user.id}>


                      {/* NAME */}

                      <td>

                        <strong>
                          {user.firstName}{" "}
                          {user.lastName}
                        </strong>

                      </td>


                      {/* EMAIL */}

                      <td>
                        {user.email}
                      </td>


                      {/* ROLE */}

                      <td>
                        {user.role}
                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            background:
                              user.status ===
                              "Approved"
                                ? "#eaf5ec"
                                : user.status ===
                                  "Rejected"
                                ? "#f8eaea"
                                : "#f3edf7",
                            color:
                              user.status ===
                              "Approved"
                                ? "#286b35"
                                : user.status ===
                                  "Rejected"
                                ? "#9b3333"
                                : "#563F6B",
                          }}
                        >
                          {user.status}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >


                          {/* PENDING */}

                          {user.status ===
                            "Pending" && (

                            <>
                              <button
                                className="primary-btn"
                                onClick={() =>
                                  approveUser(
                                    user.id
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="secondary-btn"
                                onClick={() =>
                                  rejectUser(
                                    user.id
                                  )
                                }
                              >
                                Reject
                              </button>
                            </>

                          )}


                          {/* APPROVED */}

                          {user.status ===
                            "Approved" &&
                            user.role !==
                              "Head Admin" && (

                            <button
                              className="secondary-btn"
                              onClick={() =>
                                rejectUser(
                                  user.id
                                )
                              }
                            >
                              Revoke Access
                            </button>

                          )}


                          {/* REJECTED */}

                          {user.status ===
                            "Rejected" && (
                            <>
                              <button
                                className="primary-btn"
                                onClick={() =>
                                  reactivateUser(
                                    user.id
                                  )
                                }
                              >
                                Review Again
                              </button>

                              <button
                                className="secondary-btn"
                                onClick={() =>
                                  removeUser(
                                    user.id
                                  )
                                }
                              >
                                Remove
                              </button>
                            </>
                          )}


                          {/* HEAD ADMIN */}

                          {user.role ===
                            "Head Admin" && (

                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                padding: "8px",
                              }}
                            >
                              System Account
                            </span>

                          )}

                        </div>

                      </td>


                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* =================================================
            ROLE SUMMARY
        ================================================= */}

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h2>
                User Roles
              </h2>

              <p>
                Number of registered accounts by role.
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

export default UserManagement;
