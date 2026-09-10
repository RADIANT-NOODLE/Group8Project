import { useState } from "react";

export default function Property() {

    /* =========================================
       GET LOGGED-IN USER
    ========================================= */

    const storedUser = localStorage.getItem("valoraUser");

    const user = storedUser
        ? JSON.parse(storedUser)
        : {
            firstName: "VALORA",
            lastName: "User",
            role: "Property Owner"
        };

    const role = user.role || "Property Owner";


    /* =========================================
       PROPERTY EDITING
    ========================================= */

    const [editing, setEditing] = useState(false);

    const [property, setProperty] = useState({
        name: "Parlock Hills Apartment",
        size: 85,
        bedrooms: 2,
        bathrooms: 1
    });

    const [form, setForm] = useState({
        name: "Parlock Hills Apartment",
        size: 85,
        bedrooms: 2,
        bathrooms: 1
    });


    function togglePropertyEdit() {

        setForm(property);
        setEditing(!editing);

    }


    function handleChange(event) {

        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                name === "size" ||
                name === "bedrooms" ||
                name === "bathrooms"
                    ? Number(value)
                    : value
        }));

    }


    function savePropertyDetails(event) {

        event.preventDefault();

        if (
            form.name.trim() === "" ||
            form.size <= 0 ||
            form.bedrooms <= 0 ||
            form.bathrooms <= 0
        ) {

            alert("Please enter valid property details.");
            return;

        }

        setProperty({
            ...form
        });

        setEditing(false);

        alert("Property details updated successfully.");

    }


    /* =========================================
       ROLE TITLES
    ========================================= */

    let pageTitle = "My Property 🏡";
    let pageDescription = "Manage and view your property information.";
    let propertyLabel = "MY PROPERTY";


    if (role === "Investor") {

        pageTitle = "Properties 📊";
        pageDescription =
            "View properties you are interested in and analyse their investment potential.";
        propertyLabel = "INVESTMENT PROPERTY";

    }

    if (role === "Estate Agent") {

        pageTitle = "My Listings 🏡";
        pageDescription =
            "Manage your property listings and listing information.";
        propertyLabel = "PROPERTY LISTING";

    }

    if (role === "HOA") {

        pageTitle = "Community Properties 🏘";
        pageDescription =
            "View property information within the VALORA community.";
        propertyLabel = "COMMUNITY PROPERTY";

    }


    return (
        <div className="dashboard-layout">


            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside className="sidebar">

                <div className="logo-area">

                    <img
                        src="/ValoraLogo.jpeg"
                        alt="VALORA Logo"
                    />

                    <p>
                        Property Intelligence
                    </p>

                </div>


                <nav className="side-nav">

                    <a href="/dashboard">
                        🏠 Dashboard
                    </a>


                    <a
                        href="/property"
                        className="active"
                    >
                        🏡 Property
                    </a>


                    <a href="/valuation">
                        🤖 AI Valuation
                    </a>


                    <a href="/complaints">
                        🏘 Complaints
                    </a>


                    <a href="/providers">
                        🔧 Service Providers
                    </a>


                    <a href="/announcements">
                        📢 Announcements
                    </a>


                    <a href="/profile">
                        👤 My Profile
                    </a>

                </nav>


                <div className="logout-area">

                    <a href="/">
                        🚪 Logout
                    </a>

                </div>

            </aside>


            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <main className="dashboard-main">


                {/* =========================================
                    TOP BAR
                ========================================= */}

                <div className="top-bar">

                    <div>

                        <h2>
                            {pageTitle}
                        </h2>

                        <p>
                            {pageDescription}
                        </p>

                    </div>

                </div>


                {/* =========================================
                    PROPERTY HEADER
                ========================================= */}

                <section className="property-header-card">

                    <div className="property-image">
                        🏠
                    </div>


                    <div className="property-header-info">

                        <span className="property-label">
                            {propertyLabel}
                        </span>


                        <h1 id="propertyName">
                            {property.name}
                        </h1>


                        <p>
                            📍 Parlock, KwaZulu-Natal
                        </p>


                        <span className="property-type-badge">
                            Apartment
                        </span>

                    </div>

                </section>


                {/* =========================================
                    PROPERTY STATS
                ========================================= */}

                <section className="property-stats">

                    <div className="property-stat-card">

                        <span>
                            📐
                        </span>

                        <p>
                            Property Size
                        </p>

                        <strong>
                            {property.size} m²
                        </strong>

                    </div>


                    <div className="property-stat-card">

                        <span>
                            🛏️
                        </span>

                        <p>
                            Bedrooms
                        </p>

                        <strong>
                            {property.bedrooms}
                        </strong>

                    </div>


                    <div className="property-stat-card">

                        <span>
                            🚿
                        </span>

                        <p>
                            Bathrooms
                        </p>

                        <strong>
                            {property.bathrooms}
                        </strong>

                    </div>


                    <div className="property-stat-card">

                        <span>
                            🚗
                        </span>

                        <p>
                            Parking
                        </p>

                        <strong>
                            1 Bay
                        </strong>

                    </div>

                </section>


                {/* =========================================
                    PROPERTY DETAILS
                ========================================= */}

                <section className="dashboard-panel property-details-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                Property Details
                            </h3>

                            <p>
                                Information about this property.
                            </p>

                        </div>


                        {(role === "Property Owner" ||
                          role === "Buyer") &&
                          !editing && (

                            <button
                                type="button"
                                className="edit-property-button"
                                onClick={togglePropertyEdit}
                            >
                                ✏️ Edit Details
                            </button>

                        )}

                    </div>


                    {/* =========================================
                        NORMAL DETAILS
                    ========================================= */}

                    {!editing && (

                        <div id="propertyDetails">

                            <div className="property-detail-grid">

                                <div>

                                    <span>
                                        Property Type
                                    </span>

                                    <strong>
                                        Apartment
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        Parlock, KZN
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Bedrooms
                                    </span>

                                    <strong>
                                        {property.bedrooms}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Bathrooms
                                    </span>

                                    <strong>
                                        {property.bathrooms}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Floor Area
                                    </span>

                                    <strong>
                                        {property.size} m²
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Parking
                                    </span>

                                    <strong>
                                        1 Bay
                                    </strong>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =========================================
                        EDIT FORM
                    ========================================= */}

                    {editing && (

                        <form
                            className="property-edit-form"
                            style={{ display: "block" }}
                            onSubmit={savePropertyDetails}
                        >

                            <label>
                                Property Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                            />


                            <label>
                                Property Size (m²)
                            </label>

                            <input
                                type="number"
                                name="size"
                                value={form.size}
                                onChange={handleChange}
                            />


                            <label>
                                Bedrooms
                            </label>

                            <input
                                type="number"
                                name="bedrooms"
                                value={form.bedrooms}
                                onChange={handleChange}
                            />


                            <label>
                                Bathrooms
                            </label>

                            <input
                                type="number"
                                name="bathrooms"
                                value={form.bathrooms}
                                onChange={handleChange}
                            />


                            <div className="property-edit-buttons">

                                <button
                                    type="submit"
                                >
                                    Save Changes
                                </button>


                                <button
                                    type="button"
                                    onClick={togglePropertyEdit}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    )}

                </section>


                {/* =========================================
                    FINANCIAL / INVESTMENT OVERVIEW
                ========================================= */}

                <section className="dashboard-panel property-financial-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                {role === "Investor"
                                    ? "Property Valuation & Investment 📊"
                                    : "Investment Overview 📊"}
                            </h3>

                            <p>
                                Current property financial indicators.
                            </p>

                        </div>

                    </div>


                    <div className="financial-grid">


                        <div className="financial-card">

                            <span>
                                Estimated Value
                            </span>

                            <strong>
                                R1,020,000
                            </strong>

                            <small>
                                VALORA AI estimate
                            </small>

                        </div>


                        <div className="financial-card">

                            <span>
                                Monthly Rental
                            </span>

                            <strong>
                                R6,000
                            </strong>

                            <small>
                                Estimated rental income
                            </small>

                        </div>


                        <div className="financial-card">

                            <span>
                                Rental Yield
                            </span>

                            <strong>
                                7.06%
                            </strong>

                            <small>
                                Annual rental yield
                            </small>

                        </div>


                        <div className="financial-card">

                            <span>
                                10-Year Value
                            </span>

                            <strong>
                                R1,508,000
                            </strong>

                            <small>
                                Projected value
                            </small>

                        </div>

                    </div>

                </section>


                {/* =========================================
                    ROLE-SPECIFIC PROPERTY ACTIONS
                ========================================= */}

                <section className="dashboard-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                Property Actions
                            </h3>

                            <p>
                                Access VALORA property tools.
                            </p>

                        </div>

                    </div>


                    <div className="property-actions">


                        {/* PROPERTY OWNER / BUYER */}

                        {(role === "Property Owner" ||
                          role === "Buyer") && (

                            <>

                                <a href="/valuation">

                                    🤖

                                    <strong>
                                        Analyse Property
                                    </strong>

                                    <span>
                                        View AI valuation
                                    </span>

                                </a>


                                <a href="/complaints">

                                    🏘

                                    <strong>
                                        Report Issue
                                    </strong>

                                    <span>
                                        Submit a complaint
                                    </span>

                                </a>


                                <a href="/providers">

                                    🔧

                                    <strong>
                                        Find Provider
                                    </strong>

                                    <span>
                                        Find a service provider
                                    </span>

                                </a>

                            </>

                        )}


                        {/* INVESTOR */}

                        {role === "Investor" && (

                            <>

                                <a href="/valuation">

                                    🤖

                                    <strong>
                                        Property Valuation
                                    </strong>

                                    <span>
                                        AI valuation and growth score
                                    </span>

                                </a>


                                <a href="/roi">

                                    📈

                                    <strong>
                                        10-Year ROI
                                    </strong>

                                    <span>
                                        View investment forecast
                                    </span>

                                </a>


                                <a href="/complaints">

                                    📊

                                    <strong>
                                        Complaint Trends
                                    </strong>

                                    <span>
                                        View property complaint trends
                                    </span>

                                </a>

                            </>

                        )}


                        {/* ESTATE AGENT */}

                        {role === "Estate Agent" && (

                            <>

                                <a href="/valuation">

                                    🤖

                                    <strong>
                                        AI Valuation
                                    </strong>

                                    <span>
                                        Justify listing prices
                                    </span>

                                </a>


                                <a href="/property">

                                    🏡

                                    <strong>
                                        Manage Listings
                                    </strong>

                                    <span>
                                        Add and manage property listings
                                    </span>

                                </a>


                                <a href="/profile">

                                    👤

                                    <strong>
                                        Agent Profile
                                    </strong>

                                    <span>
                                        Manage your agent information
                                    </span>

                                </a>

                            </>

                        )}


                        {/* HOA */}

                        {role === "HOA" && (

                            <>

                                <a href="/complaints">

                                    🏘

                                    <strong>
                                        Resident Complaints
                                    </strong>

                                    <span>
                                        Manage community complaints
                                    </span>

                                </a>


                                <a href="/providers">

                                    🔧

                                    <strong>
                                        Service Providers
                                    </strong>

                                    <span>
                                        Manage community providers
                                    </span>

                                </a>


                                <a href="/announcements">

                                    📢

                                    <strong>
                                        Community Announcements
                                    </strong>

                                    <span>
                                        Manage community notices
                                    </span>

                                </a>

                            </>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}
