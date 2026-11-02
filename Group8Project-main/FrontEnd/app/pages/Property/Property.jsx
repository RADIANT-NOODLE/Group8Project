import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./Property.css";
import { getSessionToken, getStoredUser, updateSessionUser } from "../../services/session";

/*
=========================================================
VALORA PROPERTY DETAIL PAGE
=========================================================
*/

export default function Property() {
    const { propertyId } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    =====================================================
    FETCH PROPERTY FROM API
    =====================================================
    */
    useEffect(() => {
        const fetchProperty = async () => {
            if (!propertyId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const token = getSessionToken();
                const response = await fetch(`http://127.0.0.1:8000/api/v1/properties/${propertyId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Property not found");
                }

                const data = await response.json();
                
                setProperty({
                    id: data.id || data.unit_id,
                    title: data.complex_name || "Property",
                    unitNumber: data.unit_no,
                    location: `${data.street_address}${data.suburb ? `, ${data.suburb}` : ""}`,
                    propertyType: data.property_type || "House",
                    bedrooms: data.bedrooms,
                    bathrooms: data.bathrooms,
                    floorArea: data.size_m2 ? Number(data.size_m2) : null,
                    development: data.complex_name,
                    features: [], 
                    listing: null 
                });
            } catch (err) {
                console.error("Error fetching property:", err);
                setError(err.message);
                setProperty(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);


    /*
    =====================================================
    SAVE / UNSAVE PROPERTY
    =====================================================
    */
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!property) return;

        const user = getStoredUser();

        if (!user?.hoa_approved) {
            setIsSaved(false);
            return;
        }

        try {
            const savedProperties = Array.isArray(user.savedProperties) ? user.savedProperties : [];
            setIsSaved(savedProperties.some(id => String(id) === String(property.id)));
        } catch (error) {
            console.error("Unable to load user:", error);
        }
    }, [property]);

    const handleSaveProperty = () => {
        const user = getStoredUser();

        if (!user?.hoa_approved) {
            window.location.href = "/login";
            return;
        }

        if (!property) return;

        try {
            const savedProperties = Array.isArray(user.savedProperties) ? user.savedProperties : [];

            let updatedSavedProperties;
            if (isSaved) {
                updatedSavedProperties = savedProperties.filter(id => String(id) !== String(property.id));
            } else {
                updatedSavedProperties = [...savedProperties, property.id];
            }

            updateSessionUser({ savedProperties: updatedSavedProperties });
            setIsSaved(!isSaved);
        } catch (error) {
            console.error("Unable to save property:", error);
        }
    };


    /*
    =====================================================
    LOADING STATE
    =====================================================
    */
    if (loading) {
        return (
            <div className="property-page">
                <header className="property-public-header">
                    <Link to="/" className="property-logo-link">
                        <img src="/assets/valora-logo.jpg" alt="VALORA Logo" />
                    </Link>
                    <div className="property-header-actions">
                        <Link to="/login" className="property-header-login">Login</Link>
                        <Link to="/register" className="property-header-register">Register</Link>
                    </div>
                </header>

                {/* A placeholder in the shape of the page, so the layout does not jump when it loads. */}
                <main className="property-main property-loading" role="status" aria-busy="true">
                    <span className="property-visually-hidden">Loading property details…</span>

                    <div className="property-skeleton property-skeleton-back" aria-hidden="true" />

                    <section className="property-header-card" aria-hidden="true">
                        <div className="property-header-content">
                            <div className="property-skeleton-stack">
                                <div className="property-skeleton property-skeleton-badge" />
                                <div className="property-skeleton property-skeleton-line short" />
                                <div className="property-skeleton property-skeleton-title" />
                                <div className="property-skeleton property-skeleton-line medium" />
                            </div>
                            <div className="property-skeleton-stack property-skeleton-price">
                                <div className="property-skeleton property-skeleton-line short" />
                                <div className="property-skeleton property-skeleton-amount" />
                            </div>
                        </div>
                    </section>

                    <section className="property-section-card" aria-hidden="true">
                        <div className="property-skeleton property-skeleton-heading" />
                        <div className="property-skeleton property-skeleton-photo">
                            <svg viewBox="0 0 24 24" width="42" height="42">
                                <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 9.5V21h14V9.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </section>

                    <section className="property-stats-grid" aria-hidden="true">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="property-stat-card property-skeleton-stat">
                                <div className="property-skeleton property-skeleton-icon" />
                                <div className="property-skeleton property-skeleton-line short" />
                                <div className="property-skeleton property-skeleton-value" />
                            </div>
                        ))}
                    </section>

                    <section className="property-section-card" aria-hidden="true">
                        <div className="property-skeleton property-skeleton-heading" />
                        <div className="property-information-grid">
                            {[0, 1, 2, 3].map((index) => (
                                <div key={index} className="property-skeleton property-skeleton-info" />
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    /*
    =====================================================
    PROPERTY NOT FOUND
    =====================================================
    */
    if (!property || error) {
        return (
            <div className="property-page">
                <header className="property-public-header">
                    <Link to="/" className="property-logo-link">
                        <img src="/assets/valora-logo.jpg" alt="VALORA Logo" />
                    </Link>
                    <div className="property-header-actions">
                        <Link to="/login" className="property-header-login">Login</Link>
                        <Link to="/register" className="property-header-register">Register</Link>
                    </div>
                </header>

                <main className="property-not-found-main">
                    <div className="property-not-found-card">
                        <div className="property-not-found-icon">
                            <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                                <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 9.5V21h14V9.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                                <path d="M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1>Property Not Found</h1>
                        <p>The property you are looking for could not be found in the VALORA database.</p>
                        <button onClick={() => navigate(-1)} className="property-primary-button" style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>
                            Back
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    /*
    =====================================================
    LISTING HELPERS
    =====================================================
    */
    const listing = property.listing || {};
    const listingType = listing.listingType || null;
    const unitStatus = property.status || "Available";
    
    const getPriceDisplay = () => {
        if (!listing.askingPrice && !listing.rentalPrice) return "Not currently listed";
        if (listingType === "For Sale" && listing.askingPrice) return `R${Number(listing.askingPrice).toLocaleString()}`;
        if (listingType === "For Rent" && listing.rentalPrice) return `R${Number(listing.rentalPrice).toLocaleString()} / month`;
        return "Not currently listed";
    };

    const getStatusClass = () => {
        if (unitStatus === "Sold") return "status-sold";
        if (unitStatus === "Rented") return "status-rented";
        if (unitStatus === "Under Offer") return "status-under-offer";
        return "status-available";
    };

    // Icon Helpers
    const FeatureIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M5 12.5L10 17l9-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const BedroomIcon = () => (
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path d="M4 18v-6h16v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 12V8h16v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 10v2M17 10v2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M3 18h18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );

    const BathroomIcon = () => (
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path d="M4 12h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M6 12V6a2 2 0 0 1 4 0v2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M4 12v2a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const PropertyTypeIcon = () => (
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9.5V21h14V9.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
    );

    const StatusIcon = () => (
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8 8h8M8 12h8M8 16h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );

    const PropertyPhotoPlaceholder = () => (
        <div className="property-photo-placeholder">
            <div className="property-photo-placeholder-icon">
                <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
                    <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 9.5V21h14V9.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            </div>
            <h3>Photos Coming Soon</h3>
            <p>Approved property photographs will be displayed here once they have been uploaded.</p>
        </div>
    );

    const propertyStats = [
        { icon: <BedroomIcon />, label: "Bedrooms", value: property.bedrooms },
        { icon: <BathroomIcon />, label: "Bathrooms", value: property.bathrooms },
        { icon: <PropertyTypeIcon />, label: "Property Type", value: property.propertyType, compact: true },
        { icon: <StatusIcon />, label: "Unit Status", value: unitStatus, compact: true },
    ];

    return (
        <div className="property-page">
            <header className="property-public-header">
                <Link to="/" className="property-logo-link">
                    <img src="/assets/valora-logo.jpg" alt="VALORA Logo" />
                </Link>
                <div className="property-header-actions">
                    <Link to="/login" className="property-header-login">Login</Link>
                    <Link to="/register" className="property-header-register">Register</Link>
                </div>
            </header>

            <main className="property-main">
                
                <button 
                    onClick={() => navigate(-1)} 
                    className="property-back-link"
                    style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}
                >
                    <span aria-hidden="true">←</span> Back
                </button>

                <section className="property-header-card">
                    <div className="property-header-content">
                        <div>
                            <span className={`property-status-badge ${getStatusClass()}`}>
                                {unitStatus.toUpperCase()}
                            </span>
                            <div className="property-unit-label">
                                {property.unitNumber} {" • "} {property.propertyType}
                            </div>
                            <h1>{property.title}</h1>
                            <p className="property-location">{property.location}</p>
                        </div>
                        <div className="property-price-area">
                            <span>{listingType === "For Rent" ? "Monthly Rental" : listingType === "For Sale" ? "Asking Price" : "Listing Status"}</span>
                            <strong className={listingType ? "property-price" : "property-price property-price-status"}>
                                {getPriceDisplay()}
                            </strong>
                        </div>
                    </div>

                    <div className="property-save-row">
                        <div>
                            <strong>{isSaved ? "Property Saved" : "Interested in this property?"}</strong>
                            <span>{isSaved ? "You can find this property in your dashboard." : "Save it to easily find it again later."}</span>
                        </div>
                        <button type="button" onClick={handleSaveProperty} className={isSaved ? "property-save-button saved" : "property-save-button"}>
                            {isSaved ? "Saved Property" : "Save Property"}
                        </button>
                    </div>
                </section>

                <section className="property-section-card">
                    <div className="property-section-heading">
                        <h2>Property Photos</h2>
                        <p>Approved images for this property.</p>
                    </div>
                    <PropertyPhotoPlaceholder />
                </section>

                <section className="property-stats-grid">
                    {propertyStats.map(stat => (
                        <div key={stat.label} className="property-stat-card">
                            <div className="property-stat-icon">{stat.icon}</div>
                            <span>{stat.label}</span>
                            <strong className={stat.compact ? "property-stat-value compact" : "property-stat-value"}>
                                {stat.value || "—"}
                            </strong>
                        </div>
                    ))}
                </section>

                <section className="property-section-card">
                    <div className="property-section-heading">
                        <h2>Unit Information</h2>
                        <p>Key information about this VALORA unit.</p>
                    </div>
                    <div className="property-information-grid">
                        {[
                            ["Unit Number", property.unitNumber],
                            ["Floor", property.floor || "Information TBC"],
                            ["Floor Area", property.floorArea ? `${property.floorArea} m²` : "Information TBC"],
                            ["Development", property.development || property.location || "VALORA Development"]
                        ].map(([label, value]) => (
                            <div key={label} className="property-information-item">
                                <span>{label}</span>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="property-section-card">
                    <div className="property-section-heading">
                        <h2>About This Property</h2>
                    </div>
                    <div className="property-description">
                        <p>Property information for this unit is being updated as the VALORA development progresses.</p>
                        <p>{property.unitNumber} is currently <strong>{unitStatus.toLowerCase()}</strong> within the VALORA development.</p>
                    </div>
                </section>

                <section className="property-listing-status-card">
                    <div>
                        <p>Listing Status</p>
                        <h3>{listingType ? "Published" : "Not Currently Listed"}</h3>
                    </div>
                    {listingType && (
                        <div className="property-listing-type">
                            <p>Listing Type</p>
                            <strong>{listingType}</strong>
                        </div>
                    )}
                </section>

                <section className="property-contact-section">
                    <h2>Interested in this property?</h2>
                    <p>Register or log in to VALORA to access property intelligence, save properties and connect with the relevant property representative.</p>
                    <div className="property-contact-actions">
                        <Link to="/login" className="property-contact-login">Login</Link>
                        <Link to="/register" className="property-contact-register">Register</Link>
                    </div>
                </section>
            </main>

            <footer className="property-footer">
                <p>© 2026 VALORA — Property Intelligence</p>
            </footer>
        </div>
    );
}