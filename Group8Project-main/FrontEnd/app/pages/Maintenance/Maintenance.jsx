import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import {
    createComplaint,
    listComplaints,
    updateComplaintStatus,
} from "../../services/complaintApi";
import { listProperties } from "../../services/propertyApi";
import { listProviders } from "../../services/providerApi";
import {
    listWorkOrders,
    rateWorkOrder,
    updateWorkOrder,
} from "../../services/workOrderApi";
import {
    COMPLAINT_STATUS,
    COMPLAINT_STATUSES,
    WORK_ORDER_STATUS,
    complaintStatusLabel,
    workOrderStatusLabel,
} from "../../services/statusMap";
import "./Maintenance.css";
import { getStoredUser } from "../../services/session";

/**
 * HOA Maintenance page.
 *
 * A maintenance request is a complaint; when an administrator assigns a
 * service provider it also has a work order. Everything comes from the API:
 * administrators see every request, residents see their own and can rate a
 * finished job. The backend enforces who may see and change what.
 */

const CATEGORY_OPTIONS = [
    "General",
    "Plumbing",
    "Electrical",
    "Security",
    "Landscaping",
    "Cleaning",
    "Structural",
    "Other",
];

const STATUS_CLASS = {
    submitted: "submitted",
    under_review: "acknowledged",
    in_progress: "in-progress",
    resolved: "resolved",
    closed: "cancelled",
};

const ACTIVE_EXCLUDED = ["resolved", "closed"];

function readUser() {
    try {
        return getStoredUser();
    } catch {
        return null;
    }
}

/** Accepts "hoa_admin", "HOA Admin", "head admin" and so on. */
function roleKey(user) {
    const role = String(user?.role || user?.userType || user?.accountType || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]/g, " ");

    if (role.includes("head")) return "head_admin";
    if (role.includes("hoa") || role === "admin" || role === "administrator") return "hoa_admin";
    if (role === "resident" || role === "property owner") return "resident";
    return role.replace(/\s+/g, "_");
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function titleFor(complaint) {
    const text = String(complaint.description || "").trim();
    if (!text) return complaint.category;
    return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}

function statusClass(status) {
    return `maintenance-badge status-${STATUS_CLASS[status] || "submitted"}`;
}

function Icon({ name, size = 19 }) {
    const props = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        focusable: false,
    };

    const icons = {
        wrench: (
            <>
                <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-6.4 6.4a2 2 0 0 0 2.8 2.8l6.4-6.4a4 4 0 0 0 5.6-5.6l-2.2 2.2-2.8-2.8z" />
            </>
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 9h18" />
            </>
        ),
        check: (
            <>
                <path d="M20 6L9 17l-5-5" />
            </>
        ),
        providers: (
            <>
                <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
            </>
        ),
        star: (
            <>
                <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14M5 12h14" />
            </>
        ),
        eye: (
            <>
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <circle cx="12" cy="12" r="2.5" />
            </>
        ),
        close: (
            <>
                <path d="M6 6l12 12M18 6L6 18" />
            </>
        ),
        send: (
            <>
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </>
        ),
    };

    return <svg {...props}>{icons[name] || null}</svg>;
}

/* =========================================================
   MAINTENANCE PAGE
========================================================= */

const EMPTY_FORM = { category: "General", unitId: "", description: "" };

