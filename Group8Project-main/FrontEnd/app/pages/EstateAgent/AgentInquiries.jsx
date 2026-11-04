import React, { useEffect, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession, getSessionToken } from "../../services/session";
import "./AgentInquiries.css";
import { showAlert, showConfirm } from "../../components/AppDialog";
import { getApiBaseUrl } from "../../services/apiClient";
import { ROLES } from "../../services/roleMap";

const OPEN_STATUSES = ["New", "Contacted", "Viewing Scheduled"];

/* Statuses that end a deal: the property comes off the market and the enquiry locks. */
const DEAL_STATUSES = ["Sold", "Rented Out"];

/** The outcome a unit can have. Older listings have no type, so both are offered. */
function dealStatusesFor(listingType) {
    if (listingType === "sale") return ["Sold"];
    if (listingType === "rent") return ["Rented Out"];
    return DEAL_STATUSES;
}

function statusOptionsFor(inquiry) {
    const options = [...OPEN_STATUSES, ...dealStatusesFor(inquiry.listingType)];
    // an older enquiry can hold a status no longer offered, such as Closed
    return options.includes(inquiry.status) ? options : [...options, inquiry.status];
}

function AgentInquiries() {
    const { user } = useSession();
    // the route only lets estate agents and administrators in
    const isAdminView = Boolean(user) && user.role !== ROLES.estateAgent;
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
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const token = getSessionToken();
                const headers = { "Authorization": `Bearer ${token}` };

                const response = await fetch(`${getApiBaseUrl()}/api/v1/inquiries`, { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    const inquiriesList = data.items || data || [];
                    
                    // Map the API response to the shape the UI expects
                    const mappedInquiries = inquiriesList.map(inq => ({
                        id: inq.inquiry_id,
                        buyerName: inq.buyer_name,
                        buyerEmail: inq.buyer_email,
                        buyerContact: inq.buyer_contact,
                        agentName: inq.agent_name,
                        listingType: inq.listing_type,
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
    const handleStatusChange = async (inquiry, newStatus) => {
        const inquiryId = inquiry.id;
        const closesDeal = DEAL_STATUSES.includes(newStatus);
        const outcome = newStatus === "Sold" ? "sold" : "rented out";

        if (closesDeal) {
            const confirmed = await showConfirm(
                `Mark ${inquiry.propertyUnit} as ${outcome} to ${inquiry.buyerName}? The property comes off the market and this inquiry can no longer be changed.`,
                { title: `Mark as ${outcome}?`, confirmLabel: `Mark as ${outcome}` }
            );
            if (!confirmed) return;
        }

        try {
            const token = getSessionToken();
            const response = await fetch(`${getApiBaseUrl()}/api/v1/inquiries/${inquiryId}`, {
                method: "PATCH",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(typeof data?.detail === "string" ? data.detail : "Could not update the inquiry status. Please try again.");
            }

            // Update the UI only after the backend confirms it was saved
            setInquiries((current) =>
                current.map((item) =>
                    item.id === inquiryId ? { ...item, status: newStatus } : item
                )
            );

            if (closesDeal) {
                showAlert(`${inquiry.propertyUnit} has been marked as ${outcome} and taken off the market.`, { title: "Deal recorded" });
            }
        } catch (err) {
            console.error(err);
            showAlert(err.message);
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
            `Phone: ${inquiry.buyerContact || "Not provided"}\n` +
            `Property: ${inquiry.propertyUnit} (${inquiry.propertyType})\n` +
            (isAdminView ? `Agent: ${inquiry.agentName || "Unknown"}\n` : "") +
            `Date: ${formatDate(inquiry.date)}\n` +
            `Status: ${inquiry.status}\n\n` +
            `Message:\n${inquiry.message || "No message"}`
        );
    };

    if (loading) {
        // a placeholder in the shape of the page, so nothing jumps when it loads
        return (
            <div className="agent-inquiries-page">
                <DashboardSidebar suppliedUser={user} />
                <main className="agent-inquiries-main" aria-busy="true">
                    <span className="agent-inquiries-visually-hidden" role="status">
                        Loading your inquiries…
                    </span>

                    <header className="agent-inquiries-topbar">
                        <div>
                            <div className="agent-inquiries-breadcrumb">
                                <span>{isAdminView ? "HOA Administration" : "Estate Agent"}</span>
                                <span className="breadcrumb-separator">/</span>
                                <span>Inquiry Log</span>
                            </div>
                            <h1>Inquiry Log</h1>
                            <p>{isAdminView ? "Manage buyer inquiries across every VALORA property." : "Manage buyer inquiries for your assigned VALORA properties."}</p>
                        </div>
                    </header>

                    <section className="agent-inquiries-stat-cards" aria-hidden="true">
                        {[0, 1, 2, 3].map((index) => (
                            <div className="agent-inquiries-stat-card" key={index}>
                                <span className="agent-inquiries-skeleton agent-inquiries-skeleton-icon" />
                                <div className="agent-inquiries-skeleton-stack">
                                    <span className="agent-inquiries-skeleton agent-inquiries-skeleton-label" />
                                    <span className="agent-inquiries-skeleton agent-inquiries-skeleton-number" />
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="agent-inquiries-panel" aria-hidden="true">
                        <div className="agent-inquiries-panel-heading">
                            <div>
                                <h2>Property Inquiries</h2>
                                <p>{isAdminView ? "Review and manage inquiries received for all listings." : "Review and manage inquiries received for your listings."}</p>
                            </div>
                        </div>

                        <div className="agent-inquiries-skeleton-table">
                            <span className="agent-inquiries-skeleton agent-inquiries-skeleton-head" />
                            {[0, 1, 2, 3].map((index) => (
                                <div className="agent-inquiries-skeleton-row" key={index}>
                                    <span className="agent-inquiries-skeleton agent-inquiries-skeleton-avatar" />
                                    <span className="agent-inquiries-skeleton-stack">
                                        <span className="agent-inquiries-skeleton agent-inquiries-skeleton-line wide" />
                                        <span className="agent-inquiries-skeleton agent-inquiries-skeleton-line" />
                                    </span>
                                    <span className="agent-inquiries-skeleton agent-inquiries-skeleton-line" />
                                    <span className="agent-inquiries-skeleton agent-inquiries-skeleton-pill" />
                                    <span className="agent-inquiries-skeleton agent-inquiries-skeleton-button" />
                                </div>
                            ))}
                        </div>
                    </section>
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
                            <span>{isAdminView ? "HOA Administration" : "Estate Agent"}</span>
                            <span className="breadcrumb-separator">/</span>
                            <span>Inquiry Log</span>
                        </div>
                        <h1>Inquiry Log</h1>
                        <p>{isAdminView ? "Manage buyer inquiries across every VALORA property." : "Manage buyer inquiries for your assigned VALORA properties."}</p>
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
                            <p>{isAdminView ? "Review and manage inquiries received for all listings." : "Review and manage inquiries received for your listings."}</p>
                        </div>
                        <div className="agent-inquiries-filter">
                            <label htmlFor="agent-inquiry-status-filter">Filter by status</label>
                            <select id="agent-inquiry-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Viewing Scheduled">Viewing Scheduled</option>
                                <option value="Sold">Sold</option>
                                <option value="Rented Out">Rented Out</option>
                                {inquiries.some((inquiry) => inquiry.status === "Closed") && <option value="Closed">Closed</option>}
                            </select>
                        </div>
                    </div>

                    <div className="agent-inquiries-table-container">
                        <table className="agent-inquiries-table">
                            <thead>
                                <tr>
                                    <th>Buyer / Investor</th>
                                    <th>Property</th>
                                    {isAdminView && <th>Agent</th>}
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdminView ? 6 : 5} className="agent-inquiries-empty">No inquiries found.</td>
                                    </tr>
                                ) : (
                                    filteredInquiries.map((inquiry) => {
                                        const statusClass = inquiry.status.toLowerCase().replace(/\s+/g, "-");
                                        return (
                                            <tr key={inquiry.id}>
                                                <td>
                                                    <div className="agent-inquiries-buyer">
                                                        <strong>{inquiry.buyerName}</strong>
                                                        <small><a href={`mailto:${inquiry.buyerEmail}`}>{inquiry.buyerEmail}</a></small>
                                                        {inquiry.buyerContact && (
                                                            <small><a href={`tel:${inquiry.buyerContact.replace(/[^0-9+]/g, "")}`}>{inquiry.buyerContact}</a></small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="agent-inquiries-property-name">
                                                        {inquiry.propertyUnit} - {inquiry.propertyType}
                                                    </span>
                                                </td>
                                                {isAdminView && <td>{inquiry.agentName || "Unknown"}</td>}
                                                <td>{formatDate(inquiry.date)}</td>
                                                <td>
                                                    <select
                                                        aria-label={`Update status for inquiry ${inquiry.id}`}
                                                        className={`agent-inquiries-status-select status-${statusClass}`}
                                                        value={inquiry.status}
                                                        disabled={DEAL_STATUSES.includes(inquiry.status)}
                                                        onChange={(e) => handleStatusChange(inquiry, e.target.value)}
                                                    >
                                                        {statusOptionsFor(inquiry).map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
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