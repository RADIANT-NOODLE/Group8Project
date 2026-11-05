
import { photoSrc } from "../../services/propertyApi";
import React, { useEffect, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import PropertyTabs from "../Dashboards/shared/PropertyTabs";
import {
    getProperties,
    updateProperty,
} from "../../data/propertyStorage";
import "./PropertyApprovals.css";
import { showConfirm, showAlert } from "../../components/AppDialog";
import { getStoredUser } from "../../services/session";
import StageSummary from "../../components/StageSummary";

/* =========================================================
   PROPERTY APPROVALS ICONS
========================================================= */

const Icon = ({ type }) => {
    const icons = {
        approval: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m5 12 4 4L19 6" />
            </>
        ),
        pending: (
            <>
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        published: (
            <>
                <circle cx="12" cy="12" r="8.5" />
                <path d="m8 12 2.7 2.7L16.5 9" />
            </>
        ),
        changes: (
            <>
                <path d="M5 7h11" />
                <path d="m13 4 3 3-3 3" />
                <path d="M19 17H8" />
                <path d="m11 14-3 3 3 3" />
            </>
        ),
        rejected: (
            <>
                <circle cx="12" cy="12" r="8.5" />
                <path d="m9 9 6 6M15 9l-6 6" />
            </>
        ),
        close: <path d="m7 7 10 10M17 7 7 17" />,
        photo: (
            <>
                <rect x="4" y="5" width="16" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.5" />
                <path d="m5 17 4.5-4 3 2.5 2-2 4.5 4" />
            </>
        ),
        check: <path d="m5 12 4 4L19 6" />,
    };

    return (
        <span className="property-approvals-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
                {icons[type] || icons.approval}
            </svg>
        </span>
    );
};

/* =========================================================
   PROPERTY APPROVALS
========================================================= */

function PropertyApprovals() {
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    // which list the table shows: submissions waiting for review, or approved (published) listings
    const [view, setView] = useState("pending");
    const [reviewMessage, setReviewMessage] = useState("");
    const [message, setMessage] = useState("");

    /* Load properties */
    useEffect(() => {
        const loadProperties = () => {
            setProperties(getProperties());
        };

        loadProperties();

        const handleStorage = (event) => {
            if (
                !event.key ||
                event.key === "valoraProperties"
            ) {
                loadProperties();
            }
        };

        const handlePropertiesUpdated = () => loadProperties();

        window.addEventListener("storage", handleStorage);
        window.addEventListener(
            "valoraPropertiesUpdated",
            handlePropertiesUpdated
        );

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(
                "valoraPropertiesUpdated",
                handlePropertiesUpdated
            );
        };
    }, []);

    const user = (() => {
        try {
            const parsed = (getStoredUser() || {});

            const name =
                parsed.name ||
                parsed.fullName ||
                parsed.username ||
                `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() ||
                "HOA Admin";

            const rawRole =
                parsed.role ||
                parsed.userRole ||
                parsed.accountType ||
                "HOA Admin";

            const role =
                typeof rawRole === "string" &&
                ["hoa", "hoa admin"].includes(rawRole.toLowerCase())
                    ? "HOA Admin"
                    : rawRole;

            const initials =
                parsed.initials ||
                name
                    .split(" ")
                    .filter(Boolean)
                    .map((word) => word[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

            return { ...parsed, name, role, initials };
        } catch {
            return {
                name: "HOA Admin",
                role: "HOA Admin",
                initials: "HA",
            };
        }
    })();

    const pendingProperties = properties.filter((property) => {
        const listing = property.listing || {};

        return (
            listing.listingStatus === "Pending HOA Approval" ||
            listing.hoaApprovalStatus === "Pending Review"
        );
    });

    const getStatus = (property) =>
        property.listing?.listingStatus || "Not Listed";

    const getListingType = (property) =>
        property.listing?.listingType || "Not specified";

    const getPrice = (property) => {
        const listing = property.listing || {};

        if (listing.listingType === "For Sale") {
            return listing.askingPrice
                ? `R${Number(listing.askingPrice).toLocaleString()}`
                : "Not specified";
        }

        if (listing.listingType === "For Rent") {
            return listing.rentalPrice
                ? `R${Number(listing.rentalPrice).toLocaleString()} / month`
                : "Not specified";
        }

        return "Not specified";
    };

    const handleReview = (property) => {
        setSelectedProperty(property);
        setReviewMessage(property.listing?.hoaReviewMessage || "");
        setMessage("");
    };

    const handleCloseReview = () => {
        setSelectedProperty(null);
        setReviewMessage("");
    };

    const updatePropertyInState = (updatedProperty) => {
        if (!updatedProperty) return;

        setProperties((current) =>
            current.map((item) =>
                item.id === updatedProperty.id
                    ? updatedProperty
                    : item
            )
        );

        window.dispatchEvent(
            new Event("valoraPropertiesUpdated")
        );
    };

    /* Approve and publish a listing */
    const handleApprove = async (property) => {
        const listing = property.listing || {};

        if (!listing.assignedAgentId && !listing.assignedAgentName) {
            showAlert(
                "This listing cannot be published because no Estate Agent has been assigned to the property."
            );
            return;
        }

        const isPending =
            listing.listingStatus === "Pending HOA Approval" ||
            listing.hoaApprovalStatus === "Pending Review";

        if (!isPending) {
            showAlert(
                "This property is no longer awaiting HOA approval."
            );
            return;
        }

        if (
            !await showConfirm(
                `Approve the listing and submitted photographs for ${property.unitNumber}?`
            )
        ) {
            return;
        }

        const existingImages = Array.isArray(property.images)
            ? property.images
            : [];

        const pendingImages = Array.isArray(property.pendingImages)
            ? property.pendingImages
            : [];

        const removals = Array.isArray(listing.pendingPhotoRemovals)
            ? listing.pendingPhotoRemovals
            : [];

        const removalIds = new Set(
            removals
                .map((item) =>
                    typeof item === "string" ? item : item?.id
                )
                .filter(Boolean)
        );

        const remainingImages = existingImages.filter((image) => {
            const imageId =
                typeof image === "string" ? image : image?.id;

            return !removalIds.has(imageId);
        });

        const existingImageIds = new Set(
            remainingImages
                .map((image) =>
                    typeof image === "string" ? image : image?.id
                )
                .filter(Boolean)
        );

        const newImages = pendingImages.filter((image) => {
            if (!image?.id) return true;
            return !existingImageIds.has(image.id);
        });

        const updatedProperty = updateProperty(property.id, {
            images: [...remainingImages, ...newImages],
            pendingImages: [],
            listing: {
                ...listing,
                listingStatus: "Published",
                hoaApprovalStatus: "Approved",
                hoaReviewMessage: "",
                pendingPhotoRemovals: [],
                lastApprovedAt: new Date().toISOString(),
                lastApprovedBy: user.name,
            },
        });

        updatePropertyInState(updatedProperty);
        setSelectedProperty(null);
        setReviewMessage("");
        setMessage(
            `${property.unitNumber} has been approved and published. The approved photographs are now public.`
        );
    };

    /* Request changes from the Estate Agent */
    const handleRequestChanges = (property) => {
        const reason = reviewMessage.trim();

        if (!reason) {
            showAlert(
                "Please enter a reason or instruction for the Estate Agent."
            );
            return;
        }

        const updatedProperty = updateProperty(property.id, {
            listing: {
                ...(property.listing || {}),
                listingStatus: "Changes Requested",
                hoaApprovalStatus: "Changes Requested",
                hoaReviewMessage: reason,
                lastReviewedAt: new Date().toISOString(),
                lastReviewedBy: user.name,
            },
        });

        updatePropertyInState(updatedProperty);
        setSelectedProperty(null);
        setReviewMessage("");
        setMessage(
            `Changes have been requested for ${property.unitNumber}. The Estate Agent can now update the listing and resubmit it.`
        );
    };

    /* Reject a submission */
    const handleReject = async (property) => {
        const reason = reviewMessage.trim();

        if (!reason) {
            showAlert(
                "Please enter a reason before rejecting the submission."
            );
            return;
        }

        if (
            !await showConfirm(
                `Reject the listing submission for ${property.unitNumber}?`
            )
        ) {
            return;
        }

        const updatedProperty = updateProperty(property.id, {
            pendingImages: [],
            listing: {
                ...(property.listing || {}),
                listingStatus: "Rejected",
                hoaApprovalStatus: "Rejected",
                hoaReviewMessage: reason,
                pendingPhotoRemovals: [],
                lastReviewedAt: new Date().toISOString(),
                lastReviewedBy: user.name,
            },
        });

        updatePropertyInState(updatedProperty);
        setSelectedProperty(null);
        setReviewMessage("");
        setMessage(
            `${property.unitNumber} submission has been rejected. The property unit itself remains in VALORA.`
        );
    };

    const getImageSource = (image) =>
        typeof image === "string" ? image : image?.data || photoSrc(image?.url) || "";

    const approvedProperties = properties.filter(
        (property) =>
            property.listing?.listingStatus === "Published"
    );
    const publishedCount = approvedProperties.length;

    const shownProperties = view === "approved" ? approvedProperties : pendingProperties;
    const selectedIsPublished =
        selectedProperty?.listing?.listingStatus === "Published";

    const changesCount = properties.filter(
        (property) =>
            property.listing?.listingStatus === "Changes Requested"
    ).length;

    const rejectedCount = properties.filter(
        (property) =>
            property.listing?.listingStatus === "Rejected"
    ).length;

    return (
        <div className="property-approvals-layout">
            {/* Shared sidebar: consistent across all VALORA dashboards */}
            <DashboardSidebar suppliedUser={user} />

            <main className="property-approvals-main">
                <PropertyTabs />

                <header className="property-approvals-header">
                    <div>
                        <p className="property-approvals-eyebrow">
                            HOA ADMINISTRATION
                        </p>
                        <h2>Approved Properties</h2>
                        <p className="property-approvals-description">
                            Review Estate Agent listing submissions and see
                            the listings that are approved and live.
                        </p>
                    </div>

                    <div className="property-approvals-header-user">
                        <div className="property-approvals-header-avatar">
                            {user.initials}
                        </div>
                        <div>
                            <strong>{user.name}</strong>
                            <span>{user.role}</span>
                        </div>
                    </div>
                </header>

                {message && (
                    <div
                        className="property-approvals-message"
                        role="status"
                    >
                        <div className="property-approvals-message-icon">
                            <Icon type="check" />
                        </div>
                        <div>
                            <strong>Approval Update</strong>
                            <p>{message}</p>
                        </div>
                        <button
                            type="button"
                            className="property-approvals-dismiss"
                            onClick={() => setMessage("")}
                            aria-label="Dismiss message"
                        >
                            <Icon type="close" />
                        </button>
                    </div>
                )}

                <StageSummary
                    eyebrow="Listing approvals"
                    title={
                        pendingProperties.length === 0
                            ? "No submissions waiting for review"
                            : `${pendingProperties.length} ${pendingProperties.length === 1 ? "submission is" : "submissions are"} waiting for review`
                    }
                    subtitle="Estate agent listings, from submission to published."
                    stages={[
                        { key: "pending", label: "Pending review", hint: "Awaiting your decision", count: pendingProperties.length, tone: "waiting" },
                        { key: "published", label: "Published", hint: "Approved public listings", count: publishedCount, tone: "done" },
                        { key: "changes", label: "Changes requested", hint: "Returned to agents", count: changesCount, tone: "changes" },
                        { key: "rejected", label: "Rejected", hint: "Not approved", count: rejectedCount, tone: "rejected" },
                    ]}
                />

                <section className="property-approvals-card">
                    <div className="property-approvals-card-header">
                        <div>
                            <h3>
                                {view === "approved"
                                    ? "Approved Listings"
                                    : "Pending Property Submissions"}
                            </h3>
                            <p>
                                {view === "approved"
                                    ? "Listings the HOA has approved and published for the public."
                                    : "Review listing details and photographs submitted by Estate Agents."}
                            </p>
                        </div>

                        <div className="property-approvals-view-toggle" role="group" aria-label="Show listings">
                            <button
                                type="button"
                                className={view === "pending" ? "is-active" : undefined}
                                aria-pressed={view === "pending"}
                                onClick={() => setView("pending")}
                            >
                                Pending review
                                <span>{pendingProperties.length}</span>
                            </button>
                            <button
                                type="button"
                                className={view === "approved" ? "is-active" : undefined}
                                aria-pressed={view === "approved"}
                                onClick={() => setView("approved")}
                            >
                                Approved
                                <span>{publishedCount}</span>
                            </button>
                        </div>
                    </div>

                    <div className="property-approvals-table-wrapper">
                        <table className="property-approvals-table">
                            <thead>
                                <tr>
                                    <th>Unit</th>
                                    <th>Property Type</th>
                                    <th>Listing Type</th>
                                    <th>Price</th>
                                    <th className="center">Approved Photos</th>
                                    <th className="center">Pending Photos</th>
                                    <th className="right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shownProperties.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="property-approvals-empty"
                                        >
                                            <div className="property-approvals-empty-icon">
                                                <Icon type="published" />
                                            </div>
                                            <strong>
                                                {view === "approved"
                                                    ? "No approved listings yet"
                                                    : "No pending submissions"}
                                            </strong>
                                            <span>
                                                {view === "approved"
                                                    ? "Listings you approve and publish will appear here."
                                                    : "No property submissions are currently awaiting HOA approval."}
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    shownProperties.map((property) => (
                                        <tr key={property.id}>
                                            <td>
                                                <strong>
                                                    {property.unitNumber ||
                                                        "Unit not specified"}
                                                </strong>
                                                <small>{property.id}</small>
                                            </td>
                                            <td>
                                                {property.propertyType ||
                                                    "Not specified"}
                                            </td>
                                            <td>
                                                <span className="property-approvals-type-badge">
                                                    {getListingType(property)}
                                                </span>
                                            </td>
                                            <td className="price">
                                                {getPrice(property)}
                                            </td>
                                            <td className="center">
                                                {(property.images || []).length}
                                            </td>
                                            <td className="center">
                                                <span className="property-approvals-photo-count">
                                                    {(property.pendingImages || [])
                                                        .length}
                                                </span>
                                            </td>
                                            <td className="right">
                                                <button
                                                    type="button"
                                                    className="property-approvals-secondary-btn"
                                                    onClick={() =>
                                                        handleReview(property)
                                                    }
                                                >
                                                    <Icon type="approval" />
                                                    {view === "approved" ? "View" : "Review"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {selectedProperty && (
                    <section className="property-approvals-review-card">
                        <div className="property-approvals-card-header">
                            <div>
                                <p className="property-approvals-section-label">
                                    LISTING REVIEW
                                </p>
                                <h3>
                                    Review {selectedProperty.unitNumber}
                                </h3>
                                <p>
                                    {selectedProperty.propertyType}
                                    {" · "}
                                    {selectedProperty.floor || "Floor not specified"}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="property-approvals-close-btn"
                                onClick={handleCloseReview}
                            >
                                <Icon type="close" />
                                Close Review
                            </button>
                        </div>

                        <div className="property-approvals-sub-card">
                            <div className="property-approvals-sub-header">
                                <h3>Property Information</h3>
                            </div>
                            <div className="property-approvals-summary-list">
                                <div className="property-approvals-summary-row">
                                    <strong>Unit</strong>
                                    <span>{selectedProperty.unitNumber || "—"}</span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Property Type</strong>
                                    <span>{selectedProperty.propertyType || "—"}</span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Bedrooms</strong>
                                    <span>{selectedProperty.bedrooms ?? "—"}</span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Bathrooms</strong>
                                    <span>{selectedProperty.bathrooms ?? "—"}</span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Floor Area</strong>
                                    <span>
                                        {selectedProperty.floorArea ?? "—"} m²
                                    </span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Floor</strong>
                                    <span>{selectedProperty.floor || "—"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="property-approvals-sub-card">
                            <div className="property-approvals-sub-header">
                                <h3>Listing Information</h3>
                            </div>
                            <div className="property-approvals-summary-list">
                                <div className="property-approvals-summary-row">
                                    <strong>Listing Type</strong>
                                    <span>{getListingType(selectedProperty)}</span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Price</strong>
                                    <span>{getPrice(selectedProperty)}</span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Listing Status</strong>
                                    <span>{getStatus(selectedProperty)}</span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Owner</strong>
                                    <span>
                                        {selectedProperty.listing?.ownerName ||
                                            "Not specified"}
                                    </span>
                                </div>
                                <div className="property-approvals-summary-row">
                                    <strong>Assigned Agent</strong>
                                    <span>
                                        {selectedProperty.listing?.assignedAgentName ||
                                            "Not specified"}
                                    </span>
                                </div>
                            </div>

                            {selectedProperty.listing?.description && (
                                <div className="property-approvals-description-block">
                                    <strong>Description</strong>
                                    <p>{selectedProperty.listing.description}</p>
                                </div>
                            )}
                        </div>

                        {selectedProperty.listing?.hoaReviewMessage && (
                            <div className="property-approvals-sub-card">
                                <div className="property-approvals-sub-header">
                                    <div>
                                        <h3>Previous HOA Review</h3>
                                        <p>
                                            The most recent review instruction
                                            or decision.
                                        </p>
                                    </div>
                                </div>
                                <p className="property-approvals-review-message">
                                    {selectedProperty.listing.hoaReviewMessage}
                                </p>
                            </div>
                        )}

                        <div className="property-approvals-sub-card">
                            <div className="property-approvals-sub-header">
                                <div>
                                    <h3>Approved Photos</h3>
                                    <p>
                                        These photographs are already approved
                                        and publicly available.
                                    </p>
                                </div>
                                <span className="property-approvals-photo-heading-icon">
                                    <Icon type="photo" />
                                </span>
                            </div>

                            {(selectedProperty.images || []).length === 0 ? (
                                <div className="property-approvals-no-photos">
                                    No approved photographs.
                                </div>
                            ) : (
                                <div className="property-approvals-photo-grid">
                                    {selectedProperty.images.map((image, index) => (
                                        <div
                                            className="property-approvals-photo-item"
                                            key={image?.id || index}
                                        >
                                            <img
                                                src={getImageSource(image)}
                                                alt={`Approved property photo ${index + 1}`}
                                            />
                                            <span>
                                                Approved Photo {index + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="property-approvals-sub-card">
                            <div className="property-approvals-sub-header">
                                <div>
                                    <h3>Photos Awaiting Approval</h3>
                                    <p>
                                        Review these photographs before
                                        approving the listing.
                                    </p>
                                </div>
                                <span className="property-approvals-photo-heading-icon">
                                    <Icon type="pending" />
                                </span>
                            </div>

                            {(selectedProperty.pendingImages || []).length === 0 ? (
                                <div className="property-approvals-no-photos">
                                    No new photographs were submitted.
                                </div>
                            ) : (
                                <div className="property-approvals-photo-grid">
                                    {selectedProperty.pendingImages.map(
                                        (image, index) => (
                                            <div
                                                className="property-approvals-photo-item"
                                                key={image?.id || index}
                                            >
                                                <img
                                                    src={getImageSource(image)}
                                                    alt={`Pending property photo ${index + 1}`}
                                                />
                                                <span>
                                                    {image?.name ||
                                                        `Photo ${index + 1}`}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedIsPublished ? (
                            <p className="property-approvals-published-note">
                                This listing has been approved and is live for the public.
                            </p>
                        ) : (
                            <>
                            <div className="property-approvals-sub-card">
                                <div className="property-approvals-sub-header">
                                    <div>
                                        <h3>HOA Review</h3>
                                        <p>
                                            Add instructions if changes are required
                                            or if the submission should be rejected.
                                        </p>
                                    </div>
                                </div>
                                <textarea
                                    className="property-approvals-textarea"
                                    value={reviewMessage}
                                    onChange={(event) =>
                                        setReviewMessage(event.target.value)
                                    }
                                    rows={5}
                                    placeholder="Enter review notes, requested changes, or rejection reason..."
                                />
                            </div>

                            <div className="property-approvals-actions">
                                <button
                                    type="button"
                                    className="property-approvals-primary-btn"
                                    onClick={() => handleApprove(selectedProperty)}
                                >
                                    <Icon type="check" />
                                    Approve &amp; Publish
                                </button>
                                <button
                                    type="button"
                                    className="property-approvals-secondary-btn"
                                    onClick={() =>
                                        handleRequestChanges(selectedProperty)
                                    }
                                >
                                    <Icon type="changes" />
                                    Request Changes
                                </button>
                                <button
                                    type="button"
                                    className="property-approvals-danger-btn"
                                    onClick={() => handleReject(selectedProperty)}
                                >
                                    <Icon type="rejected" />
                                    Reject Submission
                                </button>
                            </div>
                            </>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

export default PropertyApprovals;
