import React from "react";

function AgentListings() {
  const listings = [
    {
      id: "VAL-001",
      property: "3 Bedroom Family Home",
      location: "Parlock Hills",
      price: "R1,250,000",
      status: "Active",
      views: 124,
      inquiries: 8,
      listed: "25 Aug 2026",
    },
    {
      id: "VAL-002",
      property: "2 Bedroom Apartment",
      location: "Summerstrand",
      price: "R895,000",
      status: "Active",
      views: 98,
      inquiries: 5,
      listed: "22 Aug 2026",
    },
    {
      id: "VAL-003",
      property: "4 Bedroom Family Home",
      location: "Walmer",
      price: "R1,850,000",
      status: "Under Offer",
      views: 156,
      inquiries: 11,
      listed: "18 Aug 2026",
    },
    {
      id: "VAL-004",
      property: "2 Bedroom Townhouse",
      location: "Lorraine",
      price: "R980,000",
      status: "Sold",
      views: 203,
      inquiries: 14,
      listed: "10 Aug 2026",
    },
  ];

  const totalListings = listings.length;

  const activeListings = listings.filter(
    (listing) => listing.status === "Active"
  ).length;

  const underOffer = listings.filter(
    (listing) => listing.status === "Under Offer"
  ).length;

  const totalInquiries = listings.reduce(
    (total, listing) => total + listing.inquiries,
    0
  );

  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  const handleView = (listing) => {
    alert(
      `${listing.property}\n\nLocation: ${listing.location}\nPrice: ${listing.price}\nStatus: ${listing.status}`
    );
  };

  const handleAddListing = () => {
    alert("Add New Listing feature coming soon.");
  };

  return (
    <div className="dashboard-layout">

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

          <a href="/dashboard">
            🏠 Dashboard
          </a>

          <a
            href="/agent-listings"
            className="active"
          >
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

      <main className="dashboard-main">

        <div className="top-bar">

          <div>

            <h2>
              My Listings
            </h2>

            <p>
              Manage and monitor your property listings.
            </p>

          </div>

          <div className="profile-small">

            <div className="profile-circle">
              EA
            </div>

            <span>
              Estate Agent
            </span>

          </div>

        </div>

        <section className="stat-cards">

          <div className="stat-card">

            <span className="stat-icon">
              🏠
            </span>

            <div>

              <p>
                Total Listings
              </p>

              <h3>
                {totalListings}
              </h3>

              <small>
                Properties listed
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              ✅
            </span>

            <div>

              <p>
                Active Listings
              </p>

              <h3>
                {activeListings}
              </h3>

              <small>
                Currently available
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              🤝
            </span>

            <div>

              <p>
                Under Offer
              </p>

              <h3>
                {underOffer}
              </h3>

              <small>
                Pending sales
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              👥
            </span>

            <div>

              <p>
                Total Inquiries
              </p>

              <h3>
                {totalInquiries}
              </h3>

              <small>
                Buyer inquiries
              </small>

            </div>

          </div>

        </section>

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Property Listings
              </h3>

              <p>
                View and manage your current property listings.
              </p>

            </div>

            <button
              className="primary-btn"
              onClick={handleAddListing}
            >
              + Add Listing
            </button>

          </div>

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Property
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Views
                  </th>

                  <th>
                    Inquiries
                  </th>

                  <th>
                    Listed
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {listings.map((listing) => (

                  <tr key={listing.id}>

                    <td>

                      <strong>
                        {listing.property}
                      </strong>

                      <small
                        style={{
                          display: "block",
                          color: "#777",
                          marginTop: "4px",
                        }}
                      >
                        {listing.id}
                      </small>

                    </td>

                    <td>
                      {listing.location}
                    </td>

                    <td>
                      <strong>
                        {listing.price}
                      </strong>
                    </td>

                    <td>

                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "15px",
                          background:
                            listing.status === "Active"
                              ? "#e8f5e9"
                              : listing.status === "Under Offer"
                              ? "#fff4d6"
                              : "#eee7f3",
                          color:
                            listing.status === "Active"
                              ? "#2e7d32"
                              : listing.status === "Under Offer"
                              ? "#8a6500"
                              : "#563F6B",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {listing.status}
                      </span>

                    </td>

                    <td>
                      {listing.views}
                    </td>

                    <td>
                      {listing.inquiries}
                    </td>

                    <td>
                      {listing.listed}
                    </td>

                    <td>

                      <button
                        className="secondary-btn"
                        onClick={() =>
                          handleView(listing)
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        <section className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Listing Actions
                </h3>

                <p>
                  Manage your property listings.
                </p>

              </div>

            </div>

            <div className="quick-actions">

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handleAddListing();
                }}
              >
                ➕ Add New Listing
              </a>

              <a href="/agent-edit-listings">
                ✏️ Edit Listings
              </a>

              <a href="/agent-inquiries">
                👥 View Inquiries
              </a>

            </div>

          </div>

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Listing Overview
                </h3>

                <p>
                  Current performance of your listings.
                </p>

              </div>

            </div>

            <div className="property-summary">

              <div>

                <span>
                  Total
                </span>

                <strong>
                  {totalListings}
                </strong>

              </div>

              <div>

                <span>
                  Active
                </span>

                <strong>
                  {activeListings}
                </strong>

              </div>

              <div>

                <span>
                  Under Offer
                </span>

                <strong>
                  {underOffer}
                </strong>

              </div>

              <div>

                <span>
                  Inquiries
                </span>

                <strong>
                  {totalInquiries}
                </strong>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AgentListings;
