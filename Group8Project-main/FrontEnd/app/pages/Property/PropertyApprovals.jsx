import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getProperties,
    updateProperty,
} from "../../data/propertyStorage";
import * as authService from "../../services/authService.js";
import { useSession } from "../../services/session.js";
import ConfirmPrompt from "../../components/ConfirmPrompt";
import InlineMessage from "../../components/InlineMessage";
import "./PropertyApprovals.css";


/* =========================================================
   PROFESSIONAL ICONS
========================================================= */

const Icon = ({ type }) => {

    const icons = {

        dashboard: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
        ),

        residents: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9" cy="8" r="3" />
                <path d="M3.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M15 14.5c2.6.1 4.2 1.6 4.8 4.5" />
            </svg>
        ),

        complaint: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.5 20 7v5.5c0 4.2-3.1 7-8 8-4.9-1-8-3.8-8-8V7l8-3.5Z" />
                <path d="M12 8v4.5" />
                <circle cx="12" cy="16" r=".7" fill="currentColor" stroke="none" />
            </svg>
        ),

        maintenance: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14.5 5.5 4-2 2 2-2 4" />
                <path d="m17 8-8.5 8.5" />
                <path d="M6.5 20.5a2.5 2.5 0 1 1 0-5l2 2a2.5 2.5 0 0 1-2 3Z" />
                <path d="m14 4 6 6" />
            </svg>
        ),

        provider: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.5 19.5 12 12 20.5 4.5 12 12 3.5Z" />
                <circle cx="12" cy="12" r="2" />
            </svg>
        ),

        announcement: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 10h4l9-4v12l-9-4H4v-4Z" />
                <path d="M8 14.5 9.5 20h3L11 15" />
                <path d="M19 9.5c.7.7 1 1.5 1 2.5s-.3 1.8-1 2.5" />
            </svg>
        ),

        approval: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
                <circle cx="12" cy="12" r="9" />
            </svg>
        ),

        profile: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" />
            </svg>
        ),

        logout: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 5H5v14h5" />
                <path d="M13 8l4 4-4 4" />
                <path d="M8 12h9" />
            </svg>
        ),

        pending: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7v5l3 2" />
            </svg>
        ),

        published: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="m8 12 2.7 2.7L16.5 9" />
            </svg>
        ),

        changes: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7h11" />
                <path d="m13 4 3 3-3 3" />
                <path d="M19 17H8" />
                <path d="m11 14-3 3 3 3" />
            </svg>
        ),

        rejected: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="m9 9 6 6M15 9l-6 6" />
            </svg>
        ),

        close: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" />
            </svg>
        ),

        photo: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="5" width="16" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.5" />
                <path d="m5 17 4.5-4 3 2.5 2-2 4.5 4" />
            </svg>
        ),

        check: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
            </svg>
        ),

        alert: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 4 8 15H4L12 4Z" />
                <path d="M12 9v4" />
                <circle
                    cx="12"
                    cy="16"
                    r=".7"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
        ),

    };

    return (
        <span className="property-approvals-icon">
            {icons[type] || icons.dashboard}
        </span>
    );

};


/* =========================================================
   GET CURRENT USER
========================================================= */



