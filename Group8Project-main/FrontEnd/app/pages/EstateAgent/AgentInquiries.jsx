import React, { useEffect, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession, getSessionToken } from "../../services/session";
import "./AgentInquiries.css";
import { showAlert } from "../../components/AppDialog";

function AgentInquiries() {
    const { user } = useSession();
    const [statusFilter, setStatusFilter] = useState("All");
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    /*
    =========================================================
    LOAD INQUIRIES FROM API
    =========================================================
    */
    useEffect(() => {
        const fetchAgentInquiries = async () => {
            if (!user) return;

            try {
                const token = getSessionToken();
                const headers = { "Authorization": `Bearer ${token}` };

                const response = await fetch("http://127.0.0.1:8000/api/v1/inquiries", { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    const inquiriesList = data.items || data || [];
                    
                    // Map the API response to the shape the UI expects
                    const mappedInquiries = inquiriesList.map(inq => ({
                        id: inq.inquiry_id,
                        buyerName: inq.buyer_name,
                        buyerEmail: inq.buyer_email,
                        buyerContact: inq.buyer_contact,
                        propertyUnit: `Unit ${inq.property_unit}`,
                        propertyType: inq.property_complex,
                        status: inq.status,
                        date: inq.created_at,
                        message: inq.message
                    }));

                    setInquiries(mappedInquiries);
                }
            } catch (err) {
                console.error("Failed to load inquiries:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAgentInquiries();
    }, [user]);

    /*
    =========================================================
    FORMAT DATE
    =========================================================
    */
    const formatDate = (date) => {
        if (!date) return "-";
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return String(date);
        return parsedDate.toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    /*
    =========================================================
    STATUS FILTER
    =========================================================
    */
    const filteredInquiries = statusFilter === "All"
        ? inquiries
        : inquiries.filter((inquiry) => inquiry.status === statusFilter);

    /*
    =========================================================
    STATUS COUNTS
    =========================================================
    */
    const totalInquiries = inquiries.length;
    const newInquiries = inquiries.filter(i => i.status === "New").length;
    const contactedInquiries = inquiries.filter(i => i.status === "Contacted").length;
    const viewingInquiries = inquiries.filter(i => i.status === "Viewing Scheduled").length;

    /*
    =========================================================
    UPDATE STATUS (Now saves to API)
    =========================================================
    */
    const handleStatusChange = async (inquiryId, newStatus) => {
        try {
            const token = getSessionToken();
            const response = await fetch(`http://127.0.0.1:8000/api/v1/inquiries/${inquiryId}`, {
                method: "PATCH",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            // Update the UI only after the backend confirms it was saved
            setInquiries((current) =>
                current.map((inquiry) =>
                    inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
                )
            );
        } catch (err) {
            console.error(err);
            showAlert("Could not update the inquiry status. Please try again.");
        }
    };

    /*
    =========================================================
    VIEW INQUIRY
    =========================================================
    */
    const handleView = (inquiry) => {
        showAlert(
            `Inquiry Details\n\n` +
            `Buyer: ${inquiry.buyerName}\n` +
            `Email: ${inquiry.buyerEmail}\n` +
            `Property: ${inquiry.propertyUnit} (${inquiry.propertyType})\n` +
            `Date: ${formatDate(inquiry.date)}\n` +
            `Status: ${inquiry.status}\n\n` +
            `Message:\n${inquiry.message}`
        );
    };

    if (loading) {
        return (
            <div className="agent-inquiries-page">
                <DashboardSidebar suppliedUser={user} />
                <main className="agent-inquiries-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <h2>Loading your inquiries...</h2>
                </main>
            </div>
        );
    }

    return (
        <div className="agent-inquiries-page">
            <DashboardSidebar suppliedUser={user} />

            <main className="agent-inquiries-main">
                {/* PAGE HEADER */}
                <header className="agent-inquiries-topbar">
                    <div>
                        <div className="agent-inquiries-breadcrumb">
                            <span>Estate Agent</span>
                            <span className="breadcrumb-separator">/</span>
                            <span>Inquiry Log</span>
                        </div>
                        <h1>Inquiry Log</h1>
                        <p>Manage buyer and investor inquiries for your assigned VALORA properties.</p>
                    </div>
                </header>

                {/* STAT CARDS */}
                <section className="agent-inquiries-stat-cards" aria-label="Inquiry statistics">
                    <div className="agent-inquiries-stat-card">
                        <div className="agent-inquiries-stat-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4Z" /><path d="M8 9h8M8 13h5" /></svg>
                        </div>
                        <div><span>Total Inquiries</span><strong>{totalInquiries}</strong></div>
                    </div>
                    <div className="agent-inquiries-stat-card">
                        <div className="agent-inquiries-stat-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></svg>
                        </div>
                        <div><span>New</span><strong>{newInquiries}</strong></div>
                    </div>
                    <div className="agent-inquiries-stat-card">
                        <div className="agent-inquiries-stat-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
                        </div>
                        <div><span>Contacted</span><strong>{contactedInquiries}</strong></div>
                    </div>
                    <div className="agent-inquiries-stat-card">
                        <div className="agent-inquiries-stat-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z" /><path d="M8 3v4M16 3v4M4 9h16" /><path d="m9 14 2 2 4-4" /></svg>
                        </div>
                        <div><span>Viewings</span><strong>{viewingInquiries}</strong></div>
                    </div>
                </section>

                {/* INQUIRIES PANEL */}
                <section className="agent-inquiries-panel">
                    <div className="agent-inquiries-panel-heading">
                        <div>
                            <h2>Property Inquiries</h2>
                            <p>Review and manage inquiries received for your listings.</p>
                        </div>
                        <div className="agent-inquiries-filter">
                            <label htmlFor="agent-inquiry-status-filter">Filter by status</label>
                            <select id="agent-inquiry-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Viewing Scheduled">Viewing Scheduled</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="agent-inquiries-table-container">
                        <table className="agent-inquiries-table">
                            <thead>
                                <tr>
                                    <th>Buyer / Investor</th>
                                    <th>Property</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="agent-inquiries-empty">No inquiries found.</td>
                                    </tr>
                                ) : (
                                    filteredInquiries.map((inquiry) => {
                                        const statusClass = inquiry.status.toLowerCase().replace(/\s+/g, "-");
                                        return (
                                            <tr key={inquiry.id}>
                                                <td>
                                                    <div className="agent-inquiries-buyer">
                                                        <strong>{inquiry.buyerName}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="agent-inquiries-property-name">
                                                        {inquiry.propertyUnit} - {inquiry.propertyType}
                                                    </span>
                                                </td>
                                                <td>{formatDate(inquiry.date)}</td>
                                                <td>
                                                    <select
                                                        aria-label={`Update status for inquiry ${inquiry.id}`}
                                                        className={`agent-inquiries-status-select status-${statusClass}`}
                                                        value={inquiry.status}
                                                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                                                    >
                                                        <option value="New">New</option>
                                                        <option value="Contacted">Contacted</option>
                                                        <option value="Viewing Scheduled">Viewing Scheduled</option>
                                                        <option value="Closed">Closed</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button type="button" className="agent-inquiries-view-btn" onClick={() => handleView(inquiry)}>
                                                        View
                                                    </button>
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
        </div>
    );
}

export default AgentInquiries;