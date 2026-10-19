import { useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./UserManagement.css";

/* =========================================================
   PROFESSIONAL ICONS
========================================================= */

function Icon({ name, size = 18 }) {
  const icons = {
    users: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    property: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  };

  return icons[name] || null;
}

/* =========================================================
   USER MANAGEMENT
========================================================= */

function UserManagement() {
  const [users, setUsers] = useState(() => {
    try {
      const storedUsers = JSON.parse(
        localStorage.getItem("valoraUsers") || "[]"
      );

      return Array.isArray(storedUsers) ? storedUsers : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState("All");

  /* =====================================================
     REFRESH USER DATA
  ===================================================== */

  function refreshUsers() {
    try {
      const updatedUsers = JSON.parse(
        localStorage.getItem("valoraUsers") || "[]"
      );

      setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
    } catch {
      setUsers([]);
      alert("Unable to load the saved user accounts.");
    }
  }

  /* =====================================================
     UPDATE USER DATA
  ===================================================== */

  function updateUsers(updatedUsers) {
    try {
      localStorage.setItem(
        "valoraUsers",
        JSON.stringify(updatedUsers)
      );

      setUsers(updatedUsers);
    } catch {
      alert("Unable to save the user account changes.");
    }
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
    alert("User account approved successfully.");
  }

  /* =====================================================
     REJECT USER
  ===================================================== */

  function rejectUser(userId) {
    const reason = window.prompt(
      "Please enter a reason for rejecting this account:"
    );

    if (reason === null) return;

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
    alert("User account has been returned to Pending status.");
  }

  /* =====================================================
     REMOVE USER
  ===================================================== */

  function removeUser(userId) {
    const userToRemove = users.find(
      (user) => user.id === userId
    );

    if (!userToRemove) return;

    if (
      String(userToRemove.role || "").trim().toLowerCase() ===
      "head admin"
    ) {
      alert("The system Head Admin account cannot be removed.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${userToRemove.firstName || ""} ${userToRemove.lastName || ""} from VALORA?`
    );

    if (!confirmed) return;

    const updatedUsers = users.filter(
      (user) => user.id !== userId
    );

    updateUsers(updatedUsers);
    alert("User account removed.");
  }

  /* =====================================================
     FILTER USERS
  ===================================================== */

  const filteredUsers =
    filter === "All"
      ? users
      : users.filter((user) => user.status === filter);

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

  const roleCounts = {
    residents: users.filter(
      (user) => user.role === "Resident"
    ).length,
    investors: users.filter(
      (user) => user.role === "Investor"
    ).length,
    agents: users.filter(
      (user) => user.role === "Estate Agent"
    ).length,
    hoaAdmins: users.filter(
      (user) => user.role === "HOA Admin"
    ).length,
  };

  return (
    <div className="user-management-page">
      {/* ONE SHARED SIDEBAR — SAME COMPONENT AS HEAD ADMIN DASHBOARD */}
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="user-management-main">
        <div className="user-management-header">
          <div>
            <p className="user-management-eyebrow">
              HEAD ADMINISTRATION
            </p>

            <h1>User Management</h1>

            <p className="user-management-subtitle">
              View and manage all VALORA user accounts
              and their access status.
            </p>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="user-management-stats">
          <div className="user-management-stat-card">
            <div className="user-management-stat-icon">
              <Icon name="users" size={19} />
            </div>
            <div>
              <span>Total Users</span>
              <strong>{users.length}</strong>
              <small>Registered accounts</small>
            </div>
          </div>

          <div className="user-management-stat-card">
            <div className="user-management-stat-icon">
              <Icon name="check" size={19} />
            </div>
            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
              <small>Active accounts</small>
            </div>
          </div>

          <div className="user-management-stat-card">
            <div className="user-management-stat-icon">
              <Icon name="pending" size={19} />
            </div>
            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
              <small>Awaiting approval</small>
            </div>
          </div>

          <div className="user-management-stat-card">
            <div className="user-management-stat-icon">
              <Icon name="rejected" size={19} />
            </div>
            <div>
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
              <small>Restricted accounts</small>
            </div>
          </div>
        </div>

        {/* REGISTERED USERS */}
        <section className="user-management-panel">
          <div className="user-management-panel-heading">
            <div>
              <h2>All Registered Users</h2>
              <p>
                Manage account status and review user roles
                across the VALORA system.
              </p>
            </div>

            <button
              type="button"
              className="user-management-refresh"
              onClick={refreshUsers}
            >
              <Icon name="refresh" size={15} />
              <span>Refresh</span>
            </button>
          </div>

          {/* FILTERS */}
          <div className="user-management-filters">
            {["All", "Approved", "Pending", "Rejected"].map(
              (status) => (
                <button
                  type="button"
                  key={status}
                  className={filter === status ? "active" : ""}
                  onClick={() => setFilter(status)}
                >
                  {status === "All" ? "All Users" : status}
                </button>
              )
            )}
          </div>

          {/* USER TABLE */}
          {filteredUsers.length === 0 ? (
            <div className="user-management-empty">
              <div className="user-management-empty-icon">
                <Icon name="users" size={22} />
              </div>

              <h3>No users found</h3>

              <p>
                There are no accounts matching the selected filter.
              </p>
            </div>
          ) : (
            <div className="user-management-table-wrapper">
              <table className="user-management-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>
                          {user.firstName} {user.lastName}
                        </strong>
                      </td>

                      <td>{user.email}</td>

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
                          {user.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="user-management-actions">
                          {user.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                className="user-management-primary-btn"
                                onClick={() => approveUser(user.id)}
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                className="user-management-secondary-btn"
                                onClick={() => rejectUser(user.id)}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {user.status === "Approved" &&
                            String(user.role || "").trim().toLowerCase() !==
                              "head admin" && (
                              <button
                                type="button"
                                className="user-management-secondary-btn"
                                onClick={() => rejectUser(user.id)}
                              >
                                Revoke Access
                              </button>
                            )}

                          {user.status === "Rejected" && (
                            <>
                              <button
                                type="button"
                                className="user-management-primary-btn"
                                onClick={() => reactivateUser(user.id)}
                              >
                                Review Again
                              </button>

                              <button
                                type="button"
                                className="user-management-secondary-btn"
                                onClick={() => removeUser(user.id)}
                              >
                                Remove
                              </button>
                            </>
                          )}

                          {String(user.role || "").trim().toLowerCase() ===
                            "head admin" && (
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

        {/* ROLE SUMMARY */}
        <section className="user-management-panel">
          <div className="user-management-panel-heading">
            <div>
              <h2>User Roles</h2>
              <p>Number of registered accounts by role.</p>
            </div>
          </div>

          <div className="user-management-role-grid">
            <div className="user-management-role-card">
              <div className="user-management-role-icon">
                <Icon name="users" size={18} />
              </div>
              <span>Residents</span>
              <strong>{roleCounts.residents}</strong>
            </div>

            <div className="user-management-role-card">
              <div className="user-management-role-icon">
                <Icon name="people" size={18} />
              </div>
              <span>Investors</span>
              <strong>{roleCounts.investors}</strong>
            </div>

            <div className="user-management-role-card">
              <div className="user-management-role-icon">
                <Icon name="property" size={18} />
              </div>
              <span>Estate Agents</span>
              <strong>{roleCounts.agents}</strong>
            </div>

            <div className="user-management-role-card">
              <div className="user-management-role-icon">
                <Icon name="profile" size={18} />
              </div>
              <span>HOA Admins</span>
              <strong>{roleCounts.hoaAdmins}</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserManagement;
