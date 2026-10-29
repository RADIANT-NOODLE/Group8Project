import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import "./Complaints.css";

const COMPLAINT_CATEGORIES = [
    "Security",
    "Maintenance",
    "Water Leakage",
    "Noise",
    "Cleaning",
    "Parking",
    "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const STATUSES = [
    "Submitted",
    "Acknowledged",
    "In Progress",
    "Resolved",
    "Cancelled",
];

// Helper to read the logged-in user from local storage
function readUser() {
    try {
        return JSON.parse(localStorage.getItem("valoraUser") || "null");
    } catch {
        return null;
    }
}

function normaliseRole(value = "") {
    const role = String(value).trim().toLowerCase();
    if (role.includes("head admin")) return "Head Admin";
    if (role.includes("hoa") || role.includes("homeowners association")) return "HOA Admin";
    if (role.includes("estate agent")) return "Estate Agent";
    if (role.includes("investor") || role === "buyer") return "Investor";
    if (role.includes("resident") || role === "property owner") return "Resident";
    return value || "User";
}

function getUserRole(user) {
    return normaliseRole(user?.role || user?.userType || user?.accountType || "");
}

function getUserName(user) {
    if (!user) return "";
    return (
        user.fullName ||
        user.name ||
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.email ||
        ""
    ).trim();
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function CameraIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4 7.5 6H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-2.5L15 4H9Zm3 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
    );
}

function statusClass(status) {
    const classes = {
        Submitted: "complaints-status-submitted",
        Acknowledged: "complaints-status-acknowledged",
        "In Progress": "complaints-status-progress",
        Resolved: "complaints-status-resolved",
        Cancelled: "complaints-status-cancelled",
    };
    return classes[status] || classes.Submitted;
}

