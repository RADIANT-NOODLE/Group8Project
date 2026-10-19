import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyById } from "../../data/propertyStorage";
import "./Property.css";

/*
=========================================================
VALORA PROPERTY DETAIL PAGE
=========================================================

PUBLIC PROPERTY PAGE

The same property page can be viewed by:
- Guests
- Residents
- Investors
- Estate Agents
- HOA Admins
- Head Admin

Only HOA-approved published listing information is
displayed publicly.

=========================================================
*/

export default function Property() {

    const { propertyId } = useParams();

    const [property, setProperty] = useState(null);

    useEffect(() => {

        if (!propertyId) {
            setProperty(null);
            return;
        }

        setProperty(getPropertyById(propertyId));

    }, [propertyId]);


    /*
    =====================================================
    USER STATE
    =====================================================
    */

    const [currentUser, setCurrentUser] = useState(null);
    const [isSaved, setIsSaved] = useState(false);


    /*
    =====================================================
    LOAD USER + RECENTLY VIEWED
    =====================================================
    */

    useEffect(() => {

        if (!property) {
            return;
        }

        const loggedIn =
            localStorage.getItem("valoraLoggedIn") === "true";

        const storedUser =
            localStorage.getItem("valoraUser");

        if (!loggedIn || !storedUser) {
            setCurrentUser(null);
            setIsSaved(false);
            return;
        }

        try {

            const user = JSON.parse(storedUser);

            if (!user) {
                return;
            }

            const savedProperties =
                Array.isArray(user.savedProperties)
                    ? user.savedProperties
                    : [];

            setIsSaved(
                savedProperties.some(
                    (savedId) =>
                        String(savedId).toLowerCase() ===
                        String(property.id).toLowerCase()
                )
            );

            const recentlyViewed =
                Array.isArray(user.recentlyViewed)
                    ? user.recentlyViewed
                    : [];

            const updatedRecentlyViewed = [
                property.id,
                ...recentlyViewed.filter(
                    (id) =>
                        String(id).toLowerCase() !==
                        String(property.id).toLowerCase()
                )
            ].slice(0, 5);

            const updatedUser = {
                ...user,
                recentlyViewed: updatedRecentlyViewed
            };

            localStorage.setItem(
                "valoraUser",
                JSON.stringify(updatedUser)
            );

            setCurrentUser(updatedUser);

        } catch (error) {

            console.error(
                "Unable to load VALORA user:",
                error
            );

        }

    }, [property]);


    /*
    =====================================================
    SAVE / UNSAVE PROPERTY
    =====================================================
    */

    const handleSaveProperty = () => {

        const loggedIn =
            localStorage.getItem("valoraLoggedIn") === "true";

        const storedUser =
            localStorage.getItem("valoraUser");

        if (!loggedIn || !storedUser) {
            window.location.href = "/login";
            return;
        }

        if (!property) {
            return;
        }

        try {

            const user = JSON.parse(storedUser);

            const savedProperties =
                Array.isArray(user.savedProperties)
                    ? user.savedProperties
                    : [];

            if (isSaved) {

                const updatedSavedProperties =
                    savedProperties.filter(
                        (savedId) =>
                            String(savedId).toLowerCase() !==
                            String(property.id).toLowerCase()
                    );

                const updatedUser = {
                    ...user,
                    savedProperties: updatedSavedProperties
                };

                localStorage.setItem(
                    "valoraUser",
                    JSON.stringify(updatedUser)
                );

                setCurrentUser(updatedUser);
                setIsSaved(false);

                return;
            }

            const alreadySaved =
                savedProperties.some(
                    (savedId) =>
                        String(savedId).toLowerCase() ===
                        String(property.id).toLowerCase()
                );

            const updatedSavedProperties =
                alreadySaved
                    ? savedProperties
                    : [...savedProperties, property.id];

            const updatedUser = {
                ...user,
                savedProperties: updatedSavedProperties
            };

            localStorage.setItem(
                "valoraUser",
                JSON.stringify(updatedUser)
            );

            setCurrentUser(updatedUser);
            setIsSaved(true);

        } catch (error) {

            console.error(
                "Unable to save property:",
                error
            );

        }

    };


    /*
    =====================================================
    PROPERTY NOT FOUND
    =====================================================
    */

    if (!property) {

        return (
            <div className="property-page">

                <header className="property-public-header">

                    <Link
                        to="/"
                        className="property-logo-link"
                    >
                        <img
                            src="/ValoraLogo.jpeg"
                            alt="VALORA Logo"
                        />
                    </Link>

                    <div className="property-header-actions">

                        <Link
                            to="/login"
                            className="property-header-login"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="property-header-register"
                        >
                            Register
                        </Link>

                    </div>

                </header>


                <main className="property-not-found-main">

                    <div className="property-not-found-card">

                        <div className="property-not-found-icon">

                            <svg
                                viewBox="0 0 24 24"
                                width="36"
                                height="36"
                                aria-hidden="true"
                            >
                                <path
                                    d="M3 10.5L12 3l9 7.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                <path
                                    d="M5 9.5V21h14V9.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinejoin="round"
                                />

                                <path
                                    d="M9 21v-6h6v6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinejoin="round"
                                />
                            </svg>

                        </div>

                        <h1>
                            Property Not Found
                        </h1>

                        <p>
                            The property you are looking for could
                            not be found in the VALORA property
                            listings.
                        </p>

                        <Link
                            to="/"
                            className="property-primary-button"
                        >
                            Back to Properties
                        </Link>

                    </div>

                </main>


                <footer className="property-footer">

                    <p>
                        © 2026 VALORA — Property Intelligence
                    </p>

                </footer>

            </div>
        );
    }


    /*
    =====================================================
    LISTING DATA
    =====================================================
    */

    const listing = property.listing || {};


    /*
    =====================================================
    PUBLIC LISTING APPROVAL CHECK
    =====================================================
    */

    const listingStatusValue =
        String(listing.listingStatus || "")
            .trim()
            .toLowerCase();

    const hoaApprovalStatusValue =
        String(listing.hoaApprovalStatus || "")
            .trim()
            .toLowerCase();

    const isPublished =
        listingStatusValue === "published" &&
        hoaApprovalStatusValue === "approved";


    /*
    =====================================================
    APPROVED PUBLIC IMAGES
    =====================================================
    */

    const approvedImages =
        isPublished && Array.isArray(property.images)
            ? property.images
                .map((image) => {

                    if (typeof image === "string") {
                        return image;
                    }

                    if (
                        image &&
                        typeof image === "object"
                    ) {
                        return image.data || "";
                    }

                    return "";

                })
                .filter(Boolean)
            : [];


    /*
    =====================================================
    PUBLIC LISTING TYPE
    =====================================================
    */

    const listingType =
        isPublished
            ? listing.listingType || null
            : null;


    /*
    =====================================================
    PUBLIC LISTING STATUS
    =====================================================
    */

    const publicListingStatus =
        isPublished
            ? "Published"
            : "Not Currently Listed";


    /*
    =====================================================
    PRICE DISPLAY
    =====================================================
    */

    const getPriceDisplay = () => {

        if (!isPublished) {
            return "Not currently listed";
        }

        if (listing.listingType === "For Sale") {

            if (listing.askingPrice) {
                return `R${Number(
                    listing.askingPrice
                ).toLocaleString()}`;
            }

            return "Price TBC";
        }

        if (listing.listingType === "For Rent") {

            if (listing.rentalPrice) {
                return `R${Number(
                    listing.rentalPrice
                ).toLocaleString()} / month`;
            }

            return "Rental Price TBC";
        }

        return "Not currently listed";
    };


    /*
    =====================================================
    UNIT STATUS
    =====================================================
    */

    const unitStatus =
        property.unitStatus ||
        property.status ||
        "Available";


    /*
    =====================================================
    STATUS COLOUR
    =====================================================
    */

    const getStatusClass = () => {

        if (unitStatus === "Sold") {
            return "status-sold";
        }

        if (unitStatus === "Rented") {
            return "status-rented";
        }

        if (unitStatus === "Under Offer") {
            return "status-under-offer";
        }

        return "status-available";
    };


    /*
    =====================================================
    FEATURE ICON
    =====================================================
    */

    const FeatureIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
        >
            <path
                d="M5 12.5L10 17l9-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );


    /*
    =====================================================
    PROPERTY STAT ICONS
    =====================================================
    */

    const BedroomIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            aria-hidden="true"
        >
            <path
                d="M4 18v-6h16v6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M4 12V8h16v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M7 10v2M17 10v2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />

            <path
                d="M3 18h18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );


    const BathroomIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            aria-hidden="true"
        >
            <path
                d="M4 12h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />

            <path
                d="M6 12V6a2 2 0 0 1 4 0v2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />

            <path
                d="M4 12v2a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );


    const PropertyTypeIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            aria-hidden="true"
        >
            <path
                d="M3 10.5L12 3l9 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M5 9.5V21h14V9.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />

            <path
                d="M9 21v-6h6v6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
        </svg>
    );


    const StatusIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            aria-hidden="true"
        >
            <rect
                x="5"
                y="3"
                width="14"
                height="18"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            />

            <path
                d="M8 8h8M8 12h8M8 16h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );


    /*
    =====================================================
    PHOTO PLACEHOLDER
    =====================================================
    */

    const PropertyPhotoPlaceholder = () => (
        <div className="property-photo-placeholder">

            <div className="property-photo-placeholder-icon">

                <svg
                    viewBox="0 0 24 24"
                    width="42"
                    height="42"
                    aria-hidden="true"
                >
                    <path
                        d="M3 10.5L12 3l9 7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <path
                        d="M5 9.5V21h14V9.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />

                    <path
                        d="M9 21v-6h6v6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                </svg>

            </div>

            <h3>
                Photos Coming Soon
            </h3>

            <p>
                Approved property photographs will be
                displayed here once they have been uploaded
                by an Estate Agent and approved by the HOA.
            </p>

        </div>
    );


    /*
    =====================================================
    PUBLIC DESCRIPTION
    =====================================================
    */

    const publicDescription =
        isPublished && listing.description
            ? listing.description
            : property.description ||
              "Property information for this unit is being updated as the VALORA development progresses.";


    /*
    =====================================================
    PROPERTY STATS
    =====================================================
    */

    const propertyStats = [
        {
            icon: <BedroomIcon />,
            label: "Bedrooms",
            value: property.bedrooms,
        },
        {
            icon: <BathroomIcon />,
            label: "Bathrooms",
            value: property.bathrooms,
        },
        {
            icon: <PropertyTypeIcon />,
            label: "Property Type",
            value: property.propertyType,
            compact: true,
        },
        {
            icon: <StatusIcon />,
            label: "Unit Status",
            value: unitStatus,
            compact: true,
        },
    ];


    /*
    =====================================================
    MAIN PROPERTY PAGE
    =====================================================
    */

    return (

        <div className="property-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="property-public-header">

                <Link
                    to="/"
                    className="property-logo-link"
                >
                    <img
                        src="/ValoraLogo.jpeg"
                        alt="VALORA Logo"
                    />
                </Link>

                <div className="property-header-actions">

                    <Link
                        to="/login"
                        className="property-header-login"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="property-header-register"
                    >
                        Register
                    </Link>

                </div>

            </header>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="property-main">

                <Link
                    to="/"
                    className="property-back-link"
                >
                    <span aria-hidden="true">←</span>
                    Back to Properties
                </Link>


                {/* =================================================
                    PROPERTY HEADER
                ================================================= */}

                <section className="property-header-card">

                    <div className="property-header-content">

                        <div>

                            <span
                                className={`property-status-badge ${getStatusClass()}`}
                            >
                                {unitStatus.toUpperCase()}
                            </span>

                            <div className="property-unit-label">
                                {property.unitNumber}
                                {" • "}
                                {property.propertyType}
                            </div>

                            <h1>
                                {property.title}
                            </h1>

                            <p className="property-location">
                                {property.location}
                            </p>

                        </div>


                        <div className="property-price-area">

                            <span>
                                {listingType === "For Rent"
                                    ? "Monthly Rental"
                                    : listingType === "For Sale"
                                    ? "Asking Price"
                                    : "Listing Status"}
                            </span>

                            <strong
                                className={
                                    listingType
                                        ? "property-price"
                                        : "property-price property-price-status"
                                }
                            >
                                {getPriceDisplay()}
                            </strong>

                        </div>

                    </div>


                    {/* SAVE PROPERTY */}

                    <div className="property-save-row">

                        <div>

                            <strong>
                                {isSaved
                                    ? "Property Saved"
                                    : "Interested in this property?"}
                            </strong>

                            <span>
                                {isSaved
                                    ? "You can find this property in your dashboard."
                                    : "Save it to easily find it again later."}
                            </span>

                        </div>

                        <button
                            type="button"
                            onClick={handleSaveProperty}
                            className={
                                isSaved
                                    ? "property-save-button saved"
                                    : "property-save-button"
                            }
                        >
                            {isSaved
                                ? "Saved Property"
                                : "Save Property"}
                        </button>

                    </div>

                </section>


                {/* =================================================
                    PROPERTY PHOTOS
                ================================================= */}

                <section className="property-section-card">

                    <div className="property-section-heading">
                        <h2>
                            Property Photos
                        </h2>

                        <p>
                            Approved images for this property.
                        </p>
                    </div>

                    {approvedImages.length === 0 ? (

                        <PropertyPhotoPlaceholder />

                    ) : (

                        <div className="property-photo-grid">

                            {approvedImages.map(
                                (image, index) => (

                                    <div
                                        key={`${property.id}-photo-${index}`}
                                        className="property-photo-card"
                                    >

                                        <div className="property-photo-image">

                                            <img
                                                src={image}
                                                alt={`${property.unitNumber} property photo ${index + 1}`}
                                            />

                                        </div>

                                        <div className="property-photo-caption">

                                            <h3>
                                                {property.unitNumber}
                                                {" — "}
                                                Photo {index + 1}
                                            </h3>

                                            <p>
                                                Approved property
                                                photograph for{" "}
                                                {property.title}.
                                            </p>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    PROPERTY STATS
                ================================================= */}

                <section className="property-stats-grid">

                    {propertyStats.map((stat) => (

                        <div
                            key={stat.label}
                            className="property-stat-card"
                        >

                            <div className="property-stat-icon">
                                {stat.icon}
                            </div>

                            <span>
                                {stat.label}
                            </span>

                            <strong
                                className={
                                    stat.compact
                                        ? "property-stat-value compact"
                                        : "property-stat-value"
                                }
                            >
                                {stat.value}
                            </strong>

                        </div>

                    ))}

                </section>


                {/* =================================================
                    UNIT INFORMATION
                ================================================= */}

                <section className="property-section-card">

                    <div className="property-section-heading">
                        <h2>
                            Unit Information
                        </h2>

                        <p>
                            Key information about this VALORA unit.
                        </p>
                    </div>

                    <div className="property-information-grid">

                        {[
                            ["Unit Number", property.unitNumber],
                            [
                                "Floor",
                                property.floor || "Information TBC"
                            ],
                            [
                                "Floor Area",
                                property.floorArea
                                    ? `${property.floorArea} m²`
                                    : "Information TBC"
                            ],
                            [
                                "Development",
                                property.development ||
                                property.location ||
                                "VALORA Development"
                            ]
                        ].map(([label, value]) => (

                            <div
                                key={label}
                                className="property-information-item"
                            >

                                <span>
                                    {label}
                                </span>

                                <strong>
                                    {value}
                                </strong>

                            </div>

                        ))}

                    </div>

                </section>


                {/* =================================================
                    ABOUT PROPERTY
                ================================================= */}

                <section className="property-section-card">

                    <div className="property-section-heading">
                        <h2>
                            About This Property
                        </h2>
                    </div>

                    <div className="property-description">

                        <p>
                            {publicDescription}
                        </p>

                        <p>
                            {property.unitNumber} is currently{" "}
                            <strong>
                                {unitStatus.toLowerCase()}
                            </strong>{" "}
                            within the VALORA development.
                        </p>

                    </div>

                </section>


                {/* =================================================
                    PROPERTY FEATURES
                ================================================= */}

                <section className="property-section-card">

                    <div className="property-section-heading">
                        <h2>
                            Property Features
                        </h2>

                        <p>
                            Features currently recorded for this unit.
                        </p>
                    </div>

                    <div className="property-features-grid">

                        {Array.isArray(property.features) &&
                            property.features.map(
                                (feature) => (

                                    <div
                                        key={feature}
                                        className="property-feature-item"
                                    >

                                        <span className="property-feature-icon">
                                            <FeatureIcon />
                                        </span>

                                        <span>
                                            {feature}
                                        </span>

                                    </div>

                                )
                            )}

                    </div>

                </section>


                {/* =================================================
                    LISTING STATUS
                ================================================= */}

                <section className="property-listing-status-card">

                    <div>

                        <p>
                            Listing Status
                        </p>

                        <h3>
                            {publicListingStatus}
                        </h3>

                    </div>


                    {listingType && (

                        <div className="property-listing-type">

                            <p>
                                Listing Type
                            </p>

                            <strong>
                                {listingType}
                            </strong>

                        </div>

                    )}

                </section>


                {/* =================================================
                    CONTACT SECTION
                ================================================= */}

                <section className="property-contact-section">

                    <h2>
                        Interested in this property?
                    </h2>

                    <p>
                        Register or log in to VALORA to access
                        property intelligence, save properties
                        and connect with the relevant property
                        representative when a unit becomes
                        available for sale or rental.
                    </p>

                    <div className="property-contact-actions">

                        <Link
                            to="/login"
                            className="property-contact-login"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="property-contact-register"
                        >
                            Register
                        </Link>

                    </div>

                </section>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="property-footer">

                <p>
                    © 2026 VALORA — Property Intelligence
                </p>

            </footer>

        </div>
    );
}
