import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession, getSessionToken } from "../../services/session";
import "./AgentInquiries.css";
import { showAlert, showConfirm } from "../../components/AppDialog";
import StageSummary from "../../components/StageSummary";
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

function initialsOf(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

function ContactIcon({ children }) {
    return (
        <span className="inquiry-view-contact-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {children}
            </svg>
        </span>
    );
}

function InquiryDetails({ inquiry, showAgent, formatDate, onClose }) {
    const closeRef = useRef(null);

    useEffect(() => {
        const openedFrom = document.activeElement;
        closeRef.current?.focus();

        function closeOnEscape(event) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", closeOnEscape);
        return () => {
            window.removeEventListener("keydown", closeOnEscape);
            openedFrom?.focus?.();
        };
    }, [onClose]);

    const statusClass = String(inquiry.status || "").toLowerCase().replace(/\s+/g, "-");
    const facts = [
        ["Property", `${inquiry.propertyUnit}${inquiry.propertyType ? ` · ${inquiry.propertyType}` : ""}`],
        ...(showAgent ? [["Agent", inquiry.agentName || "Unknown"]] : []),
        ["Received", formatDate(inquiry.date)],
    ];

    return createPortal(
        <div
            className="inquiry-view-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="inquiry-view" role="dialog" aria-modal="true" aria-labelledby="inquiry-view-name">
                <header className="inquiry-view-header">
                    <span className="inquiry-view-avatar" aria-hidden="true">{initialsOf(inquiry.buyerName)}</span>
                    <div className="inquiry-view-heading">
                        <p>Inquiry details</p>
                        <h2 id="inquiry-view-name">{inquiry.buyerName || "Unknown buyer"}</h2>
                    </div>
                    <span className={`inquiry-view-status status-${statusClass}`}>{inquiry.status}</span>
                </header>

                <div className="inquiry-view-body">
                    <ul className="inquiry-view-contact">
                        <li>
                            <ContactIcon>
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="m3 7 9 6 9-6" />
                            </ContactIcon>
                            {inquiry.buyerEmail
                                ? <a href={`mailto:${inquiry.buyerEmail}`}>{inquiry.buyerEmail}</a>
                                : <span>Email not provided</span>}
                        </li>
                        <li>
                            <ContactIcon>
                                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                            </ContactIcon>
                            {inquiry.buyerContact
                                ? <a href={`tel:${String(inquiry.buyerContact).replace(/\s+/g, "")}`}>{inquiry.buyerContact}</a>
                                : <span>Phone not provided</span>}
                        </li>
                    </ul>

                    <dl className="inquiry-view-facts">
                        {facts.map(([label, value]) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <section className="inquiry-view-message" aria-label="Message">
                        <h3>Message</h3>
                        {inquiry.message
                            ? <p>{inquiry.message}</p>
                            : <p className="is-empty">The buyer didn't leave a message.</p>}
                    </section>
                </div>

                <footer className="inquiry-view-footer">
                    <button type="button" ref={closeRef} onClick={onClose}>Close</button>
                </footer>
            </div>
        </div>,
        document.body
    );
}

function AgentInquiries() {
    const { user } = useSession();
    // the route only lets estate agents and administrators in
    const isAdminView = Boolean(user) && user.role !== ROLES.estateAgent;
    const [statusFilter, setStatusFilter] = useState("All");
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState(null);
    const closeDetails = useCallback(() => setViewing(null), []);

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
    const dealInquiries = inquiries.filter(i => DEAL_STATUSES.includes(i.status)).length;
    const openInquiries = newInquiries + contactedInquiries + viewingInquiries;
    // older enquiries can hold a status no longer offered, such as Closed
    const otherInquiries = totalInquiries - openInquiries - dealInquiries;

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
                            <p>{isAdminView ? "View buyer inquiries across every VALORA property." : "Manage buyer inquiries for your assigned VALORA properties."}</p>
                        </div>
                    </header>

                    <div className="agent-inquiries-skeleton agent-inquiries-skeleton-summary" aria-hidden="true" />

                    <section className="agent-inquiries-panel" aria-hidden="true">
                        <div className="agent-inquiries-panel-heading">
                            <div>
                                <h2>Property Inquiries</h2>
                                <p>{isAdminView ? "Review inquiries received for all listings." : "Review and manage inquiries received for your listings."}</p>
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
                        <p>{isAdminView ? "View buyer inquiries across every VALORA property." : "Manage buyer inquiries for your assigned VALORA properties."}</p>
                    </div>
                </header>

                <StageSummary
                    eyebrow="Inquiry progress"
                    title={`${openInquiries} of ${totalInquiries} ${totalInquiries === 1 ? "inquiry" : "inquiries"} still open`}
                    subtitle="Where every inquiry stands, from first contact to a completed deal."
                    stages={[
                        { key: "new", label: "New", hint: "Not contacted yet", count: newInquiries, tone: "waiting" },
                        { key: "contacted", label: "Contacted", hint: "Buyer has been reached", count: contactedInquiries, tone: "early" },
                        { key: "viewing", label: "Viewing scheduled", hint: "Viewing is booked", count: viewingInquiries, tone: "middle" },
                        { key: "deal", label: "Sold or rented", hint: "Deal completed", count: dealInquiries, tone: "done" },
                        ...(otherInquiries > 0
                            ? [{ key: "other", label: "Closed", hint: "Older inquiries", count: otherInquiries, tone: "neutral" }]
                            : []),
                    ]}
                />

                {/* INQUIRIES PANEL */}
                <section className="agent-inquiries-panel">
                    <div className="agent-inquiries-panel-heading">
                        <div>
                            <h2>Property Inquiries</h2>
                            <p>{isAdminView ? "Review inquiries received for all listings." : "Review and manage inquiries received for your listings."}</p>
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
                                                    {isAdminView ? (
                                                        <span className={`inquiry-view-status status-${statusClass}`}>{inquiry.status}</span>
                                                    ) : (
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
                                                    )}
                                                </td>
                                                <td>
                                                    <button type="button" className="agent-inquiries-view-btn" onClick={() => setViewing(inquiry)}>
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

            {viewing && (
                <InquiryDetails
                    inquiry={viewing}
                    showAgent={isAdminView}
                    formatDate={formatDate}
                    onClose={closeDetails}
                />
            )}
        </div>
    );
}

export default AgentInquiries;