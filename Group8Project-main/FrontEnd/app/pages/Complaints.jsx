import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import "./Complaints.css";

const STORAGE_KEY = "valoraComplaints";
const UPDATED_EVENT = "valoraComplaintsUpdated";

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
    if (role.includes("hoa") || role.includes("homeowners association")) {
        return "HOA Admin";
    }
    if (role.includes("estate agent")) return "Estate Agent";
    if (role.includes("investor") || role === "buyer") return "Investor";
    if (
        role.includes("resident") ||
        role === "property owner"
    ) return "Resident";

    return value || "User";
}

function getUserRole(user) {
    return normaliseRole(
        user?.role || user?.userType || user?.accountType || ""
    );
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

function getUserIdentity(user) {
    if (!user) return "";

    const stableId =
        user.id ??
        user.userId ??
        user._id ??
        user.email ??
        user.username;

    return stableId == null ? "" : String(stableId).trim().toLowerCase();
}

function loadComplaints() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) return [];

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveComplaints(complaints) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    window.dispatchEvent(new Event(UPDATED_EVENT));
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
    const [complaints, setComplaints] = useState(loadComplaints);

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
    const userIdentity = getUserIdentity(user);

    const isAdmin = role === "HOA Admin" || role === "Head Admin";
    const canSubmit = ["Resident", "Investor", "Estate Agent"].includes(role);

    const refreshComplaints = useCallback(() => {
        setComplaints(loadComplaints());
    }, []);

    useEffect(() => {
        const refresh = () => {
            setUser(readUser());
            refreshComplaints();
        };

        window.addEventListener(UPDATED_EVENT, refresh);
        window.addEventListener("storage", refresh);
        window.addEventListener("focus", refresh);

        return () => {
            window.removeEventListener(UPDATED_EVENT, refresh);
            window.removeEventListener("storage", refresh);
            window.removeEventListener("focus", refresh);
        };
    }, [refreshComplaints]);

    const visibleComplaints = useMemo(() => {
        if (isAdmin) return complaints;

        if (!userIdentity) return [];

        return complaints.filter((complaint) => {
            const ownerIdentity = String(
                complaint.submitterId || ""
            ).trim().toLowerCase();

            return ownerIdentity !== "" && ownerIdentity === userIdentity;
        });
    }, [complaints, isAdmin, userIdentity]);

    const filteredComplaints = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return visibleComplaints;

        return visibleComplaints.filter((complaint) =>
            [
                complaint.id,
                complaint.category,
                complaint.description,
                complaint.priority,
                complaint.status,
                complaint.submitterName,
                complaint.submitterRole,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [visibleComplaints, search]);

    const counts = useMemo(() => {
        return {
            total: visibleComplaints.length,
            submitted: visibleComplaints.filter(
                (item) => item.status === "Submitted"
            ).length,
            acknowledged: visibleComplaints.filter(
                (item) => item.status === "Acknowledged"
            ).length,
            inProgress: visibleComplaints.filter(
                (item) => item.status === "In Progress"
            ).length,
            resolved: visibleComplaints.filter(
                (item) => item.status === "Resolved"
            ).length,
            cancelled: visibleComplaints.filter(
                (item) => item.status === "Cancelled"
            ).length,
        };
    }, [visibleComplaints]);

    async function handleImageUpload(event) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please choose a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Please choose an image smaller than 2 MB.");
            event.target.value = "";
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
            setError("");
        } catch {
            setError("The image could not be loaded. Please try again.");
        }

        event.target.value = "";
    }

    function submitComplaint(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (!canSubmit) {
            setError("Your account role cannot submit complaints.");
            return;
        }

        if (!userIdentity || !userName) {
            setError("Your account details could not be identified. Please sign in again.");
            return;
        }

        if (!description.trim()) {
            setError("Please describe the complaint before submitting.");
            return;
        }

        const existing = loadComplaints();

        const newComplaint = {
            id: `CMP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            category,
            description: description.trim(),
            priority,
            createdAt: new Date().toISOString(),
            date: new Date().toISOString(),
            status: "Submitted",
            image: complaintImage || null,
            imageName: imageName || "",
            submitterId: userIdentity,
            submitterName: userName,
            submitterRole: role,
            statusUpdatedAt: new Date().toISOString(),
            statusUpdatedBy: "",
            adminNote: "",
        };

        try {
            saveComplaints([...existing, newComplaint]);
            setComplaints(loadComplaints());
            setDescription("");
            setCategory("Security");
            setPriority("Low");
            setComplaintImage("");
            setImageName("");
            setNotice(`Complaint ${newComplaint.id} submitted successfully.`);
        } catch {
            setError(
                "The complaint could not be saved. The browser may be out of storage space."
            );
        }
    }

    function updateStatus(complaintId, nextStatus) {
        if (!isAdmin || !STATUSES.includes(nextStatus)) return;

        const existing = loadComplaints();
        const target = existing.find((item) => item.id === complaintId);

        if (!target) {
            setError("This complaint could not be found. Please refresh the page.");
            return;
        }

        const updated = existing.map((item) =>
            item.id === complaintId
                ? {
                    ...item,
                    status: nextStatus,
                    statusUpdatedAt: new Date().toISOString(),
                    statusUpdatedBy: userName || role,
                }
                : item
        );

        try {
            saveComplaints(updated);
            setComplaints(loadComplaints());
            setSelectedComplaint((current) =>
                current?.id === complaintId
                    ? updated.find((item) => item.id === complaintId)
                    : current
            );
            setNotice(`Complaint ${complaintId} updated to "${nextStatus}".`);
            setError("");
        } catch {
            setError("The complaint status could not be saved.");
        }
    }

    return (
        <div className="complaints-layout">
            {/* Use the existing shared sidebar. Do not duplicate its markup or styles. */}
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
                        <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div className="complaints-error" role="alert">
                        {error}
                        <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                            ×
                        </button>
                    </div>
                )}

                {!user && (
                    <section className="complaints-panel complaints-access-message">
                        <h3>Sign in required</h3>
                        <p>Please sign in to view or submit complaints.</p>
                    </section>
                )}

                {user && !isAdmin && !canSubmit && (
                    <section className="complaints-panel complaints-access-message">
                        <h3>Complaints unavailable</h3>
                        <p>Your account role does not have access to this section.</p>
                    </section>
                )}

                {user && (isAdmin || canSubmit) && (
                    <>
                        <section className="complaints-stats" aria-label="Complaint statistics">
                            <div className="complaints-stat-card">
                                <span>{isAdmin ? "All Complaints" : "My Complaints"}</span>
                                <strong>{counts.total}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>Submitted</span>
                                <strong>{counts.submitted}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>Acknowledged</span>
                                <strong>{counts.acknowledged}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>In Progress</span>
                                <strong>{counts.inProgress}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>Resolved</span>
                                <strong>{counts.resolved}</strong>
                            </div>
                            <div className="complaints-stat-card">
                                <span>Cancelled</span>
                                <strong>{counts.cancelled}</strong>
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
                                            <p className="complaints-help-text">
                                                JPG, PNG or another image format; maximum 2 MB.
                                            </p>
                                            <label className="complaints-image-upload-button" htmlFor="complaint-image">
                                                <CameraIcon />
                                                <span>{imageName || "Choose Image"}</span>
                                            </label>
                                            <input
                                                id="complaint-image"
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
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
                                                    onClick={() => {
                                                        setComplaintImage("");
                                                        setImageName("");
                                                    }}
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

                                        <button type="submit" className="complaints-submit-btn">
                                            Submit Complaint
                                        </button>
                                    </form>
                                </section>
                            )}

                            <section className="complaints-panel complaints-history-panel">
                                <div className="complaints-panel-heading">
                                    <div>
                                        <h3>{isAdmin ? "Complaint Register" : "My Complaint History"}</h3>
                                        <p>
                                            {isAdmin
                                                ? "Only authorised administrators can see the full complaint register."
                                                : "Only your own complaints appear in this list."}
                                        </p>
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
                                            {filteredComplaints.map((complaint) => (
                                                <tr key={complaint.id}>
                                                    <td>{complaint.id}</td>
                                                    {isAdmin && (
                                                        <td>
                                                            <strong>{complaint.submitterName || "Unknown user"}</strong>
                                                            <small>{complaint.submitterRole || "User"}</small>
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
                                                    <td>{formatDate(complaint.createdAt || complaint.date)}</td>
                                                    <td>
                                                        <span className={statusClass(complaint.status)}>
                                                            {complaint.status}
                                                        </span>
                                                        {isAdmin ? (
                                                            <select
                                                                className="complaints-status-select"
                                                                aria-label={`Update status for ${complaint.id}`}
                                                                value={complaint.status}
                                                                onChange={(event) => updateStatus(complaint.id, event.target.value)}
                                                            >
                                                                {STATUSES.map((item) => (
                                                                    <option key={item} value={item}>{item}</option>
                                                                ))}
                                                            </select>
                                                        ) : null}
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
                                            ))}

                                            {filteredComplaints.length === 0 && (
                                                <tr>
                                                    <td colSpan={isAdmin ? 7 : 6} className="complaints-empty">
                                                        {search
                                                            ? "No complaints match your search."
                                                            : isAdmin
                                                            ? "No complaints have been submitted yet."
                                                            : "You have not submitted any complaints yet."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </main>

            {selectedComplaint && (
                <div
                    className="complaints-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSelectedComplaint(null);
                    }}
                >
                    <section
                        className="complaints-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="complaints-modal-title"
                    >
                        <div className="complaints-modal-header">
                            <div>
                                <span className="complaints-eyebrow">COMPLAINT DETAILS</span>
                                <h3 id="complaints-modal-title">{selectedComplaint.id}</h3>
                            </div>
                            <button
                                type="button"
                                className="complaints-modal-close"
                                onClick={() => setSelectedComplaint(null)}
                                aria-label="Close details"
                            >
                                ×
                            </button>
                        </div>

                        <dl className="complaints-detail-list">
                            <div><dt>Category</dt><dd>{selectedComplaint.category}</dd></div>
                            <div><dt>Priority</dt><dd>{selectedComplaint.priority}</dd></div>
                            <div><dt>Date submitted</dt><dd>{formatDate(selectedComplaint.createdAt || selectedComplaint.date)}</dd></div>
                            <div><dt>Status</dt><dd><span className={statusClass(selectedComplaint.status)}>{selectedComplaint.status}</span></dd></div>
                            {isAdmin && (
                                <div>
                                    <dt>Submitted by</dt>
                                    <dd>{selectedComplaint.submitterName} ({selectedComplaint.submitterRole})</dd>
                                </div>
                            )}
                            <div className="complaints-detail-description">
                                <dt>Description</dt>
                                <dd>{selectedComplaint.description}</dd>
                            </div>
                            {selectedComplaint.statusUpdatedBy && (
                                <div>
                                    <dt>Last updated by</dt>
                                    <dd>{selectedComplaint.statusUpdatedBy}</dd>
                                </div>
                            )}
                            {selectedComplaint.statusUpdatedAt && (
                                <div>
                                    <dt>Last updated</dt>
                                    <dd>{formatDate(selectedComplaint.statusUpdatedAt)}</dd>
                                </div>
                            )}
                        </dl>

                        {selectedComplaint.image && (
                            <div className="complaints-modal-image">
                                <h4>Attached Photo</h4>
                                <img src={selectedComplaint.image} alt="Complaint evidence" />
                            </div>
                        )}

                        {isAdmin && (
                            <div className="complaints-modal-actions">
                                <label htmlFor="modal-complaint-status">Update Complaint Status</label>
                                <select
                                    id="modal-complaint-status"
                                    value={selectedComplaint.status}
                                    onChange={(event) => updateStatus(selectedComplaint.id, event.target.value)}
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
