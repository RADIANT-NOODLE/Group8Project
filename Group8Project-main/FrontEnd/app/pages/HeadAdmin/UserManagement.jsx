import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "../../services/authService.js";
import { isAdministrator, ROLES, toRole } from "../../services/roleMap.js";
import ConfirmPrompt from "../../components/ConfirmPrompt";
import InlineMessage from "../../components/InlineMessage";
import "./UserManagement.css";


/* =========================================================
   PROFESSIONAL ICONS
========================================================= */

function Icon({ name, size = 18 }) {

  const icons = {

    dashboard: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),

    users: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    requests: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </svg>
    ),

    property: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),

    valuation: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),

    complaints: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16v13H7l-3 3V4Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    ),

    providers: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a4.5 4.5 0 0 0-5.9 5.9L3 18a2.1 2.1 0 0 0 3 3l5.8-5.8a4.5 4.5 0 0 0 5.9-5.9l-3 3-3-3 3-3Z" />
      </svg>
    ),

    announcements: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11v2a2 2 0 0 0 2 2h2l7 4V5L7 9H5a2 2 0 0 0-2 2Z" />
        <path d="M18 9a5 5 0 0 1 0 6" />
        <path d="M20 7a8 8 0 0 1 0 10" />
      </svg>
    ),

    maintenance: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a4.5 4.5 0 0 0-5.9 5.9L3 18a2.1 2.1 0 0 0 3 3l5.8-5.8a4.5 4.5 0 0 0 5.9-5.9l-3 3-3-3 3-3Z" />
      </svg>
    ),

    ai: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="5" width="14" height="14" rx="3" />
        <path d="M9 9h6v6H9z" />
        <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
      </svg>
    ),

    analytics: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20V7" />
      </svg>
    ),

    profile: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),

    logout: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-7" />
      </svg>
    ),

    refresh: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 11a8 8 0 0 0-14.9-3" />
        <path d="M4 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14.9 3" />
        <path d="M20 20v-4h-4" />
      </svg>
    ),

    people: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3.5" />
        <circle cx="17" cy="9" r="3" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M14 16a5.5 5.5 0 0 1 7.5 4" />
      </svg>
    ),

    check: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m5 12 4 4L19 6" />
      </svg>
    ),

    pending: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),

    rejected: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6M15 9l-6 6" />
      </svg>
    ),

  };

  return icons[name] || null;
}


/* =========================================================
   USER MANAGEMENT
========================================================= */

/*
Account administration is served by the VALORA API in a later phase
(connection plan, Phase 4 item 1). No local account store exists.
*/
function loadManagedAccounts() {

  return [];

}


