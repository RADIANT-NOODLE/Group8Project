import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../services/session"; // <-- IMPORT SESSION
import { apiRequest } from "../services/apiClient";
import { getProperty } from "../services/propertyApi";
import { createPropertyRequest, listPropertyRequests, parsePrice } from "../services/propertyRequestApi";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import "./RequestToSell.css";

/* =========================================================
   REQUEST PROGRESS
   The stages a sale/rent request moves through, in order.
========================================================= */

const OPEN_STATUSES = ["pending_review", "approved", "assigned", "listed"];
const COMPLETE_STATUSES = ["sold", "rented"];

const TRACKER_REFRESH_SECONDS = 30;

// how far each backend status has got (index into the steps below)
const STATUS_STEP = { pending_review: 0, approved: 1, assigned: 2, listed: 3, sold: 4, rented: 4, rejected: 1 };

function requestSteps(request) {
    const isRent = String(request.requestType).toLowerCase() === "rent";
    return [
        { label: "Submitted", hint: "Sent to the HOA" },
        { label: "Approved by the HOA", hint: "Cleared to go to market" },
        { label: "Estate agent assigned", hint: request.assignedAgentName || "An agent will handle the listing" },
        { label: "Listed", hint: isRent ? "Advertised for rent" : "Advertised for sale" },
        { label: isRent ? "Rented" : "Sold", hint: isRent ? "A tenant has been found" : "The sale has gone through" },
    ];
}

function formatRequestDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

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
    // the resident's own sale/rent requests, newest first
    const [myRequests, setMyRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [startNewRequest, setStartNewRequest] = useState(false);

    async function loadMyRequests() {
        try {
            const { items } = await listPropertyRequests();
            setMyRequests([...items].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
        } catch (err) {
            console.error("Failed to load your requests:", err);
        } finally {
            setRequestsLoading(false);
        }
    }

    useEffect(() => {
        loadMyRequests();

        // the HOA and the agent move the request on from their own screens, so look for changes
        function refreshIfVisible() {
            if (document.visibilityState === "visible") loadMyRequests();
        }

        const timer = window.setInterval(refreshIfVisible, TRACKER_REFRESH_SECONDS * 1000);
        document.addEventListener("visibilitychange", refreshIfVisible);
        window.addEventListener("focus", refreshIfVisible);

        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", refreshIfVisible);
            window.removeEventListener("focus", refreshIfVisible);
        };
    }, []);
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
            setStartNewRequest(false);
            await loadMyRequests();
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
       REQUEST STATUS
       An open (or finished) request is shown as a tracker;
       the form only appears when there is nothing open.
    ===================================================== */
    const latest = myRequests[0] || null;
    const latestStatus = latest?.rawStatus || "";
    const hasOpenRequest = OPEN_STATUSES.includes(latestStatus);
    const showTracker = Boolean(latest) && (hasOpenRequest || COMPLETE_STATUSES.includes(latestStatus) || latestStatus === "rejected");
    const showForm = !requestsLoading && (!latest || (!hasOpenRequest && startNewRequest) || latestStatus === "rejected");

    const tracker = showTracker && (() => {
        const steps = requestSteps(latest);
        const reached = STATUS_STEP[latestStatus] ?? 0;
        const rejected = latestStatus === "rejected";
        const complete = COMPLETE_STATUSES.includes(latestStatus);

        return (
            <section className="request-card request-tracker" aria-labelledby="request-tracker-title">
                {submitted && (
                    <p className="request-tracker-notice" role="status">
                        <CheckIcon /> Your request has been sent to the HOA.
                    </p>
                )}

                <div className="request-tracker-head">
                    <div>
                        <span className="request-eyebrow">YOUR REQUEST</span>
                        <h2 id="request-tracker-title">
                            {latest.requestType ? `${latest.requestType} request` : "Property request"}
                            {latest.unitNo ? ` · Unit ${latest.unitNo}` : ""}
                        </h2>
                        <p>
                            Submitted {formatRequestDate(latest.createdAt)}
                            {latest.askingPrice ? ` · R ${Number(latest.askingPrice).toLocaleString("en-ZA")}` : ""}
                            {String(latest.requestType).toLowerCase() === "rent" && latest.askingPrice ? " / month" : ""}
                        </p>
                    </div>
                    <span className={`request-tracker-status status-${latestStatus}`}>{latest.status}</span>
                </div>

                <ol className="request-tracker-steps">
                    {steps.map((step, index) => {
                        const isRejectedStep = rejected && index === 1;
                        const state = isRejectedStep
                            ? "is-rejected"
                            : index < reached || (complete && index === reached)
                                ? "is-done"
                                : index === reached && !rejected
                                    ? "is-current"
                                    : "";

                        return (
                            <li key={step.label} className={state}>
                                <span className="request-tracker-dot" aria-hidden="true">
                                    {isRejectedStep ? "✕" : state === "is-done" ? "✓" : index + 1}
                                </span>
                                <div>
                                    <strong>{isRejectedStep ? "Not approved by the HOA" : step.label}</strong>
                                    <small>{isRejectedStep ? latest.rejectionReason || "The HOA did not approve this request." : step.hint}</small>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                {complete && !startNewRequest && (
                    <div className="request-tracker-footer">
                        <p>This request is complete. You can submit a new one if you need to.</p>
                        <button type="button" onClick={() => setStartNewRequest(true)}>Start a new request</button>
                    </div>
                )}
                {rejected && (
                    <div className="request-tracker-footer">
                        <p>You can correct the details below and submit a new request.</p>
                    </div>
                )}
            </section>
        );
    })();

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
                            <p>Track your sale or rental request, or submit a new one for HOA review.</p>
                        </div>
                    </div>

                    {requestsLoading && (
                        <section className="request-card request-tracker" aria-busy="true">
                            <p className="request-tracker-loading">Loading your requests…</p>
                        </section>
                    )}

                    {tracker}

                    {showForm && (
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
                    )}
                </div>
            </main>
        </div>
    );
}

export default RequestToSell;