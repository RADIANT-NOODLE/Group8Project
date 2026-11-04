import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { getComplaintStats, listComplaints, updateComplaintStatus } from "../../services/complaintApi";
import { listProviders } from "../../services/providerApi";
import { createWorkOrder, listWorkOrders, updateWorkOrder } from "../../services/workOrderApi";
import {
    COMPLAINT_STATUSES,
    WORK_ORDER_STATUSES,
    complaintStatusLabel,
    complaintStatusTone,
    workOrderStatusLabel,
} from "../../services/statusMap";
import ComplaintStatusRing from "../../components/ComplaintStatusRing";
import DateRangeFilter, { ALL_DATES, inDateRange, isDateFilterActive } from "../../components/DateRangeFilter";
import ComplaintPhoto from "../../components/ComplaintPhoto";
import "../../components/ValoraModal.css";
import "./ResidentComplaints.css";
import { roleLabel } from "../../services/roleMap";
import { getStoredUser } from "../../services/session";

const RESOLVED_STATUSES = ["resolved", "closed"];

// Helper to read the logged-in user from local storage
function readUser() {
    try {
        return getStoredUser();
    } catch {
        return null;
    }
}

function normaliseRole(value = "") {
    const role = String(value).trim().toLowerCase().replace(/_/g, " ");

    if (role.includes("head admin")) return "head_admin";
    if (
        role.includes("hoa") ||
        role.includes("homeowners association") ||
        role === "administrator"
    ) {
        return "hoa_admin";
    }
    return value || "";
}

function getUserRole(user) {
    return normaliseRole(user?.role || user?.userType || user?.accountType || "");
}

function getUserName(user) {
    if (!user) return "Administrator";
    return (
        user.fullName ||
        user.name ||
        [user.firstName || user.firstname, user.lastName || user.lastname]
            .filter(Boolean)
            .join(" ") ||
        user.email ||
        "Administrator"
    ).trim();
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

function getStatusClass(status) {
    const classes = {
        submitted: "resident-complaints-status-submitted",
        under_review: "resident-complaints-status-acknowledged",
        in_progress: "resident-complaints-status-progress",
        resolved: "resident-complaints-status-resolved",
        closed: "resident-complaints-status-cancelled",
    };
    return classes[status] || classes.submitted;
}

function submitterLabel(complaint) {
    if (complaint.isAnonymous && complaint.userId == null) return "Anonymous";
    return complaint.userId == null ? "Unknown" : `Resident #${complaint.userId}`;
}

function Icon({ name, size = 19 }) {
    const icons = {
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
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icons[name] || icons.total}
        </svg>
    );
}