export default function Complaints() {
    const [user, setUser] = useState(readUser);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [category, setCategory] = useState("Security");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Low");
    
    const [complaintImage, setComplaintImage] = useState("");
    const [imageName, setImageName] = useState("");
    
    const [search, setSearch] = useState("");
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    const role = getUserRole(user);
    const userName = getUserName(user);
    const isAdmin = role === "HOA Admin" || role === "Head Admin";
    const canSubmit = ["Resident", "Investor", "Estate Agent"].includes(role);

    // 1. Fetch data from API
    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
            const response = await fetch("http://127.0.0.1:8000/api/v1/complaints", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Handle both direct arrays and wrapped objects
                const list = Array.isArray(data) ? data : (data.complaints || data.items || []);
                setComplaints(list);
            } else {
                setError("Failed to load complaints from the server.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not connect to the backend server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setUser(readUser());
        fetchComplaints();
    }, []);

    // 2. Filter based on role
    const visibleComplaints = useMemo(() => {
        if (isAdmin) return complaints;
        
        // For residents, match by user id from the backend (user_id)
        // If your backend returns user_id, we filter on that. Otherwise fallback to email match.
        return complaints.filter((complaint) => {
            return complaint.email === user?.email || 
                   complaint.user_id === user?.id ||
                   complaint.userId === user?.id;
        });
    }, [complaints, isAdmin, user]);

    const filteredComplaints = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return visibleComplaints;
        return visibleComplaints.filter((complaint) =>
            [
                complaint.complaint_id,
                complaint.id,
                complaint.category,
                complaint.description,
                complaint.priority,
                complaint.status,
                complaint.full_name,
                complaint.submitterName,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [visibleComplaints, search]);

    // 3. Counts
    const counts = useMemo(() => {
        return {
            total: visibleComplaints.length,
            submitted: visibleComplaints.filter((item) => item.status === "Submitted").length,
            acknowledged: visibleComplaints.filter((item) => item.status === "Acknowledged").length,
            inProgress: visibleComplaints.filter((item) => item.status === "In Progress").length,
            resolved: visibleComplaints.filter((item) => item.status === "Resolved").length,
            cancelled: visibleComplaints.filter((item) => item.status === "Cancelled").length,
        };
    }, [visibleComplaints]);

    // 4. Handle Image 
    async function handleImageUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please choose a valid image file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("Please choose an image smaller than 2 MB.");
            return;
        }
        try {
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error("Image could not be read."));
                reader.readAsDataURL(file);
            });
            setComplaintImage(String(dataUrl));
            setImageName(file.name);
        } catch {
            setError("The image could not be loaded.");
        }
    }

    // 5. Submit Complaint to API
    async function submitComplaint(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (!canSubmit) return setError("Your account role cannot submit complaints.");
        if (!description.trim()) return setError("Please describe the complaint before submitting.");

        try {
            const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
            
            const response = await fetch("http://127.0.0.1:8000/api/v1/complaints", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    category: category,
                    description: description.trim(),
                    priority: priority,
                    user_id: user?.id || user?.user_id,
                    unit_id: user?.unit_no || null,
                    photo_url: complaintImage || null 
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                console.log("FULL BACKEND ERROR:", errData);
                
                // If the error detail is an array (FastAPI validation error), map it to a string
                let errorMsg = "Failed to submit complaint";
                if (Array.isArray(errData.detail)) {
                    errorMsg = errData.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(", ");
                } else if (typeof errData.detail === 'string') {
                    errorMsg = errData.detail;
                }
                throw new Error(errorMsg);
            }

            // Reset form
            setDescription("");
            setCategory("Security");
            setPriority("Low");
            setComplaintImage("");
            setImageName("");
            setNotice("Complaint submitted successfully to the database!");
            
            // Refresh the list
            await fetchComplaints();

        } catch (err) {
            if (typeof err === "object" && err !== null) {
                setError(JSON.stringify(err));
            } else {
                setError(String(err.message));
            }
        }
    }

    // 6. Update Status (Admin Only)
    async function updateStatus(complaintId, nextStatus) {
        if (!isAdmin || !STATUSES.includes(nextStatus)) return;

        try {
            const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
            
            const response = await fetch(`http://127.0.0.1:8000/api/v1/complaints/${complaintId}/status`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: nextStatus })
            });

            if (!response.ok) throw new Error("Failed to update status.");

            await fetchComplaints();
            setNotice(`Complaint updated to "${nextStatus}".`);
            setError("");

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="complaints-layout">
            <DashboardSidebar />

            <main className="complaints-main">
                <header className="complaints-top-bar">
                    <span className="complaints-eyebrow">
                        {isAdmin ? "COMMUNITY MANAGEMENT" : "RESIDENT SERVICES"}
                    </span>
                    <h2>{isAdmin ? "Community Complaints" : "My Complaints"}</h2>
                    <p>
                        {isAdmin
                            ? "Review community complaints, acknowledge issues and update their progress."
                            : "Submit a complaint privately and track its progress."}
                    </p>
                </header>

                {notice && (
                    <div className="complaints-notice" role="status">
                        {notice}
                        <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button>
                    </div>
                )}

                {error && (
                    <div className="complaints-error" role="alert">
                        {error}
                        <button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button>
                    </div>
                )}

                {user && (isAdmin || canSubmit) && (
                    <>
                        <section className="complaints-stats" aria-label="Complaint statistics">
                            <div className="complaints-stat-card">
                                <span>{isAdmin ? "All Complaints" : "My Complaints"}</span>
                                <strong>{loading ? "..." : counts.total}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>Submitted</span>
                                <strong>{loading ? "..." : counts.submitted}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>Acknowledged</span>
                                <strong>{loading ? "..." : counts.acknowledged}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>In Progress</span>
                                <strong>{loading ? "..." : counts.inProgress}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>Resolved</span>
                                <strong>{loading ? "..." : counts.resolved}</strong>
                            </div>
                        </section>

                        <div className="complaints-layout-grid">
                            {canSubmit && (
                                <section className="complaints-panel">
                                    <div className="complaints-panel-heading">
                                        <div>
                                            <h3>Submit a Complaint</h3>
                                            <p>Your complaint is visible to you and the HOA/Head Admin only.</p>
                                        </div>
                                    </div>

                                    <form className="complaints-form" onSubmit={submitComplaint}>
                                        <label htmlFor="complaint-category">Complaint Category</label>
                                        <select
                                            id="complaint-category"
                                            value={category}
                                            onChange={(event) => setCategory(event.target.value)}
                                        >
                                            {COMPLAINT_CATEGORIES.map((item) => (
                                                <option key={item} value={item}>{item}</option>
                                            ))}
                                        </select>

                                        <label htmlFor="complaint-description">Complaint Description</label>
                                        <textarea
                                            id="complaint-description"
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                            placeholder="Describe the issue clearly..."
                                            rows={5}
                                            maxLength={5000}
                                            required
                                        />

                                        <div className="complaints-field">
                                            <label htmlFor="complaint-image">Attach a Photo (Optional)</label>
                                            <label className="complaints-image-upload-button" htmlFor="complaint-image">
                                                <CameraIcon />
                                                <span>{imageName || "Choose Image"}</span>
                                            </label>
                                            <input
                                                id="complaint-image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="complaints-file-input"
                                            />
                                        </div>

                                        {complaintImage && (
                                            <div className="complaints-image-preview">
                                                <img src={complaintImage} alt="Complaint evidence preview" />
                                                <button
                                                    type="button"
                                                    className="complaints-text-button"
                                                    onClick={() => { setComplaintImage(""); setImageName(""); }}
                                                >
                                                    Remove photo
                                                </button>
                                            </div>
                                        )}

                                        <label htmlFor="complaint-priority">Priority</label>
                                        <select
                                            id="complaint-priority"
                                            value={priority}
                                            onChange={(event) => setPriority(event.target.value)}
                                        >
                                            {PRIORITIES.map((item) => (
                                                <option key={item} value={item}>{item}</option>
                                            ))}
                                        </select>

                                        <button type="submit" className="complaints-submit-btn" disabled={loading}>
                                            {loading ? "Submitting..." : "Submit Complaint"}
                                        </button>
                                    </form>
                                </section>
                            )}

                            <section className="complaints-panel complaints-history-panel">
                                <div className="complaints-panel-heading">
                                    <div>
                                        <h3>{isAdmin ? "Complaint Register" : "My Complaint History"}</h3>
                                    </div>
                                </div>

                                <label className="complaints-search-label" htmlFor="complaints-search">
                                    Search {isAdmin ? "complaints" : "your complaints"}
                                </label>
                                <input
                                    id="complaints-search"
                                    className="complaints-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by ID, category or status..."
                                />

                                <div className="complaints-table-container">
                                    <table className="complaints-data-table">
                                        <thead>
                                            <tr>
                                                <th>Complaint ID</th>
                                                {isAdmin && <th>Submitted By</th>}
                                                <th>Category</th>
                                                <th>Priority</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={isAdmin ? 7 : 6} className="complaints-empty">Loading...</td></tr>
                                            ) : filteredComplaints.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isAdmin ? 7 : 6} className="complaints-empty">
                                                        No complaints found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredComplaints.map((complaint) => (
                                                    <tr key={complaint.complaint_id || complaint.id}>
                                                        <td>{complaint.complaint_id || complaint.id}</td>
                                                        {isAdmin && (
                                                            <td>
                                                                <strong>{complaint.full_name || complaint.submitterName || "Unknown user"}</strong>
                                                                <small>{complaint.role || complaint.submitterRole || "Resident"}</small>
                                                            </td>
                                                        )}
                                                        <td>{complaint.category}</td>
                                                        <td>
                                                            <span className={
                                                                ["High", "Urgent"].includes(complaint.priority)
                                                                    ? "complaints-priority-high"
                                                                    : "complaints-priority-normal"
                                                            }>
                                                                {complaint.priority}
                                                            </span>
                                                        </td>
                                                        <td>{formatDate(complaint.created_at || complaint.createdAt)}</td>
                                                        <td>
                                                            <span className={statusClass(complaint.status)}>
                                                                {complaint.status}
                                                            </span>
                                                            {isAdmin && (
                                                                <select
                                                                    className="complaints-status-select"
                                                                    value={complaint.status}
                                                                    onChange={(event) => updateStatus(complaint.complaint_id || complaint.id, event.target.value)}
                                                                >
                                                                    {STATUSES.map((item) => (
                                                                        <option key={item} value={item}>{item}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="complaints-view-button"
                                                                onClick={() => setSelectedComplaint(complaint)}
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </main>

            {/* MODAL */}
            {selectedComplaint && (
                <div className="complaints-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedComplaint(null); }}>
                    <section className="complaints-modal" role="dialog" aria-modal="true">
                        <div className="complaints-modal-header">
                            <div>
                                <span className="complaints-eyebrow">COMPLAINT DETAILS</span>
                                <h3>{selectedComplaint.complaint_id || selectedComplaint.id}</h3>
                            </div>
                            <button type="button" className="complaints-modal-close" onClick={() => setSelectedComplaint(null)}>×</button>
                        </div>

                        <dl className="complaints-detail-list">
                            <div><dt>Category</dt><dd>{selectedComplaint.category}</dd></div>
                            <div><dt>Priority</dt><dd>{selectedComplaint.priority}</dd></div>
                            <div><dt>Date submitted</dt><dd>{formatDate(selectedComplaint.created_at || selectedComplaint.createdAt)}</dd></div>
                            <div><dt>Status</dt><dd><span className={statusClass(selectedComplaint.status)}>{selectedComplaint.status}</span></dd></div>
                            <div className="complaints-detail-description">
                                <dt>Description</dt>
                                <dd>{selectedComplaint.description}</dd>
                            </div>
                        </dl>

                        {isAdmin && (
                            <div className="complaints-modal-actions">
                                <label htmlFor="modal-complaint-status">Update Complaint Status</label>
                                <select
                                    id="modal-complaint-status"
                                    value={selectedComplaint.status}
                                    onChange={(event) => {
                                        updateStatus(selectedComplaint.complaint_id || selectedComplaint.id, event.target.value);
                                        setSelectedComplaint({...selectedComplaint, status: event.target.value});
                                    }}
                                >
                                    {STATUSES.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}