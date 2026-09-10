import React, { useState } from "react";

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

    const totalComplaints = complaints.length;

    const activeComplaints = complaints.filter(
        complaint =>
            complaint.status !== "Resolved" &&
            complaint.status !== "Cancelled"
    ).length;

    const resolvedComplaints = complaints.filter(
        complaint =>
            complaint.status === "Resolved"
    ).length;

    const urgentComplaints = complaints.filter(
        complaint =>
            complaint.priority === "Urgent" ||
            complaint.priority === "High"
    ).length;

    const handleLogout = () => {

        localStorage.removeItem("valoraLoggedIn");
        localStorage.removeItem("valoraUser");
        localStorage.removeItem("valoraUserEmail");

        window.location.href = "/";
    };

    return (

        <div className="dashboard-layout">

            {/* SIDEBAR */}

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

                    <a
                        href="/resident-complaints"
                        className="active"
                    >
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


            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                <div className="top-bar">

                    <div>

                        <h2>
                            Resident Complaints 📋
                        </h2>

                        <p>
                            Review and manage complaints submitted by residents.
                        </p>

                    </div>

                    <div className="profile-small">

                        <div className="profile-circle">
                            A
                        </div>

                        <span>
                            HOA Admin
                        </span>

                    </div>

                </div>


                {/* STAT CARDS */}

                <section className="stat-cards">

                    <div className="stat-card">

                        <span className="stat-icon">
                            📋
                        </span>

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


                    <div className="stat-card">

                        <span className="stat-icon">
                            ⚠️
                        </span>

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


                    <div className="stat-card">

                        <span className="stat-icon">
                            ✅
                        </span>

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


                    <div className="stat-card">

                        <span className="stat-icon">
                            🚨
                        </span>

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


                {/* COMPLAINT TABLE */}

                <section className="dashboard-panel complaint-history">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                Complaint Management
                            </h3>

                            <p>
                                Review resident complaints and update their status.
                            </p>

                        </div>

                    </div>


                    <div className="table-container">

                        <table>

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
                                            <strong>
                                                {complaint.id}
                                            </strong>
                                        </td>

                                        <td>
                                            {complaint.resident}
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
                                                    complaint.priority === "High" ||
                                                    complaint.priority === "Urgent"
                                                        ? "priority-high"
                                                        : "priority-normal"
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
                                                    complaint.status === "Resolved"
                                                        ? "status-resolved"
                                                        : complaint.status === "In Progress"
                                                        ? "status-progress"
                                                        : complaint.status === "Acknowledged"
                                                        ? "status-acknowledged"
                                                        : complaint.status === "Cancelled"
                                                        ? "status-cancelled"
                                                        : "status-submitted"
                                                }
                                            >
                                                {complaint.status}
                                            </span>

                                        </td>

                                        <td>

                                            <select
                                                value={complaint.status}
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


                {/* INFORMATION PANEL */}

                <section className="dashboard-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                Complaint Management Process
                            </h3>

                            <p>
                                HOA administrators can monitor complaints through each stage.
                            </p>

                        </div>

                    </div>


                    <div className="complaint-status-flow">

                        <div className="complaint-status-step">

                            <span>
                                01
                            </span>

                            <strong>
                                Submitted
                            </strong>

                            <p>
                                Resident submits a complaint.
                            </p>

                        </div>


                        <div className="complaint-status-step">

                            <span>
                                02
                            </span>

                            <strong>
                                Acknowledged
                            </strong>

                            <p>
                                HOA acknowledges the complaint.
                            </p>

                        </div>


                        <div className="complaint-status-step">

                            <span>
                                03
                            </span>

                            <strong>
                                In Progress
                            </strong>

                            <p>
                                The issue is being investigated or addressed.
                            </p>

                        </div>


                        <div className="complaint-status-step">

                            <span>
                                04
                            </span>

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
