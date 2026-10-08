import { useState } from "react";

export default function Valuation() {
    const [location, setLocation] = useState("");
    const [propertyType, setPropertyType] = useState("1");
    const [propertySize, setPropertySize] = useState("");
    const [bedrooms, setBedrooms] = useState("2");
    const [monthlyRent, setMonthlyRent] = useState("");

    const [result, setResult] = useState(null);

    function calculateValuation(event) {
        event.preventDefault();

        if (!location.trim() || !propertySize || Number(propertySize) <= 0) {
            alert("Please enter a property location and valid property size.");
            return;
        }

        const size = Number(propertySize);
        const typeMultiplier = Number(propertyType);
        const bedroomCount = Number(bedrooms);

        /*
         * VALORA sample valuation calculation.
         * Base value is calculated from property size,
         * property type and number of bedrooms.
         */

        const basePricePerSquareMeter = 12000;

        const bedroomAdjustment =
            bedroomCount === 1
                ? 0.9
                : bedroomCount === 2
                ? 1
                : bedroomCount === 3
                ? 1.1
                : bedroomCount === 4
                ? 1.2
                : 1.3;

        const estimatedValue =
            size *
            basePricePerSquareMeter *
            typeMultiplier *
            bedroomAdjustment;

        const roundedValue =
            Math.round(estimatedValue / 1000) * 1000;

        let rentalYield = 0;

        if (monthlyRent && Number(monthlyRent) > 0) {
            rentalYield =
                (Number(monthlyRent) * 12 / roundedValue) * 100;
        } else {
            rentalYield = 7.06;
        }

        const tenYearValue =
            roundedValue * Math.pow(1.04, 10);

        const growthPercentage =
            ((tenYearValue - roundedValue) / roundedValue) * 100;

        setResult({
            location: location.trim(),
            value: roundedValue,
            rentalYield: rentalYield,
            tenYearValue: Math.round(tenYearValue / 1000) * 1000,
            growthPercentage: growthPercentage
        });
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            maximumFractionDigits: 0
        }).format(value);
    }

    return (
        <div className="dashboard-layout">

            {/* SIDEBAR */}

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


                {/* SIDEBAR NAVIGATION */}

                <nav className="side-nav">

                    <a href="/">
                        🏠 Dashboard
                    </a>

                    <a href="/property">
                        🏡 My Property
                    </a>

                    <a
                        href="/valuation"
                        className="active"
                    >
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


                {/* LOGOUT */}

                <div className="logout-area">

                    <a href="/">
                        🚪 Logout
                    </a>

                </div>

            </aside>


            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                {/* TOP BAR */}

                <div className="top-bar">

                    <div>

                        <h2>
                            AI Property Valuation 🤖
                        </h2>

                        <p>
                            Estimate property value and investment potential.
                        </p>

                    </div>

                </div>


                {/* VALUATION CONTENT */}

                <div className="valuation-layout">

                    {/* PROPERTY INFORMATION */}

                    <section className="dashboard-panel">

                        <div className="panel-heading">

                            <div>

                                <h3>
                                    Property Information
                                </h3>

                                <p>
                                    Enter your property details below.
                                </p>

                            </div>

                        </div>


                        <form onSubmit={calculateValuation}>

                            {/* LOCATION */}

                            <label>
                                Property Location
                            </label>

                            <input
                                type="text"
                                placeholder="Example: Parlock"
                                value={location}
                                onChange={(event) =>
                                    setLocation(event.target.value)
                                }
                            />


                            {/* PROPERTY TYPE */}

                            <label>
                                Property Type
                            </label>

                            <select
                                value={propertyType}
                                onChange={(event) =>
                                    setPropertyType(event.target.value)
                                }
                            >

                                <option value="1">
                                    Apartment
                                </option>

                                <option value="1.15">
                                    Townhouse
                                </option>

                                <option value="1.3">
                                    House
                                </option>

                            </select>


                            {/* PROPERTY SIZE */}

                            <label>
                                Property Size (m²)
                            </label>

                            <input
                                type="number"
                                placeholder="Example: 85"
                                value={propertySize}
                                onChange={(event) =>
                                    setPropertySize(event.target.value)
                                }
                            />


                            {/* BEDROOMS */}

                            <label>
                                Bedrooms
                            </label>

                            <select
                                value={bedrooms}
                                onChange={(event) =>
                                    setBedrooms(event.target.value)
                                }
                            >

                                <option value="1">
                                    1 Bedroom
                                </option>

                                <option value="2">
                                    2 Bedrooms
                                </option>

                                <option value="3">
                                    3 Bedrooms
                                </option>

                                <option value="4">
                                    4 Bedrooms
                                </option>

                                <option value="5">
                                    5+ Bedrooms
                                </option>

                            </select>


                            {/* MONTHLY RENT */}

                            <label>
                                Estimated Monthly Rental (Optional)
                            </label>

                            <input
                                type="number"
                                placeholder="Example: 6000"
                                value={monthlyRent}
                                onChange={(event) =>
                                    setMonthlyRent(event.target.value)
                                }
                            />


                            {/* BUTTON */}

                            <button type="submit">
                                Analyse Property
                            </button>

                        </form>

                    </section>


                    {/* RESULTS */}

                    <section className="dashboard-panel valuation-result-panel">

                        <div className="panel-heading">

                            <div>

                                <h3>
                                    VALORA Analysis
                                </h3>

                                <p>
                                    Your estimated investment results.
                                </p>

                            </div>

                        </div>


                        <div id="valuationResult">

                            {/* EMPTY STATE */}

                            {!result && (

                                <div className="empty-result">

                                    <span>
                                        🤖
                                    </span>

                                    <h3>
                                        Ready to analyse
                                    </h3>

                                    <p>
                                        Enter your property information
                                        and click "Analyse Property".
                                    </p>

                                </div>

                            )}


                            {/* RESULTS */}

                            {result && (

                                <div>

                                    {/* MAIN RESULT */}

                                    <div className="valuation-main-result">

                                        <span>
                                            Estimated Property Value
                                        </span>

                                        <h2>
                                            {formatCurrency(result.value)}
                                        </h2>

                                        <p>
                                            📍 {result.location}
                                        </p>

                                    </div>


                                    {/* METRICS */}

                                    <div className="valuation-metrics">

                                        {/* RENTAL YIELD */}

                                        <div className="valuation-metric">

                                            <span>
                                                💰
                                            </span>

                                            <p>
                                                Rental Yield
                                            </p>

                                            <strong>
                                                {result.rentalYield.toFixed(2)}%
                                            </strong>

                                        </div>


                                        {/* 10 YEAR GROWTH */}

                                        <div className="valuation-metric">

                                            <span>
                                                📈
                                            </span>

                                            <p>
                                                10-Year Growth
                                            </p>

                                            <strong>
                                                {result.growthPercentage.toFixed(1)}%
                                            </strong>

                                        </div>


                                        {/* 10 YEAR VALUE */}

                                        <div className="valuation-metric">

                                            <span>
                                                🏠
                                            </span>

                                            <p>
                                                10-Year Value
                                            </p>

                                            <strong>
                                                {formatCurrency(result.tenYearValue)}
                                            </strong>

                                        </div>


                                        {/* INVESTMENT OUTLOOK */}

                                        <div className="valuation-metric">

                                            <span>
                                                📊
                                            </span>

                                            <p>
                                                Investment Outlook
                                            </p>

                                            <strong>
                                                Positive
                                            </strong>

                                        </div>

                                    </div>


                                    {/* ROI / INVESTMENT PROJECTION */}

                                    <div className="roi-box">

                                        <h3>
                                            Investment Projection
                                        </h3>

                                        <p>
                                            Based on the current estimated
                                            property value and projected
                                            annual growth.
                                        </p>

                                        <h2>
                                            {formatCurrency(result.tenYearValue)}
                                        </h2>

                                        <p>
                                            Estimated value after 10 years
                                        </p>

                                    </div>


                                    {/* VALORA NOTE */}

                                    <div className="valuation-note">

                                        <strong>
                                            VALORA Note:
                                        </strong>

                                        {" "}
                                        This valuation is an estimated
                                        projection based on the information
                                        provided. Actual property values may
                                        vary depending on market conditions,
                                        location, property condition and
                                        other factors.

                                    </div>

                                </div>

                            )}

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}
