import React, { useEffect, useState } from "react";
import {
    getInquiries,
    updateInquiry,
} from "../../data/inquiryStorage";
import { getProperties } from "../../data/propertyStorage";
import * as authService from "../../services/authService.js";
import "./AgentInquiries.css";

function AgentInquiries() {

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [inquiries, setInquiries] =
        useState([]);

    const [properties, setProperties] =
        useState([]);

    /* The enquiry opened for reading. This used to be a
       browser alert with the same details. */

    const [selectedInquiry, setSelectedInquiry] =
        useState(null);

    /*
    =========================================================
    LOAD SHARED DATA
    =========================================================
    */

    useEffect(() => {

        const storedInquiries =
            getInquiries();

        const storedProperties =
            getProperties();

        setInquiries(
            storedInquiries
        );

        setProperties(
            storedProperties
        );

    }, []);

    /*
    =========================================================
    GET PROPERTY
    =========================================================
    */

    const getProperty = (inquiry) => {

        const property =
            properties.find(
                (item) =>
                    item.id ===
                    inquiry.propertyId
            );

        return property || null;

    };

    /*
    =========================================================
    GET PROPERTY DISPLAY NAME
    =========================================================
    */

    const getPropertyName = (inquiry) => {

        const property =
            getProperty(inquiry);

        if (property) {

            return `${property.unitNumber} - ${property.propertyType}`;

        }

        if (inquiry.propertyUnit) {

            return inquiry.propertyUnit;

        }

        return "Unknown Property";

    };

    /*
    =========================================================
    GET PROPERTY LOCATION
    =========================================================
    */

    const getPropertyLocation = (inquiry) => {

        const property =
            getProperty(inquiry);

        if (property) {

            return property.location ||
                property.development ||
                "VALORA Estate";

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

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-ZA",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

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
                    inquiry.status ===
                    statusFilter
            );

    /*
    =========================================================
    STATUS COUNTS
    =========================================================
    */

    const totalInquiries =
        inquiries.length;

    const newInquiries =
        inquiries.filter(
            (inquiry) =>
                inquiry.status ===
                "New"
        ).length;

    const contactedInquiries =
        inquiries.filter(
            (inquiry) =>
                inquiry.status ===
                "Contacted"
        ).length;

    const viewingInquiries =
        inquiries.filter(
            (inquiry) =>
                inquiry.status ===
                "Viewing Scheduled"
        ).length;

    /*
    =========================================================
    UPDATE INQUIRY STATUS
    =========================================================
    */

    const handleStatusChange = (
        inquiryId,
        newStatus
    ) => {

        const updatedInquiry =
            updateInquiry(
                inquiryId,
                {
                    status: newStatus,
                }
            );

        if (!updatedInquiry) {
            return;
        }

        setInquiries(
            (currentInquiries) =>
                currentInquiries.map(
                    (inquiry) =>
                        inquiry.id ===
                        inquiryId
                            ? updatedInquiry
                            : inquiry
                )
        );

    };

    /*
    =========================================================
    VIEW INQUIRY
    =========================================================
    */

    const handleView = (
        inquiry
    ) => {

        setSelectedInquiry({

            propertyName: getPropertyName(
                inquiry
            ),

            rows: [

                [
                    "Buyer",
                    inquiry.buyerName ||
                        "Not provided",
                ],

                [
                    "Email",
                    inquiry.buyerEmail ||
                        "Not provided",
                ],

                [
                    "Contact",
                    inquiry.buyerContact ||
                        "Not provided",
                ],

                [
                    "Location",
                    getPropertyLocation(inquiry),
                ],

                [
                    "Date",
                    formatDate(inquiry.date),
                ],

                [
                    "Status",
                    inquiry.status || "New",
                ],

            ],

            message:
                inquiry.message ||
                "No message provided.",

        });

    };

    /*
    =========================================================
    SVG ICONS
    =========================================================
    */

    const DashboardIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
            />
            <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
            />
            <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
            />
            <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
            />
        </svg>
    );

    const ListingsIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
        </svg>
    );

    const EditIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
    );

    const InquiryIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M4 5h16v11H8l-4 4Z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
        </svg>
    );

    const LogoutIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M10 5H5v14h5" />
            <path d="M14 8l4 4-4 4" />
            <path d="M9 12h9" />
        </svg>
    );

    const UserIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="8"
                r="3.5"
            />
            <path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6" />
        </svg>
    );

    const InquiryCardIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M4 5h16v11H8l-4 4Z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
        </svg>
    );

    const NewIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="8"
            />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
        </svg>
    );

    const ContactedIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M5 4h14v16H5z" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
        </svg>
    );

    const ViewingIcon = () => (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M4 5h16v14H4z" />
            <path d="M8 3v4" />
            <path d="M16 3v4" />
            <path d="M4 9h16" />
            <path d="m9 14 2 2 4-4" />
        </svg>
    );

    /*
    =========================================================
    RENDER
    =========================================================
    */

    return (

        <div className="agent-inquiries-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="agent-inquiries-sidebar">

                <div className="agent-inquiries-logo-area">

                    <img
                        src="/assets/valora-logo.svg"
                        alt="VALORA"
                    />

                </div>

                <div className="agent-inquiries-role">

                    <div className="agent-inquiries-role-icon">
                        <UserIcon />
                    </div>

                    <div>
                        <strong>
                            Estate Agent
                        </strong>

                        <span>
                            Agent Portal
                        </span>
                    </div>

                </div>

                <nav className="agent-inquiries-nav">

                    <a href="/dashboard">

                        <DashboardIcon />

                        <span>
                            Dashboard
                        </span>

                    </a>

                    <a href="/agent-listings">

                        <ListingsIcon />

                        <span>
                            My Listings
                        </span>

                    </a>

                    <a href="/agent-edit-listings">

                        <EditIcon />

                        <span>
                            Edit Listings
                        </span>

                    </a>

                    <a
                        href="/agent-inquiries"
                        className="active"
                    >

                        <InquiryIcon />

                        <span>
                            Inquiry Log
                        </span>

                    </a>

                </nav>

                <div className="agent-inquiries-logout-area">

                    <button
                        onClick={() => {

                            authService.logout();

                            window.location.href =
                                "/login";

                        }}
                    >

                        <LogoutIcon />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="agent-inquiries-main">

                {/* =================================================
                    INQUIRY DETAILS
                ================================================= */}

                {selectedInquiry && (

                    <section
                        className="agent-inquiries-detail"
                        aria-label="Enquiry details"
                    >

                        <div className="agent-inquiries-detail-head">

                            <div>

                                <h2>
                                    {selectedInquiry.propertyName}
                                </h2>

                                <p>
                                    Enquiry details
                                </p>

                            </div>


                            <button
                                type="button"
                                className="agent-inquiries-detail-close"
                                onClick={() =>
                                    setSelectedInquiry(null)
                                }
                                aria-label="Close enquiry details"
                            >
                                Close
                            </button>

                        </div>


                        <dl className="agent-inquiries-detail-grid">

                            {selectedInquiry.rows.map(
                                ([label, value]) => (

                                    <div key={label}>

                                        <dt>
                                            {label}
                                        </dt>

                                        <dd>
                                            {value}
                                        </dd>

                                    </div>

                                )
                            )}

                        </dl>


                        <div className="agent-inquiries-detail-message">

                            <h3>
                                Message
                            </h3>

                            <p>
                                {selectedInquiry.message}
                            </p>

                        </div>

                    </section>

                )}


                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div className="agent-inquiries-topbar">

                    <div>

                        <div className="agent-inquiries-breadcrumb">
                            Estate Agent
                            <span>/</span>
                            Inquiry Log
                        </div>

                        <h1>
                            Inquiry Log
                        </h1>

                        <p>
                            Manage buyer and investor inquiries
                            for your assigned VALORA properties.
                        </p>

                    </div>

                    <div className="agent-inquiries-profile">

                        <div className="agent-inquiries-profile-circle">
                            EA
                        </div>

                        <div>

                            <strong>
                                Estate Agent
                            </strong>

                            <span>
                                Estate Agent
                            </span>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <div className="agent-inquiries-stat-cards">

                    <div className="agent-inquiries-stat-card">

                        <div className="agent-inquiries-stat-icon">
                            <InquiryCardIcon />
                        </div>

                        <div>

                            <span>
                                Total Inquiries
                            </span>

                            <strong>
                                {totalInquiries}
                            </strong>

                        </div>

                    </div>

                    <div className="agent-inquiries-stat-card">

                        <div className="agent-inquiries-stat-icon">
                            <NewIcon />
                        </div>

                        <div>

                            <span>
                                New
                            </span>

                            <strong>
                                {newInquiries}
                            </strong>

                        </div>

                    </div>

                    <div className="agent-inquiries-stat-card">

                        <div className="agent-inquiries-stat-icon">
                            <ContactedIcon />
                        </div>

                        <div>

                            <span>
                                Contacted
                            </span>

                            <strong>
                                {contactedInquiries}
                            </strong>

                        </div>

                    </div>

                    <div className="agent-inquiries-stat-card">

                        <div className="agent-inquiries-stat-icon">
                            <ViewingIcon />
                        </div>

                        <div>

                            <span>
                                Viewings
                            </span>

                            <strong>
                                {viewingInquiries}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    INQUIRY PANEL
                ================================================= */}

                <section className="agent-inquiries-panel">

                    <div className="agent-inquiries-panel-heading">

                        <div>

                            <h2>
                                Property Inquiries
                            </h2>

                            <p>
                                Review and manage inquiries
                                received for your listings.
                            </p>

                        </div>

                        <div className="agent-inquiries-filter">

                            <label htmlFor="status-filter">
                                Filter by status
                            </label>

                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All Statuses
                                </option>

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

                        </div>

                    </div>

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="agent-inquiries-table-container">

                        <table className="agent-inquiries-table">

                            <thead>

                                <tr>

                                    <th>
                                        Buyer / Investor
                                    </th>

                                    <th>
                                        Property
                                    </th>

                                    <th>
                                        Location
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredInquiries.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="agent-inquiries-empty"
                                        >
                                            No inquiries found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredInquiries.map(
                                        (inquiry) => (

                                            <tr
                                                key={
                                                    inquiry.id
                                                }
                                            >

                                                <td>

                                                    <div className="agent-inquiries-buyer">

                                                        <strong>
                                                            {
                                                                inquiry.buyerName ||
                                                                "Unknown"
                                                            }
                                                        </strong>

                                                        {inquiry.buyerEmail && (

                                                            <small>
                                                                {
                                                                    inquiry.buyerEmail
                                                                }
                                                            </small>

                                                        )}

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="agent-inquiries-property-name">

                                                        {
                                                            getPropertyName(
                                                                inquiry
                                                            )
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    {
                                                        getPropertyLocation(
                                                            inquiry
                                                        )
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        inquiry.buyerContact ||
                                                        "-"
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        formatDate(
                                                            inquiry.date
                                                        )
                                                    }

                                                </td>

                                                <td>

                                                    <select
                                                        className={`agent-inquiries-status-select status-${String(
                                                            inquiry.status ||
                                                            "New"
                                                        )
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                "-"
                                                            )}`}
                                                        value={
                                                            inquiry.status ||
                                                            "New"
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusChange(
                                                                inquiry.id,
                                                                event
                                                                    .target
                                                                    .value
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
                                                        className="agent-inquiries-view-btn"
                                                        onClick={() =>
                                                            handleView(
                                                                inquiry
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )

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
