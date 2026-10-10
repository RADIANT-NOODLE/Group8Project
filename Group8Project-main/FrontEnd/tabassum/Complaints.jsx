import { useState } from "react";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import "./Complaints.css";

export default function Complaints() {

    const [category, setCategory] = useState("Security");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Low");

    const [complaintImage, setComplaintImage] = useState(null);

    const [complaints, setComplaints] = useState([
        {
            id: "VAL-001",
            category: "Security",
            priority: "High",
            date: "18 Aug 2026",
            status: "Submitted",
            image: null
        }
    ]);


    /* =========================================================
       IMAGE UPLOAD
    ========================================================= */

    function handleImageUpload(event) {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file.");
            return;
        }

        const imageUrl = URL.createObjectURL(file);

        setComplaintImage(imageUrl);
    }


    function removeComplaintImage() {
        setComplaintImage(null);
    }


    /* =========================================================
       SUBMIT COMPLAINT
    ========================================================= */

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

            status: "Submitted",

            image: complaintImage
        };


        setComplaints([
            ...complaints,
            newComplaint
        ]);


        setDescription("");
        setCategory("Security");
        setPriority("Low");
        setComplaintImage(null);


        alert("Complaint submitted successfully.");
    }


    /* =========================================================
       COMPLAINT STATISTICS
    ========================================================= */

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


    /* =========================================================
       SVG ICONS
    ========================================================= */

    const CameraIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4 7.5 6H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-2.5L15 4H9Zm3 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
    );


    const RemoveIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 7h12l-1 14H7L6 7Zm3-4h6l1 2h4v2H4V5h4l1-2Zm1 7v8h2v-8h-2Zm4 0v8h2v-8h-2Z" />
        </svg>
    );


    return (

        <div className="complaints-layout">

            {/* =================================================
                SHARED VALORA SIDEBAR
            ================================================= */}

            <DashboardSidebar />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="complaints-main">

                <div className="complaints-top-bar">

                    <div>

                        <span className="complaints-eyebrow">
                            RESIDENT SERVICES
                        </span>

                        <h2>
                            Community Complaint Tracker
                        </h2>

                        <p>
                            Report and monitor issues within your community.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    COMPLAINT FORM + SUMMARY
                ================================================= */}

                <div className="complaints-layout-grid">


                    {/* SUBMIT COMPLAINT */}

                    <section className="complaints-panel">

                        <div className="complaints-panel-heading">

                            <div>

                                <h3>
                                    Submit a Complaint
                                </h3>

                                <p>
                                    Provide details about the issue.
                                </p>

                            </div>

                        </div>


                        <form
                            className="complaints-form"
                            onSubmit={submitComplaint}
                        >

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


                            {/* IMAGE UPLOAD */}

                            <div className="complaints-photo-section">

                                <label>
                                    Attach a Photo
                                </label>

                                <p className="complaints-image-upload-help">
                                    Upload a photo or take a picture of the issue.
                                </p>


                                <label className="complaints-image-upload-button">

                                    <CameraIcon />

                                    <span>
                                        Take Photo / Choose Image
                                    </span>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageUpload}
                                        hidden
                                    />

                                </label>

                            </div>


                            {/* IMAGE PREVIEW */}

                            {complaintImage && (

                                <div className="complaints-image-preview">

                                    <img
                                        src={complaintImage}
                                        alt="Complaint evidence preview"
                                    />

                                    <button
                                        type="button"
                                        className="complaints-remove-image-button"
                                        onClick={removeComplaintImage}
                                    >
                                        <RemoveIcon />

                                        <span>
                                            Remove Photo
                                        </span>

                                    </button>

                                </div>

                            )}


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


                            <button
                                type="submit"
                                className="complaints-submit-btn"
                            >
                                Submit Complaint
                            </button>

                        </form>

                    </section>


                    {/* SUMMARY */}

                    <section className="complaints-panel">

                        <div className="complaints-panel-heading">

                            <div>

                                <h3>
                                    Complaint Summary
                                </h3>

                                <p>
                                    Your current complaints.
                                </p>

                            </div>

                        </div>


                        <div className="complaints-stats">

                            <div>
                                <span>Total</span>
                                <strong>{totalComplaints}</strong>
                            </div>

                            <div>
                                <span>Submitted</span>
                                <strong>{submittedComplaints}</strong>
                            </div>

                            <div>
                                <span>Acknowledged</span>
                                <strong>{acknowledgedComplaints}</strong>
                            </div>

                            <div>
                                <span>In Progress</span>
                                <strong>{inProgressComplaints}</strong>
                            </div>

                            <div>
                                <span>Resolved</span>
                                <strong>{resolvedComplaints}</strong>
                            </div>

                            <div>
                                <span>Cancelled</span>
                                <strong>{cancelledComplaints}</strong>
                            </div>

                        </div>


                        {complaints.length > 1 && (

                            <div className="complaints-success-message">

                                Complaint submitted successfully.
                                Your issue has been added to the
                                complaint history.

                            </div>

                        )}

                    </section>

                </div>


                {/* =================================================
                    COMPLAINT HISTORY
                ================================================= */}

                <section className="complaints-panel complaints-history">

                    <div className="complaints-panel-heading">

                        <div>

                            <h3>
                                Complaint History
                            </h3>

                            <p>
                                Track your submitted community issues.
                            </p>

                        </div>

                    </div>


                    <div className="complaints-table-container">

                        <table className="complaints-data-table">

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
                                                        ? "complaints-priority-high"
                                                        : "complaints-priority-normal"
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
                                                        ? "complaints-status-resolved"
                                                        : complaint.status === "Cancelled"
                                                        ? "complaints-status-cancelled"
                                                        : complaint.status === "In Progress"
                                                        ? "complaints-status-progress"
                                                        : complaint.status === "Acknowledged"
                                                        ? "complaints-status-acknowledged"
                                                        : "complaints-status-submitted"
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


                {/* =================================================
                    COMPLAINT STATUS FLOW
                ================================================= */}

                <section className="complaints-panel">

                    <div className="complaints-panel-heading">

                        <div>

                            <h3>
                                Complaint Status
                            </h3>

                            <p>
                                Your complaint progresses through the following stages.
                            </p>

                        </div>

                    </div>


                    <div className="complaints-status-flow">

                        <div className="complaints-status-step">

                            <span>01</span>

                            <strong>
                                Submitted
                            </strong>

                            <p>
                                Complaint has been submitted by the resident.
                            </p>

                        </div>


                        <div className="complaints-status-step">

                            <span>02</span>

                            <strong>
                                Acknowledged
                            </strong>

                            <p>
                                Complaint has been received and acknowledged.
                            </p>

                        </div>


                        <div className="complaints-status-step">

                            <span>03</span>

                            <strong>
                                In Progress
                            </strong>

                            <p>
                                The complaint is currently being investigated or addressed.
                            </p>

                        </div>


                        <div className="complaints-status-step">

                            <span>04</span>

                            <strong>
                                Resolved
                            </strong>

                            <p>
                                The issue has been resolved.
                            </p>

                        </div>


                        <div className="complaints-status-step">

                            <span>05</span>

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
