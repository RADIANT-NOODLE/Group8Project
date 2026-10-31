import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession } from "../../services/session";
import "./PropertyRequests.css";

/* =========================================================
   ICONS
========================================================= */
const Icon = ({ type }) => {
    const icons = {
        requests: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>),
        approval: (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.3 2.3 4.7-5" /></svg>),
        residents: (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.4-3.4 2.2-5 5.5-5s5.1 1.6 5.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 15c2.7-.1 4.4 1.5 5 4.5" /></svg>),
        close: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>),
        pending: (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>),
        assigned: (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="m8 12 2.5 2.5L16 9" /></svg>),
        rejected: (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="m9 9 6 6M15 9l-6 6" /></svg>),
    };

    return <span className="property-requests-nav-icon">{icons[type] || icons.requests}</span>;
};

/* =========================================================
   PROPERTY REQUESTS 
========================================================= */
function PropertyRequests() {
    const { user } = useSession();
    
    const [requests, setRequests] = useState([]);
    const [agents, setAgents] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Custom Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

    /* =====================================================
       LOAD DATA
    ===================================================== */
    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
            const headers = { "Authorization": `Bearer ${token}` };

            const reqRes = await fetch("http://127.0.0.1:8000/api/v1/property-requests", { headers });
            if (reqRes.ok) {
                const reqData = await reqRes.json();
                const list = reqData.items || reqData.requests || reqData || [];
                setRequests(list);
            }

            const usersRes = await fetch("http://127.0.0.1:8000/api/v1/users/", { headers });
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                const allUsers = usersData.users || usersData || [];
                const approvedAgents = allUsers.filter(u => 
                    String(u.role).toLowerCase() === "estate_agent" && u.hoa_approved === true
                );
                setAgents(approvedAgents);
            }
            setError("");
        } catch (err) {
            console.error("Failed to load property requests:", err);
            setError("Unable to load property requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    /* =====================================================
       ROLE ACCESS
    ===================================================== */
    if (!user) return <Navigate to="/login" replace />;
    const roleCheck = String(user.role || "").toLowerCase();
    if (!["head_admin", "hoa_admin"].includes(roleCheck)) return <Navigate to="/dashboard" replace />;
    const isHeadAdmin = roleCheck === "head_admin";

    /* =====================================================
       COUNTS
    ===================================================== */
    const pendingRequests = requests.filter(r => r.status === "Pending");
    const approvedRequests = requests.filter(r => r.status === "Approved");
    const assignedRequests = requests.filter(r => r.status === "Assigned");
    const rejectedRequests = requests.filter(r => r.status === "Rejected");

    /* =====================================================
       HANDLERS
    ===================================================== */
    function openReview(request) {
        setSelectedRequest(request);
        setRejectionReason("");
        setSelectedAgentId(request.assigned_agent_id || "");
        setMessage("");
        setError("");
    }

    function closeReview() {
        setSelectedRequest(null);
        setRejectionReason("");
        setSelectedAgentId("");
        setMessage("");
        setError("");
    }

    function handleApprove() {
        if (!selectedRequest) return;
        
        setConfirmModal({
            isOpen: true,
            title: "Approve Property Request",
            message: "Are you sure you want to approve this property request?",
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
                    const response = await fetch(`http://127.0.0.1:8000/api/v1/property-requests/${selectedRequest.request_id}/approve`, {
                        method: "PATCH",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                
                    if (!response.ok) throw new Error("Failed to approve");
                
                    setSelectedRequest(null);
                    setMessage("Property request approved successfully. An Estate Agent can now be assigned.");
                    loadData();
                } catch (err) {
                    setError("Unable to approve the property request.");
                }
                setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
            }
        });
    }

    function handleReject() {
        if (!selectedRequest) return;
        if (!rejectionReason.trim()) return setError("Please enter a reason before rejecting this request.");

        setConfirmModal({
            isOpen: true,
            title: "Reject Property Request",
            message: "Are you sure you want to reject this property request?",
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
                    const response = await fetch(`http://127.0.0.1:8000/api/v1/property-requests/${selectedRequest.request_id}/reject`, {
                        method: "PATCH",
                        headers: { 
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ reason: rejectionReason })
                    });
                    
                    if (!response.ok) throw new Error("Failed to reject");
                    
                    setSelectedRequest(null);
                    setRejectionReason("");
                    setMessage("Property request rejected successfully.");
                    loadData();
                } catch (err) {
                    setError("Unable to reject the property request.");
                }
                setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
            }
        });
    }

    function handleAssignAgent() {
        if (!selectedRequest || !selectedAgentId) return setError("Please select an approved Estate Agent.");

        setConfirmModal({
            isOpen: true,
            title: "Assign Estate Agent",
            message: "Are you sure you want to assign this agent to the property request?",
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
                    const response = await fetch(`http://127.0.0.1:8000/api/v1/property-requests/${selectedRequest.request_id}/assign`, {
                        method: "PATCH",
                        headers: { 
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ agent_id: Number(selectedAgentId) })
                    });
                    
                    if (!response.ok) throw new Error("Failed to assign agent");
                    
                    setSelectedRequest(null);
                    setSelectedAgentId("");
                    setMessage("Estate Agent has been assigned successfully.");
                    loadData();
                } catch (err) {
                    setError("Unable to assign the Estate Agent.");
                }
                setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
            }
        });
    }

    /* =====================================================
       HELPERS
    ===================================================== */
    function formatDate(value) {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
    }

    function formatCurrency(value) {
        if (value === null || value === undefined || value === "") return "—";
        const numericValue = Number(String(value).replace(/[^0-9.-]/g, ""));
        if (Number.isNaN(numericValue)) return value;
        return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(numericValue);
    }

    function formatRequestType(type) {
        if (!type) return "—";
        const normalized = String(type).trim().toLowerCase();
        if (normalized === "sell") return "Sell";
        if (normalized === "rent") return "Rent";
        return type;
    }

    function getStatusClass(status) {
        switch (status) {
            case "Pending": return "status-pending";
            case "Approved": return "status-approved";
            case "Assigned": return "status-assigned";
            case "Rejected": return "status-rejected";
            default: return "";
        }
    }

    if (loading) {
        return (
            <div className="property-requests-page">
                <DashboardSidebar />
                <main className="property-requests-main property-requests-loading">
                    <div className="property-requests-loading-card">
                        <div className="property-requests-loading-spinner" />
                        <h2>Property Requests</h2>
                        <p>Loading property requests...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="property-requests-page">
            <DashboardSidebar />

            <main className="property-requests-main">
                <header className="property-requests-topbar">
                    <div>
                        <p className="property-requests-eyebrow">
                            {isHeadAdmin ? "HEAD ADMINISTRATION" : "HOA ADMINISTRATION"}
                        </p>
                        <h1>Property Requests</h1>
                        <p>Review resident and investor requests to sell or rent their units.</p>
                    </div>
                    <div className="property-requests-header-user">
                        <div className="property-requests-header-avatar">{user.initials}</div>
                        <div>
                            <strong>{user.fullName}</strong>
                            <span>{user.roleLabel}</span>
                        </div>
                    </div>
                </header>

                <div className="property-requests-content">
                    {message && (
                        <div className="property-requests-message property-requests-message-success">
                            <div className="property-requests-message-icon"><Icon type="assigned" /></div>
                            <div><strong>Request Updated</strong><p>{message}</p></div>
                        </div>
                    )}
                    {error && (
                        <div className="property-requests-message property-requests-message-error">
                            <div className="property-requests-message-icon"><Icon type="rejected" /></div>
                            <div><strong>Action Required</strong><p>{error}</p></div>
                        </div>
                    )}

                    {/* STATISTICS */}
                    <div className="property-requests-stats">
                        {[
                            { label: "Pending Review", count: pendingRequests.length, description: "Requests awaiting review", icon: "pending", type: "pending" },
                            { label: "Awaiting Agent", count: approvedRequests.length, description: "Approved requests awaiting assignment", icon: "approval", type: "approved" },
                            { label: "Assigned", count: assignedRequests.length, description: "Requests assigned to agents", icon: "assigned", type: "assigned" },
                            { label: "Rejected", count: rejectedRequests.length, description: "Requests not approved", icon: "rejected", type: "rejected" },
                        ].map((stat) => (
                            <div className="property-requests-stat-card" key={stat.label}>
                                <div className="property-requests-stat-top">
                                    <span className={`property-requests-stat-icon ${stat.type}`}><Icon type={stat.icon} /></span>
                                    <span>{stat.label}</span>
                                </div>
                                <strong>{stat.count}</strong>
                                <p>{stat.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* REQUEST TABLE */}
                    <section className="property-requests-panel">
                        <div className="property-requests-panel-heading">
                            <div>
                                <h2>Property Requests</h2>
                                <p>All sell and rent requests submitted by residents and investors.</p>
                            </div>
                            <span className="property-requests-total">{requests.length} Total</span>
                        </div>

                        {requests.length === 0 ? (
                            <div className="property-requests-empty">
                                <div className="property-requests-empty-icon"><Icon type="requests" /></div>
                                <h3>No Property Requests</h3>
                                <p>There are currently no property requests to review.</p>
                            </div>
                        ) : (
                            <div className="property-requests-table-container">
                                <table className="property-requests-table">
                                    <thead>
                                        <tr>
                                            <th>Request ID</th>
                                            <th>Requester</th>
                                            <th>Unit</th>
                                            <th>Type</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr key={request.request_id}>
                                                <td><strong className="property-requests-id">{request.request_id}</strong></td>
                                                <td>
                                                    <div className="property-requests-owner">
                                                        <strong>{request.requester_name || `User #${request.requester_id}`}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="property-requests-unit">
                                                        <strong>Unit {request.unit_no || request.unit_id}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="property-requests-type">{formatRequestType(request.request_type)}</span>
                                                </td>
                                                <td>
                                                    <span className="property-requests-date">{formatDate(request.created_at)}</span>
                                                </td>
                                                <td>
                                                    <span className={`property-requests-status ${getStatusClass(request.status)}`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button type="button" className="property-requests-primary-btn" onClick={() => openReview(request)}>
                                                        {request.status === "Pending" ? "Review" : request.status === "Approved" ? "Assign Agent" : "View"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* REVIEW MODAL */}
            {selectedRequest && (
                <div className="property-requests-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeReview(); }}>
                    <div className="property-requests-modal">
                        <div className="property-requests-modal-header">
                            <div>
                                <p className="property-requests-modal-eyebrow">PROPERTY REQUEST</p>
                                <h2>Property Request Review</h2>
                                <p>Request ID: {selectedRequest.request_id}</p>
                            </div>
                            <button type="button" className="property-requests-close-btn" onClick={closeReview}><Icon type="close" /></button>
                        </div>

                        <div className="property-requests-modal-body">
                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon"><Icon type="requests" /></div>
                                    <div><h3>Request Information</h3></div>
                                </div>
                                <div className="property-requests-detail-grid">
                                    <div className="property-requests-detail-item">
                                        <span>Requester</span>
                                        <strong>{selectedRequest.requester_name || `User #${selectedRequest.requester_id}`}</strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Request Type</span>
                                        <strong>{formatRequestType(selectedRequest.request_type)}</strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Asking Price</span>
                                        <strong>{formatCurrency(selectedRequest.asking_price)}</strong>
                                    </div>
                                    <div className="property-requests-detail-item">
                                        <span>Rental Period</span>
                                        <strong>{selectedRequest.rental_period || "—"}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon"><Icon type="approval" /></div>
                                    <div><h3>Financial Information</h3></div>
                                </div>
                                <div className="property-requests-text-box">
                                    <p>{selectedRequest.financial_information || "No financial information provided."}</p>
                                </div>
                            </section>

                            <section className="property-requests-review-section">
                                <div className="property-requests-section-heading">
                                    <div className="property-requests-section-icon"><Icon type="requests" /></div>
                                    <div><h3>Additional Details</h3></div>
                                </div>
                                <div className="property-requests-text-box">
                                    <p>{selectedRequest.additional_details || "No additional details provided."}</p>
                                </div>
                            </section>

                            {selectedRequest.status === "Pending" && (
                                <section className="property-requests-review-section property-requests-action-section">
                                    <div className="property-requests-section-heading">
                                        <div className="property-requests-section-icon"><Icon type="approval" /></div>
                                        <div><h3>Administrator Decision</h3></div>
                                    </div>
                                    <div className="property-requests-action-buttons">
                                        <button type="button" className="property-requests-primary-btn" onClick={handleApprove}>Approve Request</button>
                                        <button type="button" className="property-requests-secondary-btn" onClick={handleReject}>Reject Request</button>
                                    </div>
                                    <div className="property-requests-form-group">
                                        <label>Rejection Reason</label>
                                        <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter a reason if the request is rejected." rows={4} />
                                    </div>
                                </section>
                            )}

                            {selectedRequest.status === "Approved" && (
                                <section className="property-requests-review-section property-requests-action-section">
                                    <div className="property-requests-section-heading">
                                        <div className="property-requests-section-icon"><Icon type="assigned" /></div>
                                        <div><h3>Assign Estate Agent</h3></div>
                                    </div>
                                    {agents.length === 0 ? (
                                        <div className="property-requests-no-agents"><Icon type="residents" /><p>There are no approved Estate Agents available.</p></div>
                                    ) : (
                                        <>
                                            <div className="property-requests-form-group">
                                                <label>Select Estate Agent</label>
                                                <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}>
                                                    <option value="">Select an Estate Agent</option>
                                                    {agents.map((agent) => (
                                                        <option key={agent.id || agent.user_id} value={agent.id || agent.user_id}>
                                                            {agent.full_name} — {agent.email}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="property-requests-action-buttons">
                                                <button type="button" className="property-requests-primary-btn" onClick={handleAssignAgent}>Assign Estate Agent</button>
                                            </div>
                                        </>
                                    )}
                                </section>
                            )}
                        </div>

                        <div className="property-requests-modal-footer">
                            <button type="button" className="property-requests-secondary-btn" onClick={closeReview}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM CONFIRMATION MODAL */}
            {confirmModal.isOpen && (
                <div className="valora-modal-overlay">
                    <div className="valora-modal">
                        <h3>{confirmModal.title}</h3>
                        <p>{confirmModal.message}</p>
                        
                        <div className="valora-modal-actions">
                            <button 
                                className="valora-modal-btn valora-modal-btn-cancel"
                                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
                            >
                                Cancel
                            </button>
                            <button 
                                className="valora-modal-btn valora-modal-btn-confirm"
                                onClick={confirmModal.onConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PropertyRequests;