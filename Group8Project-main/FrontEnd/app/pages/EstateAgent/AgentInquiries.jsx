import React, { useCallback, useEffect, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import {
    getInquiries,
    updateInquiry,
} from "../../data/inquiryStorage";
import { getProperties } from "../../data/propertyStorage";
import "./AgentInquiries.css";

function AgentInquiries() {
    const [statusFilter, setStatusFilter] = useState("All");
    const [inquiries, setInquiries] = useState([]);
    const [properties, setProperties] = useState([]);

    /*
    =========================================================
    LOAD SHARED DATA
    =========================================================
    */

    const loadData = useCallback(() => {
        setInquiries(getInquiries());
        setProperties(getProperties());
    }, []);

    useEffect(() => {
        loadData();

        const handleStorageChange = (event) => {
            if (
                !event ||
                !event.key ||
                event.key.startsWith("valora") ||
                event.key.toLowerCase().includes("inquir") ||
                event.key.toLowerCase().includes("propert")
            ) {
                loadData();
            }
        };

        const handleSharedDataUpdate = () => {
            loadData();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener(
            "valoraInquiriesUpdated",
            handleSharedDataUpdate
        );
        window.addEventListener(
            "valoraPropertiesUpdated",
            handleSharedDataUpdate
        );

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener(
                "valoraInquiriesUpdated",
                handleSharedDataUpdate
            );
            window.removeEventListener(
                "valoraPropertiesUpdated",
                handleSharedDataUpdate
            );
        };
    }, [loadData]);

    /*
    =========================================================
    GET PROPERTY
    =========================================================
    */

    const getProperty = (inquiry) => {
        return (
            properties.find(
                (property) => property.id === inquiry.propertyId
            ) || null
        );
    };

    /*
    =========================================================
    GET PROPERTY DISPLAY NAME
    =========================================================
    */

    const getPropertyName = (inquiry) => {
        const property = getProperty(inquiry);

        if (property) {
            const unit =
                property.unitNumber || property.id || "Property";

            const type =
                property.propertyType || property.type || "";

            return type ? `${unit} - ${type}` : unit;
        }

        return inquiry.propertyUnit || "Unknown Property";
    };

    /*
    =========================================================
    GET PROPERTY LOCATION
    =========================================================
    */

    const getPropertyLocation = (inquiry) => {
        const property = getProperty(inquiry);

        if (property) {
            return (
                property.location ||
                property.development ||
                "VALORA Estate"
            );
        }

        return "VALORA Estate";
    };

    /*
    =========================================================
    FORMAT DATE
    =========================================================
    */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

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

    const filteredInquiries =
        statusFilter === "All"
            ? inquiries
            : inquiries.filter(
                  (inquiry) =>
                      (inquiry.status || "New") === statusFilter
              );

    /*
    =========================================================
    STATUS COUNTS
    =========================================================
    */

    const totalInquiries = inquiries.length;

    const newInquiries = inquiries.filter(
        (inquiry) => (inquiry.status || "New") === "New"
    ).length;

    const contactedInquiries = inquiries.filter(
        (inquiry) => inquiry.status === "Contacted"
    ).length;

    const viewingInquiries = inquiries.filter(
        (inquiry) => inquiry.status === "Viewing Scheduled"
    ).length;

    /*
    =========================================================
    UPDATE INQUIRY STATUS
    =========================================================
    */

    const handleStatusChange = (inquiryId, newStatus) => {
        const updatedInquiry = updateInquiry(inquiryId, {
            status: newStatus,
        });

        if (!updatedInquiry) {
            return;
        }

        setInquiries((currentInquiries) =>
            currentInquiries.map((inquiry) =>
                inquiry.id === inquiryId ? updatedInquiry : inquiry
            )
        );

        window.dispatchEvent(new Event("valoraInquiriesUpdated"));
    };

    /*
    =========================================================
    VIEW INQUIRY
    =========================================================
    */

    const handleView = (inquiry) => {
        const propertyName = getPropertyName(inquiry);
        const message = inquiry.message || "No message provided.";

        window.alert(
            `Inquiry Details\n\n` +
                `Buyer: ${inquiry.buyerName || "Not provided"}\n` +
                `Email: ${inquiry.buyerEmail || "Not provided"}\n` +
                `Contact: ${inquiry.buyerContact || "Not provided"}\n` +
                `Property: ${propertyName}\n` +
                `Location: ${getPropertyLocation(inquiry)}\n` +
                `Date: ${formatDate(inquiry.date)}\n` +
                `Status: ${inquiry.status || "New"}\n\n` +
                `Message:\n${message}`
        );
    };

    /*
    =========================================================
    RENDER
    =========================================================
    */

    return (
        <div className="agent-inquiries-page">
            <DashboardSidebar />

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

                        <p>
                            Manage buyer and investor inquiries for your
                            assigned VALORA properties.
                        </p>
                    </div>
                </header>

                {/* STAT CARDS */}

                <section
                    className="agent-inquiries-stat-cards"
                    aria-label="Inquiry statistics"
                >
                    <div className="agent-inquiries-stat-card">
                        <div className="agent-inquiries-stat-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 5h16v11H8l-4 4Z" />
                                <path d="M8 9h8M8 13h5" />
                            </svg>
                        </div>

                        <div>
                            <span>Total Inquiries</span>
                            <strong>{totalInquiries}</strong>
                        </div>
                    </div>

                    <div className="agent-inquiries-stat-card">
                        <div className="agent-inquiries-stat-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="8" />
                                <path d="M12 8v8M8 12h8" />
                            </svg>
                        </div>

                        <div>
                            <span>New</span>
                            <strong>{newInquiries}</strong>
                        </div>
                    </div>

                    <div className="agent-inquiries-stat-card">
                        <div className="agent-inquiries-stat-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 4h14v16H5z" />
                                <path d="M8 8h8M8 12h8M8 16h5" />
                            </svg>
                        </div>

                        <div>
                            <span>Contacted</span>
                            <strong>{contactedInquiries}</strong>
                        </div>
                    </div>

                    <div className="agent-inquiries-stat-card">
                        <div className="agent-inquiries-stat-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 5h16v14H4z" />
                                <path d="M8 3v4M16 3v4M4 9h16" />
                                <path d="m9 14 2 2 4-4" />
                            </svg>
                        </div>

                        <div>
                            <span>Viewings</span>
                            <strong>{viewingInquiries}</strong>
                        </div>
                    </div>
                </section>

                {/* INQUIRIES PANEL */}

                <section className="agent-inquiries-panel">
                    <div className="agent-inquiries-panel-heading">
                        <div>
                            <h2>Property Inquiries</h2>

                            <p>
                                Review and manage inquiries received for your
                                listings.
                            </p>
                        </div>

                        <div className="agent-inquiries-filter">
                            <label htmlFor="agent-inquiry-status-filter">
                                Filter by status
                            </label>

                            <select
                                id="agent-inquiry-status-filter"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                            >
                                <option value="All">All Statuses</option>
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Viewing Scheduled">
                                    Viewing Scheduled
                                </option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* INQUIRY TABLE */}

                    <div className="agent-inquiries-table-container">
                        <table className="agent-inquiries-table">
                            <thead>
                                <tr>
                                    <th>Buyer / Investor</th>
                                    <th>Property</th>
                                    <th>Location</th>
                                    <th>Contact</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInquiries.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="agent-inquiries-empty"
                                        >
                                            No inquiries found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInquiries.map((inquiry) => {
                                        const status =
                                            inquiry.status || "New";

                                        const statusClass = status
                                            .toLowerCase()
                                            .replace(/\s+/g, "-");

                                        return (
                                            <tr key={inquiry.id}>
                                                <td>
                                                    <div className="agent-inquiries-buyer">
                                                        <strong>
                                                            {inquiry.buyerName ||
                                                                "Unknown"}
                                                        </strong>

                                                        {inquiry.buyerEmail && (
                                                            <small>
                                                                {inquiry.buyerEmail}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="agent-inquiries-property-name">
                                                        {getPropertyName(inquiry)}
                                                    </span>
                                                </td>

                                                <td>
                                                    {getPropertyLocation(inquiry)}
                                                </td>

                                                <td>
                                                    {inquiry.buyerContact || "-"}
                                                </td>

                                                <td>
                                                    {formatDate(inquiry.date)}
                                                </td>

                                                <td>
                                                    <select
                                                        aria-label={`Update status for inquiry ${inquiry.id}`}
                                                        className={`agent-inquiries-status-select status-${statusClass}`}
                                                        value={status}
                                                        onChange={(event) =>
                                                            handleStatusChange(
                                                                inquiry.id,
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="New">
                                                            New
                                                        </option>

                                                        <option value="Contacted">
                                                            Contacted
                                                        </option>

                                                        <option value="Viewing Scheduled">
                                                            Viewing Scheduled
                                                        </option>

                                                        <option value="Closed">
                                                            Closed
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="agent-inquiries-view-btn"
                                                        onClick={() =>
                                                            handleView(inquiry)
                                                        }
                                                    >
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