export default function ResidentComplaints() {
    const [user, setUser] = useState(readUser);
    const [complaints, setComplaints] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [providers, setProviders] = useState([]);
    const [serverStats, setServerStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState(ALL_DATES);

    // work order dialog
    const [orderTarget, setOrderTarget] = useState(null);
    const [photoTarget, setPhotoTarget] = useState(null);
    const [orderForm, setOrderForm] = useState({ providerId: "", jobCost: "", estimatedCompletionDate: "" });
    const [orderError, setOrderError] = useState("");
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    const role = getUserRole(user);
    const userName = getUserName(user);
    const isAdmin = role === "hoa_admin" || role === "head_admin";

    // 1. Fetch complaints, their work orders and the providers that can be assigned
    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const [complaintPage, orderPage, providerPage, stats] = await Promise.all([
                listComplaints({ pageSize: 100 }),
                listWorkOrders({ pageSize: 100 }),
                listProviders(),
                getComplaintStats().catch(() => null),
            ]);

            setComplaints(complaintPage.items);
            setWorkOrders(orderPage.items);
            setProviders(providerPage.items);
            setServerStats(stats);
            setError("");
        } catch (err) {
            console.error("Fetch error:", err);
            setError(
                err?.status === 403
                    ? "You do not have permission to view complaints."
                    : "Could not load complaints from the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // 2. Load data on mount
    useEffect(() => {
        setUser(readUser());
        fetchComplaints();
    }, []);

    const ordersByComplaint = useMemo(() => {
        const map = new Map();
        workOrders.forEach((order) => {
            map.set(order.complaintId, [...(map.get(order.complaintId) || []), order]);
        });
        return map;
    }, [workOrders]);

    const providerName = (providerId) =>
        providers.find((provider) => provider.id === providerId)?.fullName || `Provider #${providerId}`;

    // 3. Filter and Search
    const filteredComplaints = useMemo(() => {
        const term = search.trim().toLowerCase();
        const sorted = [...complaints]
            .filter((complaint) => inDateRange(complaint.createdAt, dateRange))
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        if (!term) return sorted;

        return sorted.filter((complaint) =>
            [
                complaint.id,
                submitterLabel(complaint),
                complaint.unitId,
                complaint.category,
                complaint.description,
                complaintStatusLabel(complaint.status),
            ]
                .filter((value) => value !== null && value !== undefined && value !== "")
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [complaints, search, dateRange]);

    // 4. Stats Calculation
    const stats = useMemo(() => ({
        total: complaints.length,
        active: complaints.filter((item) => !RESOLVED_STATUSES.includes(item.status)).length,
        resolved: complaints.filter((item) => RESOLVED_STATUSES.includes(item.status)).length,
        withWorkOrder: complaints.filter((item) => ordersByComplaint.has(item.id)).length,
    }), [complaints, ordersByComplaint]);

    // 5. Update status via API
    async function updateStatus(complaintId, nextStatus) {
        if (!isAdmin) {
            setError("You are not authorised to update complaint statuses.");
            return;
        }

        if (!COMPLAINT_STATUSES.some((status) => status.value === nextStatus)) return;

        try {
            await updateComplaintStatus(complaintId, { status: nextStatus });
            await fetchComplaints();

            setError("");
            setNotice(`Complaint status updated to "${complaintStatusLabel(nextStatus)}".`);
        } catch (err) {
            setError(err?.message || "Failed to update the complaint status.");
        }
    }

    // 6. Work orders: assign a provider to a complaint
    function openWorkOrderDialog(complaint) {
        setOrderTarget(complaint);
        setOrderForm({ providerId: "", jobCost: "", estimatedCompletionDate: "" });
        setOrderError("");
    }

    function closeWorkOrderDialog() {
        setOrderTarget(null);
        setOrderError("");
    }

    async function submitWorkOrder(event) {
        event.preventDefault();
        setOrderError("");

        if (!orderForm.providerId) {
            setOrderError("Select the service provider who will do the work.");
            return;
        }

        const cost = orderForm.jobCost.trim();
        if (cost && (!Number.isFinite(Number(cost)) || Number(cost) < 0)) {
            setOrderError("The estimated cost must be a positive number.");
            return;
        }

        setIsSavingOrder(true);

        try {
            await createWorkOrder({
                complaintId: orderTarget.id,
                providerId: orderForm.providerId,
                jobCost: cost ? Number(cost) : null,
                estimatedCompletionDate: orderForm.estimatedCompletionDate
                    ? new Date(`${orderForm.estimatedCompletionDate}T17:00:00`).toISOString()
                    : null,
            });

            // an assigned complaint is now being worked on
            if (["submitted", "under_review"].includes(orderTarget.status)) {
                await updateComplaintStatus(orderTarget.id, { status: "in_progress" });
            }

            closeWorkOrderDialog();
            await fetchComplaints();
            setNotice(`Work order created for complaint #${orderTarget.id}.`);
            setError("");
        } catch (err) {
            setOrderError(err?.message || "Unable to create the work order.");
        } finally {
            setIsSavingOrder(false);
        }
    }

    async function changeWorkOrderStatus(order, nextStatus) {
        try {
            await updateWorkOrder(order.id, { status: nextStatus });

            // finished work resolves the complaint it came from
            if (nextStatus === "completed") {
                const complaint = complaints.find((item) => item.id === order.complaintId);
                if (complaint && !RESOLVED_STATUSES.includes(complaint.status)) {
                    await updateComplaintStatus(complaint.id, { status: "resolved" });
                }
            }

            await fetchComplaints();
            setError("");
            setNotice(`Work order #${order.id} is now "${workOrderStatusLabel(nextStatus)}".`);
        } catch (err) {
            setError(err?.message || "Unable to update the work order.");
        }
    }

    if (!user) {
        return (
            <div className="resident-complaints-layout">
                <DashboardSidebar />
                <main className="resident-complaints-main">
                    <section className="resident-complaints-panel resident-complaints-message">
                        <h2>Sign in required</h2>
                        <p>Please sign in to access community complaints.</p>
                    </section>
                </main>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="resident-complaints-layout">
                <DashboardSidebar />
                <main className="resident-complaints-main">
                    <section className="resident-complaints-panel resident-complaints-message">
                        <h2>Access restricted</h2>
                        <p>This page is for HOA Admin and Head Admin users.</p>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="resident-complaints-layout">
            <DashboardSidebar />

            <main className="resident-complaints-main">
                <header className="resident-complaints-top-bar">
                    <div>
                        <span className="resident-complaints-eyebrow">COMMUNITY MANAGEMENT</span>
                        <h2>Resident Complaints</h2>
                        <p>Review complaints submitted across VALORA, assign service providers and update their progress.</p>
                    </div>

                    <div className="resident-complaints-admin-label">
                        <span className="resident-complaints-admin-avatar">
                            {userName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase()}
                        </span>
                        <div>
                            <strong>{userName}</strong>
                            <span>{roleLabel(role)}</span>
                        </div>
                    </div>
                </header>

                {notice && (
                    <div className="resident-complaints-notice" role="status">
                        <span>{notice}</span>
                        <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button>
                    </div>
                )}

                {error && (
                    <div className="resident-complaints-error" role="alert">
                        <span>{error}</span>
                        <button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button>
                    </div>
                )}

                <section className="resident-complaints-overview" aria-labelledby="resident-complaints-overview-title">
                    <div className="resident-complaints-overview-heading">
                        <div>
                            <h2 id="resident-complaints-overview-title">Complaint overview</h2>
                            <p>Where every community complaint stands right now.</p>
                        </div>
                    </div>

                    <ComplaintStatusRing complaints={complaints} loading={loading} layout="row" />

                    <div className="resident-complaints-overview-orders">
                        <div className="resident-complaints-overview-orders-top">
                            <span>Service providers assigned</span>
                            <strong>
                                {loading
                                    ? "…"
                                    : `${stats.withWorkOrder} of ${stats.total} ${stats.total === 1 ? "complaint" : "complaints"} ${stats.withWorkOrder === 1 ? "has" : "have"} a work order`}
                            </strong>
                        </div>
                        <div
                            className="resident-complaints-overview-orders-track"
                            role="img"
                            aria-label={`${stats.withWorkOrder} of ${stats.total} complaints have a work order`}
                        >
                            <span
                                className="resident-complaints-overview-orders-fill"
                                style={{ width: `${stats.total > 0 ? Math.round((stats.withWorkOrder / stats.total) * 100) : 0}%` }}
                            />
                        </div>
                    </div>
                </section>

                <section className="resident-complaints-panel">
                    <div className="resident-complaints-panel-heading">
                        <div>
                            <h3>Complaint Management</h3>
                            <p>Changes are saved directly to the database and sync with other dashboards.</p>
                        </div>
                        <span className="resident-complaints-record-count">
                            {complaints.length} {complaints.length === 1 ? "Record" : "Records"}
                        </span>
                    </div>

                    <div className="resident-complaints-toolbar">
                        <label htmlFor="resident-complaints-search">Search complaints</label>
                        <input
                            id="resident-complaints-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search ID, submitter, category or status..."
                        />
                        <div className="resident-complaints-date-filter">
                            <DateRangeFilter id="resident-complaints-date" value={dateRange} onChange={setDateRange} />
                        </div>
                    </div>

                    <div className="resident-complaints-table-container">
                        <table className="resident-complaints-table">
                            <thead>
                                <tr>
                                    <th>Complaint ID</th>
                                    <th>Submitted By</th>
                                    <th>Unit</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Work Order</th>
                                    <th>Update Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="resident-complaints-empty">Loading complaints from database...</td>
                                    </tr>
                                ) : filteredComplaints.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="resident-complaints-empty">
                                            {search || isDateFilterActive(dateRange) ? "No complaints match your search or date filter." : "No complaints have been submitted yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredComplaints.map((complaint) => {
                                        const orders = ordersByComplaint.get(complaint.id) || [];

                                        return (
                                            <tr key={complaint.id}>
                                                <td>
                                                    <strong className="resident-complaints-id">#{complaint.id}</strong>
                                                </td>

                                                <td>
                                                    <div className="resident-complaints-resident">
                                                        <strong>{submitterLabel(complaint)}</strong>
                                                        <small>{complaint.isAnonymous ? "Anonymous complaint" : "Resident"}</small>
                                                    </div>
                                                </td>

                                                <td>{complaint.unitId ? `Unit #${complaint.unitId}` : "—"}</td>
                                                <td title={complaint.description}>
                                                    {complaint.category || "Other"}
                                                    {complaint.photoUrl && (
                                                        <div>
                                                            <button
                                                                type="button"
                                                                className="resident-complaints-link-button"
                                                                onClick={() => setPhotoTarget(complaint)}
                                                            >
                                                                View photo
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{formatDate(complaint.createdAt)}</td>

                                                <td>
                                                    <span className={getStatusClass(complaint.status)}>
                                                        {complaintStatusLabel(complaint.rawStatus)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="resident-complaints-workorders">
                                                        {orders.map((order) => (
                                                            <div key={order.id} className="resident-complaints-workorder">
                                                                <span>
                                                                    {providerName(order.providerId)}
                                                                    {order.residentRating ? ` · ★ ${order.residentRating}` : ""}
                                                                </span>
                                                                <select
                                                                    className="resident-complaints-status-select"
                                                                    aria-label={`Work order ${order.id} status`}
                                                                    value={order.status}
                                                                    onChange={(event) => changeWorkOrderStatus(order, event.target.value)}
                                                                >
                                                                    {WORK_ORDER_STATUSES.map((status) => (
                                                                        <option key={status.value} value={status.value}>{status.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ))}
                                                        {!RESOLVED_STATUSES.includes(complaint.status) && (
                                                            <button
                                                                type="button"
                                                                className="resident-complaints-link-button"
                                                                onClick={() => openWorkOrderDialog(complaint)}
                                                            >
                                                                {orders.length ? "Add work order" : "Create work order"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <select
                                                        className="resident-complaints-status-select"
                                                        aria-label={`Update status for complaint ${complaint.id}`}
                                                        data-tone={complaintStatusTone(complaint.status)}
                                                        value={complaint.status || "submitted"}
                                                        onChange={(event) => updateStatus(complaint.id, event.target.value)}
                                                    >
                                                        {COMPLAINT_STATUSES.map((status) => (
                                                            <option key={status.value} value={status.value}>{status.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="resident-complaints-panel">
                    <div className="resident-complaints-panel-heading">
                        <div>
                            <h3>Complaint Management Process</h3>
                            <p>Monitor each complaint from submission through a provider's work order to resolution.</p>
                        </div>
                    </div>

                    <div className="resident-complaints-status-flow">
                        {[
                            { number: "01", title: "Submitted", description: "A user submits a complaint." },
                            { number: "02", title: "Under review", description: "An administrator reviews it." },
                            { number: "03", title: "Work order", description: "A service provider is assigned and works on it." },
                            { number: "04", title: "Resolved", description: "The job is completed and the complaint resolved." },
                        ].map((step, index, steps) => (
                            <React.Fragment key={step.number}>
                                <div className="resident-complaints-status-step">
                                    <div className="resident-complaints-step-number">{step.number}</div>
                                    <strong>{step.title}</strong>
                                    <p>{step.description}</p>
                                </div>
                                {index < steps.length - 1 && <div className="resident-complaints-flow-line" />}
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            </main>

            {photoTarget && (
                <div
                    className="valora-modal-overlay"
                    onMouseDown={(event) => { if (event.target === event.currentTarget) setPhotoTarget(null); }}
                >
                    <div className="valora-modal" role="dialog" aria-modal="true" aria-label={`Photo for complaint ${photoTarget.id}`} style={{ maxWidth: "640px" }}>
                        <h3>Complaint #{photoTarget.id} · {photoTarget.category}</h3>
                        <ComplaintPhoto complaint={photoTarget} />
                        <div className="valora-modal-actions" style={{ marginTop: "16px" }}>
                            <button type="button" className="valora-modal-btn valora-modal-btn-cancel" autoFocus onClick={() => setPhotoTarget(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {orderTarget && (
                <div
                    className="resident-complaints-modal-backdrop"
                    onMouseDown={(event) => { if (event.target === event.currentTarget) closeWorkOrderDialog(); }}
                >
                    <form className="resident-complaints-modal" role="dialog" aria-modal="true" onSubmit={submitWorkOrder}>
                        <h3>Create work order</h3>
                        <p className="resident-complaints-modal-lead">
                            Complaint #{orderTarget.id} · {orderTarget.category}
                        </p>
                        <p className="resident-complaints-modal-description">{orderTarget.description}</p>

                        {orderError && <div className="resident-complaints-error" role="alert"><span>{orderError}</span></div>}

                        <label htmlFor="work-order-provider">Service provider</label>
                        <select
                            id="work-order-provider"
                            value={orderForm.providerId}
                            onChange={(event) => setOrderForm({ ...orderForm, providerId: event.target.value })}
                            required
                        >
                            <option value="">
                                {providers.length ? "Select a provider" : "No service providers yet"}
                            </option>
                            {providers.map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                    {provider.fullName} — {provider.trade}
                                    {provider.avgRating != null ? ` (★ ${provider.avgRating.toFixed(1)})` : ""}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="work-order-cost">Estimated cost (R, optional)</label>
                        <input
                            id="work-order-cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={orderForm.jobCost}
                            onChange={(event) => setOrderForm({ ...orderForm, jobCost: event.target.value })}
                        />

                        <label htmlFor="work-order-date">Expected completion (optional)</label>
                        <input
                            id="work-order-date"
                            type="date"
                            value={orderForm.estimatedCompletionDate}
                            onChange={(event) => setOrderForm({ ...orderForm, estimatedCompletionDate: event.target.value })}
                        />

                        <div className="resident-complaints-modal-actions">
                            <button type="button" onClick={closeWorkOrderDialog}>Cancel</button>
                            <button type="submit" disabled={isSavingOrder || !providers.length}>
                                {isSavingOrder ? "Saving…" : "Create work order"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

