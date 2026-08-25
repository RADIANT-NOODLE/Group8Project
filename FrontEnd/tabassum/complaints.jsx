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
            status: "Pending"
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
            priority: priority,
            date: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }),
            status: "Pending"
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

    const pendingComplaints =
        complaints.filter(
            complaint => complaint.status === "Pending"
        ).length;

    const resolvedComplaints =
        complaints.filter(
            complaint => complaint.status === "Resolved"
        ).length;


    return (

        <div className="dashboard-layout">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="logo-area">

                    <h1>VALORA</h1>

                    <p>
                        Property Intelligence
                    </p>

                </div>


                <nav className="side-nav">

                    <a href="/">
                        🏠 Dashboard
                    </a>

                    <a href="/property">
                        🏡 My Property
                    </a>

                    <a href="/valuation">
                        🤖 AI Valuation
                    </a>

                    <a
                        href="/roi"
                    >
                        📈 10-Year ROI
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
                                    Pending
                                </span>

                                <strong>
                                    {pendingComplaints}
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

                                            <span className="status-pending">

                                                {complaint.status}

                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    );
}
