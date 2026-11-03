import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import { createComplaint, listComplaints, updateComplaintStatus } from "../services/complaintApi";
import { apiRequest } from "../services/apiClient";
import { listProperties } from "../services/propertyApi";
import { listWorkOrders } from "../services/workOrderApi";
import { COMPLAINT_STATUSES, complaintStatusLabel } from "../services/statusMap";
import ComplaintStatusRing from "../components/ComplaintStatusRing";
import "./Complaints.css";
import { getStoredUser } from "../services/session";

const COMPLAINT_CATEGORIES = [
    "Security",
    "Maintenance",
    "Water Leakage",
    "Noise",
    "Cleaning",
    "Parking",
    "Other",
];

// Helper to read the logged-in user from local storage
function readUser() {
    try {
        return getStoredUser();
    } catch {
        return null;
    }
}

/* Roles are the API's values ("resident", "hoa_admin", ...). */
function getUserRole(user) {
    return String(user?.role || "").trim().toLowerCase();
}

function getUserName(user) {
    if (!user) return "";
    return (
        user.fullName ||
        user.full_name ||
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
        submitted: "complaints-status-submitted",
        under_review: "complaints-status-acknowledged",
        in_progress: "complaints-status-progress",
        resolved: "complaints-status-resolved",
        closed: "complaints-status-cancelled",
    };
    return classes[status] || classes.submitted;
}