/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
    user,
    handleLogout,
}) {

    return (

        <aside className="property-approvals-sidebar">

            <div className="property-approvals-brand">

                <img
                    src="/assets/valora-logo.svg"
                    alt="VALORA"
                />

                <div>
                    <strong>
                        VALORA
                    </strong>

                    <span>
                        COMMUNITY PLATFORM
                    </span>
                </div>

            </div>


            <div className="property-approvals-profile">

                <div className="property-approvals-avatar">
                    {user.initials}
                </div>

                <div className="property-approvals-profile-details">

                    <strong>
                        {user.name}
                    </strong>

                    <span>
                        {user.roleLabel}
                    </span>

                </div>

            </div>


            <nav className="property-approvals-navigation">

                <div className="property-approvals-nav-title">
                    ADMINISTRATION
                </div>


                <Link
                    to="/dashboard"
                    className="property-approvals-nav-link"
                >
                    <Icon type="dashboard" />
                    <span>Dashboard</span>
                </Link>


                <Link
                    to="/registration-requests"
                    className="property-approvals-nav-link"
                >
                    <Icon type="approval" />
                    <span>Registration Requests</span>
                </Link>


                <Link
                    to="/resident-directory"
                    className="property-approvals-nav-link"
                >
                    <Icon type="residents" />
                    <span>Resident Directory</span>
                </Link>


                <Link
                    to="/resident-complaints"
                    className="property-approvals-nav-link"
                >
                    <Icon type="complaint" />
                    <span>Resident Complaints</span>
                </Link>


                <Link
                    to="/property-approvals"
                    className="property-approvals-nav-link active"
                >
                    <Icon type="approval" />
                    <span>Property Approvals</span>
                </Link>


                <Link
                    to="/maintenance"
                    className="property-approvals-nav-link"
                >
                    <Icon type="maintenance" />
                    <span>Maintenance</span>
                </Link>


                <Link
                    to="/announcements"
                    className="property-approvals-nav-link"
                >
                    <Icon type="announcement" />
                    <span>Community Announcements</span>
                </Link>


                <Link
                    to="/community-analytics"
                    className="property-approvals-nav-link"
                >
                    <Icon type="provider" />
                    <span>Community Analytics</span>
                </Link>


                <div className="property-approvals-nav-title second">
                    ACCOUNT
                </div>


                <Link
                    to="/profile"
                    className="property-approvals-nav-link"
                >
                    <Icon type="profile" />
                    <span>My Profile</span>
                </Link>

            </nav>


            <button
                className="property-approvals-logout"
                onClick={handleLogout}
            >
                <Icon type="logout" />
                <span>Logout</span>
            </button>

        </aside>

    );

}


/* =========================================================
   PROPERTY APPROVALS
========================================================= */

