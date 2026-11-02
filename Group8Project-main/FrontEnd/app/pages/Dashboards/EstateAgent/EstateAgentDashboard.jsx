import React, { useEffect, useState } from "react";
import DashboardSidebar from "../shared/DashboardSidebar";
import { useSession, getSessionToken } from "../../../services/session";
import "./EstateAgentDashboard.css";

function EstateAgentDashboard({ user }) {
  const { user: sessionUser } = useSession();
  const currentUser = user || sessionUser;

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!currentUser) return;

      try {
        const token = getSessionToken();
        const headers = { "Authorization": `Bearer ${token}` };

        // Fetch the listings table
        const response = await fetch("http://127.0.0.1:8000/api/v1/listings", { headers });
        
        if (response.ok) {
          const data = await response.json();
          const allListings = data.listings || data.items || data || [];
          
          // Filter for listings assigned to THIS agent
          const myListings = allListings.filter(l => 
            String(l.agent_id) === String(currentUser.id)
          );
          
          setListings(myListings);
        }
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [currentUser]);

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

        {/* STATS */}
        <div className="estate-agent-stats">
          <div className="estate-agent-stat-card">
            <div className="estate-agent-stat-top">
              <span className="estate-agent-stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-5h6v5" /><path d="M9 10h6" />
                </svg>
              </span>
              Active Listings
            </div>
            {/* NOW DYNAMIC */}
            <strong>{loading ? "..." : listings.length}</strong>
          </div>

          <div className="estate-agent-stat-card">
            <div className="estate-agent-stat-top">
              <span className="estate-agent-stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              New Inquiries
            </div>
            <strong>0</strong>
          </div>

          <div className="estate-agent-stat-card">
            <div className="estate-agent-stat-top">
              <span className="estate-agent-stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
              Edits Pending
            </div>
            <strong>0</strong>
          </div>

          <div className="estate-agent-stat-card">
            <div className="estate-agent-stat-top">
              <span className="estate-agent-stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19V5" /><path d="M4 19h16" /><path d="M7 15l4-4 3 2 5-6" />
                </svg>
              </span>
              Total Views
            </div>
            <strong>0</strong>
          </div>
        </div>

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