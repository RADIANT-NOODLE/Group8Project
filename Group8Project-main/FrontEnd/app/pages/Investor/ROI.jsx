
import { useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./ROI.css";

/* =========================================================
   VALORA ROI ICONS
========================================================= */

function Icon({ name, size = 18 }) {
    const icons = {
        roi: (
            <>
                <path d="M4 19V9" />
                <path d="M10 19V5" />
                <path d="M16 19v-7" />
                <path d="M22 19V3" />
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
                <circle
                    cx="12"
                    cy="7"
                    r=".7"
                    fill="currentColor"
                    stroke="none"
                />
            </>
        ),
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

        if (
            propertyValue === "" ||
            !Number.isFinite(Number(propertyValue)) ||
            Number(propertyValue) <= 0
        ) {
            window.alert("Please enter a valid property value.");
            return;
        }

        if (
            monthlyRent === "" ||
            !Number.isFinite(Number(monthlyRent)) ||
            Number(monthlyRent) < 0
        ) {
            window.alert("Please enter a valid monthly rental amount.");
            return;
        }

        if (
            monthlyExpenses === "" ||
            !Number.isFinite(Number(monthlyExpenses)) ||
            Number(monthlyExpenses) < 0
        ) {
            window.alert("Please enter valid monthly property expenses.");
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

        const capitalGrowth = projectedValue - value;

        const totalRentalIncome =
            netAnnualRentalIncome * years;

        const totalReturn =
            capitalGrowth + totalRentalIncome;

        const roi = (totalReturn / value) * 100;

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
            years,
        });
    }

    /* =======================================================
       FORMAT CURRENCY
    ======================================================= */

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            maximumFractionDigits: 0,
        }).format(value);
    }

    return (
        <div className="roi-page">
            {/* SHARED VALORA DASHBOARD NAVIGATION */}

            <DashboardSidebar />

            {/* MAIN CONTENT */}

            <main className="roi-main">
                {/* PAGE HEADER */}

                <header className="roi-top-bar">
                    <div>
                        <span className="roi-eyebrow">
                            INVESTMENT ANALYSIS
                        </span>

                        <h2>10-Year ROI</h2>

                        <p>
                            Evaluate your property's potential investment
                            return.
                        </p>
                    </div>
                </header>

                {/* INTRODUCTION */}

                <section className="roi-intro-panel">
                    <div className="roi-intro-icon">
                        <Icon name="calculator" size={22} />
                    </div>

                    <div>
                        <h3>Investment Return Calculator</h3>

                        <p>
                            Enter your property's value, rental income,
                            expenses and expected growth. VALORA will estimate
                            how your investment could perform over your
                            selected period.
                        </p>
                    </div>
                </section>

                {/* CALCULATOR LAYOUT */}

                <div className="roi-layout">
                    {/* INVESTMENT INPUTS */}

                    <section className="roi-panel roi-input-panel">
                        <div className="roi-panel-heading">
                            <div>
                                <h3>Investment Information</h3>

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
                                <label htmlFor="roi-property-value">
                                    Property Value
                                </label>

                                <div className="roi-input-wrapper">
                                    <span className="roi-input-prefix">
                                        R
                                    </span>

                                    <input
                                        id="roi-property-value"
                                        type="number"
                                        min="1"
                                        step="any"
                                        placeholder="Enter property value"
                                        value={propertyValue}
                                        onChange={(event) =>
                                            setPropertyValue(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* MONTHLY RENT */}

                            <div className="roi-form-field">
                                <label htmlFor="roi-monthly-rent">
                                    Expected Monthly Rent
                                </label>

                                <div className="roi-input-wrapper">
                                    <span className="roi-input-icon">
                                        <Icon name="rent" size={15} />
                                    </span>

                                    <input
                                        id="roi-monthly-rent"
                                        type="number"
                                        min="0"
                                        step="any"
                                        placeholder="Enter monthly rent"
                                        value={monthlyRent}
                                        onChange={(event) =>
                                            setMonthlyRent(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* MONTHLY EXPENSES */}

                            <div className="roi-form-field">
                                <label htmlFor="roi-monthly-expenses">
                                    Monthly Property Expenses
                                </label>

                                <div className="roi-input-wrapper">
                                    <span className="roi-input-icon">
                                        <Icon name="expenses" size={15} />
                                    </span>

                                    <input
                                        id="roi-monthly-expenses"
                                        type="number"
                                        min="0"
                                        step="any"
                                        placeholder="Enter monthly expenses"
                                        value={monthlyExpenses}
                                        onChange={(event) =>
                                            setMonthlyExpenses(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* ANNUAL GROWTH */}

                            <div className="roi-form-field">
                                <label htmlFor="roi-growth-rate">
                                    Expected Annual Growth
                                </label>

                                <select
                                    id="roi-growth-rate"
                                    value={growthRate}
                                    onChange={(event) =>
                                        setGrowthRate(event.target.value)
                                    }
                                >
                                    <option value="2">2% per year</option>
                                    <option value="3">3% per year</option>
                                    <option value="4">4% per year</option>
                                    <option value="5">5% per year</option>
                                    <option value="6">6% per year</option>
                                    <option value="7">7% per year</option>
                                </select>
                            </div>

                            {/* INVESTMENT PERIOD */}

                            <div className="roi-form-field">
                                <label htmlFor="roi-investment-period">
                                    Investment Period
                                </label>

                                <select
                                    id="roi-investment-period"
                                    value={investmentPeriod}
                                    onChange={(event) =>
                                        setInvestmentPeriod(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="5">5 Years</option>
                                    <option value="10">10 Years</option>
                                    <option value="15">15 Years</option>
                                    <option value="20">20 Years</option>
                                </select>
                            </div>

                            <button
                                className="roi-calculate-button"
                                type="submit"
                            >
                                <Icon name="calculator" size={15} />
                                <span>Calculate ROI</span>
                            </button>
                        </form>
                    </section>

                    {/* RESULTS */}

                    <section className="roi-panel roi-results-panel">
                        <div className="roi-panel-heading">
                            <div>
                                <h3>VALORA Investment Analysis</h3>

                                <p>
                                    Your projected investment performance.
                                </p>
                            </div>
                        </div>

                        {!result && (
                            <div className="roi-empty-result">
                                <div className="roi-empty-icon">
                                    <Icon name="roi" size={22} />
                                </div>

                                <h3>Ready to calculate</h3>

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

                                    <h2>{result.roi.toFixed(1)}%</h2>

                                    <p>
                                        Estimated total return on your
                                        investment
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
                                            <p>Annual Rental Income</p>

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
                                            <p>Annual Expenses</p>

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
                                            <p>Net Annual Rental</p>

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
                                            <p>Rental Yield</p>

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
                                            <span>PROJECTION</span>

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

                                    <p>Projected property value</p>

                                    <h2>
                                        {formatCurrency(result.projectedValue)}
                                    </h2>

                                    <div className="roi-projection-details">
                                        <div>
                                            <span>Capital Growth</span>

                                            <strong>
                                                {formatCurrency(
                                                    result.capitalGrowth
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Net Rental Income</span>

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
                                            {formatCurrency(result.totalReturn)}
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
                                        <strong>What does this mean?</strong>

                                        <p>
                                            ROI (Return on Investment) shows
                                            the estimated return relative to
                                            your original property value over
                                            the selected period. This
                                            calculation includes projected
                                            capital growth and net rental
                                            income.
                                        </p>

                                        <p>
                                            This estimate assumes the selected
                                            growth rate and constant monthly
                                            rent and expenses throughout the
                                            investment period. It excludes
                                            financing costs, taxes, vacancies,
                                            transaction costs and changes in
                                            rental amounts. Actual returns may
                                            differ.
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
