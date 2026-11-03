import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../services/session"; // <-- IMPORT SESSION
import { apiRequest } from "../services/apiClient";
import { getProperty } from "../services/propertyApi";
import { createPropertyRequest, parsePrice } from "../services/propertyRequestApi";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import "./RequestToSell.css";

/* =========================================================
   ICON
========================================================= */
function CheckIcon() {
    return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 12.5L9.2 16.5L19 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* =========================================================
   REQUEST TO SELL / RENT
========================================================= */
function RequestToSell() {
    const navigate = useNavigate();
    const { user } = useSession(); 

    // Safely get role (lowercase from API) and user info
    const userRole = String(user?.role || "").toLowerCase();
    // check for lowercase matches
    const isAllowed = userRole === "resident";


    /* =====================================================
       PROPERTY DATA (Fetch from API)
    ===================================================== */
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [propertiesLoading, setPropertiesLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let cancelled = false;

        // A resident may only request a sale or rental of their own unit: the one the
        // HOA linked to their account in the resident directory. It is selected for them.
        async function fetchProperties() {
            try {
                const records = await apiRequest("/api/v1/resident-directory");
                const ownRecord = (Array.isArray(records) ? records : records?.items || [])[0];

                if (!ownRecord?.property_id) return;

                const ownUnit = await getProperty(ownRecord.property_id);
                if (cancelled) return;

                setSelectedProperty(ownUnit);
                setForm((previous) => ({ ...previous, propertyId: String(ownUnit.id) }));
            } catch (err) {
                console.error("Failed to load your property:", err);
                if (!cancelled) setLoadError("Unable to load your property. Please refresh and try again.");
            } finally {
                if (!cancelled) setPropertiesLoading(false);
            }
        }

        fetchProperties();

        return () => {
            cancelled = true;
        };
    }, []);

    const propertyLabel = (property) =>
        [property.unitNo && `Unit ${property.unitNo}`, property.complexName].filter(Boolean).join(" — ") ||
        `Property ${property.id}`;

    /* =====================================================
       FORM
    ===================================================== */
    const [form, setForm] = useState({
        propertyId: "",
        requestType: "Sell",
        askingPrice: "",
        rentalPeriod: "",
        additionalDetails: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* =====================================================
       ACCESS CONTROL (FIXED FOR API ROLES)
    ===================================================== */
    // Only residents may request a sale or rental
    if (!isAllowed) {
        return (
            <div className="request-page">
                <DashboardSidebar />
                <main className="request-main">
                    <div className="request-container">
                        <div className="request-card request-access-card">
                            <div className="request-access-icon">
                                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M12 3L20 6V11C20 16.2 16.7 19.5 12 21C7.3 19.5 4 16.2 4 11V6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                    <path d="M12 8V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <circle cx="12" cy="15.5" r="0.8" fill="currentColor" />
                                </svg>
                            </div>
                            <h1>Access Restricted</h1>
                            <p>Only residents can submit property sale or rental requests.</p>
                            <button type="button" onClick={() => navigate("/dashboard")}>
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleRequestTypeChange = (requestType) => {
        setForm((previous) => ({ ...previous, requestType, askingPrice: "", rentalPeriod: "" }));
        setError("");
    };

    /* =====================================================
       SUBMIT (Connect to API)
    ===================================================== */
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.propertyId) return setError("Your account is not linked to a property yet. Ask the HOA to assign your unit first.");
        if (!selectedProperty) return setError("The selected property could not be found.");
        if (!form.askingPrice.trim()) {
            return setError(form.requestType === "Sell" ? "Please enter your asking sale price." : "Please enter your monthly rental price.");
        }
        if (parsePrice(form.askingPrice) <= 0) {
            return setError("Please enter a price greater than zero, for example R1,250,000.");
        }

        setIsSubmitting(true);

        try {
            await createPropertyRequest({
                unitId: selectedProperty.id,
                requestType: form.requestType,
                askingPrice: form.askingPrice,
                rentalPeriod: form.requestType === "Rent" ? form.rentalPeriod : null,
                additionalDetails: form.additionalDetails,
            });

            setSubmitted(true);
        } catch (err) {
            // 409: an open request for this unit already exists; 422: a field was invalid
            setError(
                (err?.message || "").replace(/Value error,\s*/gi, "") ||
                    "Unable to submit your request. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /* =====================================================
       SUCCESS
    ===================================================== */
    if (submitted) {
        return (
            <div className="request-page">
                <DashboardSidebar />
                <main className="request-main">
                    <div className="request-card request-success">
                        <div className="success-icon"><CheckIcon /></div>
                        <h1>Request Submitted</h1>
                        <p>Your property request has been submitted to the HOA Administrator for review.</p>
                        <p>The HOA will review the property and financial information before deciding whether the request can proceed.</p>
                        <div className="success-status">
                            <span>Status</span>
                            <strong>Pending HOA Review</strong>
                        </div>
                        {selectedProperty && (
                            <div className="success-property">
                                <span>Property</span>
                                <strong>{propertyLabel(selectedProperty)}</strong>
                            </div>
                        )}
                        <button type="button" onClick={() => navigate("/dashboard")}>Return to Dashboard</button>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       FORM UI 
    ===================================================== */
    return (
        <div className="request-page">
            <DashboardSidebar />
            <main className="request-main">
                <div className="request-container">
                    <div className="request-header">
                        <div>
                            <span className="request-eyebrow">PROPERTY SERVICES</span>
                            <h1>Request to Sell or Rent</h1>
                            <p>Submit an existing VALORA property for HOA review before an estate agent can be assigned.</p>
                        </div>
                    </div>

                    <form className="request-card" onSubmit={handleSubmit}>
                        {/* REQUEST TYPE */}
                        <section className="form-section">
                            <div className="section-heading">
                                <h2>Request Type</h2>
                                <p>Select what you would like to do with your property.</p>
                            </div>
                            <div className="request-type-grid">
                                <button type="button" className={form.requestType === "Sell" ? "request-type active" : "request-type"} onClick={() => handleRequestTypeChange("Sell")}>
                                    <strong>Sell Property</strong>
                                    <span>Request an estate agent to market your property for sale.</span>
                                </button>
                                <button type="button" className={form.requestType === "Rent" ? "request-type active" : "request-type"} onClick={() => handleRequestTypeChange("Rent")}>
                                    <strong>Rent Property</strong>
                                    <span>Request an estate agent to market your property for rental.</span>
                                </button>
                            </div>
                        </section>

                        {/* YOUR PROPERTY */}
                        <section className="form-section">
                            <div className="section-heading">
                                <h2>Your Property</h2>
                                <p>The VALORA unit linked to your account. This request will be made for this property.</p>
                            </div>
                            {propertiesLoading && <p className="form-hint">Loading your property…</p>}
                            {loadError && <p className="form-error" role="alert">{loadError}</p>}
                            {!propertiesLoading && !loadError && !selectedProperty && (
                                <p className="form-hint">
                                    Your account is not linked to a property yet. Ask the HOA to assign your unit before submitting a request.
                                </p>
                            )}

                            {selectedProperty && (
                                <div className="selected-property">
                                    <div className="selected-property-header">
                                        <div>
                                            <span>YOUR PROPERTY</span>
                                            <h3>{propertyLabel(selectedProperty)}</h3>
                                        </div>
                                        <strong>#{selectedProperty.id}</strong>
                                    </div>
                                    <div className="selected-property-details">
                                        <div><span>Complex</span><strong>{selectedProperty.complexName || "Not specified"}</strong></div>
                                        <div><span>Address</span><strong>{selectedProperty.streetAddress || "Not specified"}</strong></div>
                                        <div><span>Suburb</span><strong>{selectedProperty.suburb || "Not specified"}</strong></div>
                                        <div><span>Bedrooms</span><strong>{selectedProperty.bedrooms ?? "Not specified"}</strong></div>
                                        <div><span>Bathrooms</span><strong>{selectedProperty.bathrooms ?? "Not specified"}</strong></div>
                                        <div><span>Property Size</span><strong>{selectedProperty.sizeM2 != null ? `${selectedProperty.sizeM2} m²` : "Not specified"}</strong></div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* FINANCIAL INFO */}
                        <section className="form-section">
                            <div className="section-heading">
                                <h2>Financial Information</h2>
                                <p>This information will be reviewed by the HOA before approval.</p>
                            </div>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>{form.requestType === "Sell" ? "Asking Sale Price" : "Monthly Rental Price"}<span>*</span></label>
                                    <input name="askingPrice" value={form.askingPrice} onChange={handleChange} placeholder={form.requestType === "Sell" ? "e.g. R1,250,000" : "e.g. R12,500"} />
                                </div>
                                {form.requestType === "Rent" && (
                                    <div className="form-field">
                                        <label>Rental Period</label>
                                        <select name="rentalPeriod" value={form.rentalPeriod} onChange={handleChange}>
                                            <option value="">Select period</option>
                                            <option value="Short Term">Short Term</option>
                                            <option value="Long Term">Long Term</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ADDITIONAL DETAILS */}
                        <section className="form-section">
                            <div className="section-heading">
                                <h2>Additional Information</h2>
                                <p>Add any information that may assist the HOA in reviewing your request.</p>
                            </div>
                            <div className="form-field">
                                <label>Property Details</label>
                                <textarea name="additionalDetails" value={form.additionalDetails} onChange={handleChange} rows="5" placeholder="Describe the property, improvements, special features or any other relevant information." />
                            </div>
                        </section>

                        {error && <div className="form-error">{error}</div>}

                        <div className="form-actions">
                            <button type="button" className="secondary-button" onClick={() => navigate("/dashboard")}>Cancel</button>
                            <button type="submit" className="primary-button" disabled={isSubmitting || propertiesLoading}>{isSubmitting ? "Submitting…" : "Submit for HOA Review"}</button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default RequestToSell;