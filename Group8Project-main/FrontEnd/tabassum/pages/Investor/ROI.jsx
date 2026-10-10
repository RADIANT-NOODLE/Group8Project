import { useState } from "react";
import "./ROI.css";


/* =========================================================
   VALORA ICONS
========================================================= */

function Icon({ name, size = 18 }) {

    const icons = {

        dashboard: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
        ),

        property: (
            <>
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5.5 10v10h13V10" />
                <path d="M9 20v-6h6v6" />
            </>
        ),

        ai: (
            <>
                <rect x="6" y="6" width="12" height="12" rx="2" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                <path d="M10 10h4v4h-4z" />
            </>
        ),

        roi: (
            <>
                <path d="M4 19V9" />
                <path d="M10 19V5" />
                <path d="M16 19v-7" />
                <path d="M22 19V3" />
            </>
        ),

        complaints: (
            <>
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M8.5 8h7" />
                <path d="M8.5 12h7" />
                <path d="M8.5 16h4.5" />
            </>
        ),

        providers: (
            <>
                <path d="M14.5 5.5a4 4 0 0 0-5.1 5.1L4 16l4 4 5.4-5.4a4 4 0 0 0 5.1-5.1l-2.6 2.6-3-3 2.6-2.6Z" />
            </>
        ),

        announcements: (
            <>
                <path d="M4 10v4h4l7 4V6l-7 4H4Z" />
                <path d="M8 14l1.5 5" />
                <path d="M18 9c1 .8 1.5 1.7 1.5 3s-.5 2.2-1.5 3" />
            </>
        ),

        profile: (
            <>
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6" />
            </>
        ),

        logout: (
            <>
                <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
                <path d="M14 8l4 4-4 4" />
                <path d="M18 12H9" />
            </>
        ),

        calculator: (
            <>
                <rect x="5" y="2.5" width="14" height="19" rx="2" />
                <path d="M8 6h8" />
                <path d="M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2" />
            </>
        ),

        rent: (
            <>
                <path d="M4 11h16v8H4z" />
                <path d="M7 11V8h10v3" />
                <path d="M3 19h18" />
            </>
        ),

        expenses: (
            <>
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" />
            </>
        ),

        income: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10" />
                <path d="M9 9.5c0-1.1 1.2-2 3-2s3 .9 3 2-1.2 2-3 2-3 .9-3 2 1.2 2 3 2 3-.9 3-2" />
            </>
        ),

        growth: (
            <>
                <path d="M4 17 10 11l4 4 6-8" />
                <path d="M15 7h5v5" />
            </>
        ),

        information: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 10v6" />
                <circle cx="12" cy="7" r=".7" fill="currentColor" stroke="none" />
            </>
        )

    };


    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[name]}
        </svg>
    );
}


/* =========================================================
   ROI CALCULATOR
========================================================= */

