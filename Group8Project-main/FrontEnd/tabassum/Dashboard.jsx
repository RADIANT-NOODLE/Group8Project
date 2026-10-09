import React from "react";

function Dashboard({ role }) {

  // Get the logged-in user's details
  const storedUser = JSON.parse(
    localStorage.getItem("valoraUser")
  );

  const userName = storedUser
    ? `${storedUser.firstName} ${storedUser.lastName}`
    : "VALORA User";

  const userRole = role || storedUser?.role || "Resident";

  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };


  /* =====================================================
     RESIDENT DASHBOARD
     ===================================================== */

  const ResidentDashboard = () => (
    <>
      <section className="stat-cards">

        <div className="stat-card">
          <span className="stat-icon">🏠</span>
          <div>
            <p>Property Value</p>
            <h3>R1.02M</h3>
            <small>Current AI estimate</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🤖</span>
          <div>
            <p>AI Valuation</p>
            <h3>7.1%</h3>
            <small>Estimated rental yield</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <div>
            <p>Complaints</p>
            <h3>1</h3>
            <small>Active complaint</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📢</span>
          <div>
            <p>Announcements</p>
            <h3>3</h3>
            <small>Community updates</small>
          </div>
        </div>

      </section>


      <section className="dashboard-grid">

        {/* MY PROPERTY */}

        <div className="dashboard-panel large-panel">

          <div className="panel-heading">
            <div>
              <h3>My Property</h3>
              <p>Your property information</p>
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


        {/* AI VALUATION */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>AI Valuation</h3>
              <p>Current property estimate</p>
            </div>

            <a href="/valuation">
              View
            </a>

          </div>

          <div className="announcement-preview">

            <h4>Estimated Value</h4>

            <strong className="dashboard-value">
              R1,020,000
            </strong>

            <p>
              Use VALORA's AI-powered valuation tools
              to understand your property's estimated value.
            </p>

          </div>

        </div>


        {/* COMPLAINTS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Complaints</h3>
              <p>Track your reported issues</p>
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
              <p>In Progress</p>
            </div>

          </div>

        </div>


        {/* SERVICE PROVIDERS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Service Providers</h3>
              <p>Find trusted community services</p>
            </div>

            <a href="/providers">
              View
            </a>

          </div>

          <div className="quick-actions">

            <a href="/providers">
              🔧 Find a Provider
            </a>

            <a href="/providers">
              ⭐ View Ratings
            </a>

          </div>

        </div>


        {/* ANNOUNCEMENTS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Community Announcements</h3>
              <p>Latest HOA updates</p>
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

      </section>
    </>
  );


  /* =====================================================
     INVESTOR DASHBOARD
     ===================================================== */

  const InvestorDashboard = () => (
    <>
      <section className="stat-cards">

        <div className="stat-card">
          <span className="stat-icon">🏠</span>
          <div>
            <p>Properties</p>
            <h3>4</h3>
            <small>Properties of interest</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div>
            <p>Rental Yield</p>
            <h3>7.1%</h3>
            <small>Average estimated yield</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <div>
            <p>10-Year ROI</p>
            <h3>25%</h3>
            <small>Projected return</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div>
            <p>Growth Score</p>
            <h3>82/100</h3>
            <small>Community growth score</small>
          </div>
        </div>

      </section>


      <section className="dashboard-grid">

        {/* PROPERTIES */}

        <div className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>
              <h3>Properties</h3>
              <p>Properties you are interested in</p>
            </div>

            <a href="/property">
              View All
            </a>

          </div>

          <div className="property-summary">

            <div>
              <span>Property</span>
              <strong>Modern Apartment</strong>
            </div>

            <div>
              <span>Value</span>
              <strong>R1.02M</strong>
            </div>

            <div>
              <span>Yield</span>
              <strong>7.1%</strong>
            </div>

            <div>
              <span>Growth</span>
              <strong>82/100</strong>
            </div>

          </div>

        </div>


        {/* PROPERTY VALUATION */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Property Valuation</h3>
              <p>Investment metrics</p>
            </div>

            <a href="/valuation">
              Analyse
            </a>

          </div>

          <div className="quick-actions">

            <a href="/valuation">
              🤖 AI Valuation
            </a>

            <a href="/roi">
              📈 10-Year ROI
            </a>

            <a href="/valuation">
              💰 Rental Yield
            </a>

            <a href="/valuation">
              📊 Growth Score
            </a>

          </div>

        </div>


        {/* COMPLAINT TRENDS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Complaint Trends</h3>
              <p>Community property insights</p>
            </div>

            <a href="/complaints">
              View
            </a>

          </div>

          <div className="announcement-preview">

            <h4>Complaint Activity</h4>

            <p>
              12 complaints recorded across the
              selected properties this month.
            </p>

            <small>
              Trend: Stable
            </small>

          </div>

        </div>


        {/* INVESTMENT REPORT */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Investment Report</h3>
              <p>Property investment analysis</p>
            </div>

          </div>

          <div className="quick-actions">

            <a href="/roi">
              📄 View Investment Metrics
            </a>

            <a href="/roi">
              ⬇ Download Report
            </a>

          </div>

        </div>


        {/* SALES HISTORY */}

        <div className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>
              <h3>Sales History</h3>
              <p>Historical unit sales data</p>
            </div>

          </div>

          <div className="property-summary">

            <div>
              <span>Last Sale</span>
              <strong>R980,000</strong>
            </div>

            <div>
              <span>Date</span>
              <strong>12 Jun 2026</strong>
            </div>

            <div>
              <span>Previous Sale</span>
              <strong>R920,000</strong>
            </div>

            <div>
              <span>Growth</span>
              <strong>6.5%</strong>
            </div>

          </div>

        </div>

      </section>
    </>
  );


  /* =====================================================
     ESTATE AGENT DASHBOARD
     ===================================================== */

  const EstateAgentDashboard = () => (
    <>
      <section className="stat-cards">

        <div className="stat-card">
          <span className="stat-icon">🏠</span>
          <div>
            <p>My Listings</p>
            <h3>12</h3>
            <small>Total listings</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🟢</span>
          <div>
            <p>Active</p>
            <h3>8</h3>
            <small>Active listings</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div>
            <p>Pending</p>
            <h3>2</h3>
            <small>Pending listings</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <p>Inquiries</p>
            <h3>18</h3>
            <small>Buyer inquiries</small>
          </div>
        </div>

      </section>


      <section className="dashboard-grid">

        {/* MY LISTINGS */}

        <div className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>
              <h3>My Listings</h3>
              <p>Manage your property listings</p>
            </div>

            <a href="/agent-listings">
              View All
            </a>

          </div>

          <div className="property-summary">

            <div>
              <span>Active</span>
              <strong>8</strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>2</strong>
            </div>

            <div>
              <span>Sold</span>
              <strong>1</strong>
            </div>

            <div>
              <span>Not Available</span>
              <strong>1</strong>
            </div>

          </div>

        </div>


        {/* EDIT LISTINGS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Edit Listings</h3>
              <p>Add or update properties</p>
            </div>

          </div>

          <div className="quick-actions">

            <a href="/agent-listings">
              ➕ Add New Listing
            </a>

            <a href="/agent-edit-listings">
              ✏️ Edit Listing
            </a>

            <a href="/agent-edit-listings">
              🗑 Delete Listing
            </a>

          </div>

        </div>


        {/* INQUIRY LOG */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Inquiry Log</h3>
              <p>Buyer and investor interest</p>
            </div>

            <a href="/agent-inquiries">
              View
            </a>

          </div>

          <div className="announcement-preview">

            <h4>18 Active Inquiries</h4>

            <p>
              Buyers and investors have shown interest
              in your listed properties.
            </p>

            <small>
              Listing interactions are being tracked.
            </small>

          </div>

        </div>


        {/* AI VALUATION */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>AI Valuation</h3>
              <p>Support your listing prices</p>
            </div>

            <a href="/valuation">
              Open
            </a>

          </div>

          <div className="announcement-preview">

            <h4>🤖 Property Valuation</h4>

            <p>
              Use AI-powered estimates to support
              property pricing when working with sellers.
            </p>

          </div>

        </div>

      </section>
    </>
  );


  /* =====================================================
     HOA ADMIN DASHBOARD
     ===================================================== */

  const HOAAdminDashboard = () => (
    <>
      <section className="stat-cards">

        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <p>Residents</p>
            <h3>148</h3>
            <small>Registered residents</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <div>
            <p>Complaints</p>
            <h3>12</h3>
            <small>Active complaints</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🔧</span>
          <div>
            <p>Providers</p>
            <h3>24</h3>
            <small>Verified providers</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📢</span>
          <div>
            <p>Announcements</p>
            <h3>5</h3>
            <small>Published notices</small>
          </div>
        </div>

      </section>


      <section className="dashboard-grid">

        {/* RESIDENT DIRECTORY */}

        <div className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>
              <h3>Resident Directory</h3>
              <p>Registered community residents</p>
            </div>

            <a href="/resident-directory">
              Manage
            </a>

          </div>

          <div className="property-summary">

            <div>
              <span>Total Residents</span>
              <strong>148</strong>
            </div>

            <div>
              <span>Occupied Units</span>
              <strong>136</strong>
            </div>

            <div>
              <span>Available Units</span>
              <strong>12</strong>
            </div>

            <div>
              <span>Community</span>
              <strong>VALORA</strong>
            </div>

          </div>

        </div>


        {/* RESIDENT COMPLAINTS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Resident Complaints</h3>
              <p>Manage community complaints</p>
            </div>

            <a href="/resident-complaints">
              Manage
            </a>

          </div>

          <div className="complaint-status">

            <div className="status-circle">
              12
            </div>

            <div>
              <strong>Active Complaints</strong>
              <p>Requires administration review</p>
            </div>

          </div>

        </div>


        {/* MAINTENANCE & PROVIDERS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Maintenance & Service Providers</h3>
              <p>Manage verified providers</p>
            </div>

            <a href="/maintenance">
              Manage
            </a>

          </div>

          <div className="quick-actions">

            <a href="/maintenance">
              🔧 Maintenance
            </a>

            <a href="/providers">
              ✅ Verify Providers
            </a>

            <a href="/maintenance">
              ➕ Add Maintenance Request
            </a>

          </div>

        </div>


        {/* ANNOUNCEMENTS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Community Announcements</h3>
              <p>Create and manage notices</p>
            </div>

            <a href="/community-announcements">
              Manage
            </a>

          </div>

          <div className="quick-actions">

            <a href="/community-announcements">
              ➕ Create Announcement
            </a>

            <a href="/community-announcements">
              ✏️ Edit Announcement
            </a>

            <a href="/community-announcements">
              🗑 Delete Announcement
            </a>

          </div>

        </div>


        {/* AI TRAINING DATA */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>AI Training Data</h3>
              <p>Manage historical sales data</p>
            </div>

          </div>

          <div className="quick-actions">

            <a href="/ai-training-data">
              📊 View Training Data
            </a>

            <a href="/ai-training-data">
              ⬆ Upload Sales Data
            </a>

          </div>

        </div>


        {/* COMMUNITY ANALYTICS */}

        <div className="dashboard-panel">

          <div className="panel-heading">

            <div>
              <h3>Community Analytics</h3>
              <p>Community performance reports</p>
            </div>

            <a href="/community-analytics">
              View
            </a>

          </div>

          <div className="property-summary">

            <div>
              <span>Complaints</span>
              <strong>12</strong>
            </div>

            <div>
              <span>Avg Resolution</span>
              <strong>2.4 days</strong>
            </div>

            <div>
              <span>Provider Rating</span>
              <strong>4.6/5</strong>
            </div>

            <div>
              <span>Satisfaction</span>
              <strong>91%</strong>
            </div>

          </div>

        </div>

      </section>
    </>
  );


  /* =====================================================
     SELECT DASHBOARD
     ===================================================== */

  let dashboardContent;

  switch (userRole) {

    case "Resident":
      dashboardContent = <ResidentDashboard />;
      break;

    case "Investor":
      dashboardContent = <InvestorDashboard />;
      break;

    case "Estate Agent":
      dashboardContent = <EstateAgentDashboard />;
      break;

    case "HOA Admin":
      dashboardContent = <HOAAdminDashboard />;
      break;

    default:
      dashboardContent = <ResidentDashboard />;

  }


  return (
    <div className="dashboard-layout">

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside className="sidebar">

        <div className="logo-area">

          <img
            src="/ValoraLogo.jpeg"
            alt="VALORA Logo"
          />

          <p>
            Property Intelligence
          </p>

        </div>


        <nav className="side-nav">

          {/* DASHBOARD HEADING — NOT A BUTTON */}

          <div className="nav-heading">
            DASHBOARD
          </div>


          {/* RESIDENT */}

          {userRole === "Resident" && (
            <>
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
            </>
          )}


          {/* INVESTOR */}

          {userRole === "Investor" && (
            <>
              <a href="/property">
                🏠 Properties
              </a>

              <a href="/valuation">
                🤖 Property Valuation
              </a>

              <a href="/complaints">
                📊 Complaint Trends
              </a>

              <a href="/roi">
                📄 Investment Report
              </a>

              <a href="/property">
                📈 Sales History
              </a>

              <a href="/profile">
                👤 My Profile
              </a>
            </>
          )}


          {/* ESTATE AGENT */}

          {userRole === "Estate Agent" && (
            <>
              <a href="/agent-listings">
                🏠 My Listings
              </a>

              <a href="/agent-edit-listings">
                ✏️ Edit Listings
              </a>

              <a href="/agent-inquiries">
                👥 Inquiry Log
              </a>

              <a href="/valuation">
                🤖 AI Valuation
              </a>

              <a href="/profile">
                👤 My Profile
              </a>
            </>
          )}


          {/* HOA ADMIN */}

          {userRole === "HOA Admin" && (
            <>
              <a href="/resident-directory">
                👥 Resident Directory
              </a>

              <a href="/resident-complaints">
                📋 Resident Complaints
              </a>

              <a href="/maintenance">
                🔧 Maintenance
              </a>

              <a href="/community-announcements">
                📢 Community Announcements
              </a>

              <a href="/ai-training-data">
                🤖 AI Training Data
              </a>

              <a href="/community-analytics">
                📊 Community Analytics
              </a>

              <a href="/profile">
                👤 My Profile
              </a>
            </>
          )}

        </nav>


        <div className="logout-area">

          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              handleLogout();
            }}
          >
            🚪 Logout
          </a>

        </div>

      </aside>


      {/* =================================================
          MAIN DASHBOARD
          ================================================= */}

      <main className="dashboard-main">

        <div className="top-bar">

          <div>

            <h2>
              Good day, <span>{userName}</span> 👋
            </h2>

            <p>
              {userRole === "Resident" &&
                "Here's your property and community overview."}

              {userRole === "Investor" &&
                "Here's your investment and property overview."}

              {userRole === "Estate Agent" &&
                "Here's an overview of your property listings."}

              {userRole === "HOA Admin" &&
                "Here's your community management overview."}
            </p>

          </div>


          <div className="profile-small">

            <div className="profile-circle">
              {userName.charAt(0).toUpperCase()}
            </div>

            <span>
              {userRole}
            </span>

          </div>

        </div>


        {dashboardContent}

      </main>

    </div>
  );
}

export default Dashboard;
