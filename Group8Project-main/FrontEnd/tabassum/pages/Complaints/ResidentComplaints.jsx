import React, { useState } from "react";
import "./ResidentComplaints.css";


/* =========================================================
   VALORA ICONS
========================================================= */

function Icon({ name, size = 18 }) {

    const icons = {

        dashboard: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
        ),

        residents: (
            <>
                <circle cx="9" cy="8" r="3" />
                <path d="M3.5 19c.5-3 2.4-4.5 5.5-4.5s5 1.5 5.5 4.5" />
                <path d="M15 5.5c2.2-.2 4 1.2 4 3.5 0 1.5-.8 2.7-2 3.3" />
                <path d="M16 14.5c2.4.4 3.9 1.8 4.5 4" />
            </>
        ),

        complaints: (
            <>
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M8.5 8h7" />
                <path d="M8.5 12h7" />
                <path d="M8.5 16h4.5" />
            </>
        ),

        maintenance: (
            <>
                <path d="M14.5 5.5a4 4 0 0 0-5.1 5.1L4 16l4 4 5.4-5.4a4 4 0 0 0 5.1-5.1l-2.6 2.6-3-3 2.6-2.6Z" />
            </>
        ),

        announcements: (
            <>
                <path d="M4 10v4h4l7 4V6l-7 4H4Z" />
                <path d="M8 14l1.5 5" />
                <path d="M18 9c1 .8 1.5 1.7 1.5 3s-.5 2.2-1.5 3" />
            </>
        ),

        ai: (
            <>
                <rect x="6" y="6" width="12" height="12" rx="2" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                <path d="M10 10h4v4h-4z" />
            </>
        ),

        analytics: (
            <>
                <path d="M4 19V9" />
                <path d="M10 19V5" />
                <path d="M16 19v-7" />
                <path d="M22 19V3" />
            </>
        ),

        profile: (
            <>
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6" />
            </>
        ),

        logout: (
            <>
                <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
                <path d="M14 8l4 4-4 4" />
                <path d="M18 12H9" />
            </>
        ),

        total: (
            <>
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" />
            </>
        ),

        active: (
            <>
                <path d="M12 3 21 19H3L12 3Z" />
                <path d="M12 9v4" />
                <circle cx="12" cy="16" r=".7" fill="currentColor" stroke="none" />
            </>
        ),

        resolved: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m7.5 12 3 3 6-6" />
            </>
        ),

        urgent: (
            <>
                <path d="M12 3 21 19H3L12 3Z" />
                <path d="M12 9v4" />
                <circle cx="12" cy="16" r=".7" fill="currentColor" stroke="none" />
            </>
        ),

        check: (
            <path d="m5 12.5 4 4L19 6.5" />
        ),

        arrow: (
            <path d="M5 12h14M13 6l6 6-6 6" />
        )

    };


    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[name]}
        </svg>
    );
}


/* =========================================================
   RESIDENT COMPLAINTS
========================================================= */

