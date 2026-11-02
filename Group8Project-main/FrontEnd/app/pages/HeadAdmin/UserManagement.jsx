import { useCallback, useEffect, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { approveUser, listUsers, rejectUser, revokeUser, roleLabel } from "../../services/userApi";
import "./UserManagement.css";
import { showConfirm } from "../../components/AppDialog";
import { getStoredUser } from "../../services/session";

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
   Reads and changes accounts through the users API.
   An account is either Approved (hoa_approved) or Pending.
========================================================= */

const isHeadAdmin = (user) => user.role === "head_admin";
const statusOf = (user) => (user.hoa_approved ? "Approved" : "Pending");

function getSignedInUserId() {
  try {
    return getStoredUser()?.id ?? null;
  } catch {
    return null;
  }
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("All");
  const myId = getSignedInUserId();

  const refreshUsers = useCallback(async () => {
    try {
      setUsers(await listUsers());
      setError("");
    } catch (loadError) {
      console.error("Unable to load users:", loadError);
      setError(loadError?.message || "Unable to load the user accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  async function runAction(user, action, successMessage) {
    setBusyId(user.id);
    setError("");
    setNotice("");

    try {
      await action(user.id);
      setNotice(successMessage);
      await refreshUsers();
    } catch (actionError) {
      setError(actionError?.message || "That action could not be completed.");
    } finally {
      setBusyId(null);
    }
  }

  const approve = (user) =>
    runAction(user, approveUser, `${user.full_name} has been approved.`);

  const revoke = async (user) => {
    if (!await showConfirm(`Revoke access for ${user.full_name}? They will return to Pending.`)) return;
    runAction(user, revokeUser, `Access revoked for ${user.full_name}.`);
  };

  const remove = async (user) => {
    if (!await showConfirm(`Remove ${user.full_name} from VALORA? This deletes the account and cannot be undone.`)) return;
    runAction(user, rejectUser, `${user.full_name} has been removed.`);
  };

  const filteredUsers =
    filter === "All" ? users : users.filter((user) => statusOf(user) === filter);

  const pendingCount = users.filter((user) => !user.hoa_approved).length;
  const approvedCount = users.filter((user) => user.hoa_approved).length;

  const roleCounts = {
    residents: users.filter((user) => user.role === "resident").length,
    agents: users.filter((user) => user.role === "estate_agent").length,
    hoaAdmins: users.filter((user) => user.role === "hoa_admin").length,
  };

  return (
    <div className="user-management-page">
      <DashboardSidebar />

      <main className="user-management-main">
        <div className="user-management-header">
          <div>
            <p className="user-management-eyebrow">HEAD ADMINISTRATION</p>
            <h1>User Management</h1>
            <p className="user-management-subtitle">
              View and manage all VALORA user accounts and their access status.
            </p>
          </div>
        </div>

        {error && (
          <div className="user-management-empty" role="alert">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {notice && (
          <div className="user-management-empty" role="status">
            <p>{notice}</p>
          </div>
        )}

        <div className="user-management-stats">
          <div className="user-management-stat-card">
            <div className="user-management-stat-icon"><Icon name="users" size={19} /></div>
            <div>
              <span>Total Users</span>
              <strong>{users.length}</strong>
              <small>Registered accounts</small>
            </div>
          </div>

          <div className="user-management-stat-card">
            <div className="user-management-stat-icon"><Icon name="check" size={19} /></div>
            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
              <small>Active accounts</small>
            </div>
          </div>

          <div className="user-management-stat-card">
            <div className="user-management-stat-icon"><Icon name="pending" size={19} /></div>
            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
              <small>Awaiting approval</small>
            </div>
          </div>
        </div>

        <section className="user-management-panel">
          <div className="user-management-panel-heading">
            <div>
              <h2>All Registered Users</h2>
              <p>Manage account status and review user roles across the VALORA system.</p>
            </div>

            <button type="button" className="user-management-refresh" onClick={refreshUsers}>
              <Icon name="refresh" size={15} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="user-management-filters">
            {["All", "Approved", "Pending"].map((status) => (
              <button
                type="button"
                key={status}
                className={filter === status ? "active" : ""}
                onClick={() => setFilter(status)}
              >
                {status === "All" ? "All Users" : status}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="user-management-empty"><p>Loading users...</p></div>
          ) : filteredUsers.length === 0 ? (
            <div className="user-management-empty">
              <div className="user-management-empty-icon"><Icon name="users" size={22} /></div>
              <h3>No users found</h3>
              <p>There are no accounts matching the selected filter.</p>
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
                  {filteredUsers.map((user) => {
                    const protectedAccount = isHeadAdmin(user) || user.id === myId;

                    return (
                      <tr key={user.id}>
                        <td><strong>{user.full_name}</strong></td>
                        <td>{user.email}</td>
                        <td><span className="user-management-role">{roleLabel(user.role)}</span></td>
                        <td>
                          <span className={`user-management-status ${user.hoa_approved ? "approved" : "pending"}`}>
                            {statusOf(user)}
                          </span>
                        </td>
                        <td>
                          <div className="user-management-actions">
                            {protectedAccount ? (
                              <span className="user-management-system-account">
                                {isHeadAdmin(user) ? "System Account" : "You"}
                              </span>
                            ) : (
                              <>
                                {!user.hoa_approved ? (
                                  <button
                                    type="button"
                                    className="user-management-primary-btn"
                                    disabled={busyId === user.id}
                                    onClick={() => approve(user)}
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="user-management-secondary-btn"
                                    disabled={busyId === user.id}
                                    onClick={() => revoke(user)}
                                  >
                                    Revoke Access
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="user-management-secondary-btn"
                                  disabled={busyId === user.id}
                                  onClick={() => remove(user)}
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="user-management-panel">
          <div className="user-management-panel-heading">
            <div>
              <h2>User Roles</h2>
              <p>Number of registered accounts by role.</p>
            </div>
          </div>

          <div className="user-management-role-grid">
            <div className="user-management-role-card">
              <div className="user-management-role-icon"><Icon name="users" size={18} /></div>
              <span>Residents</span>
              <strong>{roleCounts.residents}</strong>
            </div>

            <div className="user-management-role-card">
              <div className="user-management-role-icon"><Icon name="property" size={18} /></div>
              <span>Estate Agents</span>
              <strong>{roleCounts.agents}</strong>
            </div>

            <div className="user-management-role-card">
              <div className="user-management-role-icon"><Icon name="profile" size={18} /></div>
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
