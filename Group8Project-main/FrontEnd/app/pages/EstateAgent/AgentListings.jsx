import React, { useEffect, useState } from "react";
import { getProperties } from "../../data/propertyStorage";
import {
    ensureLocalPropertyForRequest,
    getPropertyRequests,
} from "../../data/propertyRequests";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useNavigate } from "react-router-dom";
import "./AgentListings.css";
import { showAlert } from "../../components/AppDialog";
import { getStoredUser } from "../../services/session";

function AgentListings() {
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [propertyRequests, setPropertyRequests] = useState([]);

    const [currentUser] = useState(() => {
        try {
            return getStoredUser();
        } catch {
            return null;
        }
    });

    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                // the API only returns the requests assigned to this agent
                const requests = (await getPropertyRequests()) || [];
                if (cancelled) return;

                requests.forEach((request) => ensureLocalPropertyForRequest(request));
                setProperties(getProperties() || []);
                setPropertyRequests(requests);
                setLoadError("");
            } catch (error) {
                console.error("Unable to load assigned property requests:", error);
                if (!cancelled) {
                    setProperties(getProperties() || []);
                    setLoadError("Unable to load your assigned properties. Please try again.");
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const currentAgentName =
        currentUser?.name ||
        currentUser?.fullName ||
        `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim();

    const assignedRequests = propertyRequests.filter((request) => {
        if (currentUser?.id && request.assignedAgentId) {
            return String(request.assignedAgentId) === String(currentUser.id);
        }

        return Boolean(
            request.assignedAgentName &&
            currentAgentName &&
            request.assignedAgentName === currentAgentName
        );
    });

    const assignedListings = assignedRequests.map((request) => ({
        request,
        property: properties.find(
            (item) => String(item.id) === String(request.propertyId)
        ) || null,
    }));

    const getListingStatus = ({ property }) =>
        property?.listing?.listingStatus || "Not Listed";

    const getListingPrice = ({ request, property }) => {
        const listing = property?.listing || {};

        if (request.requestType === "Sell" || listing.listingType === "For Sale") {
            const price = listing.askingPrice || request.askingPrice;
            return price ? `R${Number(price).toLocaleString()}` : "Price not set";
        }

        if (request.requestType === "Rent" || listing.listingType === "For Rent") {
            const price = listing.rentalPrice || request.rentalPrice;
            return price
                ? `R${Number(price).toLocaleString()} / month`
                : "Rental price not set";
        }

        return "Not listed";
    };

    const getListingType = ({ request, property }) => {
        if (request.requestType === "Sell") return "For Sale";
        if (request.requestType === "Rent") return "For Rent";

        return property?.listing?.listingType || "Not Listed";
    };

    const getOwnerName = ({ request, property }) =>
        request.requesterName ||
        property?.listing?.ownerName ||
        "Owner not assigned";

    const getViews = ({ property }) => property?.listing?.views || 0;
    const getInquiries = ({ property }) => property?.listing?.inquiries || 0;
    const getRequestStatus = ({ request }) => request.status || "Assigned";

    const totalListings = assignedListings.length;

    const activeListings = assignedListings.filter(
        (listing) => getListingStatus(listing) === "Published"
    ).length;

    const underOffer = assignedListings.filter(
        (listing) => getListingStatus(listing) === "Under Offer"
    ).length;

    const totalInquiries = assignedListings.reduce(
        (total, listing) => total + Number(getInquiries(listing)),
        0
    );

    const handleView = ({ request, property }) => {
        const listing = property?.listing || {};

        showAlert(
            `${property?.unitNumber || request.propertyAddress || request.propertyId || "Property"}\n\n` +
            `Owner: ${getOwnerName({ request, property })}\n` +
            `Property Type: ${property?.propertyType || request.propertyType || "Not specified"}\n` +
            `Bedrooms: ${property?.bedrooms || request.bedrooms || "Not specified"}\n` +
            `Bathrooms: ${property?.bathrooms || request.bathrooms || "Not specified"}\n` +
            `Property Size: ${property?.size || property?.area || request.propertySize || "Not specified"}\n\n` +
            `Listing Type: ${getListingType({ request, property })}\n` +
            `Price: ${getListingPrice({ request, property })}\n` +
            `Request Status: ${getRequestStatus({ request })}\n` +
            `Listing Status: ${getListingStatus({ property })}\n` +
            `HOA Approval: ${listing.hoaApprovalStatus || "Not Submitted"}`
        );
    };

    const handleEditListing = ({ request, property }) => {
        if (!property) {
            showAlert("The property record linked to this request could not be found.");
            return;
        }

        localStorage.setItem(
            "valoraAgentSelectedProperty",
            JSON.stringify({
                propertyId: property.id,
                requestId: request.id,
            })
        );

        navigate(`/agent-edit-listings?propertyId=${property.id}`);
    };

    const handleAddListing = () => {
        showAlert(
            "New listings are created through the HOA property request and agent assignment process."
        );
    };

    const icons = {
        property: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 21V7l8-4 8 4v14" />
                <path d="M8 21v-5h8v5M8 10h2M14 10h2M8 13h2M14 13h2" />
            </svg>
        ),
        active: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="m5 12 4 4L19 6" />
            </svg>
        ),
        offers: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7h14v12H5zM8 7V5h8v2M8 12h8" />
            </svg>
        ),
        inquiries: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5h16v11H8l-4 4zM8 9h8M8 13h5" />
            </svg>
        ),
    };

    const statCards = [
        {
            label: "Assigned Listings",
            value: totalListings,
            description: "Properties assigned to you",
            icon: icons.property,
        },
        {
            label: "Active Listings",
            value: activeListings,
            description: "Currently published",
            icon: icons.active,
        },
        {
            label: "Under Offer",
            value: underOffer,
            description: "Pending sales",
            icon: icons.offers,
        },
        {
            label: "Total Inquiries",
            value: totalInquiries,
            description: "Buyer inquiries",
            icon: icons.inquiries,
        },
    ];

    return (
        <div className="agent-listings-page">
            {/* SHARED SIDEBAR */}
            <DashboardSidebar suppliedUser={currentUser} />

            <main className="agent-listings-main">
                <header className="agent-listings-topbar">
                    <div>
                        <div className="agent-listings-breadcrumb">
                            <span>Estate Agent</span>
                            <span>/</span>
                            <span>My Listings</span>
                        </div>

                        <h1>My Listings</h1>

                        <p>
                            Manage properties assigned to you by the HOA.
                        </p>
                    </div>

                    <div className="agent-listings-profile">
                        <div className="agent-listings-profile-circle">
                            {currentUser?.initials ||
                                `${currentUser?.firstName?.charAt(0) || ""}${currentUser?.lastName?.charAt(0) || ""}` ||
                                "EA"}
                        </div>

                        <div>
                            <strong>
                                {currentAgentName || "Estate Agent"}
                            </strong>
                            <span>Estate Agent</span>
                        </div>
                    </div>
                </header>

                {loadError && (
                    <div className="agent-listings-empty" role="alert">
                        {loadError}
                    </div>
                )}

                <section className="agent-listings-stat-cards">
                    {statCards.map((card) => (
                        <div className="agent-listings-stat-card" key={card.label}>
                            <div className="agent-listings-stat-icon">
                                {card.icon}
                            </div>

                            <div>
                                <span>{card.label}</span>
                                <strong>{card.value}</strong>
                                <small>{card.description}</small>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="agent-listings-panel">
                    <div className="agent-listings-panel-heading">
                        <div>
                            <h2>Assigned Properties</h2>
                            <p>
                                Properties approved by the HOA and assigned
                                to you for listing management.
                            </p>
                        </div>

                        <button
                            className="agent-listings-primary-btn"
                            onClick={handleAddListing}
                        >
                            Add Listing
                        </button>
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
                                    <th>Views</th>
                                    <th>Inquiries</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {assignedListings.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="agent-listings-empty">
                                            No properties have been assigned to you yet.
                                        </td>
                                    </tr>
                                ) : (
                                    assignedListings.map(({ request, property }) => {
                                        const listingStatus = getListingStatus({ property });
                                        const requestStatus = getRequestStatus({ request });

                                        return (
                                            <tr key={request.id}>
                                                <td>
                                                    <div className="agent-listings-primary-text">
                                                        {property?.unitNumber ||
                                                            request.propertyAddress ||
                                                            request.propertyId ||
                                                            "Property"}
                                                    </div>
                                                    <small>
                                                        {request.propertyId || property?.id}
                                                        {" • "}
                                                        {property?.propertyType ||
                                                            request.propertyType ||
                                                            "Property"}
                                                    </small>
                                                </td>

                                                <td>
                                                    <div className="agent-listings-primary-text">
                                                        {getOwnerName({ request, property })}
                                                    </div>
                                                    <small>
                                                        {request.requesterEmail || "No email"}
                                                    </small>
                                                </td>

                                                <td>
                                                    <div className="agent-listings-primary-text">
                                                        {getListingType({ request, property })}
                                                    </div>
                                                    <small>Request {request.id}</small>
                                                </td>

                                                <td>
                                                    <strong className="agent-listings-price">
                                                        {getListingPrice({ request, property })}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`agent-listings-status ${
                                                            requestStatus === "Assigned to Estate Agent"
                                                                ? "status-approved"
                                                                : "status-default"
                                                        }`}
                                                    >
                                                        {requestStatus}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`agent-listings-status ${
                                                            listingStatus === "Published"
                                                                ? "status-published"
                                                                : listingStatus === "Pending HOA Approval"
                                                                ? "status-pending"
                                                                : listingStatus === "Changes Requested"
                                                                ? "status-rejected"
                                                                : "status-default"
                                                        }`}
                                                    >
                                                        {listingStatus}
                                                    </span>
                                                </td>

                                                <td>{getViews({ property })}</td>
                                                <td>{getInquiries({ property })}</td>

                                                <td>
                                                    <div className="agent-listings-actions">
                                                        <button
                                                            className="agent-listings-secondary-btn"
                                                            onClick={() =>
                                                                handleView({ request, property })
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            className="agent-listings-primary-small-btn"
                                                            onClick={() =>
                                                                handleEditListing({ request, property })
                                                            }
                                                        >
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

                <section className="agent-listings-grid">
                    <div className="agent-listings-panel">
                        <div className="agent-listings-panel-heading">
                            <div>
                                <h2>Listing Actions</h2>
                                <p>Manage your assigned property listings.</p>
                            </div>
                        </div>

                        <div className="agent-listings-quick-actions">
                            <button type="button" onClick={handleAddListing}>
                                Add New Listing
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/agent-edit-listings")}
                            >
                                Edit Listings
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/agent-inquiries")}
                            >
                                View Inquiries
                            </button>
                        </div>
                    </div>

                    <div className="agent-listings-panel">
                        <div className="agent-listings-panel-heading">
                            <div>
                                <h2>Listing Overview</h2>
                                <p>
                                    Current status of your assigned properties.
                                </p>
                            </div>
                        </div>

                        <div className="agent-listings-summary">
                            <div>
                                <span>Assigned</span>
                                <strong>{totalListings}</strong>
                            </div>
                            <div>
                                <span>Published</span>
                                <strong>{activeListings}</strong>
                            </div>
                            <div>
                                <span>Under Offer</span>
                                <strong>{underOffer}</strong>
                            </div>
                            <div>
                                <span>Inquiries</span>
                                <strong>{totalInquiries}</strong>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default AgentListings;
