import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { getPropertyById } from "../../data/propertyStorage";
import "./MyProperty.css";

/*
=========================================================
VALORA MY PROPERTY
=========================================================

RESIDENT PROPERTY PAGE

This page displays the property assigned to the currently
logged-in Resident.

The resident's account stores the assigned property ID in:

user.myProperty

Example:

myProperty: "VAL-001"

The property itself is retrieved from the shared VALORA
property storage.

IMPORTANT:
- This page does NOT display all VALORA units.
- Only the property assigned to the logged-in Resident
  is displayed.
- /property/:propertyId remains the public property detail
  page.
- /properties is the property browsing page.
=========================================================
*/

export default function MyProperty() {

    const [user, setUser] = useState(null);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);


    /*
    =====================================================
    LOAD RESIDENT + PROPERTY
    =====================================================
    */

    useEffect(() => {

        const storedUser =
            localStorage.getItem("valoraUser");

        if (!storedUser) {
            setUser(null);
            setProperty(null);
            setLoading(false);
            return;
        }

        try {

            const parsedUser =
                JSON.parse(storedUser);

            if (!parsedUser) {
                setUser(null);
                setProperty(null);
                setLoading(false);
                return;
            }

            setUser(parsedUser);

            /*
            -------------------------------------------------
            RESIDENT PROPERTY
            -------------------------------------------------

            myProperty contains the VALORA property ID.

            Example:
            "VAL-001"
            */

            const myPropertyId =
                parsedUser.myProperty;

            if (!myPropertyId) {
                setProperty(null);
                setLoading(false);
                return;
            }

            const assignedProperty =
                getPropertyById(myPropertyId);

            setProperty(assignedProperty);

        } catch (error) {

            console.error(
                "Unable to load VALORA resident property:",
                error
            );

            setUser(null);
            setProperty(null);

        } finally {

            setLoading(false);

        }

    }, []);


    /*
    =====================================================
    PROPERTY STATUS
    =====================================================
    */

    const getPropertyStatus = () => {

        if (!property) {
            return "Not Assigned";
        }

        const unitStatus =
            property.unitStatus ||
            property.status ||
            "";

        return unitStatus || "Active";

    };


    /*
    =====================================================
    OWNERSHIP / OCCUPANCY
    =====================================================
    */

    const getOccupancyLabel = () => {

        if (!user) {
            return "Property";
        }

        if (user.propertyGoal === "Buy") {
            return "Owned";
        }

        if (user.propertyGoal === "Rent") {
            return "Rented";
        }

        return "Resident Property";

    };


    /*
    =====================================================
    PROPERTY IMAGE
    =====================================================
    */

    const getPropertyImage = () => {

        if (
            !property ||
            !Array.isArray(property.images) ||
            property.images.length === 0
        ) {
            return null;
        }

        const firstImage =
            property.images[0];

        if (typeof firstImage === "string") {
            return firstImage;
        }

        if (
            firstImage &&
            typeof firstImage === "object"
        ) {
            return firstImage.data || null;
        }

        return null;

    };


    /*
    =====================================================
    ICONS
    =====================================================
    */

    const PropertyIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
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


    const BedroomIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
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
            width="22"
            height="22"
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


    const AreaIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
        >
            <path
                d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );


    const FloorIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
        >
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
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


    const ArrowIcon = () => (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden="true"
        >
            <path
                d="M5 12h13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            <path
                d="M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {

        return (

            <div className="my-property-page">

                <DashboardSidebar />

                <main className="my-property-main">

                    <div className="my-property-loading">

                        <div className="my-property-loading-line"></div>

                        <div className="my-property-loading-box"></div>

                    </div>

                </main>

            </div>

        );

    }


    /*
    =====================================================
    NO PROPERTY ASSIGNED
    =====================================================
    */

    if (!property) {

        return (

            <div className="my-property-page">

                <DashboardSidebar />

                <main className="my-property-main">

                    <div className="my-property-header">

                        <div>

                            <span className="my-property-eyebrow">
                                PROPERTY
                            </span>

                            <h1>
                                My Property
                            </h1>

                            <p>
                                Manage and view the property
                                associated with your VALORA account.
                            </p>

                        </div>

                    </div>


                    <section className="my-property-empty-card">

                        <div className="my-property-empty-icon">
                            <PropertyIcon />
                        </div>

                        <div className="my-property-empty-content">

                            <span className="my-property-empty-label">
                                No Property Assigned
                            </span>

                            <h2>
                                Your VALORA property has not
                                been assigned yet.
                            </h2>

                            <p>
                                Once a property has been assigned
                                to your account, it will appear
                                here with its property information,
                                status and available details.
                            </p>

                            {/* DIRECTLY TO PROPERTIES */}

                            <Link
                                to="/properties"
                                className="my-property-secondary-button"
                            >
                                Browse Properties
                            </Link>

                        </div>

                    </section>

                </main>

            </div>

        );

    }


    /*
    =====================================================
    PROPERTY DATA
    =====================================================
    */

    const image =
        getPropertyImage();

    const occupancy =
        getOccupancyLabel();

    const propertyStatus =
        getPropertyStatus();


    /*
    =====================================================
    MAIN PAGE
    =====================================================
    */

    return (

        <div className="my-property-page">

            <DashboardSidebar />

            <main className="my-property-main">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="my-property-header">

                    <div>

                        <span className="my-property-eyebrow">
                            PROPERTY
                        </span>

                        <h1>
                            My Property
                        </h1>

                        <p>
                            View the property associated with
                            your VALORA account.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    PROPERTY CARD
                ================================================= */}

                <section className="my-property-card">

                    <div className="my-property-image">

                        {image ? (

                            <img
                                src={image}
                                alt={property.unitNumber}
                            />

                        ) : (

                            <div className="my-property-image-placeholder">

                                <PropertyIcon />

                                <span>
                                    Property Image
                                </span>

                                <small>
                                    Approved photographs will
                                    appear here when available.
                                </small>

                            </div>

                        )}

                    </div>


                    <div className="my-property-card-content">

                        <div className="my-property-card-top">

                            <div>

                                <span className="my-property-unit">
                                    {property.unitNumber}
                                </span>

                                <h2>
                                    {property.title ||
                                        property.propertyType ||
                                        "VALORA Property"}
                                </h2>

                                <p className="my-property-location">
                                    {property.location ||
                                        property.development ||
                                        "VALORA Estate"}
                                </p>

                            </div>


                            <div className="my-property-statuses">

                                <span className="my-property-occupancy">
                                    {occupancy}
                                </span>

                                <span className="my-property-unit-status">
                                    {propertyStatus}
                                </span>

                            </div>

                        </div>


                        {/* PROPERTY DETAILS */}

                        <div className="my-property-details">

                            <div className="my-property-detail">

                                <span className="my-property-detail-icon">
                                    <BedroomIcon />
                                </span>

                                <div>

                                    <span>
                                        Bedrooms
                                    </span>

                                    <strong>
                                        {property.bedrooms}
                                    </strong>

                                </div>

                            </div>


                            <div className="my-property-detail">

                                <span className="my-property-detail-icon">
                                    <BathroomIcon />
                                </span>

                                <div>

                                    <span>
                                        Bathrooms
                                    </span>

                                    <strong>
                                        {property.bathrooms}
                                    </strong>

                                </div>

                            </div>


                            <div className="my-property-detail">

                                <span className="my-property-detail-icon">
                                    <AreaIcon />
                                </span>

                                <div>

                                    <span>
                                        Floor Area
                                    </span>

                                    <strong>
                                        {property.floorArea
                                            ? `${property.floorArea} m²`
                                            : "TBC"}
                                    </strong>

                                </div>

                            </div>


                            <div className="my-property-detail">

                                <span className="my-property-detail-icon">
                                    <FloorIcon />
                                </span>

                                <div>

                                    <span>
                                        Floor
                                    </span>

                                    <strong>
                                        {property.floor || "TBC"}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="my-property-description">

                            <span>
                                Property Information
                            </span>

                            <p>
                                {property.description ||
                                    "Property information is currently being updated."}
                            </p>

                        </div>


                        {/* ACTIONS */}

                        <div className="my-property-actions">

                            <Link
                                to={`/property/${property.id}`}
                                className="my-property-primary-button"
                            >
                                View Property
                                <ArrowIcon />
                            </Link>

                            <Link
                                to="/valuation"
                                className="my-property-secondary-button"
                            >
                                View Valuation
                            </Link>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PROPERTY SUMMARY
                ================================================= */}

                <section className="my-property-summary">

                    <div className="my-property-summary-heading">

                        <div>

                            <span>
                                PROPERTY SUMMARY
                            </span>

                            <h2>
                                {property.unitNumber}
                            </h2>

                        </div>

                        <div className="my-property-summary-status">
                            {occupancy}
                        </div>

                    </div>


                    <div className="my-property-summary-grid">

                        <div>

                            <span>
                                Property Type
                            </span>

                            <strong>
                                {property.propertyType}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Development
                            </span>

                            <strong>
                                {property.development ||
                                    "VALORA Estate"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Location
                            </span>

                            <strong>
                                {property.location ||
                                    "VALORA Estate"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Unit Status
                            </span>

                            <strong>
                                {propertyStatus}
                            </strong>

                        </div>

                    </div>

                </section>

            </main>

        </div>

    );
}
