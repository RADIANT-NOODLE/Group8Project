import React from "react";

function Dashboard({ userName = "VALORA User" }) {
  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo-area">
          <h1>VALORA</h1>
          <p>Property Intelligence</p>
        </div>

        <nav className="side-nav">

          <a href="/dashboard" className="active">
            🏠 Dashboard
          </a>

          <a href="/property">
            🏡 My Property
          </a>

          <a href="/valuation">
            🤖 AI Valuation
          </a>

          <a href="/complaints">
            🏘 Complaints
          </a>

          <a href="/providers">
            🔧 Service Providers
          </a>

          <a href="/announcements">
            📢 Announcements
          </a>

          <a href="/profile">
            👤 My Profile
          </a>

        </nav>

        <div className="logout-area">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            🚪 Logout
          </a>
        </div>

      </aside>


      {/* MAIN DASHBOARD */}
      <main className="dashboard-main">

        {/* TOP BAR */}
        <div className="top-bar">

          <div>
            <h2>
              Good day, <span>{userName}</span> 👋
            </h2>

            <p>
              Here's your property overview.
            </p>
          </div>

          <div className="profile-small">

            <div className="profile-circle">
              {userName.charAt(0).toUpperCase()}
            </div>

            <span>Property Owner</span>

          </div>

        </div>


        {/* STAT CARDS */}
        <section className="stat-cards">

          <div className="stat-card">
            <span className="stat-icon">🏠</span>

            <div>
              <p>Property Value</p>
              <h3>R1.02M</h3>
              <small>Estimated value</small>
            </div>
          </div>


          <div className="stat-card">
            <span className="stat-icon">💰</span>

            <div>
              <p>Rental Yield</p>
              <h3>7.1%</h3>
              <small>Estimated annual yield</small>
            </div>
          </div>


          <div className="stat-card">
            <span className="stat-icon">📈</span>

            <div>
              <p>10 Year Growth</p>
              <h3>25%</h3>
              <small>Projected growth</small>
            </div>
          </div>


          <div className="stat-card">
            <span className="stat-icon">📋</span>

            <div>
              <p>Complaints</p>
              <h3>1</h3>
              <small>Pending review</small>
            </div>
          </div>

        </section>


        {/* DASHBOARD GRID */}
        <section className="dashboard-grid">


          {/* PROPERTY OVERVIEW */}
          <div className="dashboard-panel large-panel">

            <div className="panel-heading">

              <div>
                <h3>Property Overview</h3>
                <p>Your latest property information</p>
              </div>

              <a href="/property">
                View
              </a>

            </div>


            <div className="property-summary">

              <div>
                <span>Property Type</span>
                <strong>Apartment</strong>
              </div>

              <div>
                <span>Bedrooms</span>
                <strong>2</strong>
              </div>

              <div>
                <span>Size</span>
                <strong>85 m²</strong>
              </div>

              <div>
                <span>Location</span>
                <strong>Parlock</strong>
              </div>

            </div>

          </div>


          {/* QUICK ACTIONS */}
          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>
                <h3>Quick Actions</h3>
                <p>Common VALORA tools</p>
              </div>

            </div>


            <div className="quick-actions">

              <a href="/valuation">
                🤖 Run Valuation
              </a>

              <a href="/complaints">
                🏘 Report Issue
              </a>

              <a href="/providers">
                🔧 Find Provider
              </a>

              <a href="/announcements">
                📢 View Updates
              </a>

            </div>

          </div>


          {/* ANNOUNCEMENT */}
          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>
                <h3>Latest Announcement</h3>
                <p>HOA Community Update</p>
              </div>

              <a href="/announcements">
                View All
              </a>

            </div>


            <div className="announcement-preview">

              <h4>🔧 Scheduled Maintenance</h4>

              <p>
                Maintenance work will be carried out
                in the community this Saturday.
              </p>

              <small>
                Posted 18 August 2026
              </small>

            </div>

          </div>


          {/* COMPLAINT STATUS */}
          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>
                <h3>Complaint Status</h3>
                <p>Your latest reported issue</p>
              </div>

              <a href="/complaints">
                View
              </a>

            </div>


            <div className="complaint-status">

              <div className="status-circle">
                1
              </div>

              <div>
                <strong>Security Issue</strong>
                <p>Pending Review</p>
              </div>

            </div>

          </div>


        </section>

      </main>

    </div>
  );
}

export default Dashboard;

