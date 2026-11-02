import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperty, photoSrc } from "../../../services/propertyApi";
import "./MyPropertyCard.css";

/*
=========================================================
MY PROPERTY CARD

The resident's unit, shown on the resident dashboard.
`record` is the resident-directory entry that links the
signed-in resident to a unit (the dashboard already loads
it); the unit's details and photos come from the API.
=========================================================
*/

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

export default function MyPropertyCard({ record, loading: recordLoading }) {
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const propertyId = record?.property_id;

    useEffect(() => {
        if (!propertyId) {
            setProperty(null);
            return undefined;
        }

        let cancelled = false;
        setLoading(true);
        setError("");

        getProperty(propertyId)
            .then((unit) => {
                if (!cancelled) setProperty(unit);
            })
            .catch((loadError) => {
                console.error("Failed to load property:", loadError);
                if (!cancelled) setError("Unable to load your property details right now.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [propertyId]);

    if (recordLoading || loading) {
        return (
            <section className="my-property-empty-card" aria-busy="true">
                <div className="my-property-empty-icon"><PropertyIcon /></div>
                <div className="my-property-empty-content">
                    <span className="my-property-empty-label">My Property</span>
                    <h2>Loading your property…</h2>
                </div>
            </section>
        );
    }

    if (!record) {
        return (
            <section className="my-property-empty-card">
                <div className="my-property-empty-icon"><PropertyIcon /></div>
                <div className="my-property-empty-content">
                    <span className="my-property-empty-label">No Property Assigned</span>
                    <h2>Your VALORA property has not been assigned yet.</h2>
                    <p>Once the HOA Admin links your account to a unit, it will appear here.</p>
                    <Link to="/properties" className="my-property-secondary-button">Browse Properties</Link>
                </div>
            </section>
        );
    }

    /* If the unit could not be loaded, still show what the directory knows. */
    const unitNo = property?.unitNo || record.unit_no;
    const title = property?.complexName || record.complex_name || "VALORA Property";
    const location = property
        ? [property.streetAddress, property.suburb].filter(Boolean).join(", ")
        : record.street_address;
    const photo = photoSrc(property?.photos?.[0]?.url || property?.imageUrl);

    return (
        <section className="my-property-card">
            <div className="my-property-image">
                {photo ? (
                    <img src={photo} alt={`${title}, unit ${unitNo}`} />
                ) : (
                    <div className="my-property-image-placeholder">
                        <PropertyIcon />
                        <span>Property Image</span>
                        <small>Approved photographs will appear here when available.</small>
                    </div>
                )}
            </div>

            <div className="my-property-card-content">
                <div className="my-property-card-top">
                    <div>
                        <span className="my-property-unit">Unit {unitNo}</span>
                        <h2>{title}</h2>
                        <p className="my-property-location">{location}</p>
                    </div>
                    <div className="my-property-statuses">
                        <span className="my-property-occupancy">{record.occupancy || "Occupied"}</span>
                    </div>
                </div>

                {error && <p className="my-property-error" role="alert">{error}</p>}

                <div className="my-property-details">
                    <div className="my-property-detail">
                        <span className="my-property-detail-icon"><BedroomIcon /></span>
                        <div><span>Bedrooms</span><strong>{property?.bedrooms ?? "TBC"}</strong></div>
                    </div>
                    <div className="my-property-detail">
                        <span className="my-property-detail-icon"><BathroomIcon /></span>
                        <div><span>Bathrooms</span><strong>{property?.bathrooms ?? "TBC"}</strong></div>
                    </div>
                    <div className="my-property-detail">
                        <span className="my-property-detail-icon"><AreaIcon /></span>
                        <div><span>Floor Area</span><strong>{property?.sizeM2 ? `${property.sizeM2} m²` : "TBC"}</strong></div>
                    </div>
                </div>

                <div className="my-property-actions">
                    <Link to={`/property/${propertyId}`} className="my-property-primary-button">
                        View Property <ArrowIcon />
                    </Link>
                    <Link to="/valuation" className="my-property-secondary-button">
                        View Valuation
                    </Link>
                </div>
            </div>
        </section>
    );
}