function ResidentComplaints() {

    const [complaints, setComplaints] = useState([
        {
            id: "VAL-001",
            resident: "Ahmed Khan",
            unit: "Unit 12",
            category: "Security",
            description: "Security gate access issue reported.",
            priority: "High",
            date: "18 Aug 2026",
            status: "Submitted"
        },
        {
            id: "VAL-002",
            resident: "Fatima Ismail",
            unit: "Unit 24",
            category: "Maintenance",
            description: "Water leakage reported in the kitchen.",
            priority: "Medium",
            date: "17 Aug 2026",
            status: "In Progress"
        },
        {
            id: "VAL-003",
            resident: "Yusuf Patel",
            unit: "Unit 31",
            category: "Cleaning",
            description: "Common area requires cleaning.",
            priority: "Low",
            date: "15 Aug 2026",
            status: "Resolved"
        },
        {
            id: "VAL-004",
            resident: "Ayesha Mohammed",
            unit: "Unit 08",
            category: "Noise",
            description: "Noise complaint regarding late-night disturbance.",
            priority: "Medium",
            date: "14 Aug 2026",
            status: "Acknowledged"
        }
    ]);


    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    const updateStatus = (id, newStatus) => {

        setComplaints(
            complaints.map((complaint) =>
                complaint.id === id
                    ? {
                        ...complaint,
                        status: newStatus
                    }
                    : complaint
            )
        );
    };


    /* =====================================================
       STATISTICS
    ===================================================== */

    const totalComplaints =
        complaints.length;


    const activeComplaints =
        complaints.filter(
            complaint =>
                complaint.status !== "Resolved" &&
                complaint.status !== "Cancelled"
        ).length;


    const resolvedComplaints =
        complaints.filter(
            complaint =>
                complaint.status === "Resolved"
        ).length;


    const urgentComplaints =
        complaints.filter(
            complaint =>
                complaint.priority === "Urgent" ||
                complaint.priority === "High"
        ).length;


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem("valoraLoggedIn");
        localStorage.removeItem("valoraUser");
        localStorage.removeItem("valoraUserEmail");

        window.location.href = "/";
    };


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    const getStatusClass = (status) => {

        switch (status) {

            case "Resolved":
                return "resident-complaints-status-resolved";

            case "In Progress":
                return "resident-complaints-status-progress";

            case "Acknowledged":
                return "resident-complaints-status-acknowledged";

            case "Cancelled":
                return "resident-complaints-status-cancelled";

            default:
                return "resident-complaints-status-submitted";
        }
    };


    /* =====================================================
       PRIORITY CLASS
    ===================================================== */

    const getPriorityClass = (priority) => {

        if (
            priority === "High" ||
            priority === "Urgent"
        ) {
            return "resident-complaints-priority-high";
        }

        return "resident-complaints-priority-normal";
    };


    return (

        <div className="resident-complaints-layout">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="resident-complaints-sidebar">

                <div className="resident-complaints-logo-area">

                    <img
                        src="/ValoraLogo.jpeg"
                        alt="VALORA Logo"
                    />

                    <p>
                        Property Intelligence
                    </p>

                </div>


                <nav className="resident-complaints-side-nav">

                    <a href="/dashboard">
                        <Icon
                            name="dashboard"
                            size={17}
                        />
                        <span>
                            Dashboard
                        </span>
                    </a>


                    <a href="/resident-directory">
                        <Icon
                            name="residents"
                            size={17}
                        />
                        <span>
                            Resident Directory
                        </span>
                    </a>


                    <a
                        href="/resident-complaints"
                        className="active"
                    >
                        <Icon
                            name="complaints"
                            size={17}
                        />
                        <span>
                            Resident Complaints
                        </span>
                    </a>


                    <a href="/maintenance">
                        <Icon
                            name="maintenance"
                            size={17}
                        />
                        <span>
                            Maintenance
                        </span>
                    </a>


                    <a href="/community-announcements">
                        <Icon
                            name="announcements"
                            size={17}
                        />
                        <span>
                            Community Announcements
                        </span>
                    </a>


                    <a href="/ai-training-data">
                        <Icon
                            name="ai"
                            size={17}
                        />
                        <span>
                            AI Training Data
                        </span>
                    </a>


                    <a href="/community-analytics">
                        <Icon
                            name="analytics"
                            size={17}
                        />
                        <span>
                            Community Analytics
                        </span>
                    </a>


                    <a href="/profile">
                        <Icon
                            name="profile"
                            size={17}
                        />
                        <span>
                            My Profile
                        </span>
                    </a>

                </nav>


                <div className="resident-complaints-logout-area">

                    <a
                        href="/"
                        onClick={(event) => {
                            event.preventDefault();
                            handleLogout();
                        }}
                    >
                        <Icon
                            name="logout"
                            size={17}
                        />
                        <span>
                            Logout
                        </span>
                    </a>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="resident-complaints-main">


                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div className="resident-complaints-top-bar">

                    <div>

                        <span className="resident-complaints-eyebrow">
                            COMMUNITY MANAGEMENT
                        </span>

                        <h2>
                            Resident Complaints
                        </h2>

                        <p>
                            Review and manage complaints submitted by residents.
                        </p>

                    </div>


                    <div className="resident-complaints-profile-small">

                        <div className="resident-complaints-profile-circle">
                            A
                        </div>

                        <span>
                            HOA Admin
                        </span>

                    </div>

                </div>


                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <section className="resident-complaints-stat-cards">


                    <div className="resident-complaints-stat-card">

                        <div className="resident-complaints-stat-icon">

                            <Icon
                                name="total"
                                size={19}
                            />

                        </div>

                        <div>

                            <p>
                                Total Complaints
                            </p>

                            <h3>
                                {totalComplaints}
                            </h3>

                            <small>
                                Community complaints
                            </small>

                        </div>

                    </div>


                    <div className="resident-complaints-stat-card">

                        <div className="resident-complaints-stat-icon">

                            <Icon
                                name="active"
                                size={19}
                            />

                        </div>

                        <div>

                            <p>
                                Active Complaints
                            </p>

                            <h3>
                                {activeComplaints}
                            </h3>

                            <small>
                                Require attention
                            </small>

                        </div>

                    </div>


                    <div className="resident-complaints-stat-card">

                        <div className="resident-complaints-stat-icon">

                            <Icon
                                name="resolved"
                                size={19}
                            />

                        </div>

                        <div>

                            <p>
                                Resolved
                            </p>

                            <h3>
                                {resolvedComplaints}
                            </h3>

                            <small>
                                Successfully resolved
                            </small>

                        </div>

                    </div>


                    <div className="resident-complaints-stat-card">

                        <div className="resident-complaints-stat-icon">

                            <Icon
                                name="urgent"
                                size={19}
                            />

                        </div>

                        <div>

                            <p>
                                High Priority
                            </p>

                            <h3>
                                {urgentComplaints}
                            </h3>

                            <small>
                                High or urgent complaints
                            </small>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    COMPLAINT TABLE
                ================================================= */}

                <section className="resident-complaints-panel">


                    <div className="resident-complaints-panel-heading">

                        <div>

                            <h3>
                                Complaint Management
                            </h3>

                            <p>
                                Review resident complaints and update their status.
                            </p>

                        </div>

                        <div className="resident-complaints-record-count">
                            {totalComplaints} Records
                        </div>

                    </div>


                    <div className="resident-complaints-table-container">

                        <table className="resident-complaints-table">

                            <thead>

                                <tr>

                                    <th>
                                        Complaint ID
                                    </th>

                                    <th>
                                        Resident
                                    </th>

                                    <th>
                                        Unit
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Priority
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

                                {complaints.map((complaint) => (

                                    <tr key={complaint.id}>

                                        <td>

                                            <strong className="resident-complaints-id">
                                                {complaint.id}
                                            </strong>

                                        </td>


                                        <td>

                                            <div className="resident-complaints-resident">
                                                <strong>
                                                    {complaint.resident}
                                                </strong>

                                                <small>
                                                    {complaint.description}
                                                </small>
                                            </div>

                                        </td>


                                        <td>
                                            {complaint.unit}
                                        </td>


                                        <td>
                                            {complaint.category}
                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    getPriorityClass(
                                                        complaint.priority
                                                    )
                                                }
                                            >
                                                {complaint.priority}
                                            </span>

                                        </td>


                                        <td>
                                            {complaint.date}
                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    getStatusClass(
                                                        complaint.status
                                                    )
                                                }
                                            >
                                                {complaint.status}
                                            </span>

                                        </td>


                                        <td>

                                            <select
                                                className="resident-complaints-status-select"
                                                value={
                                                    complaint.status
                                                }
                                                onChange={(event) =>
                                                    updateStatus(
                                                        complaint.id,
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                <option value="Submitted">
                                                    Submitted
                                                </option>

                                                <option value="Acknowledged">
                                                    Acknowledged
                                                </option>

                                                <option value="In Progress">
                                                    In Progress
                                                </option>

                                                <option value="Resolved">
                                                    Resolved
                                                </option>

                                                <option value="Cancelled">
                                                    Cancelled
                                                </option>

                                            </select>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* =================================================
                    INFORMATION PANEL
                ================================================= */}

                <section className="resident-complaints-panel">


                    <div className="resident-complaints-panel-heading">

                        <div>

                            <h3>
                                Complaint Management Process
                            </h3>

                            <p>
                                HOA administrators can monitor complaints through each stage.
                            </p>

                        </div>

                    </div>


                    <div className="resident-complaints-status-flow">


                        <div className="resident-complaints-status-step">

                            <div className="resident-complaints-step-number">
                                01
                            </div>

                            <strong>
                                Submitted
                            </strong>

                            <p>
                                Resident submits a complaint.
                            </p>

                        </div>


                        <div className="resident-complaints-flow-line" />


                        <div className="resident-complaints-status-step">

                            <div className="resident-complaints-step-number">
                                02
                            </div>

                            <strong>
                                Acknowledged
                            </strong>

                            <p>
                                HOA acknowledges the complaint.
                            </p>

                        </div>


                        <div className="resident-complaints-flow-line" />


                        <div className="resident-complaints-status-step">

                            <div className="resident-complaints-step-number">
                                03
                            </div>

                            <strong>
                                In Progress
                            </strong>

                            <p>
                                The issue is being investigated or addressed.
                            </p>

                        </div>


                        <div className="resident-complaints-flow-line" />


                        <div className="resident-complaints-status-step">

                            <div className="resident-complaints-step-number">
                                04
                            </div>

                            <strong>
                                Resolved
                            </strong>

                            <p>
                                The complaint has been successfully resolved.
                            </p>

                        </div>

                    </div>

                </section>


            </main>

        </div>

    );
}


export default ResidentComplaints;
