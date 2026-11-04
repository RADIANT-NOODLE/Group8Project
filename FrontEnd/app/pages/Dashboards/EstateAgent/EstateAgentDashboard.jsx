import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../shared/DashboardSidebar";
import { useSession } from "../../../services/session";
import { apiRequest } from "../../../services/apiClient";
import { getProperties } from "../../../data/propertyStorage";
import { ensureLocalPropertyForRequest, getPropertyRequests } from "../../../data/propertyRequests";
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

/* The agent's units, the same way the My Listings / Edit Listings pages build them:
   property requests assigned to the agent, matched to their listing record. */
async function loadAssignedProperties(agentId) {
  const requests = (await getPropertyRequests()) || [];
  requests.forEach((request) => ensureLocalPropertyForRequest(request));

  const mine = requests.filter((request) => String(request.assignedAgentId) === String(agentId));
  const properties = getProperties();
  const seen = new Set();

  return mine
    .map((request) => properties.find((property) => String(property.id) === String(request.propertyId)))
    .filter((property) => property && !seen.has(property.id) && seen.add(property.id));
}

function listingPrice(listing = {}) {
  const format = (value) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
  if (listing.listingType === "For Rent" && listing.rentalPrice) return `${format(Number(listing.rentalPrice))} / month`;
  if (listing.askingPrice) return format(Number(listing.askingPrice));
  return "Price not set";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function EstateAgentDashboard({ user }) {
  const { user: sessionUser } = useSession();
  const currentUser = user || sessionUser;

  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [newInquiries, setNewInquiries] = useState(0);
  const [pendingEdits, setPendingEdits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadDashboard = async () => {
      const [listingResult, inquiryResult] = await Promise.allSettled([
        loadAssignedProperties(currentUser.id),
        apiRequest("/api/v1/inquiries"),
      ]);

      if (listingResult.status === "fulfilled") {
        // "active" = published on the market, as on the Edit Listings page
        setListings(listingResult.value.filter((property) => property.listing?.listingStatus === "Published"));
      } else {
        console.error("Failed to load listings:", listingResult.reason);
      }

      if (inquiryResult.status === "fulfilled") {
        const data = inquiryResult.value;
        const all = data?.items || (Array.isArray(data) ? data : []);
        setInquiries(
          [...all].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
        );
        setNewInquiries(all.filter((inquiry) => inquiry.status === "New").length);
      } else {
        console.error("Failed to load inquiries:", inquiryResult.reason);
      }

      setPendingEdits(countPendingEdits(currentUser.id));
      setLoading(false);
    };

    loadDashboard();
  }, [currentUser]);

  const totalViews = listings.reduce((sum, property) => sum + (Number(property.listing?.views) || 0), 0);

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
            <div className="estate-agent-card-header">
              <div>
                <h2>My Active Listings</h2>
                <p>Properties you currently have on the market.</p>
              </div>
              <Link to="/agent-listings" className="estate-agent-card-link">View all</Link>
            </div>
            
            {loading ? (
              <div className="estate-agent-empty">
                <p>Loading your listings...</p>
              </div>
            ) : listings.length > 0 ? (
              <ul className="estate-agent-rows">
                {listings.slice(0, 4).map((property) => (
                  <li key={property.id} className="estate-agent-row">
                    <span className="estate-agent-row-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5" /><path d="M9 21v-6h6v6" />
                      </svg>
                    </span>
                    <div className="estate-agent-row-copy">
                      <strong>{property.unitNumber || `Unit ${property.id}`}</strong>
                      <span>
                        {[property.listing?.listingType, property.development || property.location]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                    <span className="estate-agent-row-value">{listingPrice(property.listing)}</span>
                  </li>
                ))}
              </ul>
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
            <div className="estate-agent-card-header">
              <div>
                <h2>Recent Inquiries</h2>
                <p>Messages from potential buyers or renters.</p>
              </div>
              <Link to="/agent-inquiries" className="estate-agent-card-link">View all</Link>
            </div>

            {loading ? (
              <div className="estate-agent-empty">
                <p>Loading inquiries...</p>
              </div>
            ) : inquiries.length > 0 ? (
              <ul className="estate-agent-rows">
                {inquiries.slice(0, 4).map((inquiry) => (
                  <li key={inquiry.inquiry_id} className="estate-agent-row">
                    <span className="estate-agent-row-avatar" aria-hidden="true">
                      {String(inquiry.buyer_name || "?").trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="estate-agent-row-copy">
                      <strong>{inquiry.buyer_name || "Buyer"}</strong>
                      <span>
                        {[inquiry.property_unit && `Unit ${inquiry.property_unit}`, formatDate(inquiry.created_at)]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                    <span className={`estate-agent-row-pill${inquiry.status === "New" ? " is-new" : ""}`}>
                      {inquiry.status || "New"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="estate-agent-empty">
                <div className="estate-agent-empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>No inquiries yet</h3>
                <p>Messages from buyers about your listings will appear here.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

export default EstateAgentDashboard;