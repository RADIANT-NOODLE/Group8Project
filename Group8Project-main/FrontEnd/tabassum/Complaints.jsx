import { useState } from "react";

export default function Complaints() {

    const [category, setCategory] = useState("Security");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Low");

    const [complaints, setComplaints] = useState([
        {
            id: "VAL-001",
            category: "Security",
            priority: "High",
            date: "18 Aug 2026",
            status: "Submitted"
        }
    ]);


    function submitComplaint(event) {

        event.preventDefault();

        if (description.trim() === "") {

            alert("Please describe the complaint before submitting.");

            return;
        }

        const newId =
            `VAL-${String(complaints.length + 1).padStart(3, "0")}`;

        const newComplaint = {

            id: newId,

            category: category,

            description: description,

            priority: priority,

            date: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }),

            status: "Submitted"
        };


        setComplaints([
            ...complaints,
            newComplaint
        ]);


        setDescription("");

        setCategory("Security");

        setPriority("Low");


        alert("Complaint submitted successfully.");
    }


    const totalComplaints = complaints.length;


    const submittedComplaints =
        complaints.filter(
            complaint => complaint.status === "Submitted"
        ).length;


    const acknowledgedComplaints =
        complaints.filter(
            complaint => complaint.status === "Acknowledged"
        ).length;


    const inProgressComplaints =
        complaints.filter(
            complaint => complaint.status === "In Progress"
        ).length;


    const resolvedComplaints =
        complaints.filter(
            complaint => complaint.status === "Resolved"
        ).length;


    const cancelledComplaints =
        complaints.filter(
            complaint => complaint.status === "Cancelled"
        ).length;


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

                    <a href="/property">
                        🏡 My Property
                    </a>

                    <a href="/valuation">
                        🤖 AI Valuation
                    </a>

                    <a
                        href="/complaints"
                        className="active"
                    >
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

                    <a href="/">
                        🚪 Logout
                    </a>

                </div>

            </aside>


            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                <div className="top-bar">

                    <div>

                        <h2>
                            Community Complaint Tracker
                        </h2>

                        <p>
                            Report and monitor issues within your community.
                        </p>

                    </div>

                </div>


                {/* COMPLAINT FORM + SUMMARY */}

                <div className="complaint-layout">


                    {/* SUBMIT COMPLAINT */}

                    <section className="dashboard-panel">

                        <div className="panel-heading">

                            <div>

                                <h3>
                                    Submit a Complaint
                                </h3>

                                <p>
                                    Provide details about the issue.
                                </p>

                            </div>

                        </div>


                        <form onSubmit={submitComplaint}>

                            <label>
                                Complaint Category
                            </label>

                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                            >

                                <option value="Security">
                                    Security
                                </option>

                                <option value="Maintenance">
                                    Maintenance
                                </option>

                                <option value="Noise">
                                    Noise
                                </option>

                                <option value="Cleaning">
                                    Cleaning
                                </option>

                                <option value="Parking">
                                    Parking
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>


                            <label>
                                Complaint Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Describe the issue clearly..."
                            />


                            <label>
                                Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(event.target.value)
                                }
                            >

                                <option value="Low">
                                    Low
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="High">
                                    High
                                </option>

                                <option value="Urgent">
                                    Urgent
                                </option>

                            </select>


                            <button type="submit">
                                Submit Complaint
                            </button>

                        </form>

                    </section>


                    {/* SUMMARY */}

                    <section className="dashboard-panel">

                        <div className="panel-heading">

                            <div>

                                <h3>
                                    Complaint Summary
                                </h3>

                                <p>
                                    Your current complaints.
                                </p>

                            </div>

                        </div>


                        <div className="complaint-stats">

                            <div>

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {totalComplaints}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Submitted
                                </span>

                                <strong>
                                    {submittedComplaints}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Acknowledged
                                </span>

                                <strong>
                                    {acknowledgedComplaints}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    In Progress
                                </span>

                                <strong>
                                    {inProgressComplaints}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Resolved
                                </span>

                                <strong>
                                    {resolvedComplaints}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Cancelled
                                </span>

                                <strong>
                                    {cancelledComplaints}
                                </strong>

                            </div>

                        </div>


                        {complaints.length > 1 && (

                            <div className="success-message">

                                Complaint submitted successfully.
                                Your issue has been added to the
                                complaint history.

                            </div>

                        )}

                    </section>


                </div>


                {/* COMPLAINT HISTORY */}

                <section className="dashboard-panel complaint-history">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                Complaint History
                            </h3>

                            <p>
                                Track your submitted community issues.
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

                                </tr>

                            </thead>


                            <tbody>

                                {complaints.map((complaint) => (

                                    <tr key={complaint.id}>

                                        <td>
                                            {complaint.id}
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
                                                        : complaint.status === "Cancelled"
                                                        ? "status-cancelled"
                                                        : complaint.status === "In Progress"
                                                        ? "status-progress"
                                                        : complaint.status === "Acknowledged"
                                                        ? "status-acknowledged"
                                                        : "status-submitted"
                                                }
                                            >

                                                {complaint.status}

                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* COMPLAINT STATUS FLOW */}

                <section className="dashboard-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                Complaint Status
                            </h3>

                            <p>
                                Your complaint progresses through the following stages.
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
                                Complaint has been submitted by the resident.
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
                                Complaint has been received and acknowledged.
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
                                The complaint is currently being investigated or addressed.
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
                                The issue has been resolved.
                            </p>

                        </div>


                        <div className="complaint-status-step">

                            <span>
                                05
                            </span>

                            <strong>
                                Cancelled
                            </strong>

                            <p>
                                The complaint has been cancelled.
                            </p>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}
