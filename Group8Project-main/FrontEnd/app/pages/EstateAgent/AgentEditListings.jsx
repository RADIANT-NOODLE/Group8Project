import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession } from "../../services/session";
import "./AgentEditListings.css";

function AgentEditListings() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSession();

    const [assignedRequests, setAssignedRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        listingType: "",
        askingPrice: "",
        description: "",
    });

    // 1. Fetch the agent's assigned requests
    useEffect(() => {
        const fetchAssignedRequests = async () => {
            if (!user) return;

            try {
                const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
                const headers = { "Authorization": `Bearer ${token}` };

                const response = await fetch("http://127.0.0.1:8000/api/v1/property-requests", { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    const requests = data.items || data.requests || data || [];
                    
                    // Filter for THIS agent
                    const myRequests = requests.filter(r => 
                        String(r.assigned_agent_id) === String(user.id) && r.status === "Assigned"
                    );
                    setAssignedRequests(myRequests);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedRequests();
    }, [user]);

    // 2. Handle Edit button
    const handleEdit = (request) => {
        setSelectedRequest(request);
        setFormData({
            listingType: request.request_type,
            askingPrice: request.asking_price,
            description: request.additional_details || "",
        });
        setMessage("");
    };

    const handleCancel = () => {
        setSelectedRequest(null);
        setMessage("");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Save changes to the API
    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedRequest) return;

        try {
            const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
            // Assuming your backend endpoint supports updating the request
            const response = await fetch(`http://127.0.0.1:8000/api/v1/property-requests/${selectedRequest.request_id}`, {
                method: "PATCH",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    request_type: formData.listingType,
                    asking_price: Number(formData.askingPrice),
                    additional_details: formData.description
                })
            });

            if (!response.ok) throw new Error("Failed to update");

            setMessage("Listing information updated successfully!");
            
            // Update the local state so the table reflects the change
            setAssignedRequests(prev => prev.map(r => 
                r.request_id === selectedRequest.request_id 
                    ? { ...r, request_type: formData.listingType, asking_price: Number(formData.askingPrice), additional_details: formData.description } 
                    : r
            ));
            
            setSelectedRequest(null);
        } catch (err) {
            setMessage("Error: Could not save changes.");
        }
    };

    if (loading) {
        return (
            <div className="agent-edit-layout">
                <DashboardSidebar suppliedUser={user} />
                <main className="agent-edit-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <h2>Loading your properties...</h2>
                </main>
            </div>
        );
    }

    return (
        <div className="agent-edit-layout">
            <DashboardSidebar suppliedUser={user} />

            <main className="agent-edit-main">
                <header className="agent-edit-topbar">
                    <div>
                        <h1>Edit Listings</h1>
                        <p>Update assigned property listings.</p>
                    </div>
                </header>

                <div className="agent-edit-content">
                    {message && (
                        <div className="agent-edit-message" role="status">
                            <div className="agent-edit-message-icon">✓</div>
                            <p>{message}</p>
                            <button type="button" className="agent-edit-message-close" onClick={() => setMessage("")}>×</button>
                        </div>
                    )}

                    <section className="agent-edit-card">
                        <div className="agent-edit-card-header">
                            <div>
                                <h2>My Assigned Properties</h2>
                                <p>Properties assigned to you by the HOA.</p>
                            </div>
                        </div>

                        <div className="agent-edit-table-wrapper">
                            <table className="agent-edit-table">
                                <thead>
                                    <tr>
                                        <th>Unit</th>
                                        <th>Request Type</th>
                                        <th>Owner / Requester</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="agent-edit-empty-cell">
                                                <div className="agent-edit-empty">
                                                    <strong>No properties assigned yet</strong>
                                                    <p>Properties will appear here once the HOA assigns you.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        assignedRequests.map((request) => (
                                            <tr key={request.request_id}>
                                                <td><strong>Unit {request.unit_no || request.unit_id}</strong></td>
                                                <td>{request.request_type}</td>
                                                <td><strong>{request.requester_name || "Unknown"}</strong></td>
                                                <td>R{Number(request.asking_price).toLocaleString()}</td>
                                                <td>
                                                    <span className="agent-edit-status agent-edit-status-assigned">
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="agent-edit-actions">
                                                        <button type="button" className="agent-edit-btn agent-edit-btn-primary" onClick={() => handleEdit(request)}>
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* EDITOR FORM */}
                    {selectedRequest && (
                        <section className="agent-edit-card agent-edit-editor">
                            <div className="agent-edit-card-header">
                                <div>
                                    <h2>Edit Unit {selectedRequest.unit_no || selectedRequest.unit_id}</h2>
                                </div>
                                <button type="button" className="agent-edit-close-btn" onClick={handleCancel}>
                                    Close
                                </button>
                            </div>

                            <form onSubmit={handleSave}>
                                <div className="agent-edit-form-section">
                                    <div className="agent-edit-form-grid">
                                        <div className="agent-edit-field">
                                            <label>Listing Type</label>
                                            <select name="listingType" value={formData.listingType} onChange={handleChange} required>
                                                <option value="">Select Listing Type</option>
                                                <option value="Sell">For Sale</option>
                                                <option value="Rent">For Rent</option>
                                            </select>
                                        </div>
                                        <div className="agent-edit-field">
                                            <label>Asking Price (R)</label>
                                            <input type="number" name="askingPrice" min="1" value={formData.askingPrice} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="agent-edit-field agent-edit-description-field">
                                        <label>Listing Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} rows="6" />
                                    </div>
                                </div>

                                <div className="agent-edit-form-actions">
                                    <button type="submit" className="agent-edit-submit-btn">
                                        Save Changes
                                    </button>
                                    <button type="button" className="agent-edit-cancel-btn" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AgentEditListings;