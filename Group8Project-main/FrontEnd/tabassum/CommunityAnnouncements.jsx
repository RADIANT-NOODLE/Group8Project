import { useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./CommunityAnnouncements.css";


/* =========================================================
   PROFESSIONAL ICON
========================================================= */

function Icon({ type, size = 20 }) {

    const paths = {

        announcement: (
            <>
                <path
                    d="M4 10.5h3l8-4v11l-8-4H4z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M7 13.5v4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="M17 9c1.5.5 2.5 1.5 2.5 3s-1 2.5-2.5 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </>
        ),

        plus: (
            <>
                <path
                    d="M12 5v14M5 12h14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </>
        ),

        eye: (
            <>
                <path
                    d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="2.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </>
        ),

        edit: (
            <>
                <path
                    d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M13.5 7.5l3 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </>
        ),

        users: (
            <>
                <circle
                    cx="9"
                    cy="8"
                    r="3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M3.5 20c0-3.3 2.3-5 5.5-5s5.5 1.7 5.5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="M16 5.5a3 3 0 0 1 0 5.8M17 15c2.3.5 3.5 2 3.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </>
        ),

        calendar: (
            <>
                <rect
                    x="4"
                    y="5"
                    width="16"
                    height="15"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M8 3v4M16 3v4M4 9h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </>
        ),

        filter: (
            <>
                <path
                    d="M4 6h16M7 12h10M10 18h4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </>
        ),

        chart: (
            <>
                <path
                    d="M4 19V5M4 19h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="M7 15l3-4 3 2 5-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </>
        ),

        file: (
            <>
                <path
                    d="M6 3h8l4 4v14H6z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M14 3v5h5M9 12h6M9 16h6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </>
        )

    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            {paths[type] || paths.file}
        </svg>
    );
}


/* =========================================================
   ANNOUNCEMENT DATA
========================================================= */

const announcements = [
    {
        id: "ANN-001",
        title: "Annual General Meeting",
        category: "Meeting",
        date: "28 Aug 2026",
        author: "HOA Admin",
        status: "Published"
    },
    {
        id: "ANN-002",
        title: "Water Maintenance Notice",
        category: "Maintenance",
        date: "25 Aug 2026",
        author: "HOA Admin",
        status: "Published"
    },
    {
        id: "ANN-003",
        title: "Security Gate Upgrade",
        category: "Security",
        date: "22 Aug 2026",
        author: "HOA Admin",
        status: "Published"
    },
    {
        id: "ANN-004",
        title: "Community Clean-Up Day",
        category: "Community",
        date: "20 Aug 2026",
        author: "HOA Admin",
        status: "Published"
    },
    {
        id: "ANN-005",
        title: "Parking Reminder",
        category: "General",
        date: "18 Aug 2026",
        author: "HOA Admin",
        status: "Published"
    }
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

function CommunityAnnouncements() {

    const [category, setCategory] = useState("All");

    const filteredAnnouncements =
        category === "All"
            ? announcements
            : announcements.filter(
                announcement =>
                    announcement.category === category
            );


    return (

        <div className="community-announcements-page">

            {/* =================================================
               SHARED RESIDENT SIDEBAR
            ================================================= */}

            <DashboardSidebar />


            {/* =================================================
               MAIN CONTENT
            ================================================= */}

            <main className="community-announcements-main">


                {/* =================================================
                   TOP BAR
                ================================================= */}

                <section className="community-announcements-top-bar">

                    <p className="community-announcements-eyebrow">
                        Community
                    </p>

                    <h1>
                        Community Announcements
                    </h1>

                    <p>
                        Stay informed about important updates,
                        notices and activities within your community.
                    </p>

                </section>


                {/* =================================================
                   STAT CARDS
                ================================================= */}

                <section className="community-announcements-stat-cards">

                    <div className="community-announcements-stat-card">

                        <div className="community-announcements-stat-icon">
                            <Icon type="announcement" size={20} />
                        </div>

                        <div>
                            <p>Total Announcements</p>
                            <h3>{announcements.length}</h3>
                            <small>Community updates</small>
                        </div>

                    </div>


                    <div className="community-announcements-stat-card">

                        <div className="community-announcements-stat-icon">
                            <Icon type="file" size={20} />
                        </div>

                        <div>
                            <p>Published</p>
                            <h3>
                                {
                                    announcements.filter(
                                        item => item.status === "Published"
                                    ).length
                                }
                            </h3>
                            <small>Currently visible</small>
                        </div>

                    </div>


                    <div className="community-announcements-stat-card">

                        <div className="community-announcements-stat-icon">
                            <Icon type="calendar" size={20} />
                        </div>

                        <div>
                            <p>Recent</p>
                            <h3>5</h3>
                            <small>Latest updates</small>
                        </div>

                    </div>


                    <div className="community-announcements-stat-card">

                        <div className="community-announcements-stat-icon">
                            <Icon type="users" size={20} />
                        </div>

                        <div>
                            <p>Audience</p>
                            <h3>All</h3>
                            <small>Community residents</small>
                        </div>

                    </div>

                </section>


                {/* =================================================
                   ANNOUNCEMENTS PANEL
                ================================================= */}

                <section className="community-announcements-panel community-announcements-large-panel">

                    <div className="community-announcements-panel-heading">

                        <div>

                            <h3>
                                Latest Announcements
                            </h3>

                            <p>
                                Important information shared with
                                the community.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="community-announcements-primary-btn"
                        >
                            <Icon type="plus" size={15} />
                            Create Announcement
                        </button>

                    </div>


                    {/* =================================================
                       FILTER
                    ================================================= */}

                    <div className="community-announcements-filter-row">

                        <Icon type="filter" size={16} />

                        <select
                            className="community-announcements-filter-select"
                            value={category}
                            onChange={event =>
                                setCategory(event.target.value)
                            }
                            aria-label="Filter announcements"
                        >

                            <option value="All">
                                All Categories
                            </option>

                            <option value="Meeting">
                                Meeting
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


                    {/* =================================================
                       TABLE
                    ================================================= */}

                    <div className="community-announcements-table-container">

                        <table className="community-announcements-data-table">

                            <thead>

                                <tr>
                                    <th>Announcement</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Author</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredAnnouncements.map(
                                    announcement => (

                                        <tr key={announcement.id}>

                                            <td>

                                                <strong>
                                                    {announcement.title}
                                                </strong>

                                                <span className="community-announcements-id">
                                                    {announcement.id}
                                                </span>

                                            </td>


                                            <td>

                                                <span className="community-announcements-category-badge">
                                                    {announcement.category}
                                                </span>

                                            </td>


                                            <td>
                                                {announcement.date}
                                            </td>


                                            <td>
                                                {announcement.author}
                                            </td>


                                            <td>

                                                <span className="community-announcements-status-badge">
                                                    {announcement.status}
                                                </span>

                                            </td>


                                            <td>

                                                <div className="community-announcements-action-buttons">

                                                    <button
                                                        type="button"
                                                        className="community-announcements-secondary-btn"
                                                    >
                                                        <Icon type="eye" size={13} />
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="community-announcements-secondary-btn"
                                                    >
                                                        <Icon type="edit" size={13} />
                                                        Edit
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* =================================================
                   LOWER GRID
                ================================================= */}

                <section className="community-announcements-grid">


                    {/* =================================================
                       QUICK ACTIONS
                    ================================================= */}

                    <div className="community-announcements-panel">

                        <div className="community-announcements-panel-heading">

                            <div>

                                <h3>
                                    Quick Actions
                                </h3>

                                <p>
                                    Manage your community information.
                                </p>

                            </div>

                        </div>


                        <div className="community-announcements-quick-actions">

                            <button type="button">
                                <Icon type="plus" size={17} />
                                Create New Announcement
                            </button>

                            <button type="button">
                                <Icon type="eye" size={17} />
                                View All Announcements
                            </button>

                            <button type="button">
                                <Icon type="chart" size={17} />
                                Announcement Analytics
                            </button>

                            <button type="button">
                                <Icon type="users" size={17} />
                                View Residents
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                       COMMUNITY OVERVIEW
                    ================================================= */}

                    <div className="community-announcements-panel">

                        <div className="community-announcements-panel-heading">

                            <div>

                                <h3>
                                    Community Overview
                                </h3>

                                <p>
                                    Current announcement information.
                                </p>

                            </div>

                        </div>


                        <div className="community-announcements-property-summary">

                            <div>
                                <span>
                                    Total Announcements
                                </span>

                                <strong>
                                    {announcements.length}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Published
                                </span>

                                <strong>
                                    {
                                        announcements.filter(
                                            item => item.status === "Published"
                                        ).length
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Categories
                                </span>

                                <strong>
                                    5
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


