import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../shared/DashboardSidebar";
import ComplaintStatusRing from "../../../components/ComplaintStatusRing";
import { showConfirm, showAlert } from "../../../components/AppDialog";
import { apiRequest } from "../../../services/apiClient";
import { listComplaints } from "../../../services/complaintApi";
import { listProperties } from "../../../services/propertyApi";
import { listPropertyRequests } from "../../../services/propertyRequestApi";
import {
  COMPLAINT_STATUS,
  complaintStatusLabel,
  complaintStatusTone,
  toComplaintStatus,
} from "../../../services/statusMap";
import { approveUser, listUsers, rejectUser, roleLabel } from "../../../services/userApi";
import { getProperties } from "../../../data/propertyStorage";
import "./HOAAdminDashboard.css";

/*
=========================================================
VALORA HOA ADMIN DASHBOARD

Top: what is waiting on the administrator, and the estate
at a glance. Then pending registrations beside the complaint
ring, then short previews of the four queues. Navigation
lives in the sidebar, and adding a property lives on the
Properties page, so neither is repeated here.
=========================================================
*/

const PREVIEW_LIMIT = 4;

/* A listing waits for the HOA when the agent has submitted it — the same rule
   the Property Approvals page uses (listings still live in browser storage). */
function isAwaitingApproval(property) {
  const listing = property.listing || {};
  return (
    listing.listingStatus === "Pending HOA Approval" ||
    listing.hoaApprovalStatus === "Pending Review"
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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

const ICON_PATHS = {
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V8l7-5 7 5v13" />
      <path d="M9 21v-5h6v5" />
      <path d="M9 10h6" />
    </>
  ),
  request: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M7 8h10" />
      <path d="M7 12h10" />
      <path d="M7 16h6" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
      <path d="M20 9v6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  userPlus: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M16 11h6" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* A card listing the newest few records of one queue. */
function PreviewCard({ title, subtitle, to, linkLabel, icon, preview, emptyTitle, emptyText, renderItem }) {
  return (
    <section className="hoa-dash-card">
      <div className="hoa-dash-card-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <Link to={to} className="hoa-dash-link">
          {linkLabel} <Icon name="arrow" size={14} />
        </Link>
      </div>

      {preview.loading ? (
        <ul className="hoa-dash-list" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <li key={index} className="hoa-dash-row hoa-dash-row-skeleton">
              <span className="hoa-dash-skeleton hoa-dash-skeleton-line" />
              <span className="hoa-dash-skeleton hoa-dash-skeleton-pill" />
            </li>
          ))}
        </ul>
      ) : preview.error ? (
        <p className="hoa-dash-note hoa-dash-note-error">{preview.error}</p>
      ) : preview.items.length === 0 ? (
        <div className="hoa-dash-empty">
          <span className="hoa-dash-empty-icon">
            <Icon name={icon} size={22} />
          </span>
          <h3>{emptyTitle}</h3>
          <p>{emptyText}</p>
        </div>
      ) : (
        <>
          <ul className="hoa-dash-list">{preview.items.slice(0, PREVIEW_LIMIT).map(renderItem)}</ul>
          {preview.items.length > PREVIEW_LIMIT && (
            <p className="hoa-dash-note">+{preview.items.length - PREVIEW_LIMIT} more</p>
          )}
        </>
      )}
    </section>
  );
}

function PreviewRow({ title, meta, status, tone = "neutral" }) {
  return (
    <li className="hoa-dash-row">
      <div className="hoa-dash-row-copy">
        <strong>{title}</strong>
        {meta && <span>{meta}</span>}
      </div>
      {status && <span className={`hoa-dash-pill is-${tone}`}>{status}</span>}
    </li>
  );
}

const LOADING = { loading: true, error: "", items: [] };

