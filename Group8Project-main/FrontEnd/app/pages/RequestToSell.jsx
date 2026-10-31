import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../services/session";
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

    const userRole = String(user?.role || "").toLowerCase();
    const isAllowed = ["resident", "investor"].includes(userRole);

    // We no longer need a list of all properties, just the user's assigned one
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [propertyLoading, setPropertyLoading] = useState(true);

    const [form, setForm] = useState({
        propertyId: "",
        requestType: "Sell",
        askingPrice: "",
        rentalPeriod: "",
        financialInformation: "",
        additionalDetails: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    /* =====================================================
       FETCH THE RESIDENT'S PROPERTY
    ===================================================== */
    useEffect(() => {
        const fetchMyProperty = async () => {
            if (!user) return;

            try {
                const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
                const response = await fetch("http://127.0.0.1:8000/api/v1/resident-directory", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const records = data.items || data || [];
                    
                    if (records.length > 0) {
                        const myRecord = records[0];
                        
                        // Set the form propertyId directly
                        setForm(prev => ({
                            ...prev,
                            propertyId: String(myRecord.property_id)
                        }));

                        // Set the display info
                        setSelectedProperty({
                            id: myRecord.property_id,
                            unit: myRecord.unit_no,
                            type: myRecord.complex_name,
                            address: myRecord.street_address
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load property:", err);
            } finally {
                setPropertyLoading(false);
            }
        };
        fetchMyProperty();
    }, [user]);

    /* =====================================================
       ACCESS CONTROL 
    ===================================================== */
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
                            <p>Only residents and investors can submit property sale or rental requests.</p>
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
       SUBMIT 
    ===================================================== */
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!selectedProperty) return setError("No property is linked to your account. Please contact the HOA.");
        if (!form.askingPrice.trim()) {
            return setError(form.requestType === "Sell" ? "Please enter your asking sale price." : "Please enter your monthly rental price.");
        }

        try {
            const token = localStorage.getItem("access_token") || localStorage.getItem("valora_token");
            
            const payload = {
                unit_id: selectedProperty.id,
                request_type: form.requestType,
                asking_price: parseFloat(form.askingPrice.replace(/[^0-9.]/g, '')) || 0,
                rental_period: form.rentalPeriod || null,
                financial_information: form.financialInformation,
                additional_details: form.additionalDetails,
            };

            const response = await fetch("http://127.0.0.1:8000/api/v1/property-requests", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                console.log("BACKEND ERROR:", errData);
                let msg = "Failed to submit request";
                if (Array.isArray(errData.detail)) {
                    msg = errData.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(", ");
                } else if (typeof errData.detail === 'string') {
                    msg = errData.detail;
                }
                throw new Error(msg);
            }

            setSubmitted(true);
        } catch (err) {
            setError(err.message);
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
                        
                        <div className="success-status">
                            <span>Status</span>
                            <strong>Pending HOA Review</strong>
                        </div>
                        {selectedProperty && (
                            <div className="success-property">
                                <span>Property</span>
                                <strong>Unit {selectedProperty.unit} — {selectedProperty.type}</strong>
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
                            <p>Submit your property for HOA review before an estate agent can be assigned.</p>
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

                        {/* PROPERTY SELECTION (Now a read-only card) */}
                        <section className="form-section">
                            <div className="section-heading">
                                <h2>Your Property</h2>
                                <p>The property linked to your account.</p>
                            </div>
                            
                            {propertyLoading ? (
                                <p>Loading your property...</p>
                            ) : selectedProperty ? (
                                <div style={{ padding: "20px", background: "#f5f3f7", borderRadius: "10px", border: "1px solid #ddd7e1" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                        <h3 style={{ margin: 0, color: "#29242d" }}>Unit {selectedProperty.unit}</h3>
                                        <span style={{ padding: "4px 10px", background: "#563f6b", color: "white", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                                            {selectedProperty.type}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: "#77717d", fontSize: "13px" }}>
                                        {selectedProperty.address}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ padding: "20px", background: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca" }}>
                                    <p style={{ margin: 0, color: "#dc2626", fontWeight: "600" }}>
                                        No property is linked to your account. Please contact the HOA Administrator to get your unit assigned.
                                    </p>
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
                                <div className="form-field full">
                                    <label>Financial Information</label>
                                    <textarea name="financialInformation" value={form.financialInformation} onChange={handleChange} rows="4" placeholder="Provide any relevant financial information the HOA should consider." />
                                </div>
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
                            <button type="submit" className="primary-button" disabled={!selectedProperty || propertyLoading}>
                                Submit for HOA Review
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default RequestToSell;