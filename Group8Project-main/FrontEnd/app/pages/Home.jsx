
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


import { getProperties } from "../data/propertyStorage";
import "./Home.css";

function Home() {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/v1/properties"
                );

                if (response.ok) {
                    const data = await response.json();
                    const list = data.properties || data.items || data || [];

                    const formattedProperties = list.map((p) => ({
                        id: p.id || p.unit_id,
                        title: p.complex_name || "Property",
                        location: p.street_address,
                        propertyType: p.bedrooms ? "Residential" : "Unit",
                        bedrooms: p.bedrooms,
                        bathrooms: p.bathrooms,
                        unitNumber: p.unit_no,
                        listing: null,
                    }));

                    setProperties(formattedProperties);
                }
            } catch (err) {
                console.error(
                    "Failed to fetch properties for home page:",
                    err
                );
            }
        };

        fetchProperties();
    }, []);

    const PropertyIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="feature-svg">
            <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9.5V21h14V9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    );

    const IntelligenceIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="feature-svg">
            <path d="M4 19V5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 19h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M7 15l4-4 3 2 5-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7" cy="15" r="1" fill="currentColor" />
            <circle cx="11" cy="11" r="1" fill="currentColor" />
            <circle cx="14" cy="13" r="1" fill="currentColor" />
            <circle cx="19" cy="7" r="1" fill="currentColor" />
        </svg>
    );

    const CommunityIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="feature-svg">
            <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 20c.5-3.2 2.5-5 5.5-5s5 1.8 5.5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M14.5 15.5c2.7.1 4.7 1.6 5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
                <svg viewBox="0 0 24 24" aria-hidden="true" className="property-placeholder-icon">
                    <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 9.5V21h14V9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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
            {/* NAVBAR */}
            <nav className="navbar">
                <Link to="/" className="logo">
                    <img
                        src="/assets/valora-logo.jpg"
                        alt="VALORA - go to home page"
                    />
                </Link>

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

            {/* HERO WITH BACKGROUND IMAGE */}
            <section
                className="hero"
                id="home"
                style={{
    "--hero-background-image": 'url("/assets/ValoraLandingPage.jpeg")',
}}
            >
                <div className="hero-layout">
                    <div className="hero-content">
                        <h1>
                            Smarter property decisions.
                            <br />
                            Stronger
                            <br />
                            <span>internal communities.</span>
                        </h1>

                        <p>
                            VALORA brings property management, intelligent
                            insights, and community collaboration together
                            in one connected platform.
                        </p>

                        <div className="hero-buttons">
                            <a href="#properties" className="primary-btn">
                                EXPLORE PROPERTIES
                            </a>

                            <Link to="/login" className="secondary-btn">
                                ACCESS YOUR ACCOUNT
                            </Link>
                        </div>

                        <p className="login-text">
                            Already part of a community?{" "}
                            <Link to="/login">Log in here →</Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features">
                <div className="feature-card">
                    <div className="feature-icon"><PropertyIcon /></div>
                    <div>
                        <h3>PROPERTY MANAGEMENT</h3>
                        <h4>Manage Properties With Confidence</h4>
                        <p>
                            Access property information, manage listings,
                            and keep important property details organised.
                        </p>
                        <a href="#properties">Explore properties →</a>
                    </div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon"><IntelligenceIcon /></div>
                    <div>
                        <h3>VALORA INTELLIGENCE</h3>
                        <h4>Make Informed Decisions</h4>
                        <p>
                            Use property valuation insights and investment
                            analysis to support smarter property decisions.
                        </p>
                        <Link to="/login">Explore intelligence →</Link>
                    </div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon"><CommunityIcon /></div>
                    <div>
                        <h3>COMMUNITY</h3>
                        <h4>Stronger Internal Communities</h4>
                        <p>
                            Support communication, announcements, and
                            collaboration between residents and administrators.
                        </p>
                        <Link to="/login">Access your community →</Link>
                    </div>
                </div>
            </section>

            {/* PROPERTIES */}
            <section className="property-listings" id="properties">
                <div className="listings-header">
                    <div>
                        <p className="section-label">OUR PROPERTIES</p>
                        <h2>Discover Your Next Property</h2>
                        <p>
                            Explore property information available through
                            the VALORA platform.
                        </p>
                    </div>

                    <Link to="/properties" className="view-all">
                        VIEW ALL PROPERTIES
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

            {/* VALORA INTELLIGENCE */}
            <section className="intelligence-section" id="valuation">
                <div className="intelligence-content">
                    <div className="intelligence-text">
                        <p className="section-label">VALORA INTELLIGENCE</p>
                        <h2>
                            Insights That Empower
                            <br />
                            Better Decisions
                        </h2>
                        <p>
                            Access tools designed to support property
                            valuation, investment analysis, and informed
                            decision-making.
                        </p>

                        <div className="intelligence-features">
                            <div>
                                <h3>Property Valuation</h3>
                                <p>Explore property value estimates and insights.</p>
                            </div>
                            <div>
                                <h3>Investment Analysis</h3>
                                <p>Review investment performance and potential returns.</p>
                            </div>
                            <div>
                                <h3>Data-Driven Insights</h3>
                                <p>Use available property information to guide decisions.</p>
                            </div>
                            <div>
                                <h3>Centralised Information</h3>
                                <p>Keep relevant property insights accessible in one place.</p>
                            </div>
                        </div>

                        <Link to="/login" className="primary-btn">
                            ACCESS VALORA INTELLIGENCE
                        </Link>
                    </div>
                </div>
            </section>

            {/* COMMUNITY */}
            <section className="community-section" id="community">
                <div className="community-content">
                    <div className="community-text">
                        <p className="section-label">OUR COMMUNITY</p>
                        <h2>
                            Connected People.
                            <br />
                            Stronger Communities.
                        </h2>
                        <p>
                            VALORA helps residents, property professionals,
                            and administrators work together through
                            organised communication and community tools.
                        </p>

                        <div className="community-features">
                            <div className="community-feature">
                                <h3>Community Announcements</h3>
                                <p>Keep up with important community updates.</p>
                            </div>
                            <div className="community-feature">
                                <h3>Resident Collaboration</h3>
                                <p>Support communication between residents and management.</p>
                            </div>
                            <div className="community-feature">
                                <h3>Service Provider Directory</h3>
                                <p>Find relevant service providers through the platform.</p>
                            </div>
                            <div className="community-feature">
                                <h3>Community Management</h3>
                                <p>Help administrators organise community activities.</p>
                            </div>
                        </div>

                        <Link to="/login" className="primary-btn">
                            ENTER YOUR COMMUNITY
                        </Link>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="how-it-works">
                <div className="how-content">
                    <div className="how-header">
                        <p className="section-label">HOW IT WORKS</p>
                        <h2>
                            Your Property Journey,
                            <br />
                            Made Simpler
                        </h2>
                        <p>
                            Get started with VALORA and access the tools
                            relevant to your role and community.
                        </p>
                    </div>

                    <div className="steps">
                        <div className="step">
                            <div className="step-number">01</div>
                            <h3>Access Your Account</h3>
                            <p>Log in to access your role-specific dashboard.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">02</div>
                            <h3>Explore Your Tools</h3>
                            <p>View the property and community features available to you.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">03</div>
                            <h3>Manage and Connect</h3>
                            <p>Use the platform to manage tasks and communicate.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">04</div>
                            <h3>Make Informed Decisions</h3>
                            <p>Use available information to support your property journey.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section className="about-section" id="about">
                <div className="about-content">
                    <p className="section-label">ABOUT VALORA</p>
                    <h2>
                        A Smarter Approach to
                        <br />
                        Property and Community
                    </h2>
                    <p>
                        VALORA is a property and community management
                        platform designed to bring property information,
                        management tools, intelligent insights, and
                        community collaboration into one connected experience.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default Home;
