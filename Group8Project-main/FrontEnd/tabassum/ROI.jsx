import { useState } from "react";

export default function ROI() {
    const [propertyValue, setPropertyValue] = useState("");
    const [monthlyRent, setMonthlyRent] = useState("");
    const [monthlyExpenses, setMonthlyExpenses] = useState("");
    const [growthRate, setGrowthRate] = useState("4");
    const [investmentPeriod, setInvestmentPeriod] = useState("10");

    const [result, setResult] = useState(null);

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

        if (monthlyExpenses === "" || Number(monthlyExpenses) < 0) {
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

                    <h1>VALORA</h1>

                    <p>
                        Property Intelligence
                    </p>

                </div>


                <nav className="side-nav">

                    <a href="/dashboard">
                        🏠 Dashboard
                    </a>

                    <a href="/property">
                        🏡 My Property
                    </a>

                    <a href="/valuation">
                        🤖 AI Valuation
                    </a>

                    <a
                        href="/roi"
                        className="active"
                    >
                        📈 10-Year ROI
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


            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                <div className="top-bar">

                    <div>

                        <h2>
                            10-Year ROI 📈
                        </h2>

                        <p>
                            Want to know if your property is a good investment?
                        </p>

                    </div>

                </div>


                {/* INTRODUCTION */}

                <section className="dashboard-panel">

                    <div className="panel-heading">

                        <div>

                            <h3>
                                Investment Return Calculator
                            </h3>

                            <p>
                                Tell VALORA about your property,
                                rental income and expected growth.
                                We'll estimate how your investment
                                could perform over the next 10 years.
                            </p>

                        </div>

                    </div>

                </section>


                <div className="valuation-layout">

                    {/* INPUTS */}

                    <section className="dashboard-panel">

                        <div className="panel-heading">

                            <div>

                                <h3>
                                    Investment Information
                                </h3>

                                <p>
                                    Answer a few questions about your investment.
                                </p>

                            </div>

                        </div>


                        <form onSubmit={calculateROI}>

                            <label>
                                What is the property value?
                            </label>

                            <input
                                type="number"
                                placeholder="Example: 1020000"
                                value={propertyValue}
                                onChange={(event) =>
                                    setPropertyValue(event.target.value)
                                }
                            />


                            <label>
                                How much rent do you expect each month?
                            </label>

                            <input
                                type="number"
                                placeholder="Example: 6000"
                                value={monthlyRent}
                                onChange={(event) =>
                                    setMonthlyRent(event.target.value)
                                }
                            />


                            <label>
                                What are your monthly property expenses?
                            </label>

                            <input
                                type="number"
                                placeholder="Example: 1500"
                                value={monthlyExpenses}
                                onChange={(event) =>
                                    setMonthlyExpenses(event.target.value)
                                }
                            />


                            <label>
                                How much do you expect the property
                                to grow each year?
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


                            <label>
                                How long do you plan to hold the property?
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


                            <button type="submit">
                                Calculate ROI
                            </button>

                        </form>

                    </section>


                    {/* RESULTS */}

                    <section className="dashboard-panel">

                        <div className="panel-heading">

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

                            <div className="empty-result">

                                <span>
                                    📈
                                </span>

                                <h3>
                                    Ready to calculate
                                </h3>

                                <p>
                                    Answer the questions and click
                                    "Calculate ROI" to see your
                                    projected investment return.
                                </p>

                            </div>

                        )}


                        {result && (

                            <div>

                                {/* MAIN ROI */}

                                <div className="valuation-main-result">

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

                                <div className="valuation-metrics">

                                    <div className="valuation-metric">

                                        <span>
                                            💰
                                        </span>

                                        <p>
                                            Annual Rental Income
                                        </p>

                                        <strong>
                                            {formatCurrency(
                                                result.annualRentalIncome
                                            )}
                                        </strong>

                                    </div>


                                    <div className="valuation-metric">

                                        <span>
                                            🧾
                                        </span>

                                        <p>
                                            Annual Expenses
                                        </p>

                                        <strong>
                                            {formatCurrency(
                                                result.annualExpenses
                                            )}
                                        </strong>

                                    </div>


                                    <div className="valuation-metric">

                                        <span>
                                            💵
                                        </span>

                                        <p>
                                            Net Annual Rental
                                        </p>

                                        <strong>
                                            {formatCurrency(
                                                result.netAnnualRentalIncome
                                            )}
                                        </strong>

                                    </div>


                                    <div className="valuation-metric">

                                        <span>
                                            📊
                                        </span>

                                        <p>
                                            Rental Yield
                                        </p>

                                        <strong>
                                            {result.rentalYield.toFixed(2)}%
                                        </strong>

                                    </div>

                                </div>


                                {/* PROJECTION */}

                                <div className="roi-box">

                                    <h3>
                                        {result.years}-Year Projection
                                    </h3>

                                    <p>
                                        Projected property value
                                    </p>

                                    <h2>
                                        {formatCurrency(
                                            result.projectedValue
                                        )}
                                    </h2>

                                    <p>
                                        Capital growth:
                                        {" "}
                                        {formatCurrency(
                                            result.capitalGrowth
                                        )}
                                    </p>

                                    <p>
                                        Rental income over period:
                                        {" "}
                                        {formatCurrency(
                                            result.totalRentalIncome
                                        )}
                                    </p>

                                </div>


                                {/* TOTAL RETURN */}

                                <div className="valuation-note">

                                    <strong>
                                        Total Estimated Return:
                                    </strong>

                                    <br />

                                    {formatCurrency(result.totalReturn)}

                                </div>


                                {/* EXPLANATION */}

                                <div className="valuation-note">

                                    <strong>
                                        💡 What does this mean?
                                    </strong>

                                    <p>
                                        ROI (Return on Investment) shows
                                        how much your investment could
                                        grow compared with the original
                                        property value over the selected
                                        period.
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

                        )}

                    </section>

                </div>

            </main>

        </div>
    );
}
