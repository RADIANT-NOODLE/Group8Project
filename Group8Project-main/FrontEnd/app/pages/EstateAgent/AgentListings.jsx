import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession } from "../../services/session";
import "./AgentListings.css";

function AgentListings() {
    const navigate = useNavigate();
    const { user } = useSession();

    const [assignedListings, setAssignedListings] = useState([]);
    const [existingListings, setExistingListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

    // 1. Fetch assigned requests AND existing listings
    useEffect(() => {
        const fetchMyAssignments = async () => {
            if (!user) return;

            try {
                const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
                const headers = { "Authorization": `Bearer ${token}` };

                // Fetch both in parallel
                const [reqRes, listRes] = await Promise.all([
                    fetch("http://127.0.0.1:8000/api/v1/property-requests", { headers }),
                    fetch("http://127.0.0.1:8000/api/v1/listings", { headers })
                ]);
                
                // Process Requests
                if (reqRes.ok) {
                    const reqData = await reqRes.json();
                    const requests = reqData.items || reqData.requests || reqData || [];
                    const myRequests = requests.filter(r => 
                        String(r.assigned_agent_id) === String(user.id) && r.status === "Assigned"
                    );
                    setAssignedListings(myRequests);
                }

                // Process Listings
                if (listRes.ok) {
                    const listData = await listRes.json();
                    const allListings = listData.listings || listData.items || listData || [];
                    const myListings = allListings.filter(l => 
                        String(l.agent_id) === String(user.id)
                    );
                    setExistingListings(myListings);
                }
                
            } catch (err) {
                console.error("Failed to fetch agent listings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyAssignments();
    }, [user]);

    // 2. Display Helpers
    const formatPrice = (price) => {
        if (!price) return "Not set";
        return `R${Number(price).toLocaleString()}`;
    };

    const handleView = (request) => {
        setViewModal({ isOpen: true, data: request });
    };

    const totalListings = assignedListings.length;
    const totalInquiries = 0; 

    // 3. Icons 
    const icons = {
        property: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V7l8-4 8 4v14" /><path d="M8 21v-5h8v5M8 10h2M14 10h2M8 13h2M14 13h2" /></svg>),
        active: (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m5 12 4 4L19 6" /></svg>),
        offers: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14v12H5zM8 7V5h8v2M8 12h8" /></svg>),
        inquiries: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4zM8 9h8M8 13h5" /></svg>),
    };

    if (loading) {
        return (
            <div className="agent-listings-page">
                <DashboardSidebar suppliedUser={user} />
                <main className="agent-listings-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <h2>Loading your assigned listings...</h2>
                </main>
            </div>
        );
    }

    return (
        <div className="agent-listings-page">
            <DashboardSidebar suppliedUser={user} />

            <main className="agent-listings-main">
                <header className="agent-listings-topbar">
                    <div>
                        <div className="agent-listings-breadcrumb">
                            <span>Estate Agent</span><span>/</span><span>My Listings</span>
                        </div>
                        <h1>My Listings</h1>
                        <p>Manage properties assigned to you by the HOA.</p>
                    </div>
                    <div className="agent-listings-profile">
                        <div className="agent-listings-profile-circle">
                            {user?.initials || "EA"}
                        </div>
                        <div>
                            <strong>{user?.fullName || "Estate Agent"}</strong>
                            <span>Estate Agent</span>
                        </div>
                    </div>
                </header>

                <section className="agent-listings-stat-cards">
                    <div className="agent-listings-stat-card">
                        <div className="agent-listings-stat-icon">{icons.property}</div>
                        <div><span>Assigned Listings</span><strong>{totalListings}</strong><small>Properties assigned to you</small></div>
                    </div>
                    <div className="agent-listings-stat-card">
                        <div className="agent-listings-stat-icon">{icons.active}</div>
                        <div><span>Active Listings</span><strong>{existingListings.length}</strong><small>Currently published</small></div>
                    </div>
                    <div className="agent-listings-stat-card">
                        <div className="agent-listings-stat-icon">{icons.offers}</div>
                        <div><span>Under Offer</span><strong>0</strong><small>Pending sales</small></div>
                    </div>
                    <div className="agent-listings-stat-card">
                        <div className="agent-listings-stat-icon">{icons.inquiries}</div>
                        <div><span>Total Inquiries</span><strong>{totalInquiries}</strong><small>Buyer inquiries</small></div>
                    </div>
                </section>

                <section className="agent-listings-panel">
                    <div className="agent-listings-panel-heading">
                        <div>
                            <h2>Assigned Properties</h2>
                            <p>Properties approved by the HOA and assigned to you.</p>
                        </div>
                    </div>

                    <div className="agent-listings-table-container">
                        <table className="agent-listings-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Owner</th>
                                    <th>Request</th>
                                    <th>Price</th>
                                    <th>Request Status</th>
                                    <th>Listing Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedListings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="agent-listings-empty">
                                            No properties have been assigned to you yet.
                                        </td>
                                    </tr>
                                ) : (
                                    assignedListings.map((request) => {
                                        // Check if a listing exists for this unit
                                        const listing = existingListings.find(l => String(l.unit_id) === String(request.unit_id));
                                        
                                        return (
                                            <tr key={request.request_id}>
                                                <td>
                                                    <div className="agent-listings-primary-text">Unit {request.unit_no || request.unit_id}</div>
                                                </td>
                                                <td>
                                                    <div className="agent-listings-primary-text">{request.requester_name || "Unknown"}</div>
                                                </td>
                                                <td>
                                                    <div className="agent-listings-primary-text">{request.request_type}</div>
                                                    <small>Request #{request.request_id}</small>
                                                </td>
                                                <td>
                                                    <strong className="agent-listings-price">{formatPrice(request.asking_price)}</strong>
                                                </td>
                                                <td>
                                                    <span className="agent-listings-status status-approved">{request.status}</span>
                                                </td>
                                                <td>
                                                    {/* DYNAMIC LISTING STATUS */}
                                                    {listing ? (
                                                        <span className="agent-listings-status status-published" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                                                            {listing.status || "Active"}
                                                        </span>
                                                    ) : (
                                                        <span className="agent-listings-status status-default">Not Listed</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="agent-listings-actions">
                                                        <button className="agent-listings-secondary-btn" onClick={() => handleView(request)}>
                                                            View
                                                        </button>
                                                        <button className="agent-listings-primary-small-btn" onClick={() => navigate(`/agent-edit-listings?requestId=${request.request_id}`)}>
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* VIEW MODAL */}
            {viewModal.isOpen && viewModal.data && (
                <div className="valora-modal-overlay">
                    <div className="valora-modal" style={{ maxWidth: "500px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h3 style={{ margin: 0, color: "#29242d", fontSize: "18px" }}>Request Details</h3>
                            <button 
                                onClick={() => setViewModal({ isOpen: false, data: null })}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#77717d", fontSize: "20px" }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
                            <div>
                                <span style={{ fontSize: "11px", color: "#77717d", display: "block", marginBottom: "2px" }}>Property</span>
                                <strong style={{ color: "#29242d" }}>Unit {viewModal.data.unit_no}</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: "11px", color: "#77717d", display: "block", marginBottom: "2px" }}>Requester</span>
                                <strong style={{ color: "#29242d" }}>{viewModal.data.requester_name}</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: "11px", color: "#77717d", display: "block", marginBottom: "2px" }}>Request Type</span>
                                <strong style={{ color: "#29242d" }}>{viewModal.data.request_type}</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: "11px", color: "#77717d", display: "block", marginBottom: "2px" }}>Asking Price</span>
                                <strong style={{ color: "#29242d" }}>{formatPrice(viewModal.data.asking_price)}</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: "11px", color: "#77717d", display: "block", marginBottom: "2px" }}>Financial Info</span>
                                <p style={{ margin: 0, color: "#29242d", fontSize: "13px" }}>{viewModal.data.financial_information || "None provided"}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: "11px", color: "#77717d", display: "block", marginBottom: "2px" }}>Additional Details</span>
                                <p style={{ margin: 0, color: "#29242d", fontSize: "13px" }}>{viewModal.data.additional_details || "None provided"}</p>
                            </div>
                        </div>

                        <div className="valora-modal-actions">
                            <button 
                                className="valora-modal-btn valora-modal-btn-cancel"
                                onClick={() => setViewModal({ isOpen: false, data: null })}
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

export default AgentListings;