function UserManagement() {

  const navigate = useNavigate();

  const [users, setUsers] = useState(
    loadManagedAccounts()
  );

  const [filter, setFilter] = useState("All");


  /* Result message and the action awaiting confirmation.
     Both used to be browser dialogs (alert/prompt/confirm). */

  const [notice, setNotice] = useState(null);

  const [pending, setPending] = useState(null);

  const [pendingReason, setPendingReason] = useState("");


  /* =====================================================
     REFRESH USER DATA
  ===================================================== */

  function showNotice(text, tone = "success") {

    setNotice({ text, tone });
  }


  function refreshUsers() {

    setUsers(loadManagedAccounts());
  }


  /* =====================================================
     UPDATE USER DATA
  ===================================================== */

  function updateUsers(updatedUsers) {

    setUsers(updatedUsers);
  }


  /* =====================================================
     APPROVE USER
  ===================================================== */

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

    showNotice("User account approved successfully.");
  }


  /* =====================================================
     REJECT USER (confirmed inline, with a reason)
  ===================================================== */

  function requestReject(userId) {

    setPending({ action: "reject", userId });
    setPendingReason("");
    setNotice(null);
  }

  function confirmReject() {

    const reason = pendingReason.trim() ||
      "Account access was not approved.";

    const updatedUsers = users.map((user) =>
      user.id === pending.userId
        ? {
            ...user,
            status: "Rejected",
            rejectionReason: reason,
          }
        : user
    );

    updateUsers(updatedUsers);

    setPending(null);
    setPendingReason("");
    showNotice("User account rejected.");
  }


  /* =====================================================
     REACTIVATE REJECTED USER
  ===================================================== */

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

    showNotice(
      "User account has been returned to Pending status."
    );
  }


  /* =====================================================
     REMOVE USER (confirmed inline)
  ===================================================== */

  function requestRemove(userId) {

    const userToRemove = users.find(
      (user) => user.id === userId
    );

    if (!userToRemove) {
      return;
    }

    if (isAdministrator(userToRemove.role)) {

      showNotice(
        "The system Head Admin account cannot be removed.",
        "error"
      );

      return;
    }

    setPending({ action: "remove", userId });
    setNotice(null);
  }

  function confirmRemove() {

    const updatedUsers = users.filter(
      (user) => user.id !== pending.userId
    );

    updateUsers(updatedUsers);

    setPending(null);
    showNotice("User account removed.");
  }


  const pendingUser = pending
    ? users.find((user) => user.id === pending.userId)
    : null;

  const isRemoving = pending?.action === "remove";


  /* =====================================================
     LOGOUT
  ===================================================== */

  function logout() {

    authService.logout();

    navigate("/login");
  }


  /* =====================================================
     FILTER USERS
  ===================================================== */

  const filteredUsers =
    filter === "All"
      ? users
      : users.filter(
          (user) => user.status === filter
        );


  /* =====================================================
     COUNTS
  ===================================================== */

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
    <div className="user-management-page">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="user-management-sidebar">

        <div className="user-management-brand">

          <img
            src="/assets/valora-logo.svg"
            alt="VALORA Logo"
          />

          <p>
            Property & Community Intelligence
          </p>

        </div>


        <nav className="user-management-nav">

          <div className="user-management-nav-heading">
            HEAD ADMINISTRATION
          </div>


          <Link to="/head-admin">
            <span className="user-management-nav-icon">
              <Icon name="dashboard" size={17} />
            </span>
            <span>Dashboard</span>
          </Link>


          <Link to="/registration-requests">
            <span className="user-management-nav-icon">
              <Icon name="requests" size={17} />
            </span>
            <span>Registration Requests</span>
          </Link>


          <Link
            to="/user-management"
            className="active"
          >
            <span className="user-management-nav-icon">
              <Icon name="users" size={17} />
            </span>
            <span>User Management</span>
          </Link>


          <div className="user-management-nav-heading">
            SYSTEM MANAGEMENT
          </div>


          <Link to="/property">
            <span className="user-management-nav-icon">
              <Icon name="property" size={17} />
            </span>
            <span>Properties</span>
          </Link>


          <Link to="/valuation">
            <span className="user-management-nav-icon">
              <Icon name="valuation" size={17} />
            </span>
            <span>AI Valuation</span>
          </Link>


          <Link to="/complaints">
            <span className="user-management-nav-icon">
              <Icon name="complaints" size={17} />
            </span>
            <span>Complaints</span>
          </Link>


          <Link to="/providers">
            <span className="user-management-nav-icon">
              <Icon name="providers" size={17} />
            </span>
            <span>Service Providers</span>
          </Link>


          <Link to="/announcements">
            <span className="user-management-nav-icon">
              <Icon name="announcements" size={17} />
            </span>
            <span>Announcements</span>
          </Link>


          <Link to="/maintenance">
            <span className="user-management-nav-icon">
              <Icon name="maintenance" size={17} />
            </span>
            <span>Maintenance</span>
          </Link>


          <Link to="/ai-training-data">
            <span className="user-management-nav-icon">
              <Icon name="ai" size={17} />
            </span>
            <span>AI Training Data</span>
          </Link>


          <Link to="/community-analytics">
            <span className="user-management-nav-icon">
              <Icon name="analytics" size={17} />
            </span>
            <span>Community Analytics</span>
          </Link>


          <Link to="/profile">
            <span className="user-management-nav-icon">
              <Icon name="profile" size={17} />
            </span>
            <span>My Profile</span>
          </Link>

        </nav>


        <div className="user-management-logout">

          <button onClick={logout}>

            <span className="user-management-nav-icon">
              <Icon name="logout" size={17} />
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="user-management-main">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="user-management-header">

          <div>

            <p className="user-management-eyebrow">
              HEAD ADMINISTRATION
            </p>

            <h1>
              User Management
            </h1>

            <p className="user-management-subtitle">
              View and manage all VALORA user accounts
              and their access status.
            </p>

          </div>


          <div className="user-management-profile">

            <div className="user-management-profile-circle">
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
            RESULT MESSAGE
        ================================================= */}

        <InlineMessage tone={notice?.tone}>
          {notice?.text}
        </InlineMessage>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="user-management-stats">


          <div className="user-management-stat-card">

            <div className="user-management-stat-icon">
              <Icon name="users" size={19} />
            </div>

            <div>

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


          <div className="user-management-stat-card">

            <div className="user-management-stat-icon">
              <Icon name="check" size={19} />
            </div>

            <div>

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

          </div>


          <div className="user-management-stat-card">

            <div className="user-management-stat-icon">
              <Icon name="pending" size={19} />
            </div>

            <div>

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

          </div>


          <div className="user-management-stat-card">

            <div className="user-management-stat-icon">
              <Icon name="rejected" size={19} />
            </div>

            <div>

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


        </div>


        {/* =================================================
            USER MANAGEMENT PANEL
        ================================================= */}

        <section className="user-management-panel">


          <div className="user-management-panel-heading">

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
              className="user-management-refresh"
              onClick={refreshUsers}
            >
              <Icon name="refresh" size={15} />
              <span>Refresh</span>
            </button>

          </div>


          {/* FILTERS */}

          <div className="user-management-filters">

            <button
              className={
                filter === "All"
                  ? "active"
                  : ""
              }
              onClick={() => setFilter("All")}
            >
              All Users
            </button>


            <button
              className={
                filter === "Approved"
                  ? "active"
                  : ""
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
                  ? "active"
                  : ""
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
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("Rejected")
              }
            >
              Rejected
            </button>

          </div>


          {/* CONFIRMATION — replaces window.confirm/window.prompt */}

          <ConfirmPrompt
            open={Boolean(pending)}
            tone="danger"
            title={
              isRemoving
                ? "Remove this account?"
                : "Reject this account?"
            }
            description={
              isRemoving
                ? `${
                    pendingUser?.firstName ?? ""
                  } ${
                    pendingUser?.lastName ?? ""
                  } is removed from VALORA immediately.`
                : "The account is returned to the applicant as not approved."
            }
            confirmLabel={
              isRemoving ? "Remove account" : "Reject account"
            }
            reasonLabel={
              isRemoving ? undefined : "Reason (required)"
            }
            reasonPlaceholder="Explain why access is not approved"
            reasonValue={pendingReason}
            onReasonChange={setPendingReason}
            onConfirm={
              isRemoving ? confirmRemove : confirmReject
            }
            onCancel={() => {
              setPending(null);
              setPendingReason("");
            }}
          />


          {/* USER TABLE */}

          {filteredUsers.length === 0 ? (

            <div className="user-management-empty">

              <div className="user-management-empty-icon">
                <Icon name="users" size={22} />
              </div>

              <h3>
                No users found
              </h3>

              <p>
                There are no accounts matching the
                selected filter.
              </p>

              <p>
                Account administration is not connected
                to the VALORA API yet, so managed accounts
                do not appear here.
              </p>

            </div>

          ) : (

            <div className="user-management-table-wrapper">

              <table className="user-management-table">

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

                        <span className="user-management-role">
                          {user.role}
                        </span>

                      </td>


                      <td>

                        <span
                          className={`user-management-status ${
                            user.status === "Approved"
                              ? "approved"
                              : user.status === "Rejected"
                              ? "rejected"
                              : "pending"
                          }`}
                        >
                          {user.status}
                        </span>

                      </td>


                      <td>

                        <div className="user-management-actions">


                          {/* PENDING */}

                          {user.status ===
                            "Pending" && (

                            <>
                              <button
                                className="user-management-primary-btn"
                                onClick={() =>
                                  approveUser(
                                    user.id
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="user-management-secondary-btn"
                                onClick={() =>
                                  requestReject(
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
                            !isAdministrator(user.role) && (

                            <button
                              className="user-management-secondary-btn"
                              onClick={() =>
                                requestReject(
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
                                className="user-management-primary-btn"
                                onClick={() =>
                                  reactivateUser(
                                    user.id
                                  )
                                }
                              >
                                Review Again
                              </button>

                              <button
                                className="user-management-secondary-btn"
                                onClick={() =>
                                  requestRemove(
                                    user.id
                                  )
                                }
                              >
                                Remove
                              </button>
                            </>

                          )}


                          {/* HEAD ADMIN */}

                          {isAdministrator(user.role) && (

                            <span className="user-management-system-account">
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

        <section className="user-management-panel">


          <div className="user-management-panel-heading">

            <div>

              <h2>
                User Roles
              </h2>

              <p>
                Number of registered accounts by role.
              </p>

            </div>

          </div>


          <div className="user-management-role-grid">


            <div className="user-management-role-card">

              <div className="user-management-role-icon">
                <Icon name="users" size={18} />
              </div>

              <span>
                Residents
              </span>

              <strong>
                {
                  users.filter(
                    (user) =>
                      toRole(user.role) === ROLES.resident
                  ).length
                }
              </strong>

            </div>


            <div className="user-management-role-card">

              <div className="user-management-role-icon">
                <Icon name="people" size={18} />
              </div>

              <span>
                Investors
              </span>

              <strong>
                {
                  users.filter(
                    (user) =>
                      toRole(user.role) === ROLES.investor
                  ).length
                }
              </strong>

            </div>


            <div className="user-management-role-card">

              <div className="user-management-role-icon">
                <Icon name="property" size={18} />
              </div>

              <span>
                Estate Agents
              </span>

              <strong>
                {
                  users.filter(
                    (user) =>
                      toRole(user.role) === ROLES.estateAgent
                  ).length
                }
              </strong>

            </div>


            <div className="user-management-role-card">

              <div className="user-management-role-icon">
                <Icon name="profile" size={18} />
              </div>

              <span>
                HOA Admins
              </span>

              <strong>
                {
                  users.filter(
                    (user) =>
                      toRole(user.role) === ROLES.hoaAdmin
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
