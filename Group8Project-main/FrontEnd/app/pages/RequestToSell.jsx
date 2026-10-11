import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createPropertyRequest,
} from "../data/propertyRequests";
import {
    getProperties,
} from "../data/propertyStorage";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import { getSessionUser } from "../services/session.js";
import { ROLES, toRole } from "../services/roleMap.js";
import "./RequestToSell.css";


/* =========================================================
   ICON
========================================================= */

function CheckIcon() {

    return (

        <svg
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >

            <path
                d="M5 12.5L9.2 16.5L19 6.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

        </svg>

    );

}


/* =========================================================
   REQUEST TO SELL / RENT
========================================================= */

function RequestToSell() {

    const navigate = useNavigate();


    /* =====================================================
       CURRENT USER
    ===================================================== */

    const storedUser =
        getSessionUser();


    const userName = storedUser
        ? `${storedUser.firstName || ""} ${
              storedUser.lastName || ""
          }`.trim()
        : "";


    /*
    The session carries the backend's role values (`resident`,
    `investor`). Comparing against display strings ("Resident")
    refused every resident, who is exactly who this page is for.
    */

    const userRole =
        toRole(storedUser?.role);


    /* =====================================================
       PROPERTY DATA
    ===================================================== */

    const [properties, setProperties] =
        useState([]);


    const [selectedProperty, setSelectedProperty] =
        useState(null);


    useEffect(() => {

        const storedProperties =
            getProperties();

        setProperties(
            storedProperties
        );

    }, []);


    /* =====================================================
       FORM
    ===================================================== */

    const [form, setForm] =
        useState({

            propertyId: "",

            requestType: "Sell",

            askingPrice: "",

            rentalPeriod: "",

            financialInformation: "",

            additionalDetails: "",

        });


    const [submitted, setSubmitted] =
        useState(false);


    const [error, setError] =
        useState("");


    /* =====================================================
       ACCESS CONTROL
    ===================================================== */

    if (
        userRole !== ROLES.resident &&
        userRole !== ROLES.investor
    ) {

        return (

            <div className="request-page">

                <DashboardSidebar />


                <main className="request-main">

                    <div className="request-container">

                        <div className="request-card request-access-card">

                            <div className="request-access-icon">

                                <svg
                                    width="25"
                                    height="25"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >

                                    <path
                                        d="M12 3L20 6V11C20 16.2 16.7 19.5 12 21C7.3 19.5 4 16.2 4 11V6L12 3Z"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinejoin="round"
                                    />

                                    <path
                                        d="M12 8V12"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />

                                    <circle
                                        cx="12"
                                        cy="15.5"
                                        r="0.8"
                                        fill="currentColor"
                                    />

                                </svg>

                            </div>


                            <h1>
                                Access Restricted
                            </h1>


                            <p>
                                Only residents and investors
                                can submit property sale or
                                rental requests.
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                            >
                                Return to Dashboard
                            </button>

                        </div>

                    </div>

                </main>

            </div>

        );

    }


    /* =====================================================
       PROPERTY SELECTION
    ===================================================== */

    const handlePropertyChange = (
        event
    ) => {

        const propertyId =
            event.target.value;


        const property =
            properties.find(
                (item) =>
                    item.id === propertyId
            ) || null;


        setSelectedProperty(
            property
        );


        setForm((previous) => ({

            ...previous,

            propertyId,

        }));


        setError("");

    };


    /* =====================================================
       INPUT HANDLER
    ===================================================== */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setForm((previous) => ({

            ...previous,

            [name]: value,

        }));

    };


    /* =====================================================
       REQUEST TYPE
    ===================================================== */

    const handleRequestTypeChange = (
        requestType
    ) => {

        setForm((previous) => ({

            ...previous,

            requestType,

            askingPrice: "",

            rentalPeriod: "",

        }));


        setError("");

    };


    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = (
        event
    ) => {

        event.preventDefault();

        setError("");


        if (!form.propertyId) {

            setError(
                "Please select the property or unit you are requesting to sell or rent."
            );

            return;

        }


        if (!selectedProperty) {

            setError(
                "The selected property could not be found."
            );

            return;

        }


        if (!form.askingPrice.trim()) {

            setError(
                form.requestType === "Sell"
                    ? "Please enter your asking sale price."
                    : "Please enter your monthly rental price."
            );

            return;

        }


        createPropertyRequest({

            requesterId:
                storedUser?.id ||
                storedUser?.email ||
                "",

            requesterName:
                userName,

            requesterEmail:
                storedUser?.email ||
                "",

            requesterRole:
                userRole,


            /* =============================================
               EXISTING VALORA PROPERTY
            ============================================== */

            propertyId:
                selectedProperty.id,

            propertyAddress:
                selectedProperty.unit ||
                selectedProperty.name ||
                selectedProperty.id,

            propertyType:
                selectedProperty.type ||
                "",

            bedrooms:
                selectedProperty.bedrooms ??
                "",

            bathrooms:
                selectedProperty.bathrooms ??
                "",

            propertySize:
                selectedProperty.size ||
                selectedProperty.area ||
                "",


            /* =============================================
               REQUEST INFORMATION
            ============================================== */

            requestType:
                form.requestType,

            askingPrice:
                form.askingPrice,

            rentalPeriod:
                form.rentalPeriod,

            financialInformation:
                form.financialInformation,

            additionalDetails:
                form.additionalDetails,

        });


        setSubmitted(true);

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

                        <div className="success-icon">

                            <CheckIcon />

                        </div>


                        <h1>
                            Request Submitted
                        </h1>


                        <p>
                            Your property request has been
                            submitted to the HOA Administrator
                            for review.
                        </p>


                        <p>
                            The HOA will review the property
                            and financial information before
                            deciding whether the request can
                            proceed.
                        </p>


                        <div className="success-status">

                            <span>
                                Status
                            </span>

                            <strong>
                                Pending HOA Review
                            </strong>

                        </div>


                        {selectedProperty && (

                            <div className="success-property">

                                <span>
                                    Property
                                </span>

                                <strong>
                                    {selectedProperty.unit ||
                                        selectedProperty.name ||
                                        selectedProperty.id}
                                </strong>

                            </div>

                        )}


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Return to Dashboard
                        </button>

                    </div>

                </main>

            </div>

        );

    }


    /* =====================================================
       FORM
    ===================================================== */

    return (

        <div className="request-page">

            <DashboardSidebar />


            <main className="request-main">

                <div className="request-container">

                    <div className="request-header">

                        <div>

                            <span className="request-eyebrow">
                                PROPERTY SERVICES
                            </span>

                            <h1>
                                Request to Sell or Rent
                            </h1>

                            <p>
                                Submit an existing VALORA property
                                for HOA review before an estate agent
                                can be assigned.
                            </p>

                        </div>

                    </div>


                    <form
                        className="request-card"
                        onSubmit={handleSubmit}
                    >


                        {/* =============================================
                            REQUEST TYPE
                        ============================================== */}

                        <section className="form-section">

                            <div className="section-heading">

                                <h2>
                                    Request Type
                                </h2>

                                <p>
                                    Select what you would like
                                    to do with your property.
                                </p>

                            </div>


                            <div className="request-type-grid">

                                <button
                                    type="button"
                                    className={
                                        form.requestType === "Sell"
                                            ? "request-type active"
                                            : "request-type"
                                    }
                                    onClick={() =>
                                        handleRequestTypeChange(
                                            "Sell"
                                        )
                                    }
                                >

                                    <strong>
                                        Sell Property
                                    </strong>

                                    <span>
                                        Request an estate agent
                                        to market your property
                                        for sale.
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    className={
                                        form.requestType === "Rent"
                                            ? "request-type active"
                                            : "request-type"
                                    }
                                    onClick={() =>
                                        handleRequestTypeChange(
                                            "Rent"
                                        )
                                    }
                                >

                                    <strong>
                                        Rent Property
                                    </strong>

                                    <span>
                                        Request an estate agent
                                        to market your property
                                        for rental.
                                    </span>

                                </button>

                            </div>

                        </section>


                        {/* =============================================
                            PROPERTY SELECTION
                        ============================================== */}

                        <section className="form-section">

                            <div className="section-heading">

                                <h2>
                                    Select Property
                                </h2>

                                <p>
                                    Select the existing VALORA unit
                                    you are requesting to sell or rent.
                                </p>

                            </div>


                            <div className="form-grid">

                                <div className="form-field full">

                                    <label htmlFor="propertyId">

                                        Property / Unit

                                        <span>
                                            *
                                        </span>

                                    </label>


                                    <select
                                        id="propertyId"
                                        name="propertyId"
                                        value={
                                            form.propertyId
                                        }
                                        onChange={
                                            handlePropertyChange
                                        }
                                    >

                                        <option value="">
                                            Select a property or unit
                                        </option>


                                        {properties.map(
                                            (property) => (

                                                <option
                                                    key={
                                                        property.id
                                                    }
                                                    value={
                                                        property.id
                                                    }
                                                >

                                                    {property.unit ||
                                                        property.name ||
                                                        property.id}

                                                    {" — "}

                                                    {property.type ||
                                                        "Property"}

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            {/* =========================================
                                SELECTED PROPERTY DETAILS
                            ========================================== */}

                            {selectedProperty && (

                                <div className="selected-property">

                                    <div className="selected-property-header">

                                        <div>

                                            <span>
                                                SELECTED PROPERTY
                                            </span>

                                            <h3>
                                                {selectedProperty.unit ||
                                                    selectedProperty.name ||
                                                    selectedProperty.id}
                                            </h3>

                                        </div>

                                        <strong>
                                            {selectedProperty.id}
                                        </strong>

                                    </div>


                                    <div className="selected-property-details">

                                        <div>

                                            <span>
                                                Property Type
                                            </span>

                                            <strong>
                                                {selectedProperty.type ||
                                                    "Not specified"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Bedrooms
                                            </span>

                                            <strong>
                                                {selectedProperty.bedrooms ??
                                                    "Not specified"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Bathrooms
                                            </span>

                                            <strong>
                                                {selectedProperty.bathrooms ??
                                                    "Not specified"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Property Size
                                            </span>

                                            <strong>
                                                {selectedProperty.size ||
                                                    selectedProperty.area ||
                                                    "Not specified"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Floor
                                            </span>

                                            <strong>
                                                {selectedProperty.floor ||
                                                    "Not specified"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Unit Status
                                            </span>

                                            <strong>
                                                {selectedProperty.status ||
                                                    "Available"}
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            )}

                        </section>


                        {/* =============================================
                            FINANCIAL INFORMATION
                        ============================================== */}

                        <section className="form-section">

                            <div className="section-heading">

                                <h2>
                                    Financial Information
                                </h2>

                                <p>
                                    This information will be
                                    reviewed by the HOA before
                                    approval.
                                </p>

                            </div>


                            <div className="form-grid">

                                <div className="form-field">

                                    <label>

                                        {form.requestType === "Sell"
                                            ? "Asking Sale Price"
                                            : "Monthly Rental Price"}

                                        <span>
                                            *
                                        </span>

                                    </label>


                                    <input
                                        name="askingPrice"
                                        value={
                                            form.askingPrice
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder={
                                            form.requestType === "Sell"
                                                ? "e.g. R1,250,000"
                                                : "e.g. R12,500"
                                        }
                                    />

                                </div>


                                {form.requestType ===
                                    "Rent" && (

                                    <div className="form-field">

                                        <label>
                                            Rental Period
                                        </label>

                                        <select
                                            name="rentalPeriod"
                                            value={
                                                form.rentalPeriod
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select period
                                            </option>

                                            <option value="Short Term">
                                                Short Term
                                            </option>

                                            <option value="Long Term">
                                                Long Term
                                            </option>

                                        </select>

                                    </div>

                                )}


                                <div className="form-field full">

                                    <label>
                                        Financial Information
                                    </label>

                                    <textarea
                                        name="financialInformation"
                                        value={
                                            form.financialInformation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="4"
                                        placeholder="Provide any relevant financial information the HOA should consider."
                                    />

                                </div>

                            </div>

                        </section>


                        {/* =============================================
                            ADDITIONAL DETAILS
                        ============================================== */}

                        <section className="form-section">

                            <div className="section-heading">

                                <h2>
                                    Additional Information
                                </h2>

                                <p>
                                    Add any information that may
                                    assist the HOA in reviewing
                                    your request.
                                </p>

                            </div>


                            <div className="form-field">

                                <label>
                                    Property Details
                                </label>

                                <textarea
                                    name="additionalDetails"
                                    value={
                                        form.additionalDetails
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="5"
                                    placeholder="Describe the property, improvements, special features or any other relevant information."
                                />

                            </div>

                        </section>


                        {/* =============================================
                            ERROR
                        ============================================== */}

                        {error && (

                            <div className="form-error">
                                {error}
                            </div>

                        )}


                        {/* =============================================
                            SUBMIT
                        ============================================== */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="primary-button"
                            >
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