export default function Complaints() {
    const [user, setUser] = useState(readUser);
    const [complaints, setComplaints] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [category, setCategory] = useState("Security");
    const [description, setDescription] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);

    // a complaint belongs to a unit (an integer id in the database): a resident's
    // own unit is filled in for them; an administrator picks one from the list
    const [properties, setProperties] = useState([]);
    const [unitId, setUnitId] = useState("");
    const [unitLoaded, setUnitLoaded] = useState(false);

    const [complaintImage, setComplaintImage] = useState("");
    const [imageName, setImageName] = useState("");

    const [search, setSearch] = useState("");
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    const role = getUserRole(user);
    const userName = getUserName(user);
    const isAdmin = role === "hoa_admin" || role === "head_admin";
    // the API only lets residents (and HOA admins) file complaints
    const canSubmit = role === "resident" || role === "hoa_admin";

    // 1. Fetch data from API (the API already limits residents to their own complaints)
    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const page = await listComplaints({ pageSize: 100 });
            setComplaints(page.items);

            // residents see the work done on their own complaints
            try {
                const orders = await listWorkOrders({ pageSize: 100 });
                setWorkOrders(orders.items);
            } catch {
                setWorkOrders([]); // listing work orders is HOA-only; per-complaint view is best effort
            }

            setError("");
        } catch (err) {
            console.error(err);
            setError(
                err?.status === 0
                    ? "Could not connect to the backend server."
                    : err?.message || "Failed to load complaints from the server."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const currentUser = readUser();
        setUser(currentUser);
        fetchComplaints();

        // a resident's unit comes from the resident directory (the HOA links it);
        // administrators get the unit list to choose from
        (async () => {
            try {
                const currentRole = getUserRole(currentUser);
                if (currentRole === "hoa_admin" || currentRole === "head_admin") {
                    const { items } = await listProperties({ pageSize: 100 });
                    setProperties(items);
                } else {
                    const records = await apiRequest("/api/v1/resident-directory");
                    const ownRecord = (Array.isArray(records) ? records : records?.items || [])[0];
                    if (ownRecord?.property_id) setUnitId(String(ownRecord.property_id));
                }
            } catch (err) {
                console.error("Unable to load units:", err);
            } finally {
                setUnitLoaded(true);
            }
        })();
    }, []);

    // 2. Filter by search
    const filteredComplaints = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return complaints;
        return complaints.filter((complaint) =>
            [
                complaint.id,
                complaint.category,
                complaint.description,
                complaintStatusLabel(complaint.rawStatus),
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [complaints, search]);

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
        if (!unitId) {
            return setError(
                isAdmin
                    ? "Select the unit this complaint is about."
                    : "Your account is not linked to a unit yet. Ask the HOA to assign your unit first."
            );
        }
        if (description.trim().length < 5) return setError("Please describe the complaint (at least 5 characters).");

        setIsSubmitting(true);

        try {
            // `photo_url` is a 500 character column, so an inline photo cannot be stored yet.
            // There is no photo upload endpoint; send the complaint without it rather than failing.
            const photoUrl = complaintImage && complaintImage.length <= 500 ? complaintImage : null;

            await createComplaint({
                unitId,
                category,
                description,
                isAnonymous,
                photoUrl,
            });

            setDescription("");
            setCategory("Security");
            setIsAnonymous(false);
            setComplaintImage("");
            setImageName("");
            setNotice(
                complaintImage && !photoUrl
                    ? "Complaint submitted. The photo could not be saved yet (photo uploads are not available), so it was left out."
                    : "Complaint submitted successfully."
            );

            // Refresh the list
            await fetchComplaints();
        } catch (err) {
            setError(
                (err?.message || "Failed to submit the complaint.").replace(/Value error,\s*/gi, "")
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    // 6. Update Status (Admin Only)
    async function updateStatus(complaintId, nextStatus) {
        if (!isAdmin || !COMPLAINT_STATUSES.some((status) => status.value === nextStatus)) return;

        try {
            await updateComplaintStatus(complaintId, { status: nextStatus });
            await fetchComplaints();
            setNotice(`Complaint updated to "${complaintStatusLabel(nextStatus)}".`);
            setError("");
        } catch (err) {
            setError(err?.message || "Failed to update status.");
        }
    }

    const workOrdersFor = (complaintId) =>
        workOrders.filter((order) => order.complaintId === complaintId);

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
                        <div className="complaints-page-grid">
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
                                            {isAdmin ? (
                                                <>
                                                <label htmlFor="complaint-unit">Unit</label>
                                                <select
                                                    id="complaint-unit"
                                                    value={unitId}
                                                    onChange={(event) => setUnitId(event.target.value)}
                                                    required
                                                >
                                                    <option value="">Select the unit this is about</option>
                                                    {properties.map((property) => (
                                                        <option key={property.id} value={property.id}>
                                                            {[property.unitNo && `Unit ${property.unitNo}`, property.complexName]
                                                                .filter(Boolean)
                                                                .join(" — ") || `Unit #${property.id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                </>
                                            ) : unitLoaded && !unitId ? (
                                                <p className="complaints-unit-notice" role="status">
                                                    Your account is not linked to a unit yet, so complaints cannot be submitted.
                                                    Ask the HOA to assign your unit.
                                                </p>
                                            ) : null}

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
                                                minLength={5}
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

                                            <label className="complaints-checkbox" htmlFor="complaint-anonymous">
                                                <input
                                                    id="complaint-anonymous"
                                                    type="checkbox"
                                                    checked={isAnonymous}
                                                    onChange={(event) => setIsAnonymous(event.target.checked)}
                                                />
                                                <span>Hide my name from other people (the HOA will not see who sent it)</span>
                                            </label>

                                            <button type="submit" className="complaints-submit-btn" disabled={isSubmitting || (!isAdmin && !unitId)}>
                                                {isSubmitting ? "Submitting..." : "Submit Complaint"}
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
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                    <th>Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan={isAdmin ? 6 : 5} className="complaints-empty">Loading...</td></tr>
                                                ) : filteredComplaints.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={isAdmin ? 6 : 5} className="complaints-empty">
                                                            No complaints found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredComplaints.map((complaint) => (
                                                        <tr key={complaint.id}>
                                                            <td>#{complaint.id}</td>
                                                            {isAdmin && (
                                                                <td>
                                                                    <strong>
                                                                        {complaint.userId == null ? "Anonymous" : `Resident #${complaint.userId}`}
                                                                    </strong>
                                                                </td>
                                                            )}
                                                            <td>{complaint.category}</td>
                                                            <td>{formatDate(complaint.createdAt)}</td>
                                                            <td>
                                                                <span className={statusClass(complaint.status)}>
                                                                    {complaintStatusLabel(complaint.rawStatus)}
                                                                </span>
                                                                {isAdmin && (
                                                                    <select
                                                                        className="complaints-status-select"
                                                                        value={complaint.status || "submitted"}
                                                                        onChange={(event) => updateStatus(complaint.id, event.target.value)}
                                                                    >
                                                                        {COMPLAINT_STATUSES.map((item) => (
                                                                            <option key={item.value} value={item.value}>{item.label}</option>
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

                            {/* STATUS OVERVIEW */}
                            <aside className="complaints-ring-card" aria-label="Complaint status overview">
                                <div className="complaints-ring-card-heading">
                                    <h3>{isAdmin ? "All Complaints" : "My Complaints"}</h3>
                                    <p>Where {isAdmin ? "community" : "your"} complaints stand.</p>
                                </div>
                                <ComplaintStatusRing complaints={complaints} loading={loading} />
                            </aside>
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
                                <h3>#{selectedComplaint.id}</h3>
                            </div>
                            <button type="button" className="complaints-modal-close" onClick={() => setSelectedComplaint(null)}>×</button>
                        </div>

                        <dl className="complaints-detail-list">
                            <div><dt>Category</dt><dd>{selectedComplaint.category}</dd></div>
                            <div><dt>Date submitted</dt><dd>{formatDate(selectedComplaint.createdAt)}</dd></div>
                            <div><dt>Status</dt><dd><span className={statusClass(selectedComplaint.status)}>{complaintStatusLabel(selectedComplaint.rawStatus)}</span></dd></div>
                            {selectedComplaint.resolvedAt && (
                                <div><dt>Resolved</dt><dd>{formatDate(selectedComplaint.resolvedAt)}</dd></div>
                            )}
                            {selectedComplaint.assignedTo && (
                                <div><dt>Assigned to</dt><dd>{selectedComplaint.assignedTo}</dd></div>
                            )}
                            <div className="complaints-detail-description">
                                <dt>Description</dt>
                                <dd>{selectedComplaint.description}</dd>
                            </div>
                            {workOrdersFor(selectedComplaint.id).length > 0 && (
                                <div className="complaints-detail-description">
                                    <dt>Maintenance work</dt>
                                    <dd>
                                        {workOrdersFor(selectedComplaint.id).map((order) => (
                                            <div key={order.id}>
                                                Work order #{order.id} — {order.status.replace("_", " ")}
                                            </div>
                                        ))}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        {isAdmin && (
                            <div className="complaints-modal-actions">
                                <label htmlFor="modal-complaint-status">Update Complaint Status</label>
                                <select
                                    id="modal-complaint-status"
                                    value={selectedComplaint.status || "submitted"}
                                    onChange={(event) => {
                                        updateStatus(selectedComplaint.id, event.target.value);
                                        setSelectedComplaint({ ...selectedComplaint, status: event.target.value, rawStatus: event.target.value });
                                    }}
                                >
                                    {COMPLAINT_STATUSES.map((item) => (
                                        <option key={item.value} value={item.value}>{item.label}</option>
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