function Maintenance() {
    const [currentUser] = useState(readUser);
    const role = roleKey(currentUser);
    const isHOAAdmin = role === "hoa_admin";
    const isHeadAdmin = role === "head_admin";
    const isAdmin = isHOAAdmin || isHeadAdmin;
    const isResident = role === "resident";

    const [complaints, setComplaints] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [providers, setProviders] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busyId, setBusyId] = useState(null);

    const [statusFilter, setStatusFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [showAddRequest, setShowAddRequest] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [ratingValue, setRatingValue] = useState("5");

    const load = useCallback(async () => {
        if (!isAdmin && !isResident) {
            setLoading(false);
            return;
        }

        try {
            const [complaintPage, workOrderPage, providerPage] = await Promise.all([
                listComplaints({ pageSize: 100 }),
                // Head admins are not allowed to list work orders; show requests anyway.
                listWorkOrders({ pageSize: 100 }).catch(() => ({ items: [] })),
                isAdmin ? listProviders({ pageSize: 100 }).catch(() => ({ items: [] })) : { items: [] },
            ]);

            setComplaints(complaintPage.items);
            setWorkOrders(workOrderPage.items);
            setProviders(providerPage.items);
            setError("");
        } catch (loadError) {
            console.error("Unable to load maintenance requests:", loadError);
            setError(loadError?.message || "Unable to load maintenance requests right now.");
        } finally {
            setLoading(false);
        }
    }, [isAdmin, isResident]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!isResident) return;

        listProperties({ pageSize: 100 })
            .then((page) => setUnits(page.items))
            .catch((unitError) => console.error("Unable to load units:", unitError));
    }, [isResident]);

    const providerName = useMemo(() => {
        const names = new Map(providers.map((provider) => [provider.id, provider.fullName]));
        return (providerId) => names.get(providerId) || (providerId ? `Provider #${providerId}` : "Not Assigned");
    }, [providers]);

    // One request per complaint, joined to its work order (if any).
    const requests = useMemo(() => {
        const byComplaint = new Map();
        workOrders.forEach((workOrder) => {
            if (!byComplaint.has(workOrder.complaintId)) {
                byComplaint.set(workOrder.complaintId, workOrder);
            }
        });

        return complaints.map((complaint) => ({
            ...complaint,
            workOrder: byComplaint.get(complaint.id) || null,
        }));
    }, [complaints, workOrders]);

    const filteredRequests = requests.filter((request) => {
        const matchesStatus = statusFilter === "All" || request.status === statusFilter;
        const matchesCategory = categoryFilter === "All" || request.category === categoryFilter;
        return matchesStatus && matchesCategory;
    });

    const selectedRequest = requests.find((request) => request.id === selectedId) || null;

    const totalRequests = requests.length;
    const activeRequests = requests.filter((r) => !ACTIVE_EXCLUDED.includes(r.status)).length;
    const inProgressRequests = requests.filter((r) => r.status === COMPLAINT_STATUS.in_progress).length;
    const resolvedRequests = requests.filter((r) => ACTIVE_EXCLUDED.includes(r.status)).length;

    function handleFormChange(event) {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    }

    function handleOpenAddRequest() {
        setFormData({ ...EMPTY_FORM, unitId: units.length === 1 ? String(units[0].id) : "" });
        setShowAddRequest(true);
        setNotice("");
    }

    async function handleSubmitRequest(event) {
        event.preventDefault();

        if (!isResident) {
            setError("Only residents can submit maintenance requests.");
            return;
        }

        if (!formData.unitId || formData.description.trim().length < 10) {
            setError("Choose your unit and describe the issue (at least 10 characters).");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await createComplaint({
                unitId: formData.unitId,
                category: formData.category,
                description: formData.description,
            });

            setShowAddRequest(false);
            setFormData(EMPTY_FORM);
            setNotice("Your maintenance request has been submitted.");
            await load();
        } catch (submitError) {
            setError(submitError?.message || "Unable to submit the request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleStatusChange(request, newStatus) {
        if (!isAdmin) return;

        setBusyId(request.id);
        setError("");

        try {
            await updateComplaintStatus(request.id, { status: newStatus });

            // Keep the linked work order in step with the request.
            const workOrder = request.workOrder;
            if (workOrder && isHOAAdmin) {
                if (newStatus === COMPLAINT_STATUS.resolved && workOrder.status !== WORK_ORDER_STATUS.completed) {
                    await updateWorkOrder(workOrder.id, { status: WORK_ORDER_STATUS.completed });
                } else if (newStatus === COMPLAINT_STATUS.in_progress && workOrder.status === WORK_ORDER_STATUS.assigned) {
                    await updateWorkOrder(workOrder.id, { status: WORK_ORDER_STATUS.in_progress });
                }
            }

            await load();
        } catch (updateError) {
            setError(updateError?.message || "Unable to update the request status.");
        } finally {
            setBusyId(null);
        }
    }

    async function handleRate(request) {
        if (!request.workOrder) return;

        setBusyId(request.id);
        setError("");

        try {
            await rateWorkOrder(request.workOrder.id, ratingValue);
            setNotice("Thank you. Your rating has been recorded.");
            await load();
        } catch (rateError) {
            setError(rateError?.message || "Unable to save your rating.");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="maintenance-page">
            <DashboardSidebar />

            <main className="maintenance-main">
                <header className="maintenance-header">
                    <div>
                        <p className="maintenance-eyebrow">
                            {isHeadAdmin
                                ? "HEAD ADMINISTRATION"
                                : isHOAAdmin
                                    ? "HOA ADMINISTRATION"
                                    : "MY MAINTENANCE"}
                        </p>

                        <h1>Maintenance</h1>

                        <p>
                            {isAdmin
                                ? "Manage community maintenance requests and track resolution progress."
                                : "Submit and track your maintenance requests."}
                        </p>
                    </div>
                </header>

                {!currentUser && (
                    <div className="maintenance-panel maintenance-access-message">
                        Please log in to access maintenance services.
                    </div>
                )}

                {currentUser && !isAdmin && !isResident && (
                    <div className="maintenance-panel maintenance-access-message">
                        Maintenance requests are available to residents and administrators.
                    </div>
                )}

                {error && (
                    <div className="maintenance-panel maintenance-access-message" role="alert">
                        {error}
                    </div>
                )}

                {notice && (
                    <div className="maintenance-panel maintenance-access-message" role="status">
                        {notice}
                    </div>
                )}

                <section className="maintenance-stat-grid">
                    <div className="maintenance-stat-card">
                        <div className="maintenance-stat-icon purple">
                            <Icon name="wrench" />
                        </div>
                        <div>
                            <span>Total Requests</span>
                            <strong>{totalRequests}</strong>
                            <small>{isAdmin ? "Community requests" : "Your requests"}</small>
                        </div>
                    </div>

                    <div className="maintenance-stat-card">
                        <div className="maintenance-stat-icon orange">
                            <Icon name="clock" />
                        </div>
                        <div>
                            <span>Active Requests</span>
                            <strong>{activeRequests}</strong>
                            <small>Require attention</small>
                        </div>
                    </div>

                    <div className="maintenance-stat-card">
                        <div className="maintenance-stat-icon blue">
                            <Icon name="calendar" />
                        </div>
                        <div>
                            <span>In Progress</span>
                            <strong>{inProgressRequests}</strong>
                            <small>Being worked on</small>
                        </div>
                    </div>

                    <div className="maintenance-stat-card">
                        <div className="maintenance-stat-icon green">
                            <Icon name="check" />
                        </div>
                        <div>
                            <span>Resolved</span>
                            <strong>{resolvedRequests}</strong>
                            <small>Completed requests</small>
                        </div>
                    </div>
                </section>

                {(isAdmin || isResident) && (
                    <section className="maintenance-panel maintenance-large-panel">
                        <div className="maintenance-panel-heading">
                            <div>
                                <h2>Maintenance Requests</h2>
                                <p>
                                    {isAdmin
                                        ? "Review and manage community maintenance issues."
                                        : "View and track your submitted maintenance issues."}
                                </p>
                            </div>

                            {isResident && (
                                <button
                                    type="button"
                                    className="maintenance-primary-btn"
                                    onClick={handleOpenAddRequest}
                                >
                                    <Icon name="plus" size={17} />
                                    <span>Add Request</span>
                                </button>
                            )}
                        </div>

                        {showAddRequest && (
                            <div className="maintenance-add-form">
                                <div className="maintenance-form-header">
                                    <div>
                                        <p className="maintenance-eyebrow">NEW REQUEST</p>
                                        <h2>Submit Maintenance Request</h2>
                                        <p>Enter the details of the maintenance issue you want to report.</p>
                                    </div>

                                    <button
                                        type="button"
                                        className="maintenance-modal-close"
                                        onClick={() => setShowAddRequest(false)}
                                        aria-label="Close form"
                                    >
                                        <Icon name="close" size={18} />
                                    </button>
                                </div>

                                <form className="maintenance-form" onSubmit={handleSubmitRequest}>
                                    <div className="maintenance-form-row">
                                        <div className="maintenance-form-group">
                                            <label htmlFor="maintenance-category">Category *</label>
                                            <select
                                                id="maintenance-category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleFormChange}
                                            >
                                                {CATEGORY_OPTIONS.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="maintenance-form-group">
                                            <label htmlFor="maintenance-unit">Location / Unit *</label>
                                            <select
                                                id="maintenance-unit"
                                                name="unitId"
                                                value={formData.unitId}
                                                onChange={handleFormChange}
                                                required
                                            >
                                                <option value="">Select your unit</option>
                                                {units.map((unit) => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.unitNo ? `Unit ${unit.unitNo}` : `Property #${unit.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="maintenance-form-group">
                                        <label htmlFor="maintenance-description">Description *</label>
                                        <textarea
                                            id="maintenance-description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            placeholder="Describe the issue..."
                                            rows="5"
                                            minLength={10}
                                            maxLength={2000}
                                            required
                                        />
                                    </div>

                                    <div className="maintenance-form-actions">
                                        <button
                                            type="button"
                                            className="maintenance-secondary-btn"
                                            onClick={() => setShowAddRequest(false)}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="maintenance-primary-btn"
                                            disabled={submitting}
                                        >
                                            <Icon name="send" size={16} />
                                            {submitting ? "Submitting..." : "Submit Request"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {!showAddRequest && (
                            <>
                                <div className="maintenance-filters">
                                    <div className="maintenance-filter-group">
                                        <label htmlFor="maintenance-status-filter">Status</label>
                                        <select
                                            id="maintenance-status-filter"
                                            value={statusFilter}
                                            onChange={(event) => setStatusFilter(event.target.value)}
                                        >
                                            <option value="All">All Statuses</option>
                                            {COMPLAINT_STATUSES.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="maintenance-filter-group">
                                        <label htmlFor="maintenance-category-filter">Category</label>
                                        <select
                                            id="maintenance-category-filter"
                                            value={categoryFilter}
                                            onChange={(event) => setCategoryFilter(event.target.value)}
                                        >
                                            <option value="All">All Categories</option>
                                            {CATEGORY_OPTIONS.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="maintenance-table-wrapper">
                                    <table className="maintenance-table">
                                        <thead>
                                            <tr>
                                                <th>Request</th>
                                                <th>Category</th>
                                                <th>Service Provider</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="6" className="maintenance-empty">
                                                        Loading maintenance requests...
                                                    </td>
                                                </tr>
                                            ) : filteredRequests.length > 0 ? (
                                                filteredRequests.map((request) => (
                                                    <tr key={request.id}>
                                                        <td>
                                                            <div className="maintenance-request-cell">
                                                                <strong>{titleFor(request)}</strong>
                                                                <small>REQ-{String(request.id).padStart(3, "0")}</small>
                                                            </div>
                                                        </td>

                                                        <td>{request.category}</td>

                                                        <td>
                                                            {request.workOrder
                                                                ? providerName(request.workOrder.providerId)
                                                                : "Not Assigned"}
                                                        </td>

                                                        <td>
                                                            <span className={statusClass(request.status)}>
                                                                {complaintStatusLabel(request.status)}
                                                            </span>
                                                        </td>

                                                        <td>{formatDate(request.createdAt)}</td>

                                                        <td>
                                                            <div className="maintenance-actions">
                                                                <button
                                                                    type="button"
                                                                    className="maintenance-view-btn"
                                                                    onClick={() => setSelectedId(request.id)}
                                                                >
                                                                    <Icon name="eye" size={15} />
                                                                    View
                                                                </button>

                                                                {isAdmin && (
                                                                    <select
                                                                        className="maintenance-status-select"
                                                                        aria-label={`Update status for request ${request.id}`}
                                                                        value={request.status}
                                                                        disabled={busyId === request.id}
                                                                        onChange={(event) =>
                                                                            handleStatusChange(request, event.target.value)
                                                                        }
                                                                    >
                                                                        {COMPLAINT_STATUSES.map((status) => (
                                                                            <option key={status.value} value={status.value}>
                                                                                {status.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="maintenance-empty">
                                                        {isResident
                                                            ? "You have no maintenance requests yet."
                                                            : "No maintenance requests found."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </section>
                )}
            </main>

            {selectedRequest && (
                <div
                    className="maintenance-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSelectedId(null);
                    }}
                >
                    <div
                        className="maintenance-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="maintenance-modal-title"
                    >
                        <div className="maintenance-form-header">
                            <div>
                                <p className="maintenance-eyebrow">
                                    REQ-{String(selectedRequest.id).padStart(3, "0")}
                                </p>
                                <h2 id="maintenance-modal-title">{titleFor(selectedRequest)}</h2>
                                <p>Maintenance request details</p>
                            </div>

                            <button
                                type="button"
                                className="maintenance-modal-close"
                                onClick={() => setSelectedId(null)}
                                aria-label="Close"
                            >
                                <Icon name="close" size={18} />
                            </button>
                        </div>

                        <div className="maintenance-request-details">
                            <div>
                                <span>Category</span>
                                <strong>{selectedRequest.category}</strong>
                            </div>

                            <div>
                                <span>Date</span>
                                <strong>{formatDate(selectedRequest.createdAt)}</strong>
                            </div>

                            <div>
                                <span>Service Provider</span>
                                <strong>
                                    {selectedRequest.workOrder
                                        ? providerName(selectedRequest.workOrder.providerId)
                                        : "Not Assigned"}
                                </strong>
                            </div>

                            <div>
                                <span>Work Order</span>
                                <strong>
                                    {selectedRequest.workOrder
                                        ? workOrderStatusLabel(selectedRequest.workOrder.status)
                                        : "None yet"}
                                </strong>
                            </div>

                            <div className="maintenance-request-detail-full">
                                <span>Status</span>
                                <strong>{complaintStatusLabel(selectedRequest.status)}</strong>
                            </div>

                            <div className="maintenance-request-detail-full">
                                <span>Description</span>
                                <p>{selectedRequest.description}</p>
                            </div>

                            {selectedRequest.workOrder?.completionNotes && (
                                <div className="maintenance-request-detail-full">
                                    <span>Completion Notes</span>
                                    <p>{selectedRequest.workOrder.completionNotes}</p>
                                </div>
                            )}

                            {selectedRequest.workOrder?.residentRating != null && (
                                <div className="maintenance-request-detail-full">
                                    <span>Your Rating</span>
                                    <strong>{selectedRequest.workOrder.residentRating} / 5</strong>
                                </div>
                            )}
                        </div>

                        {isAdmin && (
                            <div className="maintenance-admin-status">
                                <label htmlFor="maintenance-view-status">Update Status</label>
                                <select
                                    id="maintenance-view-status"
                                    value={selectedRequest.status}
                                    disabled={busyId === selectedRequest.id}
                                    onChange={(event) =>
                                        handleStatusChange(selectedRequest, event.target.value)
                                    }
                                >
                                    {COMPLAINT_STATUSES.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {isResident &&
                            selectedRequest.workOrder?.status === "completed" &&
                            selectedRequest.workOrder.residentRating == null && (
                                <div className="maintenance-admin-status">
                                    <label htmlFor="maintenance-rating">Rate this job</label>
                                    <select
                                        id="maintenance-rating"
                                        value={ratingValue}
                                        onChange={(event) => setRatingValue(event.target.value)}
                                    >
                                        {[5, 4, 3, 2, 1].map((value) => (
                                            <option key={value} value={value}>
                                                {value} / 5
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="maintenance-primary-btn"
                                        disabled={busyId === selectedRequest.id}
                                        onClick={() => handleRate(selectedRequest)}
                                    >
                                        Submit rating
                                    </button>
                                </div>
                            )}

                        <div className="maintenance-form-actions">
                            <button
                                type="button"
                                className="maintenance-secondary-btn"
                                onClick={() => setSelectedId(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Maintenance;
