import React, { useState } from "react";

function Announcements() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const announcements = [
    {
      icon: "🔧",
      priority: "Normal",
      priorityClass: "normal",
      category: "maintenance",
      categoryName: "Maintenance",
      title: "Scheduled Maintenance",
      description:
        "Maintenance work will be carried out in the community on Saturday from 09:00 to 13:00.",
      date: "18 August 2026",
    },
    {
      icon: "🔒",
      priority: "Important",
      priorityClass: "high",
      category: "security",
      categoryName: "Security",
      title: "Security Reminder",
      description:
        "Residents are reminded to ensure that all gates and access points are properly closed.",
      date: "14 August 2026",
    },
    {
      icon: "🚧",
      priority: "Normal",
      priorityClass: "normal",
      category: "parking",
      categoryName: "Parking",
      title: "Parking Area Notice",
      description:
        "Residents are requested to avoid parking in the visitor parking area during maintenance.",
      date: "16 August 2026",
    },
    {
      icon: "🌳",
      priority: "Normal",
      priorityClass: "normal",
      category: "community",
      categoryName: "Community",
      title: "Community Garden Project",
      description:
        "The community garden improvement project will begin next month. Residents are welcome to participate.",
      date: "10 August 2026",
    },
  ];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = announcement.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || announcement.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo-area">

          {/* VALORA LOGO IMAGE */}
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

          <a
            href="/announcements"
            className="active"
          >
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


      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <div className="top-bar">

          <div>

            <h2>
              HOA Announcements 📢
            </h2>

            <p>
              Stay updated with your community.
            </p>

          </div>

        </div>


        {/* SEARCH AND FILTER */}
        <section className="dashboard-panel announcement-controls">

          <div>

            <h3>
              Community Updates
            </h3>

            <p>
              Search and filter the latest announcements.
            </p>

          </div>


          <div className="announcement-filters">

            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />


            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >

              <option value="all">
                All Categories
              </option>

              <option value="maintenance">
                Maintenance
              </option>

              <option value="security">
                Security
              </option>

              <option value="community">
                Community
              </option>

              <option value="parking">
                Parking
              </option>

            </select>

          </div>

        </section>


        {/* ANNOUNCEMENTS */}
        {filteredAnnouncements.length > 0 ? (

          <section className="announcement-grid">

            {filteredAnnouncements.map((announcement, index) => (

              <article
                className="announcement-card"
                key={index}
              >

                <div className="announcement-top">

                  <span className="announcement-icon">
                    {announcement.icon}
                  </span>

                  <span
                    className={`announcement-priority ${announcement.priorityClass}`}
                  >
                    {announcement.priority}
                  </span>

                </div>


                <span className="announcement-category">
                  {announcement.categoryName}
                </span>


                <h3>
                  {announcement.title}
                </h3>


                <p>
                  {announcement.description}
                </p>


                <div className="announcement-footer">

                  <span>
                    📅 {announcement.date}
                  </span>

                  <span>
                    HOA
                  </span>

                </div>

              </article>

            ))}

          </section>

        ) : (

          <div className="no-providers">

            <h3>
              No announcements found
            </h3>

            <p>
              Try another search or category.
            </p>

          </div>

        )}

      </main>

    </div>
  );
}

export default Announcements;
