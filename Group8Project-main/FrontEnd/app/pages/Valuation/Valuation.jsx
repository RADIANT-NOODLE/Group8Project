import { useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./Valuation.css";
import { showAlert } from "../../components/AppDialog";


/* =========================================================
   PROFESSIONAL ICON
========================================================= */

function Icon({ type, size = 20 }) {

    const paths = {

        ai: (
            <>
                <rect x="5" y="6" width="14" height="13" rx="3" />
                <path d="M9 3v3M15 3v3M9 19v2M15 19v2" />
                <path d="M3 10h2M19 10h2" />
                <circle cx="9" cy="12" r="1" />
                <circle cx="15" cy="12" r="1" />
                <path d="M9 16c1.5 1 2.5 1 4 0" />
            </>
        ),

        location: (
            <>
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
            </>
        ),

        money: (
            <>
                <circle cx="12" cy="12" r="8" />
                <path d="M12 7v10M15 9.5c-.7-.8-1.6-1.2-3-1.2-1.7 0-2.8.8-2.8 2s1.1 2 2.8 2 2.8.8 2.8 2-1.1 2-2.8 2c-1.4 0-2.4-.4-3-1.2" />
            </>
        ),

        growth: (
            <>
                <path d="M4 18 10 12l4 3 6-8" />
                <path d="M15 7h5v5" />
            </>
        ),

        home: (
            <>
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5.5 9.5V21h13V9.5" />
                <path d="M9 21v-6h6v6" />
            </>
        ),

        chart: (
            <>
                <path d="M4 19V5M4 19h16" />
                <path d="m7 15 4-4 3 2 5-6" />
            </>
        ),

        info: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <path d="M12 8h.01" />
            </>
        ),

        calculator: (
            <>
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2" />
            </>
        )

    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[type]}
        </svg>
    );
}


/* =========================================================
   VALUATION
========================================================= */

