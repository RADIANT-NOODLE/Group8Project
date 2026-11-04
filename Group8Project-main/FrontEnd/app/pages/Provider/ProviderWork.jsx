import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession } from "../../services/session";
import { listWorkOrders, updateWorkOrder } from "../../services/workOrderApi";
import { getMyProviderProfile } from "../../services/providerApi";
import { WORK_ORDER_STATUS, workOrderStatusLabel } from "../../services/statusMap";
import { showAlert } from "../../components/AppDialog";
import "./ProviderWork.css";

function formatDate(isoString) {
    if (!isoString) return "—";
    try {
        const d = new Date(isoString);
        if (Number.isNaN(d.getTime())) return String(isoString);
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

export default function ProviderWork() {
    const { user } = useSession();
    const [providerProfile, setProviderProfile] = useState(null);
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state for updating a work order
    const [editingOrder, setEditingOrder] = useState(null);
    const [modalStatus, setModalStatus] = useState(WORK_ORDER_STATUS.in_progress);
    const [modalCost, setModalCost] = useState("");
    const [modalNotes, setModalNotes] = useState("");
    const [modalDate, setModalDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load provider profile
            try {
                const profile = await getMyProviderProfile();
                setProviderProfile(profile);
            } catch (err) {
                // If profile lookup returns 404, fallback to session info
                setProviderProfile({
                    fullName: user?.full_name || user?.name || "Contractor Partner",
                    trade: "Maintenance Contractor",
                    phone: user?.phoneno || user?.phone || "—",
                    email: user?.email || "—",
                    avgRating: null,
                    totalReviews: 0,
                    verified: true,
                    emergencyAvailable: false,
                });
            }

            // Load assigned work orders
            const response = await listWorkOrders({ pageSize: 50 });
            setWorkOrders(response?.items || []);
        } catch (err) {
            console.error("Failed to load provider workspace:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.email]);

    // KPI Summary Calculations
    const stats = useMemo(() => {
        const assigned = workOrders.filter((w) => w.status === WORK_ORDER_STATUS.assigned).length;
        const inProgress = workOrders.filter((w) => w.status === WORK_ORDER_STATUS.in_progress).length;
        const completed = workOrders.filter((w) => w.status === WORK_ORDER_STATUS.completed).length;
        const totalInvoiced = workOrders
            .reduce((sum, w) => sum + (Number(w.jobCost) || 0), 0)
            .toFixed(2);

        return {
            active: assigned + inProgress,
            assigned,
            inProgress,
            completed,
            totalInvoiced,
        };
    }, [workOrders]);

    // Filtered work orders
    const filteredOrders = useMemo(() => {
        return workOrders.filter((wo) => {
            if (filterTab !== "all" && wo.status !== filterTab) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const category = (wo.complaintCategory || "").toLowerCase();
                const desc = (wo.complaintDescription || "").toLowerCase();
                const idStr = String(wo.id);
                const unitStr = String(wo.unitId || "");
                if (
                    !category.includes(q) &&
                    !desc.includes(q) &&
                    !idStr.includes(q) &&
                    !unitStr.includes(q)
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [workOrders, filterTab, searchQuery]);

    // Quick action: Start Work
    const handleStartJob = async (orderId) => {
        try {
            await updateWorkOrder(orderId, { status: WORK_ORDER_STATUS.in_progress });
            showAlert("Work order marked as In Progress.");
            await loadData();
        } catch (err) {
            showAlert(err.message || "Could not update status.");
        }
    };

    // Open Update Modal
    const openUpdateModal = (order) => {
        setEditingOrder(order);
        setModalStatus(order.status === WORK_ORDER_STATUS.assigned ? WORK_ORDER_STATUS.in_progress : order.status);
        setModalCost(order.jobCost ? String(order.jobCost) : "");
        setModalNotes(order.completionNotes || "");
        setModalDate(
            order.estimatedCompletionDate
                ? order.estimatedCompletionDate.slice(0, 10)
                : ""
        );
    };

    // Submit Modal Update
    const handleSaveOrder = async (e) => {
        e.preventDefault();
        if (!editingOrder) return;
        setIsSubmitting(true);
        try {
            await updateWorkOrder(editingOrder.id, {
                status: modalStatus,
                jobCost: modalCost ? parseFloat(modalCost) : null,
                completionNotes: modalNotes.trim() || null,
                estimatedCompletionDate: modalDate ? new Date(modalDate).toISOString() : null,
            });
            showAlert("Work order details updated successfully.");
            setEditingOrder(null);
            await loadData();
        } catch (err) {
            showAlert(err.message || "Failed to update work order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="provider-work-container">
            <DashboardSidebar />
            <main className="provider-work-main">
                {/* Header Profile Section */}
                <header className="provider-header">
                    <div className="provider-header-content">
                        <div className="provider-title-area">
                            <h1>
                                {providerProfile?.fullName || "Contractor Workspace"}
                                {providerProfile?.trade && (
                                    <span className="provider-trade-badge">
                                        {providerProfile.trade}
                                    </span>
                                )}
                            </h1>
                            <div className="provider-contact-info">
                                <span className="provider-contact-item">
                                    📧 {providerProfile?.email || user?.email}
                                </span>
                                {providerProfile?.phone && (
                                    <span className="provider-contact-item">
                                        📞 {providerProfile.phone}
                                    </span>
                                )}
                                {providerProfile?.avgRating !== null && providerProfile?.avgRating !== undefined && (
                                    <span className="provider-contact-item">
                                        ⭐ {providerProfile.avgRating} ({providerProfile.totalReviews || 0} reviews)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="provider-badges">
                            {providerProfile?.verified && (
                                <span className="badge-verified">
                                    ✓ Verified Contractor
                                </span>
                            )}
                            {providerProfile?.emergencyAvailable && (
                                <span className="badge-emergency">
                                    ⚡ 24/7 Emergency
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Stats Summary Grid */}
                <section className="provider-stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Active Work Orders</span>
                        <span className="stat-value">{stats.active}</span>
                        <span className="stat-subtext">
                            {stats.assigned} assigned, {stats.inProgress} in progress
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Completed Jobs</span>
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-subtext">Resolved maintenance</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Invoiced</span>
                        <span className="stat-value">R {stats.totalInvoiced}</span>
                        <span className="stat-subtext">Across assigned orders</span>
                    </div>
                </section>

                {/* Filter and Tab Bar */}
                <div className="provider-controls-bar">
                    <div className="provider-tabs">
                        <button
                            type="button"
                            className={`provider-tab ${filterTab === "all" ? "active" : ""}`}
                            onClick={() => setFilterTab("all")}
                        >
                            All ({workOrders.length})
                        </button>
                        <button
                            type="button"
                            className={`provider-tab ${filterTab === WORK_ORDER_STATUS.assigned ? "active" : ""}`}
                            onClick={() => setFilterTab(WORK_ORDER_STATUS.assigned)}
                        >
                            Assigned ({stats.assigned})
                        </button>
                        <button
                            type="button"
                            className={`provider-tab ${filterTab === WORK_ORDER_STATUS.in_progress ? "active" : ""}`}
                            onClick={() => setFilterTab(WORK_ORDER_STATUS.in_progress)}
                        >
                            In Progress ({stats.inProgress})
                        </button>
                        <button
                            type="button"
                            className={`provider-tab ${filterTab === WORK_ORDER_STATUS.completed ? "active" : ""}`}
                            onClick={() => setFilterTab(WORK_ORDER_STATUS.completed)}
                        >
                            Completed ({stats.completed})
                        </button>
                    </div>

                    <div className="provider-search-box">
                        <span className="search-icon-placeholder">🔍</span>
                        <input
                            type="text"
                            className="provider-search-input"
                            placeholder="Search jobs, categories, unit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Work Orders List */}
                {loading ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                        Loading work orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="provider-empty-state">
                        <h3>No work orders found</h3>
                        <p>
                            {filterTab !== "all"
                                ? `No work orders currently match this filter tab.`
                                : "You have no assigned maintenance work orders at this time."}
                        </p>
                    </div>
                ) : (
                    <div className="work-orders-list">
                        {filteredOrders.map((wo) => (
                            <article key={wo.id} className="work-order-card">
                                <header className="wo-card-header">
                                    <div className="wo-id-group">
                                        <span className="wo-id">#WO-{wo.id}</span>
                                        {wo.complaintCategory && (
                                            <span className="wo-category-tag">
                                                {wo.complaintCategory}
                                            </span>
                                        )}
                                        {wo.unitId && (
                                            <span className="wo-category-tag">
                                                Unit {wo.unitId}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`wo-status-badge wo-status-${wo.status}`}>
                                        {workOrderStatusLabel(wo.status)}
                                    </span>
                                </header>

                                <div className="wo-body">
                                    <p className="wo-description">
                                        {wo.complaintDescription || "Maintenance request without notes."}
                                    </p>

                                    <div className="wo-details-grid">
                                        <div className="wo-detail-item">
                                            <span className="wo-detail-label">Assigned Date</span>
                                            <span className="wo-detail-value">{formatDate(wo.assignedAt)}</span>
                                        </div>
                                        <div className="wo-detail-item">
                                            <span className="wo-detail-label">Est. Completion</span>
                                            <span className="wo-detail-value">{formatDate(wo.estimatedCompletionDate)}</span>
                                        </div>
                                        <div className="wo-detail-item">
                                            <span className="wo-detail-label">Job Cost / Quote</span>
                                            <span className="wo-detail-value">
                                                {wo.jobCost !== null ? `R ${wo.jobCost}` : "Pending Quote"}
                                            </span>
                                        </div>
                                        <div className="wo-detail-item">
                                            <span className="wo-detail-label">Resident Rating</span>
                                            <span className="wo-detail-value">
                                                {wo.residentRating ? `⭐ ${wo.residentRating} / 5` : "Awaiting Rating"}
                                            </span>
                                        </div>
                                    </div>

                                    {wo.completionNotes && (
                                        <div className="wo-notes-box">
                                            <strong>Contractor Notes:</strong> {wo.completionNotes}
                                        </div>
                                    )}
                                </div>

                                <footer className="wo-actions">
                                    {wo.status === WORK_ORDER_STATUS.assigned && (
                                        <button
                                            type="button"
                                            className="btn-wo-start"
                                            onClick={() => handleStartJob(wo.id)}
                                        >
                                            Start Job
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn-wo-update"
                                        onClick={() => openUpdateModal(wo)}
                                    >
                                        Update Progress
                                    </button>
                                    {wo.status === WORK_ORDER_STATUS.in_progress && (
                                        <button
                                            type="button"
                                            className="btn-wo-complete"
                                            onClick={() => {
                                                openUpdateModal(wo);
                                                setModalStatus(WORK_ORDER_STATUS.completed);
                                            }}
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                </footer>
                            </article>
                        ))}
                    </div>
                )}

                {/* In-Page Update Modal */}
                {editingOrder && (
                    <div className="provider-modal-overlay" role="dialog" aria-modal="true">
                        <div className="provider-modal-card">
                            <header className="provider-modal-header">
                                <h2>Update Work Order #WO-{editingOrder.id}</h2>
                                <button
                                    type="button"
                                    className="btn-modal-close"
                                    onClick={() => setEditingOrder(null)}
                                    aria-label="Close dialog"
                                >
                                    ×
                                </button>
                            </header>

                            <form onSubmit={handleSaveOrder}>
                                <div className="modal-form-group">
                                    <label htmlFor="modal-wo-status">Job Status</label>
                                    <select
                                        id="modal-wo-status"
                                        className="modal-form-control"
                                        value={modalStatus}
                                        onChange={(e) => setModalStatus(e.target.value)}
                                    >
                                        <option value={WORK_ORDER_STATUS.in_progress}>In Progress</option>
                                        <option value={WORK_ORDER_STATUS.completed}>Completed</option>
                                        <option value={WORK_ORDER_STATUS.assigned}>Assigned</option>
                                    </select>
                                </div>

                                <div className="modal-form-group">
                                    <label htmlFor="modal-wo-cost">Job Cost / Invoice (R)</label>
                                    <input
                                        id="modal-wo-cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="modal-form-control"
                                        placeholder="e.g. 850.00"
                                        value={modalCost}
                                        onChange={(e) => setModalCost(e.target.value)}
                                    />
                                </div>

                                <div className="modal-form-group">
                                    <label htmlFor="modal-wo-date">Estimated / Actual Completion Date</label>
                                    <input
                                        id="modal-wo-date"
                                        type="date"
                                        className="modal-form-control"
                                        value={modalDate}
                                        onChange={(e) => setModalDate(e.target.value)}
                                    />
                                </div>

                                <div className="modal-form-group">
                                    <label htmlFor="modal-wo-notes">Completion / Contractor Notes</label>
                                    <textarea
                                        id="modal-wo-notes"
                                        rows={4}
                                        className="modal-form-control"
                                        placeholder="Describe the diagnosis, parts replaced, or completion notes..."
                                        value={modalNotes}
                                        onChange={(e) => setModalNotes(e.target.value)}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-wo-update"
                                        onClick={() => setEditingOrder(null)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-wo-start"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
