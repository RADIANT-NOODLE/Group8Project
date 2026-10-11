import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../../data/propertyStorage";
import "./Properties.css";


function Properties() {

    const [properties, setProperties] = useState([]);


    /*
    =========================================================
    PROPERTY STORAGE
    =========================================================
    */

    useEffect(() => {

        const storedProperties =
            getProperties();

        setProperties(storedProperties);

    }, []);


    /*
    =========================================================
    PROFESSIONAL PROPERTY ICON
    =========================================================
    */

    const PropertyIcon = () => (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="properties-page-icon"
        >

            <path
                d="M3 10.5L12 3l9 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M5 9.5V21h14V9.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />

            <path
                d="M9 21v-6h6v6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />

        </svg>

    );


    /*
    =========================================================
    PUBLIC LISTING CHECK
    =========================================================
    */

    const isPublished = (property) => {

        return (
            property.listing?.listingStatus === "Published" &&
            property.listing?.hoaApprovalStatus === "Approved"
        );

    };


    /*
    =========================================================
    PROPERTY IMAGE
    =========================================================
    */

    const renderPropertyImage = (property) => {

        const published =
            isPublished(property);


        const approvedImages =
            published &&
            Array.isArray(property.images)
                ? property.images.filter(Boolean)
                : [];


        if (approvedImages.length > 0) {

            const firstImage =
                approvedImages[0];


            const imageSource =
                typeof firstImage === "string"
                    ? firstImage
                    : firstImage?.data || "";


            if (imageSource) {

                return (

                    <img
                        src={imageSource}
                        alt={
                            property.title ||
                            property.propertyType ||
                            "VALORA Property"
                        }
                    />

                );

            }

        }


        return (

            <div className="property-image-placeholder">

                <PropertyIcon />

                <strong>
                    Photos Coming Soon
                </strong>

                <span>
                    Property images will be added once they
                    are available and approved.
                </span>

            </div>

        );

    };


    /*
    =========================================================
    PROPERTY LISTING TYPE
    =========================================================
    */

    const getListingType = (property) => {

        if (!isPublished(property)) {

            return "UNIT AVAILABLE";

        }


        const listingType =
            property.listing?.listingType;


        if (listingType) {

            return listingType.toUpperCase();

        }


        return "UNIT AVAILABLE";

    };


    /*
    =========================================================
    PROPERTY PRICE
    =========================================================
    */

    const getPropertyPrice = (property) => {

        if (!isPublished(property)) {

            return "Not currently listed";

        }


        const listing =
            property.listing || {};


        if (
            listing.listingType === "For Sale"
        ) {

            if (listing.askingPrice) {

                return `R${Number(
                    listing.askingPrice
                ).toLocaleString()}`;

            }

            return "Price TBC";

        }


        if (
            listing.listingType === "For Rent"
        ) {

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
    =========================================================
    PROPERTY BEDROOM LABEL
    =========================================================
    */

    const getBedroomLabel = (property) => {

        if (
            property.propertyType === "Bachelor Suite"
        ) {

            return "Bachelor Suite";

        }


        return `${property.bedrooms} ${
            property.bedrooms === 1
                ? "Bedroom"
                : "Bedrooms"
        }`;

    };


    /*
    =========================================================
    PROPERTY BATHROOM LABEL
    =========================================================
    */

    const getBathroomLabel = (property) => {

        return `${property.bathrooms} ${
            property.bathrooms === 1
                ? "Bathroom"
                : "Bathrooms"
        }`;

    };


    /*
    =========================================================
    PAGE
    =========================================================
    */

    return (

        <div className="app properties-page">


            {/* =================================================
                SAME VALORA NAVBAR AS HOME PAGE
            ================================================= */}

            <nav className="navbar">

                <div className="logo">

                    <img
                        src="/assets/valora-logo.svg"
                        alt="VALORA Logo"
                    />

                </div>


                <div className="nav-links">

                    <Link to="/">
                        HOME
                    </Link>


                    <Link
                        to="/properties"
                        className="active"
                    >
                        PROPERTIES
                    </Link>


                    <Link to="/#valuation">
                        VALUATION
                    </Link>


                    <Link to="/#community">
                        COMMUNITY
                    </Link>


                    <Link to="/#about">
                        ABOUT
                    </Link>

                </div>


                <div className="nav-buttons">

                    <Link
                        to="/login"
                        className="login-btn"
                    >
                        LOG IN
                    </Link>


                    <Link
                        to="/register"
                        className="register-btn"
                    >
                        REGISTER
                    </Link>

                </div>

            </nav>


            {/* =================================================
                PROPERTIES PAGE HEADER
            ================================================= */}

            <section className="properties-page-header">

                <div className="properties-page-header-content">

                    <p className="section-label">
                        THE VALORA DEVELOPMENT
                    </p>


                    <h1>
                        Explore our eight units.
                    </h1>


                    <p>
                        Explore the units within the VALORA
                        development. Property information and
                        approved listing details will be updated
                        as the development progresses.
                    </p>

                </div>

            </section>


            {/* =================================================
                PROPERTY LISTINGS
            ================================================= */}

            <section
                className="property-listings"
                id="properties"
            >

                <div className="listings-header">

                    <div>

                        <p className="section-label">
                            PROPERTY COLLECTION
                        </p>


                        <h2>
                            Available Properties
                        </h2>


                        <p>
                            Browse the properties within the
                            VALORA development and view the
                            information available for each unit.
                        </p>

                    </div>

                </div>


                <div className="property-cards">

                    {properties.map((property) => {

                        const priceDisplay =
                            getPropertyPrice(property);


                        const listingType =
                            getListingType(property);


                        return (

                            <div
                                className="property-card"
                                key={property.id}
                            >


                                {/* PROPERTY IMAGE */}

                                {renderPropertyImage(property)}


                                <div className="property-card-content">


                                    {/* LISTING TYPE */}

                                    <p className="property-type">
                                        {listingType}
                                    </p>


                                    {/* PROPERTY TITLE */}

                                    <h3>
                                        {property.title ||
                                            property.propertyType}
                                    </h3>


                                    {/* LOCATION */}

                                    <p className="property-location">
                                        {property.location ||
                                            property.development ||
                                            "VALORA Estate"}
                                    </p>


                                    {/* PROPERTY DETAILS */}

                                    <div className="property-details">

                                        <span>
                                            {property.propertyType}
                                        </span>

                                        <span>
                                            {getBedroomLabel(property)}
                                        </span>

                                        <span>
                                            {getBathroomLabel(property)}
                                        </span>

                                    </div>


                                    {/* UNIT INFORMATION */}

                                    <div className="property-unit">

                                        <span>
                                            {property.unitNumber}
                                        </span>

                                        <span>
                                            {property.floor}
                                        </span>

                                    </div>


                                    {/* PRICE + VIEW */}

                                    <div className="property-bottom">

                                        <strong>
                                            {priceDisplay}
                                        </strong>


                                        <Link
                                            to={`/property/${property.id}`}
                                            className="property-view-button"
                                        >
                                            View Property
                                        </Link>

                                    </div>


                                </div>

                            </div>

                        );

                    })}

                </div>

            </section>


            {/* =================================================
                BOTTOM INFORMATION
            ================================================= */}

            <section className="properties-page-information">

                <div className="properties-page-information-content">

                    <p className="section-label">
                        VALORA PROPERTY INTELLIGENCE
                    </p>


                    <h2>
                        More than a property listing.
                    </h2>


                    <p>
                        VALORA combines property information
                        with intelligent insights and community
                        management tools to help residents,
                        buyers and investors make informed
                        property decisions.
                    </p>


                    <div className="properties-page-actions">

                        <Link
                            to="/login"
                            className="primary-btn"
                        >
                            GET AI VALUATION
                        </Link>


                        <Link
                            to="/"
                            className="secondary-btn"
                        >
                            BACK TO HOME
                        </Link>

                    </div>

                </div>

            </section>


        </div>

    );

}


export default Properties;
