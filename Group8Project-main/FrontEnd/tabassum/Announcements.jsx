import React, { useState } from "react";
import "./Announcements.css";

function Announcements() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const announcements = [
    {
      icon: "maintenance",
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
      icon: "security",
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
      icon: "parking",
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
      icon: "community",
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
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  const AnnouncementIcon = ({ type }) => {
    if (type === "maintenance") {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M14.5 5.5a4 4 0 0 0-5.1 5.1L4 16a2.1 2.1 0 1 0 3 3l5.4-5.4a4 4 0 0 0 5.1-5.1l-2.4 2.4-2.1-2.1z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (type === "security") {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3.5 19 6v5.2c0 4.5-2.8 7.8-7 9.3-4.2-1.5-7-4.8-7-9.3V6z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m9 12 2 2 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (type === "parking") {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="5"
            y="4"
            width="14"
            height="16"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 3.5V8M12 12l3.5 2M16.5 4.5h4v4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="announcements-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="announcements-sidebar">

        <div className="announcements-logo-area">

          <img
            src="/ValoraLogo.jpeg"
            alt="VALORA Logo"
          />

          <p>
            Property Intelligence
          </p>

        </div>


        <nav className="announcements-side-nav">

          <a href="/dashboard">

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-5v6h-5A1.5 1.5 0 0 1 3 19.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            <span>Dashboard</span>

          </a>


          <a href="/property">

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M9 21v-6h6v6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            <span>My Property</span>

          </a>


          <a href="/valuation">

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="5"
                y="5"
                width="14"
                height="14"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M9 9h6M9 13h2M13 13h2M9 16h2M13 16h2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <span>AI Valuation</span>

          </a>


          <a href="/complaints">

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 8h8M8 12h8M8 16h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <span>Complaints</span>

          </a>


          <a href="/providers">

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14.5 5.5a4 4 0 0 0-5.1 5.1L4 16a2.1 2.1 0 1 0 3 3l5.4-5.4a4 4 0 0 0 5.1-5.1l-2.4 2.4-2.1-2.1z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            <span>Service Providers</span>

          </a>


          <a
            href="/announcements"
            className="active"
          >

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 10v4h3l8 4V6l-8 4z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M7 14l1.5 5h2L9 14M19 9.5a3.5 3.5 0 0 1 0 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <span>Announcements</span>

          </a>


          <a href="/profile">

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="12"
                cy="8"
                r="3.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <span>My Profile</span>

          </a>

        </nav>


        {/* LOGOUT */}

        <div className="announcements-logout-area">

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="m14 8 4 4-4 4M18 12H9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>Logout</span>

          </a>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="announcements-main">

        <div className="announcements-top-bar">

          <div>

            <h2>
              HOA Announcements
            </h2>

            <p>
              Stay updated with your community.
            </p>

          </div>

          <div className="announcements-profile-small">

            <div className="announcements-profile-circle">
              R
            </div>

            <span>
              Resident
            </span>

          </div>

        </div>


        {/* =====================================================
            SEARCH AND FILTER
        ===================================================== */}

        <section className="announcements-panel announcements-controls">

          <div className="announcements-panel-heading">

            <div>

              <h3>
                Community Updates
              </h3>

              <p>
                Search and filter the latest announcements.
              </p>

            </div>

          </div>


          <div className="announcements-filters">

            <div className="announcements-search">

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="10.5"
                  cy="10.5"
                  r="5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m15 15 4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <input
                type="text"
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>


            <div className="announcements-select-wrapper">

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 6h16M7 12h10M10 18h4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

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

          </div>

        </section>


        {/* =====================================================
            ANNOUNCEMENTS
        ===================================================== */}

        {filteredAnnouncements.length > 0 ? (

          <section className="announcement-grid">

            {filteredAnnouncements.map((announcement, index) => (

              <article
                className="announcement-card"
                key={index}
              >

                <div className="announcement-top">

                  <span className="announcement-icon">

                    <AnnouncementIcon
                      type={announcement.icon}
                    />

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

                  <span className="announcement-date">

                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect
                        x="4"
                        y="5"
                        width="16"
                        height="15"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <path
                        d="M8 3v4M16 3v4M4 10h16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>

                    {announcement.date}

                  </span>

                  <span className="announcement-author">
                    HOA
                  </span>

                </div>

              </article>

            ))}

          </section>

        ) : (

          <div className="announcements-empty">

            <div className="announcements-empty-icon">

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="10.5"
                  cy="10.5"
                  r="5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m15 15 4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

            </div>

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