export default function ROI() {

    const [propertyValue, setPropertyValue] = useState("");
    const [monthlyRent, setMonthlyRent] = useState("");
    const [monthlyExpenses, setMonthlyExpenses] = useState("");
    const [growthRate, setGrowthRate] = useState("4");
    const [investmentPeriod, setInvestmentPeriod] = useState("10");

    const [result, setResult] = useState(null);


    /* =======================================================
       CALCULATE ROI
    ======================================================= */

    function calculateROI(event) {

        event.preventDefault();

        if (!propertyValue || Number(propertyValue) <= 0) {
            alert("Please enter a valid property value.");
            return;
        }

        if (!monthlyRent || Number(monthlyRent) < 0) {
            alert("Please enter a valid monthly rental amount.");
            return;
        }

        if (
            monthlyExpenses === "" ||
            Number(monthlyExpenses) < 0
        ) {
            alert("Please enter your monthly expenses.");
            return;
        }


        const value = Number(propertyValue);
        const rent = Number(monthlyRent);
        const expenses = Number(monthlyExpenses);
        const growth = Number(growthRate) / 100;
        const years = Number(investmentPeriod);


        const annualRentalIncome = rent * 12;

        const annualExpenses = expenses * 12;

        const netAnnualRentalIncome =
            annualRentalIncome - annualExpenses;


        const projectedValue =
            value * Math.pow(1 + growth, years);


        const capitalGrowth =
            projectedValue - value;


        const totalRentalIncome =
            netAnnualRentalIncome * years;


        const totalReturn =
            capitalGrowth + totalRentalIncome;


        const roi =
            (totalReturn / value) * 100;


        const rentalYield =
            (netAnnualRentalIncome / value) * 100;


        setResult({
            annualRentalIncome,
            annualExpenses,
            netAnnualRentalIncome,
            projectedValue,
            capitalGrowth,
            totalRentalIncome,
            totalReturn,
            roi,
            rentalYield,
            years
        });
    }


    /* =======================================================
       FORMAT CURRENCY
    ======================================================= */

    function formatCurrency(value) {

        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            maximumFractionDigits: 0
        }).format(value);

    }


    /* =======================================================
       LOGOUT
    ======================================================= */

    function handleLogout() {

        localStorage.removeItem("valoraLoggedIn");
        localStorage.removeItem("valoraUser");
        localStorage.removeItem("valoraUserEmail");

        window.location.href = "/";
    }


    return (

        <div className="roi-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="roi-sidebar">


                <div className="roi-logo-area">

                    <img
                        src="/ValoraLogo.jpeg"
                        alt="VALORA Logo"
                    />

                    <p>
                        Property Intelligence
                    </p>

                </div>


                <nav className="roi-side-nav">


                    <a href="/dashboard">

                        <Icon
                            name="dashboard"
                            size={17}
                        />

                        <span>
                            Dashboard
                        </span>

                    </a>


                    <a href="/property">

                        <Icon
                            name="property"
                            size={17}
                        />

                        <span>
                            My Property
                        </span>

                    </a>


                    <a href="/valuation">

                        <Icon
                            name="ai"
                            size={17}
                        />

                        <span>
                            AI Valuation
                        </span>

                    </a>


                    <a
                        href="/roi"
                        className="active"
                    >

                        <Icon
                            name="roi"
                            size={17}
                        />

                        <span>
                            10-Year ROI
                        </span>

                    </a>


                    <a href="/complaints">

                        <Icon
                            name="complaints"
                            size={17}
                        />

                        <span>
                            Complaints
                        </span>

                    </a>


                    <a href="/providers">

                        <Icon
                            name="providers"
                            size={17}
                        />

                        <span>
                            Service Providers
                        </span>

                    </a>


                    <a href="/announcements">

                        <Icon
                            name="announcements"
                            size={17}
                        />

                        <span>
                            Announcements
                        </span>

                    </a>


                    <a href="/profile">

                        <Icon
                            name="profile"
                            size={17}
                        />

                        <span>
                            My Profile
                        </span>

                    </a>

                </nav>


                <div className="roi-logout-area">

                    <a
                        href="/"
                        onClick={(event) => {
                            event.preventDefault();
                            handleLogout();
                        }}
                    >

                        <Icon
                            name="logout"
                            size={17}
                        />

                        <span>
                            Logout
                        </span>

                    </a>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="roi-main">


                {/* TOP BAR */}

                <div className="roi-top-bar">

                    <div>

                        <span className="roi-eyebrow">
                            INVESTMENT ANALYSIS
                        </span>

                        <h2>
                            10-Year ROI
                        </h2>

                        <p>
                            Evaluate your property's potential investment return.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    INTRODUCTION
                ================================================= */}

                <section className="roi-intro-panel">

                    <div className="roi-intro-icon">

                        <Icon
                            name="calculator"
                            size={22}
                        />

                    </div>

                    <div>

                        <h3>
                            Investment Return Calculator
                        </h3>

                        <p>
                            Tell VALORA about your property, rental income
                            and expected growth. We'll estimate how your
                            investment could perform over the selected period.
                        </p>

                    </div>

                </section>


                {/* =================================================
                    CALCULATOR LAYOUT
                ================================================= */}

                <div className="roi-layout">


                    {/* =================================================
                        INPUT PANEL
                    ================================================= */}

                    <section className="roi-panel roi-input-panel">

                        <div className="roi-panel-heading">

                            <div>

                                <h3>
                                    Investment Information
                                </h3>

                                <p>
                                    Enter the information for your property.
                                </p>

                            </div>

                        </div>


                        <form
                            className="roi-form"
                            onSubmit={calculateROI}
                        >


                            {/* PROPERTY VALUE */}

                            <div className="roi-form-field">

                                <label>
                                    Property Value
                                </label>

                                <div className="roi-input-wrapper">

                                    <span className="roi-input-prefix">
                                        R
                                    </span>

                                    <input
                                        type="number"
                                        placeholder="Example: 1020000"
                                        value={propertyValue}
                                        onChange={(event) =>
                                            setPropertyValue(event.target.value)
                                        }
                                    />

                                </div>

                            </div>


                            {/* RENT */}

                            <div className="roi-form-field">

                                <label>
                                    Expected Monthly Rent
                                </label>

                                <div className="roi-input-wrapper">

                                    <span className="roi-input-icon">

                                        <Icon
                                            name="rent"
                                            size={15}
                                        />

                                    </span>

                                    <input
                                        type="number"
                                        placeholder="Example: 6000"
                                        value={monthlyRent}
                                        onChange={(event) =>
                                            setMonthlyRent(event.target.value)
                                        }
                                    />

                                </div>

                            </div>


                            {/* EXPENSES */}

                            <div className="roi-form-field">

                                <label>
                                    Monthly Property Expenses
                                </label>

                                <div className="roi-input-wrapper">

                                    <span className="roi-input-icon">

                                        <Icon
                                            name="expenses"
                                            size={15}
                                        />

                                    </span>

                                    <input
                                        type="number"
                                        placeholder="Example: 1500"
                                        value={monthlyExpenses}
                                        onChange={(event) =>
                                            setMonthlyExpenses(event.target.value)
                                        }
                                    />

                                </div>

                            </div>


                            {/* GROWTH */}

                            <div className="roi-form-field">

                                <label>
                                    Expected Annual Growth
                                </label>

                                <select
                                    value={growthRate}
                                    onChange={(event) =>
                                        setGrowthRate(event.target.value)
                                    }
                                >

                                    <option value="2">
                                        2% per year
                                    </option>

                                    <option value="3">
                                        3% per year
                                    </option>

                                    <option value="4">
                                        4% per year
                                    </option>

                                    <option value="5">
                                        5% per year
                                    </option>

                                    <option value="6">
                                        6% per year
                                    </option>

                                    <option value="7">
                                        7% per year
                                    </option>

                                </select>

                            </div>


                            {/* INVESTMENT PERIOD */}

                            <div className="roi-form-field">

                                <label>
                                    Investment Period
                                </label>

                                <select
                                    value={investmentPeriod}
                                    onChange={(event) =>
                                        setInvestmentPeriod(event.target.value)
                                    }
                                >

                                    <option value="5">
                                        5 Years
                                    </option>

                                    <option value="10">
                                        10 Years
                                    </option>

                                    <option value="15">
                                        15 Years
                                    </option>

                                    <option value="20">
                                        20 Years
                                    </option>

                                </select>

                            </div>


                            <button
                                className="roi-calculate-button"
                                type="submit"
                            >

                                <Icon
                                    name="calculator"
                                    size={15}
                                />

                                <span>
                                    Calculate ROI
                                </span>

                            </button>

                        </form>

                    </section>


                    {/* =================================================
                        RESULTS PANEL
                    ================================================= */}

                    <section className="roi-panel roi-results-panel">

                        <div className="roi-panel-heading">

                            <div>

                                <h3>
                                    VALORA Investment Analysis
                                </h3>

                                <p>
                                    Your projected investment performance.
                                </p>

                            </div>

                        </div>


                        {!result && (

                            <div className="roi-empty-result">

                                <div className="roi-empty-icon">

                                    <Icon
                                        name="roi"
                                        size={22}
                                    />

                                </div>

                                <h3>
                                    Ready to calculate
                                </h3>

                                <p>
                                    Enter your investment information and
                                    calculate your projected return.
                                </p>

                            </div>

                        )}


                        {result && (

                            <div className="roi-results-content">


                                {/* MAIN ROI */}

                                <div className="roi-main-result">

                                    <span>
                                        Estimated {result.years}-Year ROI
                                    </span>

                                    <h2>
                                        {result.roi.toFixed(1)}%
                                    </h2>

                                    <p>
                                        Estimated total return on your investment
                                    </p>

                                </div>


                                {/* METRICS */}

                                <div className="roi-metrics">


                                    <div className="roi-metric">

                                        <div className="roi-metric-icon">

                                            <Icon
                                                name="income"
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <p>
                                                Annual Rental Income
                                            </p>

                                            <strong>
                                                {formatCurrency(
                                                    result.annualRentalIncome
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="roi-metric">

                                        <div className="roi-metric-icon">

                                            <Icon
                                                name="expenses"
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <p>
                                                Annual Expenses
                                            </p>

                                            <strong>
                                                {formatCurrency(
                                                    result.annualExpenses
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="roi-metric">

                                        <div className="roi-metric-icon">

                                            <Icon
                                                name="income"
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <p>
                                                Net Annual Rental
                                            </p>

                                            <strong>
                                                {formatCurrency(
                                                    result.netAnnualRentalIncome
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="roi-metric">

                                        <div className="roi-metric-icon">

                                            <Icon
                                                name="growth"
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <p>
                                                Rental Yield
                                            </p>

                                            <strong>
                                                {result.rentalYield.toFixed(2)}%
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* PROJECTION */}

                                <div className="roi-projection-box">

                                    <div className="roi-projection-header">

                                        <div>

                                            <span>
                                                PROJECTION
                                            </span>

                                            <h3>
                                                {result.years}-Year Projection
                                            </h3>

                                        </div>

                                        <div className="roi-projection-icon">

                                            <Icon
                                                name="growth"
                                                size={18}
                                            />

                                        </div>

                                    </div>


                                    <p>
                                        Projected property value
                                    </p>

                                    <h2>
                                        {formatCurrency(
                                            result.projectedValue
                                        )}
                                    </h2>


                                    <div className="roi-projection-details">

                                        <div>

                                            <span>
                                                Capital Growth
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    result.capitalGrowth
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Rental Income
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    result.totalRentalIncome
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* TOTAL RETURN */}

                                <div className="roi-total-return">

                                    <div>

                                        <span>
                                            TOTAL ESTIMATED RETURN
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                result.totalReturn
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                {/* EXPLANATION */}

                                <div className="roi-explanation">

                                    <div className="roi-explanation-icon">

                                        <Icon
                                            name="information"
                                            size={17}
                                        />

                                    </div>

                                    <div>

                                        <strong>
                                            What does this mean?
                                        </strong>

                                        <p>
                                            ROI (Return on Investment) shows
                                            how much your investment could grow
                                            compared with the original property
                                            value over the selected period.
                                        </p>

                                        <p>
                                            This is an estimated projection.
                                            Actual returns can change depending
                                            on property prices, rental income,
                                            expenses, interest rates and market
                                            conditions.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                    </section>

                </div>

            </main>

        </div>
    );
}
