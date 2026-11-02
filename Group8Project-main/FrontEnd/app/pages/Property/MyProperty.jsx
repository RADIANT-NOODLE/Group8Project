import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession } from "../../services/session";
import "./MyProperty.css";

export default function MyProperty() {
    const { user } = useSession();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMyProperty = async () => {
            if (!user) return;

            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
                const headers = { "Authorization": `Bearer ${token}` };

                // 1. Fetch the resident directory to find which property is assigned to this user
                const dirRes = await fetch("http://127.0.0.1:8000/api/v1/resident-directory", { headers });
                
                if (dirRes.ok) {
                    const dirData = await dirRes.json();
                    const records = dirData.items || dirData || [];
                    
                    // 2. Find the record for the logged-in user
                    const myRecord = records.find(r => String(r.user_id) === String(user.id));
                    
                    if (myRecord) {
                        // 3. Fetch the actual property details using the property_id
                        const propRes = await fetch(`http://127.0.0.1:8000/api/v1/properties/${myRecord.property_id}`, { headers });
                        
                        if (propRes.ok) {
                            const propData = await propRes.json();
                            
                            // Map backend fields to what the UI expects
                            setProperty({
                                id: propData.id || propData.unit_id,
                                unitNumber: propData.unit_no,
                                title: propData.complex_name || "VALORA Property",
                                propertyType: propData.property_type || "House",
                                location: `${propData.street_address}${propData.suburb ? `, ${propData.suburb}` : ""}`,
                                development: propData.complex_name,
                                bedrooms: propData.bedrooms,
                                bathrooms: propData.bathrooms,
                                floorArea: propData.size_m2,
                                status: myRecord.occupancy || "Occupied",
                                description: "Property information is currently being updated.",
                                images: []
                            });
                        }
                    } else {
                        setProperty(null);
                    }
                }
            } catch (err) {
                console.error("Failed to load property:", err);
                setError("Unable to load your property details.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyProperty();
    }, [user]);

    // Icon Helpers
    const PropertyIcon = () => (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9.5V21h14V9.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
    );

    const BedroomIcon = () => (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M4 18v-6h16v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 12V8h16v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 10v2M17 10v2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M3 18h18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );

    const BathroomIcon = () => (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M4 12h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M6 12V6a2 2 0 0 1 4 0v2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M4 12v2a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const AreaIcon = () => (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const ArrowIcon = () => (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M5 12h13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    if (loading) {
        return (
            <div className="my-property-page">
                <DashboardSidebar />
                <main className="my-property-main">
                    <div className="my-property-loading">
                        <h2>Loading your property...</h2>
                    </div>
                </main>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="my-property-page">
                <DashboardSidebar />
                <main className="my-property-main">
                    <div className="my-property-header">
                        <div>
                            <span className="my-property-eyebrow">PROPERTY</span>
                            <h1>My Property</h1>
                            <p>Manage and view the property associated with your VALORA account.</p>
                        </div>
                    </div>
                    <section className="my-property-empty-card">
                        <div className="my-property-empty-icon"><PropertyIcon /></div>
                        <div className="my-property-empty-content">
                            <span className="my-property-empty-label">No Property Assigned</span>
                            <h2>Your VALORA property has not been assigned yet.</h2>
                            <p>Once the HOA Admin links your account to a unit, it will appear here.</p>
                            <Link to="/properties" className="my-property-secondary-button">Browse Properties</Link>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="my-property-page">
            <DashboardSidebar />
            <main className="my-property-main">
                <div className="my-property-header">
                    <div>
                        <span className="my-property-eyebrow">PROPERTY</span>
                        <h1>My Property</h1>
                        <p>View the property associated with your VALORA account.</p>
                    </div>
                </div>

                <section className="my-property-card">
                    <div className="my-property-image">
                        <div className="my-property-image-placeholder">
                            <PropertyIcon />
                            <span>Property Image</span>
                            <small>Approved photographs will appear here when available.</small>
                        </div>
                    </div>

                    <div className="my-property-card-content">
                        <div className="my-property-card-top">
                            <div>
                                <span className="my-property-unit">{property.unitNumber}</span>
                                <h2>{property.title}</h2>
                                <p className="my-property-location">{property.location}</p>
                            </div>
                            <div className="my-property-statuses">
                                <span className="my-property-occupancy">{property.status}</span>
                            </div>
                        </div>

                        <div className="my-property-details">
                            <div className="my-property-detail">
                                <span className="my-property-detail-icon"><BedroomIcon /></span>
                                <div><span>Bedrooms</span><strong>{property.bedrooms || "TBC"}</strong></div>
                            </div>
                            <div className="my-property-detail">
                                <span className="my-property-detail-icon"><BathroomIcon /></span>
                                <div><span>Bathrooms</span><strong>{property.bathrooms || "TBC"}</strong></div>
                            </div>
                            <div className="my-property-detail">
                                <span className="my-property-detail-icon"><AreaIcon /></span>
                                <div><span>Floor Area</span><strong>{property.floorArea ? `${property.floorArea} m²` : "TBC"}</strong></div>
                            </div>
                        </div>

                        <div className="my-property-description">
                            <span>Property Information</span>
                            <p>{property.description}</p>
                        </div>

                        <div className="my-property-actions">
                            <Link to={`/property/${property.id}`} className="my-property-primary-button">
                                View Property <ArrowIcon />
                            </Link>
                            <Link to="/valuation" className="my-property-secondary-button">
                                View Valuation
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}