import React from "react";
import DashboardSidebar from "../shared/DashboardSidebar";
import "./EstateAgentDashboard.css";

function EstateAgentDashboard({ user }) {
  return (
    <div className="estate-agent-dashboard-layout">
      {/* SHARED SIDEBAR */}
      <DashboardSidebar suppliedUser={user} />

      {/* MAIN CONTENT */}
      <main className="estate-agent-dashboard-main">
        
        {/* HEADER */}
        <header className="estate-agent-header">
          <div>
            <p className="estate-agent-eyebrow">ESTATE AGENT PORTAL</p>
            <h1>Welcome back, {user?.firstName || "Agent"}</h1>
            <p>Manage your property listings and client inquiries.</p>
          </div>
          
          <div className="estate-agent-avatar">
            {user?.initials || "EA"}
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
            <strong>0</strong>
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
            
            <div className="estate-agent-empty">
              <div className="estate-agent-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-5h6v5" /><path d="M9 10h6" />
                </svg>
              </div>
              <h3>No active listings</h3>
              <p>When you list a property for the estate, it will appear here.</p>
            </div>
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
