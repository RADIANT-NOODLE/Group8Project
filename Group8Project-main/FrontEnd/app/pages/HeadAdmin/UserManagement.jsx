import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { approveUser, listUsers, rejectUser, revokeUser, roleLabel } from "../../services/userApi";
import "./UserManagement.css";
import { showConfirm } from "../../components/AppDialog";
import { getStoredUser } from "../../services/session";

/* =========================================================
   ICONS
========================================================= */

const ICON_PATHS = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.9-3" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.9 3" />
      <path d="M20 20v-4h-4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </>
  ),
  revoke: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M6 6l12 12" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

function Icon({ name, size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}

/* =========================================================
   USER MANAGEMENT
   Reads and changes accounts through the users API.
   An account is either Approved (hoa_approved) or Pending.
========================================================= */

const ROLE_ORDER = [
  { role: "resident", label: "Residents" },
  { role: "estate_agent", label: "Estate agents" },
  { role: "hoa_admin", label: "HOA admins" },
  { role: "head_admin", label: "Head admins" },
];

const isHeadAdmin = (user) => user.role === "head_admin";
const statusOf = (user) => (user.hoa_approved ? "Approved" : "Pending");

function initials(name = "") {
  return (
    String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");
  const myId = getSignedInUserId();

  const refreshUsers = useCallback(async () => {
    setRefreshing(true);
    try {
      setUsers(await listUsers());
      setError("");
    } catch (loadError) {
      console.error("Unable to load users:", loadError);
      setError(loadError?.message || "Unable to load the user accounts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const approve = async (user) => {
    if (!await showConfirm(`Approve ${user.full_name}? They will be able to sign in to VALORA.`, { title: "Approve account?", confirmLabel: "Approve" })) return;
    runAction(user, approveUser, `${user.full_name} has been approved.`);
  };

  const revoke = async (user) => {
    if (!await showConfirm(`Revoke access for ${user.full_name}? They will return to Pending.`)) return;
    runAction(user, revokeUser, `Access revoked for ${user.full_name}.`);
  };

  const remove = async (user) => {
    if (!await showConfirm(`Remove ${user.full_name} from VALORA? This deletes the account and cannot be undone.`)) return;
    runAction(user, rejectUser, `${user.full_name} has been removed.`);
  };

  const pendingCount = users.filter((user) => !user.hoa_approved).length;
  const approvedCount = users.length - pendingCount;
  const approvedShare = users.length > 0 ? Math.round((approvedCount / users.length) * 100) : 0;

  const roleCounts = ROLE_ORDER.map((entry) => ({
    ...entry,
    count: users.filter((user) => user.role === entry.role).length,
  }));

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      if (filter !== "All" && statusOf(user) !== filter) return false;
      if (roleFilter !== "All" && user.role !== roleFilter) return false;
      if (!term) return true;
      return [user.full_name, user.email].some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [users, filter, roleFilter, search]);

  const statusTabs = [
    { value: "All", label: "All users", count: users.length },
    { value: "Approved", label: "Approved", count: approvedCount },
    { value: "Pending", label: "Pending", count: pendingCount },
  ];

  return (
    <div className="user-management-page">
      <DashboardSidebar />

      <main className="user-management-main">
        {/* HEADER */}
        <header className="user-management-header">
          <div>
            <p className="user-management-eyebrow">Head administration</p>
            <h1>User Management</h1>
            <p className="user-management-subtitle">
              View and manage every VALORA account and its access.
            </p>
          </div>

          <button type="button" className="um-button um-button-secondary" onClick={refreshUsers} disabled={refreshing}>
            <Icon name="refresh" size={16} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </header>

        {error && (
          <div className="um-banner is-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss message"><Icon name="close" size={15} /></button>
          </div>
        )}

        {notice && (
          <div className="um-banner is-success" role="status">
            <span><Icon name="check" size={16} /> {notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={15} /></button>
          </div>
        )}

        {/* SUMMARY */}
        <section className="um-summary" aria-labelledby="um-summary-title">
          <div className="um-summary-approvals">
            <p className="um-eyebrow">Accounts</p>
            <h2 id="um-summary-title">
              {loading ? "Loading accounts…" : `${approvedCount} of ${users.length} accounts approved`}
            </h2>
            <p className="um-summary-sub">
              {loading
                ? ""
                : pendingCount === 0
                  ? "No accounts are waiting for approval."
                  : `${pendingCount} ${pendingCount === 1 ? "account is" : "accounts are"} waiting for approval.`}
            </p>

            <div className="um-summary-bar" role="img" aria-label={`Approved: ${approvedCount}, pending: ${pendingCount}`}>
              {!loading && approvedCount > 0 && (
                <span className="is-approved" style={{ flexGrow: approvedCount }} title={`Approved: ${approvedCount}`} />
              )}
              {!loading && pendingCount > 0 && (
                <span className="is-pending" style={{ flexGrow: pendingCount }} title={`Pending: ${pendingCount}`} />
              )}
            </div>
            <ul className="um-summary-legend">
              <li><span className="is-approved" aria-hidden="true" />Approved <strong>{approvedCount}</strong></li>
              <li><span className="is-pending" aria-hidden="true" />Pending <strong>{pendingCount}</strong></li>
              <li>{approvedShare}% approved</li>
            </ul>
          </div>

          <ul className="um-summary-roles" aria-label="Accounts by role">
            {roleCounts.map((entry) => (
              <li key={entry.role}>
                <button
                  type="button"
                  className={roleFilter === entry.role ? "is-active" : undefined}
                  onClick={() => setRoleFilter(roleFilter === entry.role ? "All" : entry.role)}
                  aria-pressed={roleFilter === entry.role}
                  title={roleFilter === entry.role ? "Show all roles" : `Show only ${entry.label.toLowerCase()}`}
                >
                  <span>{entry.label}</span>
                  <strong>{loading ? "…" : entry.count}</strong>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* USERS */}
        <section className="um-panel" aria-labelledby="um-users-title">
          <div className="um-panel-head">
            <div>
              <h2 id="um-users-title">All registered users</h2>
              <p>Search, filter and manage account access.</p>
            </div>
          </div>

          <div className="um-toolbar">
            <label className="um-search">
              <Icon name="search" size={17} />
              <span className="um-visually-hidden">Search users</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email…"
              />
            </label>

            <label className="um-select">
              <span className="um-visually-hidden">Filter by role</span>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option value="All">All roles</option>
                {ROLE_ORDER.map((entry) => (
                  <option key={entry.role} value={entry.role}>{entry.label}</option>
                ))}
              </select>
            </label>

            <div className="um-tabs" role="group" aria-label="Filter by status">
              {statusTabs.map((tab) => (
                <button
                  type="button"
                  key={tab.value}
                  className={filter === tab.value ? "is-active" : undefined}
                  aria-pressed={filter === tab.value}
                  onClick={() => setFilter(tab.value)}
                >
                  {tab.label}
                  <span>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <ul className="um-skeleton-list" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => (
                <li key={index}>
                  <span className="um-skeleton um-skeleton-avatar" />
                  <span className="um-skeleton um-skeleton-line" />
                  <span className="um-skeleton um-skeleton-pill" />
                  <span className="um-skeleton um-skeleton-pill" />
                </li>
              ))}
            </ul>
          ) : filteredUsers.length === 0 ? (
            <div className="um-empty">
              <span className="um-empty-icon"><Icon name="users" size={22} /></span>
              <h3>No users found</h3>
              <p>No accounts match your search or filters.</p>
            </div>
          ) : (
            <div className="um-table-wrapper">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="is-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const protectedAccount = isHeadAdmin(user) || user.id === myId;
                    const busy = busyId === user.id;

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="um-user">
                            <span className="um-avatar" aria-hidden="true">{initials(user.full_name)}</span>
                            <div>
                              <strong>{user.full_name}</strong>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`um-role role-${user.role}`}>{roleLabel(user.role)}</span>
                        </td>
                        <td>
                          <span className={`um-status ${user.hoa_approved ? "is-approved" : "is-pending"}`}>
                            {statusOf(user)}
                          </span>
                        </td>
                        <td>
                          <div className="um-actions">
                            {protectedAccount ? (
                              <span className="um-badge">{isHeadAdmin(user) ? "System account" : "You"}</span>
                            ) : (
                              <>
                                {!user.hoa_approved ? (
                                  <button type="button" className="um-button um-button-primary um-button-small" disabled={busy} onClick={() => approve(user)}>
                                    <Icon name="check" size={15} />
                                    Approve
                                  </button>
                                ) : (
                                  <button type="button" className="um-button um-button-secondary um-button-small" disabled={busy} onClick={() => revoke(user)}>
                                    <Icon name="revoke" size={15} />
                                    Revoke access
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="um-button um-button-danger um-button-small"
                                  disabled={busy}
                                  onClick={() => remove(user)}
                                  aria-label={`Remove ${user.full_name}`}
                                >
                                  <Icon name="trash" size={15} />
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

          {!loading && filteredUsers.length > 0 && (
            <p className="um-count">
              Showing {filteredUsers.length} of {users.length} {users.length === 1 ? "account" : "accounts"}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default UserManagement;
