import React, { useEffect, useState } from "react";
import { getProperties, updateProperty } from "../../data/propertyStorage";
import { updateRequestProgress } from "../../services/propertyRequestApi";
import { listMyListings, updateListing } from "../../services/listingApi";
import { syncPublishedListingPhotos } from "../../services/listingPhotoSync";
import {
    ensureLocalPropertyForRequest,
    getPropertyRequests,
} from "../../data/propertyRequests";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useNavigate } from "react-router-dom";
import "./AgentListings.css";
import { showAlert, showConfirm } from "../../components/AppDialog";
import { getStoredUser } from "../../services/session";

function AgentListings() {
    const navigate = useNavigate();
    // the listing open in the details panel, or null
    const [viewing, setViewing] = useState(null);

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

        // photos of already-published listings that never reached the public site
        if (currentUser?.id) {
            syncPublishedListingPhotos(currentUser.id)
                .then((uploaded) => {
                    if (uploaded > 0 && !cancelled) setProperties(getProperties() || []);
                })
                .catch((error) => console.error("Could not sync listing photos:", error));
        }

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
        setViewing({ request, property });
    };

    // the agent closes the deal: the request (and the resident's tracker) moves to sold / rented
    const handleMarkComplete = async ({ request, property }) => {
        const isRent = String(request.requestType).toLowerCase() === "rent";
        const target = isRent ? "rented" : "sold";
        const unit = property?.unitNumber || request.propertyAddress || "this property";

        const confirmed = await showConfirm(
            `Mark ${unit} as ${target}? The resident will see that their request is complete.`,
            { title: isRent ? "Mark as rented?" : "Mark as sold?", confirmLabel: isRent ? "Mark as rented" : "Mark as sold" }
        );
        if (!confirmed) return;

        try {
            const updated = await updateRequestProgress(request.id, target);

            // take the public listing off the market as well
            try {
                const unitId = Number(request.propertyId);
                const { items } = await listMyListings(currentUser?.id, { unitId, pageSize: 10 });
                const live = items.find((item) => item.unitId === unitId && item.status === "active");
                if (live) await updateListing(live.id, { status: target });
            } catch (listingError) {
                console.error("Could not update the public listing:", listingError);
            }
            setPropertyRequests((current) =>
                current.map((item) => (item.id === request.id ? { ...item, ...updated } : item))
            );
            if (property) {
                updateProperty(property.id, {
                    listing: { ...(property.listing || {}), listingStatus: isRent ? "Rented" : "Sold" },
                });
                setProperties(getProperties() || []);
            }
            setViewing(null);
            showAlert(`${unit} has been marked as ${target}.`, { title: "Request complete" });
        } catch (err) {
            showAlert(err?.message || "The request could not be updated. Please try again.");
        }
    };

    // Escape closes the details panel
    useEffect(() => {
        if (!viewing) return undefined;
        const onKey = (event) => {
            if (event.key === "Escape") setViewing(null);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [viewing]);

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

    // every bar shares one scale, set by the largest figure
    const chartMax = Math.max(...statCards.map((card) => card.value), 0);

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

                {/* SUMMARY: one horizontal bar per figure, all on the same scale */}
                <section className="agent-listings-chart" aria-labelledby="agent-listings-chart-title">
                    <div className="agent-listings-chart-heading">
                        <h2 id="agent-listings-chart-title">Listing Summary</h2>
                        <p>Your assigned properties at a glance.</p>
                    </div>

                    <ul className="agent-listings-bars">
                        {statCards.map((card) => {
                            const share = chartMax > 0 ? (card.value / chartMax) * 100 : 0;

                            return (
                                <li
                                    className="agent-listings-bar-row"
                                    key={card.label}
                                    tabIndex={0}
                                    aria-label={`${card.label}: ${card.value} (${card.description})`}
                                >
                                    <span className="agent-listings-bar-label">
                                        <span className="agent-listings-bar-icon" aria-hidden="true">
                                            {card.icon}
                                        </span>
                                        <span>
                                            {card.label}
                                            <small>{card.description}</small>
                                        </span>
                                    </span>

                                    <span className="agent-listings-bar-track" aria-hidden="true">
                                        {card.value > 0 && (
                                            <span
                                                className="agent-listings-bar-fill"
                                                style={{ width: `max(${share}%, 6px)` }}
                                            />
                                        )}
                                        <span className="agent-listings-bar-tooltip" role="presentation">
                                            {card.label}: <strong>{card.value}</strong>
                                        </span>
                                    </span>

                                    <strong className="agent-listings-bar-value" aria-hidden="true">
                                        {card.value}
                                    </strong>
                                </li>
                            );
                        })}
                    </ul>
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
                                                            ["Assigned to Estate Agent", "Listed on the Market", "Sold", "Rented"].includes(requestStatus)
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

            {viewing && (() => {
                const { request, property } = viewing;
                const listing = property?.listing || {};
                const title = property?.unitNumber || request.propertyAddress || `Property ${request.propertyId}`;
                const address = request.propertyAddress || property?.location || property?.development || "";
                const firstImage = (property?.images || [])[0];
                const photo = typeof firstImage === "string" ? firstImage : firstImage?.data || "";
                const listingStatus = getListingStatus({ property });
                const hoaStatus = listing.hoaApprovalStatus || "Not Submitted";

                const facts = [
                    ["Property type", property?.propertyType || request.propertyType],
                    ["Bedrooms", property?.bedrooms ?? request.bedrooms],
                    ["Bathrooms", property?.bathrooms ?? request.bathrooms],
                    ["Size", property?.size || property?.area || request.propertySize],
                ];

                return (
                    <div
                        className="agent-listing-modal-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setViewing(null);
                        }}
                    >
                        <section
                            className="agent-listing-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="agent-listing-modal-title"
                        >
                            <header className="agent-listing-modal-header">
                                <div>
                                    <p className="agent-listing-modal-eyebrow">Listing details</p>
                                    <h2 id="agent-listing-modal-title">{title}</h2>
                                    {address && <p className="agent-listing-modal-address">{address}</p>}
                                    <div className="agent-listing-modal-tags">
                                        <span className={`agent-listing-modal-tag${listingStatus === "Published" ? " is-live" : ""}`}>
                                            {listingStatus}
                                        </span>
                                        <span className="agent-listing-modal-tag is-soft">HOA: {hoaStatus}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="agent-listing-modal-close"
                                    onClick={() => setViewing(null)}
                                    aria-label="Close listing details"
                                >
                                    ×
                                </button>
                            </header>

                            {photo && <img className="agent-listing-modal-photo" src={photo} alt={title} />}

                            <div className="agent-listing-modal-body">
                                <div className="agent-listing-modal-price">
                                    <span>{getListingType({ request, property })}</span>
                                    <strong>{getListingPrice({ request, property })}</strong>
                                </div>

                                <h3>Property</h3>
                                <dl className="agent-listing-modal-facts">
                                    {facts.map(([label, value]) => (
                                        <div key={label}>
                                            <dt>{label}</dt>
                                            <dd>{value || "Not specified"}</dd>
                                        </div>
                                    ))}
                                </dl>

                                <h3>Owner</h3>
                                <div className="agent-listing-modal-owner">
                                    <span className="agent-listing-modal-avatar" aria-hidden="true">
                                        {String(getOwnerName({ request, property }) || "?").trim().charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                        <strong>{getOwnerName({ request, property })}</strong>
                                        <span>{request.requesterEmail || "No email on record"}</span>
                                    </div>
                                </div>

                                <h3>Status</h3>
                                <dl className="agent-listing-modal-facts">
                                    <div><dt>Request</dt><dd>{getRequestStatus({ request })}</dd></div>
                                    <div><dt>Listing</dt><dd>{listingStatus}</dd></div>
                                    <div><dt>HOA approval</dt><dd>{hoaStatus}</dd></div>
                                    <div><dt>Views</dt><dd>{listing.views || 0}</dd></div>
                                </dl>
                            </div>

                            <footer className="agent-listing-modal-footer">
                                <button type="button" className="agent-listing-modal-button" onClick={() => setViewing(null)}>
                                    Close
                                </button>
                                {request.rawStatus === "listed" && (
                                    <button
                                        type="button"
                                        className="agent-listing-modal-button is-complete"
                                        onClick={() => handleMarkComplete({ request, property })}
                                    >
                                        {String(request.requestType).toLowerCase() === "rent" ? "Mark as rented" : "Mark as sold"}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="agent-listing-modal-button is-primary"
                                    onClick={() => {
                                        setViewing(null);
                                        handleEditListing({ request, property });
                                    }}
                                >
                                    Edit listing
                                </button>
                            </footer>
                        </section>
                    </div>
                );
            })()}
        </div>
    );
}

export default AgentListings;
