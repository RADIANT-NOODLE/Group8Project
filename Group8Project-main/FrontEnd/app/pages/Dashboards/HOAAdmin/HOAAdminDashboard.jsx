import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../shared/DashboardSidebar";
import "./HOAAdminDashboard.css";
import { apiRequest } from "../../../services/apiClient";
import { listComplaints } from "../../../services/complaintApi";
import { listPropertyRequests } from "../../../services/propertyRequestApi";
import { complaintStatusLabel, complaintStatusTone } from "../../../services/statusMap";
import { getProperties } from "../../../data/propertyStorage";
import { showConfirm, showAlert } from "../../../components/AppDialog";
import { getSessionToken } from "../../../services/session";

/*
=========================================================
VALORA HOA ADMIN DASHBOARD
=========================================================
*/

const PREVIEW_LIMIT = 4;

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

/* A listing waits for the HOA when the agent has submitted it
   and it has not been published or rejected yet — the same
   rule the Property Approvals page uses. */
function isAwaitingApproval(property) {
  const listing = property.listing || {};
  return (
    listing.listingStatus === "Pending HOA Approval" ||
    listing.hoaApprovalStatus === "Pending Review"
  );
}

/* Card body for the preview boxes: a short list of the latest
   records, a loading line, an error line, or the empty state. */