export default function Valuation() {

    const [location, setLocation] = useState("");
    const [propertyType, setPropertyType] = useState("1");
    const [propertySize, setPropertySize] = useState("");
    const [bedrooms, setBedrooms] = useState("2");
    const [monthlyRent, setMonthlyRent] = useState("");

    const [result, setResult] = useState(null);


    /* =====================================================
       CALCULATE VALUATION
    ===================================================== */

    function calculateValuation(event) {

        event.preventDefault();

        if (
            !location.trim() ||
            !propertySize ||
            Number(propertySize) <= 0
        ) {

            showAlert(
                "Please enter a property location and valid property size."
            );

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


        if (
            monthlyRent &&
            Number(monthlyRent) > 0
        ) {

            rentalYield =
                (
                    Number(monthlyRent) *
                    12 /
                    roundedValue
                ) *
                100;

        } else {

            rentalYield = 7.06;

        }


        const tenYearValue =
            roundedValue *
            Math.pow(1.04, 10);


        const growthPercentage =
            (
                (tenYearValue - roundedValue) /
                roundedValue
            ) *
            100;


        setResult({

            location:
                location.trim(),

            value:
                roundedValue,

            rentalYield:
                rentalYield,

            tenYearValue:
                Math.round(
                    tenYearValue / 1000
                ) * 1000,

            growthPercentage:
                growthPercentage

        });

    }


    /* =====================================================
       FORMAT CURRENCY
    ===================================================== */

    function formatCurrency(value) {

        return new Intl.NumberFormat(
            "en-ZA",
            {
                style: "currency",
                currency: "ZAR",
                maximumFractionDigits: 0
            }
        ).format(value);

    }


    return (

        <div className="valuation-page">


            {/* =================================================
                SHARED VALORA SIDEBAR
            ================================================= */}

            <DashboardSidebar />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="valuation-main">


                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div className="valuation-top-bar">

                    <div>

                        <p className="valuation-eyebrow">
                            PROPERTY INTELLIGENCE
                        </p>

                        <h1>
                            AI Property Valuation
                        </h1>

                        <p>
                            Estimate property value and investment potential.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="valuation-layout">


                    {/* =================================================
                        PROPERTY INFORMATION
                    ================================================= */}

                    <section className="valuation-panel">

                        <div className="valuation-panel-heading">

                            <div className="valuation-heading-icon">

                                <Icon
                                    type="calculator"
                                    size={20}
                                />

                            </div>

                            <div>

                                <h2>
                                    Property Information
                                </h2>

                                <p>
                                    Enter your property details below.
                                </p>

                            </div>

                        </div>


                        <form
                            className="valuation-form"
                            onSubmit={calculateValuation}
                        >


                            {/* =================================================
                                LOCATION
                            ================================================= */}

                            <div className="valuation-form-field">

                                <label>
                                    Property Location
                                </label>

                                <div className="valuation-input-wrapper">

                                    <span>

                                        <Icon
                                            type="location"
                                            size={16}
                                        />

                                    </span>

                                    <input
                                        type="text"
                                        placeholder="Example: Parlock"
                                        value={location}
                                        onChange={(event) =>
                                            setLocation(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PROPERTY TYPE
                            ================================================= */}

                            <div className="valuation-form-field">

                                <label>
                                    Property Type
                                </label>

                                <select
                                    value={propertyType}
                                    onChange={(event) =>
                                        setPropertyType(
                                            event.target.value
                                        )
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

                            </div>


                            {/* =================================================
                                PROPERTY SIZE
                            ================================================= */}

                            <div className="valuation-form-field">

                                <label>
                                    Property Size (m²)
                                </label>

                                <div className="valuation-input-wrapper">

                                    <input
                                        type="number"
                                        placeholder="Example: 85"
                                        value={propertySize}
                                        onChange={(event) =>
                                            setPropertySize(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <span className="valuation-input-suffix">
                                        m²
                                    </span>

                                </div>

                            </div>


                            {/* =================================================
                                BEDROOMS
                            ================================================= */}

                            <div className="valuation-form-field">

                                <label>
                                    Bedrooms
                                </label>

                                <select
                                    value={bedrooms}
                                    onChange={(event) =>
                                        setBedrooms(
                                            event.target.value
                                        )
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

                            </div>


                            {/* =================================================
                                MONTHLY RENT
                            ================================================= */}

                            <div className="valuation-form-field">

                                <label>

                                    Estimated Monthly Rental

                                    <span className="valuation-optional">
                                        Optional
                                    </span>

                                </label>

                                <div className="valuation-input-wrapper">

                                    <span className="valuation-currency">
                                        R
                                    </span>

                                    <input
                                        type="number"
                                        placeholder="Example: 6000"
                                        value={monthlyRent}
                                        onChange={(event) =>
                                            setMonthlyRent(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                BUTTON
                            ================================================= */}

                            <button
                                className="valuation-submit"
                                type="submit"
                            >

                                <Icon
                                    type="chart"
                                    size={17}
                                />

                                Analyse Property

                            </button>

                        </form>

                    </section>


                    {/* =================================================
                        RESULTS
                    ================================================= */}

                    <section className="valuation-panel valuation-result-panel">

                        <div className="valuation-panel-heading">

                            <div className="valuation-heading-icon">

                                <Icon
                                    type="ai"
                                    size={20}
                                />

                            </div>

                            <div>

                                <h2>
                                    VALORA Analysis
                                </h2>

                                <p>
                                    Your estimated investment results.
                                </p>

                            </div>

                        </div>


                        <div id="valuationResult">


                            {/* =================================================
                                EMPTY STATE
                            ================================================= */}

                            {!result && (

                                <div className="valuation-empty-result">

                                    <div className="valuation-empty-icon">

                                        <Icon
                                            type="ai"
                                            size={28}
                                        />

                                    </div>

                                    <h3>
                                        Ready to analyse
                                    </h3>

                                    <p>
                                        Enter your property information
                                        and click "Analyse Property".
                                    </p>

                                </div>

                            )}


                            {/* =================================================
                                RESULTS
                            ================================================= */}

                            {result && (

                                <div>


                                    {/* =================================================
                                        MAIN RESULT
                                    ================================================= */}

                                    <div className="valuation-main-result">

                                        <span>
                                            Estimated Property Value
                                        </span>

                                        <h2>
                                            {formatCurrency(
                                                result.value
                                            )}
                                        </h2>

                                        <p>

                                            <Icon
                                                type="location"
                                                size={14}
                                            />

                                            {result.location}

                                        </p>

                                    </div>


                                    {/* =================================================
                                        METRICS
                                    ================================================= */}

                                    <div className="valuation-metrics">


                                        {/* RENTAL YIELD */}

                                        <div className="valuation-metric">

                                            <span>

                                                <Icon
                                                    type="money"
                                                    size={19}
                                                />

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

                                                <Icon
                                                    type="growth"
                                                    size={19}
                                                />

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

                                                <Icon
                                                    type="home"
                                                    size={19}
                                                />

                                            </span>

                                            <p>
                                                10-Year Value
                                            </p>

                                            <strong>
                                                {formatCurrency(
                                                    result.tenYearValue
                                                )}
                                            </strong>

                                        </div>


                                        {/* INVESTMENT OUTLOOK */}

                                        <div className="valuation-metric">

                                            <span>

                                                <Icon
                                                    type="chart"
                                                    size={19}
                                                />

                                            </span>

                                            <p>
                                                Investment Outlook
                                            </p>

                                            <strong>
                                                Positive
                                            </strong>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        INVESTMENT PROJECTION
                                    ================================================= */}

                                    <div className="valuation-roi-box">

                                        <div className="valuation-roi-heading">

                                            <div>

                                                <h3>
                                                    Investment Projection
                                                </h3>

                                                <p>
                                                    Based on the current estimated
                                                    property value and projected
                                                    annual growth.
                                                </p>

                                            </div>

                                            <Icon
                                                type="growth"
                                                size={24}
                                            />

                                        </div>

                                        <h2>
                                            {formatCurrency(
                                                result.tenYearValue
                                            )}
                                        </h2>

                                        <p>
                                            Estimated value after 10 years
                                        </p>

                                    </div>


                                    {/* =================================================
                                        VALORA NOTE
                                    ================================================= */}

                                    <div className="valuation-note">

                                        <div className="valuation-note-icon">

                                            <Icon
                                                type="info"
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <strong>
                                                VALORA Note
                                            </strong>

                                            <p>
                                                This valuation is an estimated
                                                projection based on the information
                                                provided. Actual property values may
                                                vary depending on market conditions,
                                                location, property condition and
                                                other factors.
                                            </p>

                                        </div>

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
