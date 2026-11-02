
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProperties } from "../data/propertyStorage";
import {
    getLandingHeroSettings,
    LANDING_CONTENT_UPDATED_EVENT,
} from "../data/landingPageStorage";

import "./Home.css";

function Home() {
    const [properties, setProperties] = useState([]);
    const [heroSettings, setHeroSettings] = useState(() =>
        getLandingHeroSettings()
    );

        useEffect(() => {
        const fetchProperties = async () => {
            try {
                // Assuming this is a public endpoint (no token needed for viewing properties)
                const response = await fetch("http://127.0.0.1:8000/api/v1/properties");
                if (response.ok) {
                    const data = await response.json();
                    const list = data.properties || data.items || data || [];
                    // Map the backend schema to match what the UI expects
                    const formattedProperties = list.map(p => ({
                        id: p.id || p.unit_id,
                        title: p.complex_name || "Property",
                        location: p.street_address,
                        propertyType: p.bedrooms ? "Residential" : "Unit",
                        bedrooms: p.bedrooms,
                        bathrooms: p.bathrooms,
                        unitNumber: p.unit_no,
                        listing: null // Or check if a listing exists
                    }));
                    setProperties(formattedProperties);
                }
            } catch (err) {
                console.error("Failed to fetch properties for home page:", err);
            }
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        const refreshSettings = () => {
            setHeroSettings(getLandingHeroSettings());
        };

        window.addEventListener("storage", refreshSettings);
        window.addEventListener(
            LANDING_CONTENT_UPDATED_EVENT,
            refreshSettings
        );

        return () => {
            window.removeEventListener("storage", refreshSettings);
            window.removeEventListener(
                LANDING_CONTENT_UPDATED_EVENT,
                refreshSettings
            );
        };
    }, []);

    const content = heroSettings.content;

    const PropertyIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="feature-svg">
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

    const IntelligenceIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="feature-svg">
            <path
                d="M4 19V5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M4 19h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M7 15l4-4 3 2 5-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="7" cy="15" r="1" fill="currentColor" />
            <circle cx="11" cy="11" r="1" fill="currentColor" />
            <circle cx="14" cy="13" r="1" fill="currentColor" />
            <circle cx="19" cy="7" r="1" fill="currentColor" />
        </svg>
    );

    const CommunityIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="feature-svg">
            <circle
                cx="9"
                cy="8"
                r="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <circle
                cx="17"
                cy="9"
                r="2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M3.5 20c.5-3.2 2.5-5 5.5-5s5 1.8 5.5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M14.5 15.5c2.7.1 4.7 1.6 5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );

    const isPublished = (property) =>
        property.listing?.listingStatus === "Published" &&
        property.listing?.hoaApprovalStatus === "Approved";

    const renderPropertyImage = (property) => {
        const approvedImages =
            isPublished(property) && Array.isArray(property.images)
                ? property.images.filter(Boolean)
                : [];

        if (approvedImages.length > 0) {
            const firstImage = approvedImages[0];
            const imageSource =
                typeof firstImage === "string"
                    ? firstImage
                    : firstImage?.data || "";

            if (imageSource) {
                return (
                    <img
                        src={imageSource}
                        alt={property.title || "VALORA property"}
                    />
                );
            }
        }

        return (
            <div className="property-image-placeholder">
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="property-placeholder-icon"
                >
                    <path
                        d="M3 10.5L12 3l9 7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M5 9.5V21h14V9.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9 21v-6h6v6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                </svg>
                <strong>Photos Coming Soon</strong>
                <span>
                    Property images will be added once they are available
                    and approved.
                </span>
            </div>
        );
    };

    const getListingType = (property) => {
        if (!isPublished(property)) return "UNIT AVAILABLE";

        return property.listing?.listingType?.toUpperCase() || "UNIT AVAILABLE";
    };

    const getPropertyPrice = (property) => {
        if (!isPublished(property)) return "Not currently listed";

        const listing = property.listing || {};

        if (listing.listingType === "For Sale") {
            return listing.askingPrice
                ? `R${Number(listing.askingPrice).toLocaleString()}`
                : "Price TBC";
        }

        if (listing.listingType === "For Rent") {
            return listing.rentalPrice
                ? `R${Number(listing.rentalPrice).toLocaleString()} / month`
                : "Rental Price TBC";
        }

        return "Not currently listed";
    };

    const getBedroomLabel = (property) => {
        if (property.propertyType === "Bachelor Suite") {
            return "Bachelor Suite";
        }

        const bedrooms = Number(property.bedrooms) || 0;

        return `${bedrooms} ${bedrooms === 1 ? "Bedroom" : "Bedrooms"}`;
    };

    const getBathroomLabel = (property) => {
        const bathrooms = Number(property.bathrooms) || 0;

        return `${bathrooms} ${bathrooms === 1 ? "Bathroom" : "Bathrooms"}`;
    };

    return (
        <div className="app">
            <nav className="navbar">
                <div className="logo">
                    <img src="/ValoraLogo.jpeg" alt="VALORA Logo" />
                </div>

                <div className="nav-links">
                    <a href="#home" className="active">HOME</a>
                    <a href="#properties">PROPERTIES</a>
                    <a href="#valuation">VALUATION</a>
                    <a href="#community">COMMUNITY</a>
                    <a href="#about">ABOUT</a>
                </div>

                <div className="nav-buttons">
                    <Link to="/login" className="login-btn">LOG IN</Link>
                    <Link to="/register" className="register-btn">REGISTER</Link>
                </div>
            </nav>

            <section
                className={`hero ${
                    heroSettings.image && heroSettings.placement === "background"
                        ? "hero-with-background"
                        : ""
                }`}
                id="home"
                style={
                    heroSettings.image && heroSettings.placement === "background"
                        ? {
                              backgroundImage: `linear-gradient(rgba(245,243,247,0.86), rgba(245,243,247,0.86)), url("${heroSettings.image}")`,
                          }
                        : undefined
                }
            >
                <div
                    className={`hero-layout ${
                        heroSettings.image && heroSettings.placement === "side"
                            ? "hero-layout-with-image"
                            : ""
                    }`}
                >
                    <div className="hero-content">
                        <h1>
                            {content.hero.heading1}
                            <br />
                            {content.hero.heading2}
                            <br />
                            <span>{content.hero.heading3}</span>
                        </h1>

                        <p>{content.hero.description}</p>

                        <div className="hero-buttons">
                            <a href="#properties" className="primary-btn">
                                {content.hero.primaryButton}
                            </a>

                            <Link to="/login" className="secondary-btn">
                                {content.hero.secondaryButton}
                            </Link>
                        </div>

                        <p className="login-text">
                            {content.hero.loginPrompt}{" "}
                            <Link to="/login">{content.hero.loginLink} →</Link>
                        </p>
                    </div>

                    {heroSettings.image && heroSettings.placement === "side" && (
                        <div className="hero-image-container">
                            <img
                                src={heroSettings.image}
                                alt="VALORA development"
                                className="hero-development-image"
                            />
                        </div>
                    )}
                </div>
            </section>

            <section className="features">
                <div className="feature-card">
                    <div className="feature-icon"><PropertyIcon /></div>
                    <div>
                        <h3>{content.features.propertyLabel}</h3>
                        <h4>{content.features.propertyTitle}</h4>
                        <p>{content.features.propertyDescription}</p>
                        <a href="#properties">
                            {content.features.propertyLink} →
                        </a>
                    </div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon"><IntelligenceIcon /></div>
                    <div>
                        <h3>{content.features.intelligenceLabel}</h3>
                        <h4>{content.features.intelligenceTitle}</h4>
                        <p>{content.features.intelligenceDescription}</p>
                        <Link to="/login">
                            {content.features.intelligenceLink} →
                        </Link>
                    </div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon"><CommunityIcon /></div>
                    <div>
                        <h3>{content.features.communityLabel}</h3>
                        <h4>{content.features.communityTitle}</h4>
                        <p>{content.features.communityDescription}</p>
                        <Link to="/login">
                            {content.features.communityLink} →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="property-listings" id="properties">
                <div className="listings-header">
                    <div>
                        <p className="section-label">{content.properties.label}</p>
                        <h2>{content.properties.heading}</h2>
                        <p>{content.properties.description}</p>
                    </div>

                    <Link to="/properties" className="view-all">
                        {content.properties.viewAllButton}
                    </Link>
                </div>

                <div className="property-cards">
                    {properties.map((property) => (
                        <div className="property-card" key={property.id}>
                            {renderPropertyImage(property)}

                            <div className="property-card-content">
                                <p className="property-type">
                                    {getListingType(property)}
                                </p>

                                <h3>{property.title}</h3>
                                <p className="property-location">
                                    {property.location}
                                </p>

                                <div className="property-details">
                                    <span>{property.propertyType}</span>
                                    <span>{getBedroomLabel(property)}</span>
                                    <span>{getBathroomLabel(property)}</span>
                                </div>

                                <div className="property-unit">
                                    <span>{property.unitNumber}</span>
                                    <span>{property.floor}</span>
                                </div>

                                <div className="property-bottom">
                                    <strong>{getPropertyPrice(property)}</strong>
                                    <Link
                                        to={`/property/${property.id}`}
                                        className="property-view-button"
                                    >
                                        View Property
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="intelligence-section" id="valuation">
                <div className="intelligence-content">
                    <div className="intelligence-text">
                        <p className="section-label">{content.intelligence.label}</p>
                        <h2>
                            {content.intelligence.heading1}
                            <br />
                            {content.intelligence.heading2}
                        </h2>
                        <p>{content.intelligence.description}</p>

                        <div className="intelligence-features">
                            {[1, 2, 3, 4].map((number) => (
                                <div key={number}>
                                    <h3>
                                        {content.intelligence[`feature${number}Title`]}
                                    </h3>
                                    <p>
                                        {content.intelligence[`feature${number}Description`]}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Link to="/login" className="primary-btn">
                            {content.intelligence.button}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="community-section" id="community">
                <div className="community-content">
                    <div className="community-text">
                        <p className="section-label">{content.community.label}</p>
                        <h2>
                            {content.community.heading1}
                            <br />
                            {content.community.heading2}
                        </h2>
                        <p>{content.community.description}</p>

                        <div className="community-features">
                            {[1, 2, 3, 4].map((number) => (
                                <div className="community-feature" key={number}>
                                    <h3>
                                        {content.community[`feature${number}Title`]}
                                    </h3>
                                    <p>
                                        {content.community[`feature${number}Description`]}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Link to="/login" className="primary-btn">
                            {content.community.button}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <div className="how-content">
                    <div className="how-header">
                        <p className="section-label">{content.howItWorks.label}</p>
                        <h2>
                            {content.howItWorks.heading1}
                            <br />
                            {content.howItWorks.heading2}
                        </h2>
                        <p>{content.howItWorks.description}</p>
                    </div>

                    <div className="steps">
                        {[1, 2, 3, 4].map((number) => (
                            <div className="step" key={number}>
                                <div className="step-number">
                                    {String(number).padStart(2, "0")}
                                </div>
                                <h3>
                                    {content.howItWorks[`step${number}Title`]}
                                </h3>
                                <p>
                                    {content.howItWorks[`step${number}Description`]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="about-section" id="about">
                <div className="about-content">
                    <p className="section-label">{content.about.label}</p>
                    <h2>
                        {content.about.heading1}
                        <br />
                        {content.about.heading2}
                    </h2>
                    <p>{content.about.description}</p>
                </div>
            </section>
        </div>
    );
}

export default Home;