function PreviewList({ preview, emptyIcon, emptyTitle, emptyText, renderItem }) {
  if (preview.loading) {
    return <p className="hoa-admin-dashboard-preview-note">Loading...</p>;
  }

  if (preview.error) {
    return (
      <p className="hoa-admin-dashboard-preview-note hoa-admin-dashboard-preview-error">
        {preview.error}
      </p>
    );
  }

  if (preview.items.length === 0) {
    return (
      <div className="hoa-admin-dashboard-empty-state">
        <div className="hoa-admin-dashboard-empty-icon">{emptyIcon}</div>
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="hoa-admin-dashboard-preview-list">
        {preview.items.slice(0, PREVIEW_LIMIT).map(renderItem)}
      </ul>
      {preview.items.length > PREVIEW_LIMIT && (
        <p className="hoa-admin-dashboard-preview-more">
          +{preview.items.length - PREVIEW_LIMIT} more
        </p>
      )}
    </>
  );
}

function PreviewRow({ title, meta, status, tone = "neutral" }) {
  return (
    <li className="hoa-admin-dashboard-preview-row">
      <div className="hoa-admin-dashboard-preview-info">
        <strong>{title}</strong>
        {meta && <span>{meta}</span>}
      </div>
      {status && (
        <span className={`hoa-admin-dashboard-preview-status hoa-admin-dashboard-preview-status-${tone}`}>
          {status}
        </span>
      )}
    </li>
  );
}

const EMPTY_PREVIEW = { loading: true, error: "", items: [] };

function HOAAdminDashboard({ user }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [propertyRequestsCount, setPropertyRequestsCount] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [propertiesCount, setPropertiesCount] = useState(0);

  const [requestsPreview, setRequestsPreview] = useState(EMPTY_PREVIEW);
  const [residentsPreview, setResidentsPreview] = useState(EMPTY_PREVIEW);
  const [complaintsPreview, setComplaintsPreview] = useState(EMPTY_PREVIEW);
  const [approvalsPreview, setApprovalsPreview] = useState(EMPTY_PREVIEW);

      
  const [propertyForm, setPropertyForm] = useState({
      unit_no: "",
      complex_name: "",
      street_address: "",
      suburb: "",
      property_type: "Apartment",
      bedrooms: "",
      bathrooms: "",
      size_m2: ""
    });

  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all users to get accurate stats
    // Fetch all data to get accurate stats
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError("");
    
    const token = getSessionToken();
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    // 1. Fetch Users
    try {
      const usersRes = await fetch("http://127.0.0.1:8000/api/v1/users/", { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        let allUsers = Array.isArray(usersData) ? usersData : (usersData.users || []);
        
        const pending = allUsers.filter(u => u.hoa_approved !== true);
        const approved = allUsers.filter(u => u.hoa_approved === true);
        
        setPendingUsers(pending);
        setApprovedCount(approved.length);
      }
    } catch (err) {
      console.error("Users fetch failed:", err);
    }

    // 2. Fetch Properties
    try {
      const propRes = await fetch("http://127.0.0.1:8000/api/v1/properties/", { headers });
      if (propRes.ok) {
        const data = await propRes.json();
        setPropertiesCount(Array.isArray(data) ? data.length : (data.count || 0));
      }
    } catch (err) {
      console.error("Properties fetch failed:", err);
    }

    // 3. Property requests waiting for an HOA decision
    try {
      const page = await listPropertyRequests({ status: "pending_review" });
      setPropertyRequestsCount(page.count);
      setRequestsPreview({ loading: false, error: "", items: page.items });
    } catch (err) {
      console.error("Requests fetch failed:", err);
      setRequestsPreview({ loading: false, error: "Could not load property requests.", items: [] });
    }

    // 4. Complaints, newest first
    try {
      const page = await listComplaints({ pageSize: 50 });
      const items = [...page.items].sort((a, b) =>
        String(b.createdAt).localeCompare(String(a.createdAt))
      );
      setComplaintsCount(page.count);
      setComplaintsPreview({ loading: false, error: "", items });
    } catch (err) {
      console.error("Complaints fetch failed:", err);
      setComplaintsPreview({ loading: false, error: "Could not load complaints.", items: [] });
    }

    // 5. Resident directory
    try {
      const data = await apiRequest("/api/v1/resident-directory");
      const items = Array.isArray(data) ? data : (data?.items || []);
      setResidentsPreview({ loading: false, error: "", items });
    } catch (err) {
      console.error("Resident directory fetch failed:", err);
      setResidentsPreview({ loading: false, error: "Could not load the resident directory.", items: [] });
    }

    // 6. Listings waiting for HOA approval
    setApprovalsPreview({ loading: false, error: "", items: getProperties().filter(isAwaitingApproval) });

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const handleApprove = async (userId) => {
    if (!await showConfirm("Are you sure you want to approve this user?")) return
    
    try {
      const token = getSessionToken();

      const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${userId}/approve`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error("Failed to approve user");

      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err) {
      showAlert(err.message);
    }
  };

  const handleReject = async (userId) => {
    if (!await showConfirm("Are you sure you want to reject and delete this user?")) return;

    try {
      const token = getSessionToken();

      const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${userId}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error("Failed to reject user");

      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err) {
      showAlert(err.message);
    }
  };

    const handleAddProperty = async (e) => {
        e.preventDefault();
        try {
            const token = getSessionToken();
            const response = await fetch("http://127.0.0.1:8000/api/v1/properties", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    unit_no: propertyForm.unit_no,
                    complex_name: propertyForm.complex_name,
                    street_address: propertyForm.street_address,
                    suburb: propertyForm.suburb,
                    size_m2: Number(propertyForm.size_m2) || null,
                    property_type: propertyForm.property_type,
                    bedrooms: Number(propertyForm.bedrooms),
                    bathrooms: Number(propertyForm.bathrooms)
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                console.log("FULL BACKEND ERROR:", errData);

                let errorMsg = "Failed to add property";
                if (Array.isArray(errData.detail)) {
                  errorMsg = errData.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(", ");
                } else if (typeof errData.detail === 'string') {
                    errorMsg = errData.detail;
                }
                throw new Error(errorMsg);
              }
              
            setSuccessMessage("Property added successfully!");
            setPropertyForm({ unit_no: "", complex_name: "", street_address: "", property_type: "Apartment", bedrooms: 1, bathrooms: 1 });
            setTimeout(() => setSuccessMessage(""), 3000);
            await fetchDashboardData();

        } catch (err) {
            showAlert(err.message);
        }
    };


  return (
    <div className="hoa-admin-dashboard-layout">
      <DashboardSidebar suppliedUser={user} />

      <main className="hoa-admin-dashboard-main dashboard-main-content">

                {/* SUCCESS TOAST NOTIFICATION */}
        {successMessage && (
            <div style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                padding: "15px 25px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "600",
                animation: "slideIn 0.3s ease-out"
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
                {successMessage}
            </div>
        )}
        
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="hoa-admin-dashboard-header">
          <div>
            <span className="hoa-admin-dashboard-eyebrow">
              HOA ADMIN PORTAL
            </span>
            <h1>
              Welcome back, {user?.firstName || "Administrator"}
            </h1>
            <p>
              Manage residents, property requests, complaints
              and your community.
            </p>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}
        <div className="hoa-admin-dashboard-stats"> 
        <div className="hoa-admin-dashboard-stat-card"> 
            <div className="hoa-admin-dashboard-stat-top">
              <div className="hoa-admin-dashboard-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span>Approved Residents</span>
            </div>
            <strong>{isLoading ? "..." : approvedCount}</strong>
          </div>

          <div className="hoa-admin-dashboard-stat-card">
            <div className="hoa-admin-dashboard-stat-top">
              <div className="hoa-admin-dashboard-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M7 8h10" />
                  <path d="M7 12h10" />
                  <path d="M7 16h6" />
                </svg>
              </div>
              <span>Property Requests</span>
            </div>
            <strong>{isLoading ? "..." : propertyRequestsCount}</strong>
          </div>

          <div className="hoa-admin-dashboard-stat-card">
            <div className="hoa-admin-dashboard-stat-top">
              <div className="hoa-admin-dashboard-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                  <path d="M20 9v6" />
                </svg>
              </div>
              <span>Complaints</span>
            </div>
            <strong>{isLoading ? "..." : complaintsCount}</strong>
          </div>

          <div className="hoa-admin-dashboard-stat-card">
            <div className="hoa-admin-dashboard-stat-top">
              <div className="hoa-admin-dashboard-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V8l7-5 7 5v13" />
                  <path d="M9 21v-5h6v5" />
                  <path d="M9 10h6" />
                </svg>
              </div>
              <span>Properties</span>
            </div>
            <strong>{isLoading ? "..." : propertiesCount}</strong>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}
        <div className="hoa-admin-dashboard-content">

          {/* =================================================
              PENDING REGISTRATIONS
          ================================================= */}
          <section className="hoa-admin-dashboard-card hoa-admin-dashboard-wide-card">
            <div className="hoa-admin-dashboard-card-header">
              <div>
                <h2>Pending Registrations</h2>
                <p>Review and approve residents or agents requesting access.</p>
              </div>
              <button onClick={fetchDashboardData} className="hoa-admin-dashboard-btn-refresh">
                Refresh List
              </button>
            </div>

            {isLoading ? (
              <p>Loading pending users...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : pendingUsers.length === 0 ? (
              <div className="hoa-admin-dashboard-empty-state">
                <h3>No pending registrations</h3>
                <p>All registration requests have been processed.</p>
              </div>
            ) : (
              <div className="hoa-admin-dashboard-list">
                {pendingUsers.map((pendingUser) => (
                  <div key={pendingUser.id} className="hoa-admin-dashboard-list-item">
                    <div className="hoa-admin-dashboard-list-info">
                      <strong>{pendingUser.full_name}</strong>
                      <span>{pendingUser.email} • Role: {pendingUser.role}</span>
                    </div>

                    <div className="hoa-admin-dashboard-list-actions">
                      <button 
                        onClick={() => handleApprove(pendingUser.id)}
                        className="hoa-admin-dashboard-btn hoa-admin-dashboard-btn-approve"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(pendingUser.id)}
                        className="hoa-admin-dashboard-btn hoa-admin-dashboard-btn-reject"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =================================================
              PROPERTY REQUESTS
          ================================================= */}
          <section className="hoa-admin-dashboard-card">
            <div className="hoa-admin-dashboard-card-header">
              <div>
                <h2>Property Requests</h2>
                <p>Review resident requests to sell or rent properties.</p>
              </div>
              <Link to="/property-requests" className="hoa-admin-dashboard-card-link">
                View Requests
              </Link>
            </div>

            <PreviewList
              preview={requestsPreview}
              emptyIcon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M7 8h10" />
                  <path d="M7 12h10" />
                  <path d="M7 16h6" />
                </svg>
              }
              emptyTitle="No pending property requests"
              emptyText="New requests submitted by residents will appear here."
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
          </section>

          {/* =================================================
              RESIDENT DIRECTORY
          ================================================= */}
          <section className="hoa-admin-dashboard-card">
            <div className="hoa-admin-dashboard-card-header">
              <div>
                <h2>Resident Directory</h2>
                <p>View and manage residents within the development.</p>
              </div>
              <Link to="/resident-directory" className="hoa-admin-dashboard-card-link">
                View Directory
              </Link>
            </div>

            <PreviewList
              preview={residentsPreview}
              emptyIcon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              emptyTitle="No residents assigned yet"
              emptyText="Registered residents and their property information will appear here."
              renderItem={(resident) => (
                <PreviewRow
                  key={resident.id}
                  title={resident.name || resident.email || "Resident"}
                  meta={[resident.unit_no ? `Unit ${resident.unit_no}` : "Unassigned", resident.role].filter(Boolean).join(" · ")}
                  status={resident.occupancy || ""}
                  tone={resident.occupancy === "Occupied" ? "done" : "neutral"}
                />
              )}
            />
          </section>

          {/* =================================================
              COMPLAINTS
          ================================================= */}
          <section className="hoa-admin-dashboard-card">
            <div className="hoa-admin-dashboard-card-header">
              <div>
                <h2>Resident Complaints</h2>
                <p>Monitor complaints and update their resolution status.</p>
              </div>
              <Link to="/resident-complaints" className="hoa-admin-dashboard-card-link">
                View Complaints
              </Link>
            </div>

            <PreviewList
              preview={complaintsPreview}
              emptyIcon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                  <path d="M20 9v6" />
                </svg>
              }
              emptyTitle="No complaints to review"
              emptyText="Resident complaints will appear here for administration and resolution."
              renderItem={(complaint) => (
                <PreviewRow
                  key={complaint.id}
                  title={complaint.category}
                  meta={[
                    complaint.description.length > 60
                      ? `${complaint.description.slice(0, 60)}…`
                      : complaint.description,
                    formatDate(complaint.createdAt),
                  ].filter(Boolean).join(" · ")}
                  status={complaintStatusLabel(complaint.status)}
                  tone={complaintStatusTone(complaint.status)}
                />
              )}
            />
          </section>

          {/* =================================================
              PROPERTY APPROVALS
          ================================================= */}
          <section className="hoa-admin-dashboard-card">
            <div className="hoa-admin-dashboard-card-header">
              <div>
                <h2>Property Approvals</h2>
                <p>Review estate agent listing changes before they are published.</p>
              </div>
              <Link to="/property-approvals" className="hoa-admin-dashboard-card-link">
                Review Approvals
              </Link>
            </div>

            <PreviewList
              preview={approvalsPreview}
              emptyIcon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              }
              emptyTitle="No listing approvals pending"
              emptyText="Estate agent listing submissions will appear here before publication."
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
          </section>

          {/* =================================================
              COMMUNITY MANAGEMENT
          ================================================= */}
          <section className="hoa-admin-dashboard-card hoa-admin-dashboard-wide-card">
            <div className="hoa-admin-dashboard-card-header">
              <div>
                <h2>Community Management</h2>
                <p>Access the main tools used to manage the development.</p>
              </div>
            </div>

            <div className="hoa-admin-dashboard-actions">
              <Link to="/maintenance" className="hoa-admin-dashboard-action">
                <span className="hoa-admin-dashboard-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-2.8-2.8Z" />
                    <path d="m16 4 4 4" />
                  </svg>
                </span>
                <span>Maintenance</span>
              </Link>

              <Link to="/community-announcements" className="hoa-admin-dashboard-action">
                <span className="hoa-admin-dashboard-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                    <path d="M20 9v6" />
                  </svg>
                </span>
                <span>Announcements</span>
              </Link>

              <Link to="/providers" className="hoa-admin-dashboard-action">
                <span className="hoa-admin-dashboard-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7h-5l-2-2H9L7 7H4a2 2 0 0 0-2 2v9h20V9a2 2 0 0 0-2-2Z" />
                    <path d="M8 12h8" />
                    <path d="M12 9v6" />
                  </svg>
                </span>
                <span>Service Providers</span>
              </Link>

              <Link to="/community-analytics" className="hoa-admin-dashboard-action">
                <span className="hoa-admin-dashboard-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M8 16v-5" />
                    <path d="M12 16V8" />
                    <path d="M16 16v-9" />
                  </svg>
                </span>
                <span>Community Analytics</span>
              </Link>

              <Link to="/ai-training-data" className="hoa-admin-dashboard-action">
                <span className="hoa-admin-dashboard-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="5" width="14" height="14" rx="3" />
                    <path d="M9 9h6v6H9z" />
                    <path d="M9 2v3" />
                    <path d="M15 2v3" />
                    <path d="M9 19v3" />
                    <path d="M15 19v3" />
                    <path d="M2 9h3" />
                    <path d="M2 15h3" />
                    <path d="M19 9h3" />
                    <path d="M19 15h3" />
                  </svg>
                </span>
                <span>AI Training Data</span>
              </Link>
            </div>
          </section>

          {/* =================================================
              ADD PROPERTY FORM
          ================================================= */}
          <section className="hoa-admin-dashboard-card hoa-admin-dashboard-wide-card">
            <div className="hoa-admin-dashboard-card-header">
              <div>
                <h2>Register New Property</h2>
                <p>Add a new unit to the VALORA estate.</p>
              </div>
            </div>
            
            <form onSubmit={handleAddProperty} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", padding: "20px" }}>
                <input 
                    placeholder="Unit ID (e.g. 101)" 
                    value={propertyForm.unit_no} 
                    onChange={e => setPropertyForm({...propertyForm, unit_no: e.target.value})} 
                    required 
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
                <input 
                    placeholder="Estate Name" 
                    value={propertyForm.complex_name} 
                    onChange={e => setPropertyForm({...propertyForm, complex_name: e.target.value})} 
                    required 
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
                <input 
                    placeholder="Address" 
                    value={propertyForm.street_address} 
                    onChange={e => setPropertyForm({...propertyForm, street_address: e.target.value})} 
                    required 
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
                                <input 
                    placeholder="Suburb" 
                    value={propertyForm.suburb} 
                    onChange={e => setPropertyForm({...propertyForm, suburb: e.target.value})} 
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
                <input 
                    type="number"
                    placeholder="Size (m²)" 
                    value={propertyForm.size_m2} 
                    onChange={e => setPropertyForm({...propertyForm, size_m2: e.target.value})} 
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
                <select 
                    value={propertyForm.property_type} 
                    onChange={e => setPropertyForm({...propertyForm, property_type: e.target.value})}
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Townhouse">Townhouse</option>
                </select>
                <input 
                    type="number" 
                    placeholder="Bedrooms" 
                    value={propertyForm.bedrooms} 
                    onChange={e => setPropertyForm({...propertyForm, bedrooms: e.target.value})} 
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
                <input 
                    type="number" 
                    placeholder="Bathrooms" 
                    value={propertyForm.bathrooms} 
                    onChange={e => setPropertyForm({...propertyForm, bathrooms: e.target.value})} 
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
                <button type="submit" className="hoa-admin-dashboard-action" style={{ gridColumn: "1 / -1", background: "#563f6b", color: "white", padding: "12px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", width: "fit-content", marginTop: "10px" }}>
                    Add Property to Database
                </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default HOAAdminDashboard;