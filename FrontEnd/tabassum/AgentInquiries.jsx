import React, { useState } from "react";

function AgentInquiries() {
  const [statusFilter, setStatusFilter] = useState("All");

  const inquiries = [
    {
      id: "INQ-001",
      buyer: "Ayesha Mohammed",
      property: "3 Bedroom Family Home",
      location: "Parlock Hills",
      contact: "071 234 5678",
      date: "30 Aug 2026",
      status: "New",
      message: "I am interested in viewing this property.",
    },
    {
      id: "INQ-002",
      buyer: "Yusuf Patel",
      property: "2 Bedroom Apartment",
      location: "Summerstrand",
      contact: "072 345 6789",
      date: "29 Aug 2026",
      status: "Contacted",
      message: "Please provide more information about the apartment.",
    },
    {
      id: "INQ-003",
      buyer: "Fatima Ismail",
      property: "4 Bedroom Family Home",
      location: "Walmer",
      contact: "083 456 7890",
      date: "28 Aug 2026",
      status: "Viewing Scheduled",
      message: "I would like to arrange a viewing.",
    },
    {
      id: "INQ-004",
      buyer: "Ahmed Khan",
      property: "2 Bedroom Townhouse",
      location: "Lorraine",
      contact: "079 567 8901",
      date: "27 Aug 2026",
      status: "Closed",
      message: "Interested in purchasing the townhouse.",
    },
    {
      id: "INQ-005",
      buyer: "Zainab Ali",
      property: "3 Bedroom Family Home",
      location: "Parlock Hills",
      contact: "076 678 9012",
      date: "26 Aug 2026",
      status: "New",
      message: "Is the property still available?",
    },
  ];

  const filteredInquiries = inquiries.filter((inquiry) => {
    return (
      statusFilter === "All" ||
      inquiry.status === statusFilter
    );
  });

  const totalInquiries = inquiries.length;

  const newInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "New"
  ).length;

  const viewingScheduled = inquiries.filter(
    (inquiry) => inquiry.status === "Viewing Scheduled"
  ).length;

  const contacted = inquiries.filter(
    (inquiry) => inquiry.status === "Contacted"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  const handleView = (inquiry) => {
    alert(
      `${inquiry.buyer}\n\nProperty: ${inquiry.property}\nLocation: ${inquiry.location}\nContact: ${inquiry.contact}\n\nMessage:\n${inquiry.message}`
    );
  };

  const handleStatusChange = (id, newStatus) => {
    alert(
      `Inquiry ${id} status changed to ${newStatus}.`
    );
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

          <a href="/agent-listings">
            🏠 My Listings
          </a>

          <a href="/agent-edit-listings">
            ✏️ Edit Listings
          </a>

          <a
            href="/agent-inquiries"
            className="active"
          >
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
              Inquiry Log
            </h2>

            <p>
              Track and manage inquiries from potential property buyers.
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

          <div className="stat-card">

            <span className="stat-icon">
              🆕
            </span>

            <div>

              <p>
                New Inquiries
              </p>

              <h3>
                {newInquiries}
              </h3>

              <small>
                Require response
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              📅
            </span>

            <div>

              <p>
                Viewings
              </p>

              <h3>
                {viewingScheduled}
              </h3>

              <small>
                Scheduled viewings
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              📞
            </span>

            <div>

              <p>
                Contacted
              </p>

              <h3>
                {contacted}
              </h3>

              <small>
                Buyers contacted
              </small>

            </div>

          </div>

        </section>

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Buyer Inquiries
              </h3>

              <p>
                Review inquiries and follow up with potential buyers.
              </p>

            </div>

          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              style={{
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                minWidth: "190px",
              }}
            >

              <option value="All">
                All Statuses
              </option>

              <option value="New">
                New
              </option>

              <option value="Contacted">
                Contacted
              </option>

              <option value="Viewing Scheduled">
                Viewing Scheduled
              </option>

              <option value="Closed">
                Closed
              </option>

            </select>

          </div>

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Buyer
                  </th>

                  <th>
                    Property
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInquiries.length > 0 ? (

                  filteredInquiries.map((inquiry) => (

                    <tr key={inquiry.id}>

                      <td>

                        <strong>
                          {inquiry.buyer}
                        </strong>

                        <small
                          style={{
                            display: "block",
                            color: "#777",
                            marginTop: "4px",
                          }}
                        >
                          {inquiry.id}
                        </small>

                      </td>

                      <td>

                        <strong>
                          {inquiry.property}
                        </strong>

                        <small
                          style={{
                            display: "block",
                            color: "#777",
                            marginTop: "4px",
                          }}
                        >
                          {inquiry.location}
                        </small>

                      </td>

                      <td>
                        {inquiry.contact}
                      </td>

                      <td>
                        {inquiry.date}
                      </td>

                      <td>

                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "15px",
                            background:
                              inquiry.status === "New"
                                ? "#eee7f3"
                                : inquiry.status ===
                                  "Viewing Scheduled"
                                ? "#e8f1fb"
                                : inquiry.status ===
                                  "Contacted"
                                ? "#fff4d6"
                                : "#e8f5e9",
                            color:
                              inquiry.status === "New"
                                ? "#563F6B"
                                : inquiry.status ===
                                  "Viewing Scheduled"
                                ? "#245a8d"
                                : inquiry.status ===
                                  "Contacted"
                                ? "#8a6500"
                                : "#2e7d32",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {inquiry.status}
                        </span>

                      </td>

                      <td>

                        <button
                          className="secondary-btn"
                          onClick={() =>
                            handleView(inquiry)
                          }
                        >
                          View
                        </button>

                        <select
                          defaultValue={inquiry.status}
                          onChange={(event) =>
                            handleStatusChange(
                              inquiry.id,
                              event.target.value
                            )
                          }
                          style={{
                            marginLeft: "6px",
                            padding: "7px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        >

                          <option value="New">
                            New
                          </option>

                          <option value="Contacted">
                            Contacted
                          </option>

                          <option value="Viewing Scheduled">
                            Viewing Scheduled
                          </option>

                          <option value="Closed">
                            Closed
                          </option>

                        </select>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No inquiries found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

        <section className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Inquiry Actions
                </h3>

                <p>
                  Manage potential buyer interactions.
                </p>

              </div>

            </div>

            <div className="quick-actions">

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setStatusFilter("New");
                }}
              >
                🆕 View New Inquiries
              </a>

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setStatusFilter("Viewing Scheduled");
                }}
              >
                📅 View Scheduled Viewings
              </a>

              <a href="/agent-listings">
                🏠 View My Listings
              </a>

            </div>

          </div>

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Inquiry Overview
                </h3>

                <p>
                  Current buyer activity.
                </p>

              </div>

            </div>

            <div className="property-summary">

              <div>

                <span>
                  Total
                </span>

                <strong>
                  {totalInquiries}
                </strong>

              </div>

              <div>

                <span>
                  New
                </span>

                <strong>
                  {newInquiries}
                </strong>

              </div>

              <div>

                <span>
                  Viewings
                </span>

                <strong>
                  {viewingScheduled}
                </strong>

              </div>

              <div>

                <span>
                  Contacted
                </span>

                <strong>
                  {contacted}
                </strong>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AgentInquiries;