function HOAAdminDashboard({ user }) {
  const [pendingUsers, setPendingUsers] = useState(LOADING);
  const [approvedResidents, setApprovedResidents] = useState(null);
  const [propertiesCount, setPropertiesCount] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  const [requestsPreview, setRequestsPreview] = useState(LOADING);
  const [residentsPreview, setResidentsPreview] = useState(LOADING);
  const [complaintsPreview, setComplaintsPreview] = useState(LOADING);
  const [approvalsPreview, setApprovalsPreview] = useState(LOADING);

  const [busyUserId, setBusyUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);

    const [users, properties, requests, complaintPage, directory] = await Promise.allSettled([
      listUsers(),
      listProperties({ pageSize: 100 }),
      listPropertyRequests({ status: "pending_review" }),
      listComplaints({ pageSize: 100 }),
      apiRequest("/api/v1/resident-directory"),
    ]);

    if (users.status === "fulfilled") {
      const all = users.value;
      setPendingUsers({ loading: false, error: "", items: all.filter((u) => u.hoa_approved !== true) });
      setApprovedResidents(
        all.filter((u) => u.hoa_approved === true && String(u.role).toLowerCase() === "resident").length
      );
    } else {
      console.error("Users fetch failed:", users.reason);
      setPendingUsers({ loading: false, error: "Could not load registrations.", items: [] });
    }

    if (properties.status === "fulfilled") {
      setPropertiesCount(properties.value.count);
    } else {
      console.error("Properties fetch failed:", properties.reason);
    }

    if (requests.status === "fulfilled") {
      setRequestsPreview({ loading: false, error: "", items: requests.value.items });
    } else {
      console.error("Requests fetch failed:", requests.reason);
      setRequestsPreview({ loading: false, error: "Could not load property requests.", items: [] });
    }

    if (complaintPage.status === "fulfilled") {
      const items = [...complaintPage.value.items].sort((a, b) =>
        String(b.createdAt).localeCompare(String(a.createdAt))
      );
      setComplaints(items);
      setComplaintsPreview({ loading: false, error: "", items });
    } else {
      console.error("Complaints fetch failed:", complaintPage.reason);
      setComplaintsPreview({ loading: false, error: "Could not load complaints.", items: [] });
    }
    setComplaintsLoading(false);

    if (directory.status === "fulfilled") {
      const data = directory.value;
      setResidentsPreview({ loading: false, error: "", items: Array.isArray(data) ? data : data?.items || [] });
    } else {
      console.error("Resident directory fetch failed:", directory.reason);
      setResidentsPreview({ loading: false, error: "Could not load the resident directory.", items: [] });
    }

    setApprovalsPreview({ loading: false, error: "", items: getProperties().filter(isAwaitingApproval) });
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function decide(pendingUser, approve) {
    const name = pendingUser.full_name || pendingUser.email;
    const confirmed = await showConfirm(
      approve
        ? `Approve ${name}? They will be able to sign in to VALORA.`
        : `Reject and remove ${name}? This deletes their registration.`,
      { confirmLabel: approve ? "Approve" : "Reject" }
    );
    if (!confirmed) return;

    setBusyUserId(pendingUser.id);
    try {
      await (approve ? approveUser(pendingUser.id) : rejectUser(pendingUser.id));
      await loadDashboard();
    } catch (err) {
      showAlert(err?.message || "That could not be saved. Please try again.");
    } finally {
      setBusyUserId(null);
    }
  }

  /* ----- what is waiting on the administrator ----- */
  const newComplaints = complaints.filter(
    (complaint) => toComplaintStatus(complaint.status) === COMPLAINT_STATUS.submitted
  ).length;

  const attention = [
    {
      key: "registrations",
      count: pendingUsers.items.length,
      one: "registration to review",
      many: "registrations to review",
      to: "/registration-requests",
      icon: "userPlus",
    },
    {
      key: "requests",
      count: requestsPreview.items.length,
      one: "property request to decide",
      many: "property requests to decide",
      to: "/property-requests",
      icon: "request",
    },
    {
      key: "complaints",
      count: newComplaints,
      one: "new complaint",
      many: "new complaints",
      to: "/resident-complaints",
      icon: "megaphone",
    },
    {
      key: "approvals",
      count: approvalsPreview.items.length,
      one: "listing to approve",
      many: "listings to approve",
      to: "/property-approvals",
      icon: "shield",
    },
  ];
  const attentionLoading = pendingUsers.loading || requestsPreview.loading || complaintsLoading;
  const attentionTotal = attention.reduce((sum, item) => sum + item.count, 0);

  /* ----- estate at a glance ----- */
  const occupiedUnits = residentsPreview.items.filter((record) => record.occupancy === "Occupied").length;
  const occupancy =
    propertiesCount > 0 ? Math.min(Math.round((occupiedUnits / propertiesCount) * 100), 100) : 0;

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "Administrator";
  const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="hoa-admin-dashboard-layout">
      <DashboardSidebar suppliedUser={user} />

      <main className="hoa-admin-dashboard-main dashboard-main-content">
        {/* HEADER */}
        <header className="hoa-dash-header">
          <div>
            <p className="hoa-dash-eyebrow">HOA Admin Portal · {today}</p>
            <h1>
              {greeting()}, {firstName}
            </h1>
            <p>Here is what is happening in your estate today.</p>
          </div>

          <div className="hoa-dash-header-actions">
            <button
              type="button"
              className="hoa-dash-button hoa-dash-button-secondary"
              onClick={loadDashboard}
              disabled={refreshing}
            >
              <Icon name="refresh" size={16} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <Link to="/property-management" className="hoa-dash-button hoa-dash-button-primary">
              <Icon name="plus" size={16} />
              Add property
            </Link>
          </div>
        </header>

        {/* ATTENTION + ESTATE AT A GLANCE */}
        <div className="hoa-dash-top">
          <section className="hoa-dash-attention" aria-labelledby="hoa-dash-attention-title">
            <div className="hoa-dash-attention-head">
              <span className="hoa-dash-attention-icon">
                <Icon name="bell" size={22} />
              </span>
              <div>
                <p className="hoa-dash-attention-label" id="hoa-dash-attention-title">
                  Needs your attention
                </p>
                <p className="hoa-dash-attention-number">{attentionLoading ? "…" : attentionTotal}</p>
              </div>
            </div>

            {!attentionLoading && attentionTotal === 0 ? (
              <p className="hoa-dash-attention-clear">You're all caught up. Nothing is waiting for a decision.</p>
            ) : (
              <ul className="hoa-dash-attention-list">
                {attention.map((item) => (
                  <li key={item.key}>
                    <Link
                      to={item.to}
                      className={`hoa-dash-attention-item${item.count > 0 ? " has-items" : ""}`}
                    >
                      <span className="hoa-dash-attention-item-icon">
                        <Icon name={item.icon} size={17} />
                      </span>
                      <span className="hoa-dash-attention-item-text">
                        <strong>{attentionLoading ? "…" : item.count}</strong>{" "}
                        {item.count === 1 ? item.one : item.many}
                      </span>
                      <Icon name="arrow" size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="hoa-dash-glance" aria-labelledby="hoa-dash-glance-title">
            <h2 id="hoa-dash-glance-title">Estate at a glance</h2>

            <ul className="hoa-dash-glance-list">
              <li>
                <span className="hoa-dash-glance-icon">
                  <Icon name="people" size={18} />
                </span>
                <span className="hoa-dash-glance-label">Approved residents</span>
                <strong>{approvedResidents ?? "…"}</strong>
              </li>
              <li>
                <span className="hoa-dash-glance-icon">
                  <Icon name="building" size={18} />
                </span>
                <span className="hoa-dash-glance-label">Properties</span>
                <strong>{propertiesCount ?? "…"}</strong>
              </li>
            </ul>

            <div className="hoa-dash-occupancy">
              <div className="hoa-dash-occupancy-top">
                <span>Occupancy</span>
                <strong>
                  {propertiesCount == null || residentsPreview.loading
                    ? "…"
                    : `${occupiedUnits} of ${propertiesCount} units`}
                </strong>
              </div>
              <div className="hoa-dash-occupancy-track" role="img" aria-label={`${occupancy}% of units occupied`}>
                <span className="hoa-dash-occupancy-fill" style={{ width: `${occupancy}%` }} />
              </div>
              <span className="hoa-dash-occupancy-percent">{occupancy}% occupied</span>
            </div>
          </section>
        </div>

        {/* REGISTRATIONS + COMPLAINT STATUS */}
        <div className="hoa-dash-middle">
          <section className="hoa-dash-card" aria-labelledby="hoa-dash-registrations-title">
            <div className="hoa-dash-card-header">
              <div>
                <h2 id="hoa-dash-registrations-title">Pending Registrations</h2>
                <p>Residents and agents waiting for access to VALORA.</p>
              </div>
              <Link to="/registration-requests" className="hoa-dash-link">
                View all <Icon name="arrow" size={14} />
              </Link>
            </div>

            {pendingUsers.loading ? (
              <ul className="hoa-dash-list" aria-hidden="true">
                {[0, 1].map((index) => (
                  <li key={index} className="hoa-dash-row hoa-dash-row-skeleton">
                    <span className="hoa-dash-skeleton hoa-dash-skeleton-avatar" />
                    <span className="hoa-dash-skeleton hoa-dash-skeleton-line" />
                    <span className="hoa-dash-skeleton hoa-dash-skeleton-pill" />
                  </li>
                ))}
              </ul>
            ) : pendingUsers.error ? (
              <p className="hoa-dash-note hoa-dash-note-error">{pendingUsers.error}</p>
            ) : pendingUsers.items.length === 0 ? (
              <div className="hoa-dash-empty">
                <span className="hoa-dash-empty-icon">
                  <Icon name="userPlus" size={22} />
                </span>
                <h3>No pending registrations</h3>
                <p>All registration requests have been processed.</p>
              </div>
            ) : (
              <>
                <ul className="hoa-dash-list">
                  {pendingUsers.items.slice(0, PREVIEW_LIMIT).map((pendingUser) => (
                    <li key={pendingUser.id} className="hoa-dash-row hoa-dash-registration">
                      <span className="hoa-dash-avatar" aria-hidden="true">
                        {initials(pendingUser.full_name)}
                      </span>
                      <div className="hoa-dash-row-copy">
                        <strong>{pendingUser.full_name || "New user"}</strong>
                        <span>{pendingUser.email}</span>
                      </div>
                      <span className="hoa-dash-pill is-neutral">{roleLabel(pendingUser.role)}</span>
                      <div className="hoa-dash-row-actions">
                        <button
                          type="button"
                          className="hoa-dash-button hoa-dash-button-primary hoa-dash-button-small"
                          onClick={() => decide(pendingUser, true)}
                          disabled={busyUserId === pendingUser.id}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="hoa-dash-button hoa-dash-button-ghost hoa-dash-button-small"
                          onClick={() => decide(pendingUser, false)}
                          disabled={busyUserId === pendingUser.id}
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                {pendingUsers.items.length > PREVIEW_LIMIT && (
                  <p className="hoa-dash-note">+{pendingUsers.items.length - PREVIEW_LIMIT} more</p>
                )}
              </>
            )}
          </section>

          <aside className="hoa-dash-card hoa-dash-ring-card" aria-label="Complaint status overview">
            <div className="hoa-dash-card-header">
              <div>
                <h2>Complaints</h2>
                <p>Where community complaints stand.</p>
              </div>
            </div>
            <ComplaintStatusRing complaints={complaints} loading={complaintsLoading} />
          </aside>
        </div>

        {/* QUEUE PREVIEWS */}
        <div className="hoa-dash-grid">
          <PreviewCard
            title="Property Requests"
            subtitle="Sale and rental requests waiting for a decision."
            to="/property-requests"
            linkLabel="View requests"
            icon="request"
            preview={requestsPreview}
            emptyTitle="No pending property requests"
            emptyText="New requests from residents will appear here."
            renderItem={(request) => (
              <PreviewRow
                key={request.id}
                title={`${request.unitNo ? `Unit ${request.unitNo}` : "Property"}${request.requestType ? ` · ${request.requestType}` : ""}`}
                meta={[request.requesterName, formatDate(request.createdAt)].filter(Boolean).join(" · ")}
                status="Pending review"
                tone="open"
              />
            )}
          />

          <PreviewCard
            title="Resident Directory"
            subtitle="Residents and the units they are linked to."
            to="/resident-directory"
            linkLabel="View directory"
            icon="people"
            preview={residentsPreview}
            emptyTitle="No residents assigned yet"
            emptyText="Residents linked to units will appear here."
            renderItem={(resident) => (
              <PreviewRow
                key={resident.id}
                title={resident.name || resident.email || "Resident"}
                meta={resident.unit_no ? `Unit ${resident.unit_no}` : "Unassigned"}
                status={resident.occupancy || ""}
                tone={resident.occupancy === "Occupied" ? "done" : "neutral"}
              />
            )}
          />

          <PreviewCard
            title="Recent Complaints"
            subtitle="The latest complaints from residents."
            to="/resident-complaints"
            linkLabel="View complaints"
            icon="megaphone"
            preview={complaintsPreview}
            emptyTitle="No complaints to review"
            emptyText="Resident complaints will appear here."
            renderItem={(complaint) => (
              <PreviewRow
                key={complaint.id}
                title={complaint.category}
                meta={[
                  complaint.description.length > 60
                    ? `${complaint.description.slice(0, 60)}…`
                    : complaint.description,
                  formatDate(complaint.createdAt),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                status={complaintStatusLabel(complaint.status)}
                tone={complaintStatusTone(complaint.status)}
              />
            )}
          />

          <PreviewCard
            title="Property Approvals"
            subtitle="Agent listing changes waiting to be published."
            to="/property-approvals"
            linkLabel="Review approvals"
            icon="shield"
            preview={approvalsPreview}
            emptyTitle="No listing approvals pending"
            emptyText="Estate agent submissions will appear here."
            renderItem={(property) => (
              <PreviewRow
                key={property.id}
                title={property.unitNumber ? `Unit ${property.unitNumber}` : "Listing"}
                meta={[property.listing?.listingType, property.listing?.assignedAgentName].filter(Boolean).join(" · ")}
                status="Awaiting approval"
                tone="open"
              />
            )}
          />
        </div>
      </main>
    </div>
  );
}

export default HOAAdminDashboard;