function PropertyApprovals() {

    const navigate =
        useNavigate();


    const [properties, setProperties] =
        useState([]);

    const [selectedProperty, setSelectedProperty] =
        useState(null);

    const [reviewMessage, setReviewMessage] =
        useState("");

    const [message, setMessage] =
        useState("");


    /* Blocked actions and confirmations used to be browser
       dialogs (alert/confirm). They are now inline state. */

    const [notice, setNotice] =
        useState("");

    const [pendingAction, setPendingAction] =
        useState(null);


    /* =========================================================
       LOAD PROPERTIES
    ========================================================= */

    useEffect(() => {

        const storedProperties =
            getProperties();

        setProperties(
            storedProperties
        );

    }, []);


    const { user } =
        useSession();


    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleLogout = () => {

        authService.logout();

        authService.logout();

        authService.logout();

        navigate("/");

    };


    /* =========================================================
       PENDING PROPERTIES
    ========================================================= */

    const pendingProperties =
        properties.filter(
            (property) => {

                const listing =
                    property.listing || {};

                return (
                    listing.listingStatus ===
                        "Pending HOA Approval" ||
                    listing.hoaApprovalStatus ===
                        "Pending Review"
                );

            }
        );


    /* =========================================================
       GET PROPERTY STATUS
    ========================================================= */

    const getStatus = (
        property
    ) => {

        return (
            property.listing
                ?.listingStatus ||
            "Not Listed"
        );

    };


    /* =========================================================
       GET LISTING TYPE
    ========================================================= */

    const getListingType = (
        property
    ) => {

        return (
            property.listing
                ?.listingType ||
            "Not specified"
        );

    };


    /* =========================================================
       GET PRICE
    ========================================================= */

    const getPrice = (
        property
    ) => {

        const listing =
            property.listing || {};

        if (
            listing.listingType ===
            "For Sale"
        ) {

            return listing.askingPrice
                ? `R${Number(
                    listing.askingPrice
                ).toLocaleString()}`
                : "Not specified";

        }

        if (
            listing.listingType ===
            "For Rent"
        ) {

            return listing.rentalPrice
                ? `R${Number(
                    listing.rentalPrice
                ).toLocaleString()} / month`
                : "Not specified";

        }

        return "Not specified";

    };


    /* =========================================================
       SELECT PROPERTY FOR REVIEW
    ========================================================= */

    const handleReview = (
        property
    ) => {

        setSelectedProperty(
            property
        );

        setReviewMessage(
            property.listing
                ?.hoaReviewMessage ||
            ""
        );

        setMessage("");

    };


    /* =========================================================
       CLOSE REVIEW
    ========================================================= */

    const handleCloseReview = () => {

        setSelectedProperty(
            null
        );

        setReviewMessage("");

    };


    /* =========================================================
       UPDATE PROPERTY IN STATE
    ========================================================= */

    const updatePropertyInState = (
        updatedProperty
    ) => {

        if (!updatedProperty) {
            return;
        }

        setProperties(
            (currentProperties) =>
                currentProperties.map(
                    (item) =>
                        item.id ===
                        updatedProperty.id
                            ? updatedProperty
                            : item
                )
        );

    };


    /* =========================================================
       APPROVE PROPERTY
    ========================================================= */

    const requestApprove = (
        property
    ) => {

        const listing =
            property.listing || {};


        if (
            !listing.assignedAgentId &&
            !listing.assignedAgentName
        ) {

            setNotice(
                "This listing cannot be published because no Estate Agent has been assigned to the property."
            );

            return;

        }


        const isPending =
            listing.listingStatus ===
                "Pending HOA Approval" ||
            listing.hoaApprovalStatus ===
                "Pending Review";

        if (!isPending) {

            setNotice(
                "This property is no longer awaiting HOA approval."
            );

            return;

        }


        setNotice("");

        setPendingAction({
            type: "approve",
            property,
        });

    };


    const confirmApprove = () => {

        const property =
            pendingAction.property;

        setPendingAction(null);


        const existingImages =
            Array.isArray(
                property.images
            )
                ? property.images
                : [];

        const pendingImages =
            Array.isArray(
                property.pendingImages
            )
                ? property.pendingImages
                : [];


        /* =====================================================
           REMOVE PHOTOS MARKED FOR REMOVAL
        ===================================================== */

        const pendingPhotoRemovals =
            Array.isArray(
                listing.pendingPhotoRemovals
            )
                ? listing.pendingPhotoRemovals
                : [];


        const removalIds =
            new Set(
                pendingPhotoRemovals
                    .map(
                        (item) =>
                            typeof item === "string"
                                ? item
                                : item?.id
                    )
                    .filter(Boolean)
            );


        const remainingApprovedImages =
            existingImages.filter(
                (image) => {

                    const imageId =
                        typeof image === "string"
                            ? image
                            : image?.id;

                    return !removalIds.has(
                        imageId
                    );

                }
            );


        const existingImageIds =
            new Set(
                remainingApprovedImages
                    .map(
                        (image) =>
                            image?.id
                    )
                    .filter(Boolean)
            );


        const newApprovedImages =
            pendingImages.filter(
                (image) => {

                    if (!image?.id) {
                        return true;
                    }

                    return !existingImageIds.has(
                        image.id
                    );

                }
            );


        const approvedImages = [
            ...remainingApprovedImages,
            ...newApprovedImages,
        ];


        /* =====================================================
           UPDATE LISTING
        ===================================================== */

        const updatedProperty =
            updateProperty(
                property.id,
                {
                    images:
                        approvedImages,

                    pendingImages:
                        [],

                    listing: {
                        ...listing,

                        listingStatus:
                            "Published",

                        hoaApprovalStatus:
                            "Approved",

                        hoaReviewMessage:
                            "",

                        pendingPhotoRemovals:
                            [],

                        lastApprovedAt:
                            new Date().toISOString(),

                        lastApprovedBy:
                            user.name,
                    },
                }
            );


        updatePropertyInState(
            updatedProperty
        );


        setSelectedProperty(
            null
        );

        setReviewMessage("");


        setMessage(
            `${property.unitNumber} has been approved and published. The approved photographs are now public.`
        );

    };


    /* =========================================================
       REQUEST CHANGES
    ========================================================= */

    const handleRequestChanges = (
        property
    ) => {

        const reason =
            reviewMessage.trim();


        if (!reason) {

            setNotice(
                "Please enter a reason or instruction for the Estate Agent."
            );

            return;

        }


        setNotice("");


        const updatedProperty =
            updateProperty(
                property.id,
                {
                    listing: {
                        ...(property.listing ||
                            {}),

                        listingStatus:
                            "Changes Requested",

                        hoaApprovalStatus:
                            "Changes Requested",

                        hoaReviewMessage:
                            reason,

                        lastReviewedAt:
                            new Date().toISOString(),

                        lastReviewedBy:
                            user.name,
                    },
                }
            );


        updatePropertyInState(
            updatedProperty
        );


        setSelectedProperty(
            null
        );

        setReviewMessage("");


        setMessage(
            `Changes have been requested for ${property.unitNumber}. The Estate Agent can now update the listing and resubmit it.`
        );

    };


    /* =========================================================
       REJECT SUBMISSION
    ========================================================= */

    const handleReject = (
        property
    ) => {

        const reason =
            reviewMessage.trim();


        if (!reason) {

            setNotice(
                "Please enter a reason before rejecting the submission."
            );

            return;

        }


        setNotice("");

        setPendingAction({
            type: "reject",
            property,
            reason,
        });

    };


    const confirmReject = () => {

        const property =
            pendingAction.property;

        const reason =
            pendingAction.reason;

        setPendingAction(null);


        const updatedProperty =
            updateProperty(
                property.id,
                {
                    pendingImages:
                        [],

                    listing: {
                        ...(property.listing ||
                            {}),

                        listingStatus:
                            "Rejected",

                        hoaApprovalStatus:
                            "Rejected",

                        hoaReviewMessage:
                            reason,

                        pendingPhotoRemovals:
                            [],

                        lastReviewedAt:
                            new Date().toISOString(),

                        lastReviewedBy:
                            user.name,
                    },
                }
            );


        updatePropertyInState(
            updatedProperty
        );


        setSelectedProperty(
            null
        );

        setReviewMessage("");


        setMessage(
            `${property.unitNumber} submission has been rejected. The property unit itself remains in VALORA.`
        );

    };


    /* =========================================================
       RENDER IMAGE
    ========================================================= */

    const getImageSource = (
        image
    ) => {

        if (
            typeof image ===
            "string"
        ) {

            return image;

        }

        return image?.data || "";

    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="property-approvals-layout">

            <Sidebar
                user={user}
                handleLogout={handleLogout}
            />


            <main className="property-approvals-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="property-approvals-header">

                    <div>

                        <p className="property-approvals-eyebrow">
                            HOA ADMINISTRATION
                        </p>

                        <h2>
                            Property Approvals
                        </h2>

                        <p className="property-approvals-description">
                            Review Estate Agent listing submissions
                            before they become public.
                        </p>

                    </div>


                    <div className="property-approvals-header-user">

                        <div className="property-approvals-header-avatar">
                            {user.initials}
                        </div>

                        <div>

                            <strong>
                                {user.name}
                            </strong>

                            <span>
                                {user.roleLabel}
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                {/* Blocked actions that start from the list render here;
                    the review panel renders the same message next to its
                    own buttons, so this one stays out of the way. */}

                {!selectedProperty && (

                    <InlineMessage tone="error">
                        {notice}
                    </InlineMessage>

                )}


                {message && (

                    <div className="property-approvals-message">

                        <div className="property-approvals-message-icon">
                            <Icon type="check" />
                        </div>

                        <div>

                            <strong>
                                Approval Update
                            </strong>

                            <p>
                                {message}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <div className="property-approvals-stats">

                    <div className="property-approvals-stat-card">

                        <div className="property-approvals-stat-top">

                            <span className="property-approvals-stat-icon pending">
                                <Icon type="pending" />
                            </span>

                            <span className="property-approvals-stat-label">
                                Pending Review
                            </span>

                        </div>

                        <strong className="property-approvals-stat-number">
                            {pendingProperties.length}
                        </strong>

                        <p>
                            Property submissions awaiting review
                        </p>

                    </div>


                    <div className="property-approvals-stat-card">

                        <div className="property-approvals-stat-top">

                            <span className="property-approvals-stat-icon published">
                                <Icon type="published" />
                            </span>

                            <span className="property-approvals-stat-label">
                                Published
                            </span>

                        </div>

                        <strong className="property-approvals-stat-number">
                            {
                                properties.filter(
                                    (property) =>
                                        property.listing
                                            ?.listingStatus ===
                                        "Published"
                                ).length
                            }
                        </strong>

                        <p>
                            Approved public listings
                        </p>

                    </div>


                    <div className="property-approvals-stat-card">

                        <div className="property-approvals-stat-top">

                            <span className="property-approvals-stat-icon changes">
                                <Icon type="changes" />
                            </span>

                            <span className="property-approvals-stat-label">
                                Changes Requested
                            </span>

                        </div>

                        <strong className="property-approvals-stat-number">
                            {
                                properties.filter(
                                    (property) =>
                                        property.listing
                                            ?.listingStatus ===
                                        "Changes Requested"
                                ).length
                            }
                        </strong>

                        <p>
                            Listings returned to agents
                        </p>

                    </div>


                    <div className="property-approvals-stat-card">

                        <div className="property-approvals-stat-top">

                            <span className="property-approvals-stat-icon rejected">
                                <Icon type="rejected" />
                            </span>

                            <span className="property-approvals-stat-label">
                                Rejected
                            </span>

                        </div>

                        <strong className="property-approvals-stat-number">
                            {
                                properties.filter(
                                    (property) =>
                                        property.listing
                                            ?.listingStatus ===
                                        "Rejected"
                                ).length
                            }
                        </strong>

                        <p>
                            Rejected submissions
                        </p>

                    </div>

                </div>


                {/* =================================================
                    PENDING SUBMISSIONS
                ================================================= */}

                <section className="property-approvals-card">

                    <div className="property-approvals-card-header">

                        <div>

                            <h3>
                                Pending Property Submissions
                            </h3>

                            <p>
                                Review listing details and photographs
                                submitted by Estate Agents.
                            </p>

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
                                    <th className="center">
                                        Approved Photos
                                    </th>
                                    <th className="center">
                                        Pending Photos
                                    </th>
                                    <th className="right">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {pendingProperties.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="property-approvals-empty"
                                        >

                                            <div className="property-approvals-empty-icon">
                                                <Icon type="published" />
                                            </div>

                                            <strong>
                                                No pending submissions
                                            </strong>

                                            <span>
                                                No property submissions
                                                are currently awaiting
                                                HOA approval.
                                            </span>

                                        </td>

                                    </tr>

                                ) : (

                                    pendingProperties.map(
                                        (property) => (

                                            <tr
                                                key={
                                                    property.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            property.unitNumber
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            property.id
                                                        }
                                                    </small>

                                                </td>


                                                <td>
                                                    {
                                                        property.propertyType
                                                    }
                                                </td>


                                                <td>
                                                    <span className="property-approvals-type-badge">
                                                        {
                                                            getListingType(
                                                                property
                                                            )
                                                        }
                                                    </span>
                                                </td>


                                                <td className="price">
                                                    {
                                                        getPrice(
                                                            property
                                                        )
                                                    }
                                                </td>


                                                <td className="center">
                                                    {
                                                        (
                                                            property.images ||
                                                            []
                                                        ).length
                                                    }
                                                </td>


                                                <td className="center">

                                                    <span className="property-approvals-photo-count">
                                                        {
                                                            (
                                                                property.pendingImages ||
                                                                []
                                                            ).length
                                                        }
                                                    </span>

                                                </td>


                                                <td className="right">

                                                    <button
                                                        className="property-approvals-secondary-btn"
                                                        onClick={() =>
                                                            handleReview(
                                                                property
                                                            )
                                                        }
                                                    >
                                                        <Icon type="approval" />
                                                        Review
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


                {/* =================================================
                    REVIEW PANEL
                ================================================= */}

                {selectedProperty && (

                    <section className="property-approvals-review-card">

                        <div className="property-approvals-card-header">

                            <div>

                                <p className="property-approvals-section-label">
                                    LISTING REVIEW
                                </p>

                                <h3>
                                    Review{" "}
                                    {selectedProperty.unitNumber}
                                </h3>

                                <p>
                                    {selectedProperty.propertyType}
                                    {" · "}
                                    {selectedProperty.floor}
                                </p>

                            </div>


                            <button
                                className="property-approvals-close-btn"
                                onClick={
                                    handleCloseReview
                                }
                            >
                                <Icon type="close" />
                                Close Review
                            </button>

                        </div>


                        {/* =================================================
                            PROPERTY INFORMATION
                        ================================================= */}

                        <div className="property-approvals-sub-card">

                            <div className="property-approvals-sub-header">

                                <div>
                                    <h3>
                                        Property Information
                                    </h3>
                                </div>

                            </div>


                            <div className="property-approvals-summary-list">

                                <div className="property-approvals-summary-row">
                                    <strong>Unit</strong>
                                    <span>
                                        {
                                            selectedProperty.unitNumber
                                        }
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Property Type</strong>
                                    <span>
                                        {
                                            selectedProperty.propertyType
                                        }
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Bedrooms</strong>
                                    <span>
                                        {
                                            selectedProperty.bedrooms
                                        }
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Bathrooms</strong>
                                    <span>
                                        {
                                            selectedProperty.bathrooms
                                        }
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Floor Area</strong>
                                    <span>
                                        {
                                            selectedProperty.floorArea
                                        }{" "}
                                        m²
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Floor</strong>
                                    <span>
                                        {
                                            selectedProperty.floor
                                        }
                                    </span>
                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            LISTING INFORMATION
                        ================================================= */}

                        <div className="property-approvals-sub-card">

                            <div className="property-approvals-sub-header">

                                <div>
                                    <h3>
                                        Listing Information
                                    </h3>
                                </div>

                            </div>


                            <div className="property-approvals-summary-list">

                                <div className="property-approvals-summary-row">
                                    <strong>Listing Type</strong>
                                    <span>
                                        {
                                            getListingType(
                                                selectedProperty
                                            )
                                        }
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Price</strong>
                                    <span>
                                        {
                                            getPrice(
                                                selectedProperty
                                            )
                                        }
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Listing Status</strong>
                                    <span>
                                        {
                                            getStatus(
                                                selectedProperty
                                            )
                                        }
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Owner</strong>
                                    <span>
                                        {
                                            selectedProperty
                                                .listing
                                                ?.ownerName ||
                                            "Not specified"
                                        }
                                    </span>
                                </div>


                                <div className="property-approvals-summary-row">
                                    <strong>Assigned Agent</strong>
                                    <span>
                                        {
                                            selectedProperty
                                                .listing
                                                ?.assignedAgentName ||
                                            "Not specified"
                                        }
                                    </span>
                                </div>

                            </div>


                            {selectedProperty
                                .listing
                                ?.description && (

                                <div className="property-approvals-description-block">

                                    <strong>
                                        Description
                                    </strong>

                                    <p>
                                        {
                                            selectedProperty
                                                .listing
                                                .description
                                        }
                                    </p>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            PREVIOUS HOA REVIEW
                        ================================================= */}

                        {selectedProperty
                            .listing
                            ?.hoaReviewMessage && (

                            <div className="property-approvals-sub-card">

                                <div className="property-approvals-sub-header">

                                    <div>

                                        <h3>
                                            Previous HOA Review
                                        </h3>

                                        <p>
                                            The most recent review
                                            instruction or decision.
                                        </p>

                                    </div>

                                </div>

                                <p className="property-approvals-review-message">
                                    {
                                        selectedProperty
                                            .listing
                                            .hoaReviewMessage
                                    }
                                </p>

                            </div>

                        )}


                        {/* =================================================
                            APPROVED PHOTOS
                        ================================================= */}

                        <div className="property-approvals-sub-card">

                            <div className="property-approvals-sub-header">

                                <div>

                                    <h3>
                                        Approved Photos
                                    </h3>

                                    <p>
                                        These photographs are already
                                        approved and publicly available.
                                    </p>

                                </div>

                                <span className="property-approvals-photo-heading-icon">
                                    <Icon type="photo" />
                                </span>

                            </div>


                            {(
                                selectedProperty.images ||
                                []
                            ).length === 0 ? (

                                <div className="property-approvals-no-photos">
                                    No approved photographs.
                                </div>

                            ) : (

                                <div className="property-approvals-photo-grid">

                                    {selectedProperty.images.map(
                                        (
                                            image,
                                            index
                                        ) => (

                                            <div
                                                className="property-approvals-photo-item"
                                                key={
                                                    image?.id ||
                                                    index
                                                }
                                            >

                                                <img
                                                    src={
                                                        getImageSource(
                                                            image
                                                        )
                                                    }
                                                    alt={
                                                        `Approved property photo ${
                                                            index +
                                                            1
                                                        }`
                                                    }
                                                />

                                                <span>
                                                    Approved Photo{" "}
                                                    {index + 1}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            PENDING PHOTOS
                        ================================================= */}

                        <div className="property-approvals-sub-card">

                            <div className="property-approvals-sub-header">

                                <div>

                                    <h3>
                                        Photos Awaiting Approval
                                    </h3>

                                    <p>
                                        Review these photographs before
                                        approving the listing.
                                    </p>

                                </div>

                                <span className="property-approvals-photo-heading-icon">
                                    <Icon type="pending" />
                                </span>

                            </div>


                            {(
                                selectedProperty.pendingImages ||
                                []
                            ).length === 0 ? (

                                <div className="property-approvals-no-photos">
                                    No new photographs were submitted.
                                </div>

                            ) : (

                                <div className="property-approvals-photo-grid">

                                    {selectedProperty.pendingImages.map(
                                        (
                                            image,
                                            index
                                        ) => (

                                            <div
                                                className="property-approvals-photo-item"
                                                key={
                                                    image?.id ||
                                                    index
                                                }
                                            >

                                                <img
                                                    src={
                                                        getImageSource(
                                                            image
                                                        )
                                                    }
                                                    alt={
                                                        `Pending property photo ${
                                                            index +
                                                            1
                                                        }`
                                                    }
                                                />

                                                <span>
                                                    {
                                                        image?.name ||
                                                        `Photo ${
                                                            index +
                                                            1
                                                        }`
                                                    }
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            HOA REVIEW
                        ================================================= */}

                        <div className="property-approvals-sub-card">

                            <div className="property-approvals-sub-header">

                                <div>

                                    <h3>
                                        HOA Review
                                    </h3>

                                    <p>
                                        Add instructions if changes are
                                        required or if the submission
                                        should be rejected.
                                    </p>

                                </div>

                            </div>


                            <textarea
                                className="property-approvals-textarea"
                                value={
                                    reviewMessage
                                }
                                onChange={(
                                    event
                                ) =>
                                    setReviewMessage(
                                        event.target.value
                                    )
                                }
                                rows="5"
                                placeholder="Enter review notes, requested changes, or rejection reason..."
                            />


                            <InlineMessage tone="error">
                                {notice}
                            </InlineMessage>

                        </div>


                        {/* =================================================
                            CONFIRMATION
                        ================================================= */}

                        <ConfirmPrompt
                            open={Boolean(pendingAction)}
                            tone={
                                pendingAction?.type === "reject"
                                    ? "danger"
                                    : "neutral"
                            }
                            title={
                                pendingAction?.type === "reject"
                                    ? "Reject this submission?"
                                    : "Approve and publish this listing?"
                            }
                            description={
                                pendingAction?.type === "reject"
                                    ? `Reject the listing submission for ${pendingAction?.property?.unitNumber ?? ""}? The unit itself stays in VALORA.`
                                    : `Approve the listing and submitted photographs for ${pendingAction?.property?.unitNumber ?? ""}?`
                            }
                            confirmLabel={
                                pendingAction?.type === "reject"
                                    ? "Reject submission"
                                    : "Approve & publish"
                            }
                            onConfirm={
                                pendingAction?.type === "reject"
                                    ? confirmReject
                                    : confirmApprove
                            }
                            onCancel={() =>
                                setPendingAction(null)
                            }
                        />


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="property-approvals-actions">

                            <button
                                className="property-approvals-primary-btn"
                                onClick={() =>
                                    requestApprove(
                                        selectedProperty
                                    )
                                }
                            >
                                <Icon type="check" />
                                Approve & Publish
                            </button>


                            <button
                                className="property-approvals-secondary-btn"
                                onClick={() =>
                                    handleRequestChanges(
                                        selectedProperty
                                    )
                                }
                            >
                                <Icon type="changes" />
                                Request Changes
                            </button>


                            <button
                                className="property-approvals-danger-btn"
                                onClick={() =>
                                    handleReject(
                                        selectedProperty
                                    )
                                }
                            >
                                <Icon type="rejected" />
                                Reject Submission
                            </button>

                        </div>

                    </section>

                )}

            </main>

        </div>

    );

}


export default PropertyApprovals;
