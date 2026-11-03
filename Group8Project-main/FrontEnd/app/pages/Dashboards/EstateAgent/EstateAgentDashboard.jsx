import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../shared/DashboardSidebar";
import { useSession } from "../../../services/session";
import { apiRequest } from "../../../services/apiClient";
import { getProperties } from "../../../data/propertyStorage";
import "./EstateAgentDashboard.css";

/* Listing edits this agent sent to the HOA that are still waiting for a decision.
   Edits are kept in browser storage by the Edit Listings page. */
function countPendingEdits(agentId) {
  if (!agentId) return 0;
  return getProperties().filter((property) => {
    const listing = property.listing || {};
    return (
      String(listing.assignedAgentId) === String(agentId) &&
      listing.hoaApprovalStatus === "Pending Review"
    );
  }).length;
}

function EstateAgentDashboard({ user }) {
  const { user: sessionUser } = useSession();
  const currentUser = user || sessionUser;

  const [listings, setListings] = useState([]);
  const [newInquiries, setNewInquiries] = useState(0);
  const [pendingEdits, setPendingEdits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadDashboard = async () => {
      const [listingResult, inquiryResult] = await Promise.allSettled([
        apiRequest("/api/v1/listings"),
        apiRequest("/api/v1/inquiries"),
      ]);

      if (listingResult.status === "fulfilled") {
        const data = listingResult.value;
        const allListings = data?.listings || data?.items || (Array.isArray(data) ? data : []);
        // listings assigned to this agent
        setListings(allListings.filter((l) => String(l.agent_id) === String(currentUser.id)));
      } else {
        console.error("Failed to load listings:", listingResult.reason);
      }

      if (inquiryResult.status === "fulfilled") {
        const data = inquiryResult.value;
        const inquiries = data?.items || (Array.isArray(data) ? data : []);
        setNewInquiries(inquiries.filter((inquiry) => inquiry.status === "New").length);
      } else {
        console.error("Failed to load inquiries:", inquiryResult.reason);
      }

      setPendingEdits(countPendingEdits(currentUser.id));
      setLoading(false);
    };

    loadDashboard();
  }, [currentUser]);

  const totalViews = listings.reduce((sum, listing) => sum + (Number(listing.views) || 0), 0);

  const formatPrice = (price) => {
    if (!price) return "—";
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="estate-agent-dashboard-layout">
      <DashboardSidebar suppliedUser={currentUser} />

      <main className="estate-agent-dashboard-main">
        {/* HEADER */}
        <header className="estate-agent-header">
          <div>
            <p className="estate-agent-eyebrow">ESTATE AGENT PORTAL</p>
            <h1>Welcome back, {currentUser?.firstName || "Agent"}</h1>
            <p>Manage your property listings and client inquiries.</p>
          </div>
        </header>

        {/* OVERVIEW: what needs attention, plus the rest at a glance */}
        <section className="estate-agent-overview" aria-label="Your overview">
          <div className="estate-agent-hero">
            <span className="estate-agent-hero-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>

            <div className="estate-agent-hero-copy">
              <p className="estate-agent-hero-label">New inquiries</p>
              <p className="estate-agent-hero-number">{loading ? "…" : newInquiries}</p>
              <p className="estate-agent-hero-text">
                {loading
                  ? "Checking for new inquiries…"
                  : newInquiries === 0
                    ? "You're all caught up. No buyers are waiting for a reply."
                    : `${newInquiries === 1 ? "A buyer is" : "Buyers are"} waiting for your reply.`}
              </p>
            </div>

            <Link to="/agent-inquiries" className="estate-agent-hero-button">
              View inquiries
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
              </svg>
            </Link>
          </div>

          <ul className="estate-agent-summary">
            <li>
              <Link to="/agent-listings" className="estate-agent-summary-row">
                <span className="estate-agent-summary-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-5h6v5" /><path d="M9 10h6" />
                  </svg>
                </span>
                <span className="estate-agent-summary-label">Active listings</span>
                <strong>{loading ? "…" : listings.length}</strong>
              </Link>
            </li>
            <li>
              <Link to="/agent-edit-listings" className="estate-agent-summary-row">
                <span className="estate-agent-summary-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </span>
                <span className="estate-agent-summary-label">
                  Edits pending
                  <small>Awaiting HOA approval</small>
                </span>
                <strong>{loading ? "…" : pendingEdits}</strong>
              </Link>
            </li>
            <li>
              <div className="estate-agent-summary-row">
                <span className="estate-agent-summary-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19V5" /><path d="M4 19h16" /><path d="M7 15l4-4 3 2 5-6" />
                  </svg>
                </span>
                <span className="estate-agent-summary-label">
                  Total views
                  <small>Across your listings</small>
                </span>
                <strong>{loading ? "…" : totalViews}</strong>
              </div>
            </li>
          </ul>
        </section>

        {/* MAIN GRID */}
        <div className="estate-agent-content-grid">
          
          {/* LEFT COLUMN - LISTINGS */}
          <section className="estate-agent-card">
            <h2>My Active Listings</h2>
            <p>Properties you currently have on the market.</p>
            
            {loading ? (
              <div className="estate-agent-empty">
                <p>Loading your listings...</p>
              </div>
            ) : listings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                {/* DYNAMIC LIST RENDERING */}
                {listings.map(listing => (
                  <div key={listing.id || listing.listing_id} style={{ padding: "16px", background: "#faf9fb", borderRadius: "8px", border: "1px solid #e8e3eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong style={{ color: "#29242d" }}>Unit {listing.unit_no || listing.unit_id}</strong>
                      <span style={{ fontSize: "12px", color: "#563f6b", fontWeight: "600" }}>
                        {formatPrice(listing.price)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#77717d" }}>
                      Status: {listing.status || "Active"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="estate-agent-empty">
                <div className="estate-agent-empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-5h6v5" /><path d="M9 10h6" />
                  </svg>
                </div>
                <h3>No active listings</h3>
                <p>When you list a property for the estate, it will appear here.</p>
              </div>
            )}
          </section>

          {/* RIGHT COLUMN - INQUIRIES */}
          <section className="estate-agent-card">
            <h2>Recent Inquiries</h2>
            <p>Messages from potential buyers or renters.</p>

            <div className="estate-agent-empty">
              <div className="estate-agent-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>No new inquiries</h3>
              <p>You haven't received any messages yet.</p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default EstateAgentDashboard;