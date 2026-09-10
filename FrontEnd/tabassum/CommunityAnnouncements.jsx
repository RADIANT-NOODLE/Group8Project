import React, { useState } from "react";

function CommunityAnnouncements() {
  const [categoryFilter, setCategoryFilter] = useState("All");

  const announcements = [
    {
      id: "ANN-001",
      title: "Annual General Meeting",
      category: "Meeting",
      date: "28 Aug 2026",
      postedBy: "HOA Admin",
      status: "Published",
      description:
        "The annual general meeting will be held in the community hall. All residents are encouraged to attend.",
    },
    {
      id: "ANN-002",
      title: "Water Maintenance Notice",
      category: "Maintenance",
      date: "25 Aug 2026",
      postedBy: "HOA Admin",
      status: "Published",
      description:
        "Water supply may be interrupted between 09:00 and 14:00 due to scheduled maintenance.",
    },
    {
      id: "ANN-003",
      title: "Security Gate Upgrade",
      category: "Security",
      date: "22 Aug 2026",
      postedBy: "HOA Admin",
      status: "Published",
      description:
        "The main entrance security system will be upgraded to improve access control and visitor management.",
    },
    {
      id: "ANN-004",
      title: "Community Clean-Up Day",
      category: "Community",
      date: "20 Aug 2026",
      postedBy: "HOA Admin",
      status: "Published",
      description:
        "Residents are invited to participate in the upcoming community clean-up day.",
    },
    {
      id: "ANN-005",
      title: "Parking Reminder",
      category: "General",
      date: "18 Aug 2026",
      postedBy: "HOA Admin",
      status: "Published",
      description:
        "Residents are reminded to use designated parking areas and avoid blocking emergency access routes.",
    },
  ];

  const filteredAnnouncements = announcements.filter((announcement) => {
    return (
      categoryFilter === "All" ||
      announcement.category === categoryFilter
    );
  });

  const totalAnnouncements = announcements.length;

  const publishedAnnouncements = announcements.filter(
    (announcement) => announcement.status === "Published"
  ).length;

  const recentAnnouncements = announcements.filter(
    (announcement) =>
      announcement.date === "28 Aug 2026" ||
      announcement.date === "25 Aug 2026"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  const handleView = (announcement) => {
    alert(
      `${announcement.title}\n\n${announcement.description}`
    );
  };

  const handleAddAnnouncement = () => {
    alert("Add Community Announcement feature coming soon.");
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

          <a href="/resident-directory">
            👥 Resident Directory
          </a>

          <a href="/resident-complaints">
            📋 Resident Complaints
          </a>

          <a href="/maintenance">
            🔧 Maintenance
          </a>

          <a
            href="/community-announcements"
            className="active"
          >
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
              Community Announcements
            </h2>

            <p>
              Create and manage announcements for the community.
            </p>

          </div>

          <div className="profile-small">

            <div className="profile-circle">
              HOA
            </div>

            <span>
              HOA Admin
            </span>

          </div>

        </div>

        <section className="stat-cards">

          <div className="stat-card">

            <span className="stat-icon">
              📢
            </span>

            <div>

              <p>
                Total Announcements
              </p>

              <h3>
                {totalAnnouncements}
              </h3>

              <small>
                Community notices
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              ✅
            </span>

            <div>

              <p>
                Published
              </p>

              <h3>
                {publishedAnnouncements}
              </h3>

              <small>
                Currently visible
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              🕒
            </span>

            <div>

              <p>
                Recent Notices
              </p>

              <h3>
                {recentAnnouncements}
              </h3>

              <small>
                Latest announcements
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              👥
            </span>

            <div>

              <p>
                Audience
              </p>

              <h3>
                All
              </h3>

              <small>
                Community residents
              </small>

            </div>

          </div>

        </section>

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Community Announcements
              </h3>

              <p>
                Manage notices and important community information.
              </p>

            </div>

            <button
              className="primary-btn"
              onClick={handleAddAnnouncement}
            >
              + Add Announcement
            </button>

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
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              style={{
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                minWidth: "180px",
              }}
            >

              <option value="All">
                All Categories
              </option>

              <option value="Meeting">
                Meetings
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Security">
                Security
              </option>

              <option value="Community">
                Community
              </option>

              <option value="General">
                General
              </option>

            </select>

          </div>

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Announcement
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Posted By
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

                {filteredAnnouncements.length > 0 ? (

                  filteredAnnouncements.map(
                    (announcement) => (

                      <tr key={announcement.id}>

                        <td>

                          <strong>
                            {announcement.title}
                          </strong>

                          <small
                            style={{
                              display: "block",
                              color: "#777",
                              marginTop: "4px",
                            }}
                          >
                            {announcement.id}
                          </small>

                        </td>

                        <td>

                          <span
                            style={{
                              padding: "5px 10px",
                              borderRadius: "15px",
                              background: "#eee7f3",
                              color: "#563F6B",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {announcement.category}
                          </span>

                        </td>

                        <td>
                          {announcement.postedBy}
                        </td>

                        <td>
                          {announcement.date}
                        </td>

                        <td>

                          <span
                            style={{
                              padding: "5px 10px",
                              borderRadius: "15px",
                              background: "#e8f5e9",
                              color: "#2e7d32",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {announcement.status}
                          </span>

                        </td>

                        <td>

                          <button
                            className="secondary-btn"
                            onClick={() =>
                              handleView(announcement)
                            }
                          >
                            View
                          </button>

                          <button
                            className="secondary-btn"
                            style={{
                              marginLeft: "6px",
                            }}
                            onClick={() =>
                              alert(
                                `Edit ${announcement.id} feature coming soon.`
                              )
                            }
                          >
                            Edit
                          </button>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No announcements found.
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
                  Quick Actions
                </h3>

                <p>
                  Manage community communication.
                </p>

              </div>

            </div>

            <div className="quick-actions">

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handleAddAnnouncement();
                }}
              >
                📢 Create Announcement
              </a>

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  alert(
                    "Announcement management feature coming soon."
                  );
                }}
              >
                ✏️ Manage Announcements
              </a>

              <a
                href="/resident-directory"
              >
                👥 View Residents
              </a>

            </div>

          </div>

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Announcement Overview
                </h3>

                <p>
                  Community communication activity.
                </p>

              </div>

            </div>

            <div className="property-summary">

              <div>

                <span>
                  Total
                </span>

                <strong>
                  {totalAnnouncements}
                </strong>

              </div>

              <div>

                <span>
                  Published
                </span>

                <strong>
                  {publishedAnnouncements}
                </strong>

              </div>

              <div>

                <span>
                  Recent
                </span>

                <strong>
                  {recentAnnouncements}
                </strong>

              </div>

              <div>

                <span>
                  Audience
                </span>

                <strong>
                  All
                </strong>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CommunityAnnouncements;
