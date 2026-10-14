import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");

    const [propertyGoal, setPropertyGoal] = useState("");
    const [monthlyIncome, setMonthlyIncome] = useState("");
    const [propertyBudget, setPropertyBudget] = useState("");
    const [rentalBudget, setRentalBudget] = useState("");
    const [financeMethod, setFinanceMethod] = useState("");

    const [error, setError] = useState("");

    const isPropertyUser =
        role === "Resident" ||
        role === "Investor";

    const handleRoleChange = (selectedRole) => {
        setRole(selectedRole);

        setPropertyGoal("");
        setMonthlyIncome("");
        setPropertyBudget("");
        setRentalBudget("");
        setFinanceMethod("");

        setError("");
    };

    const handlePropertyGoalChange = (goal) => {
        setPropertyGoal(goal);

        if (goal === "Buy") {
            setMonthlyIncome("");
            setRentalBudget("");
        }

        if (goal === "Rent") {
            setPropertyBudget("");
            setFinanceMethod("");
        }

        setError("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !password.trim() ||
            !role
        ) {
            setError(
                "Please complete all required registration fields."
            );
            return;
        }

        if (isPropertyUser) {
            if (!propertyGoal) {
                setError(
                    "Please select whether you are looking to Buy or Rent."
                );
                return;
            }

            if (propertyGoal === "Buy") {
                if (!propertyBudget) {
                    setError(
                        "Please enter your estimated property budget."
                    );
                    return;
                }

                if (!financeMethod) {
                    setError(
                        "Please select your preferred purchase method."
                    );
                    return;
                }
            }

            if (propertyGoal === "Rent") {
                if (!monthlyIncome) {
                    setError(
                        "Please enter your monthly income."
                    );
                    return;
                }

                if (!rentalBudget) {
                    setError(
                        "Please enter your maximum monthly rental budget."
                    );
                    return;
                }
            }
        }

        let existingUsers = [];

        try {
            const storedUsers =
                localStorage.getItem("valoraUsers");

            if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers);

                if (Array.isArray(parsedUsers)) {
                    existingUsers = parsedUsers;
                }
            }
        } catch (error) {
            console.error(
                "Unable to read existing users:",
                error
            );

            existingUsers = [];
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const emailExists = existingUsers.some(
            (user) =>
                user &&
                user.email &&
                user.email.toLowerCase() === normalizedEmail
        );

        if (emailExists) {
            setError(
                "An account with this email address already exists."
            );
            return;
        }

        const newUser = {
            id: `user-${Date.now()}`,

            firstName: firstName.trim(),
            lastName: lastName.trim(),

            email: email.trim(),
            password,

            role,

            status: "Pending",

            propertyGoal: isPropertyUser
                ? propertyGoal
                : "",

            monthlyIncome:
                isPropertyUser &&
                propertyGoal === "Rent"
                    ? monthlyIncome
                    : "",

            rentalBudget:
                isPropertyUser &&
                propertyGoal === "Rent"
                    ? rentalBudget
                    : "",

            propertyBudget:
                isPropertyUser &&
                propertyGoal === "Buy"
                    ? propertyBudget
                    : "",

            financeMethod:
                isPropertyUser &&
                propertyGoal === "Buy"
                    ? financeMethod
                    : "",

            savedProperties: [],
            recentlyViewed: [],
            myProperty: null,
            enquiries: [],
            viewingRequests: []
        };

        existingUsers.push(newUser);

        localStorage.setItem(
            "valoraUsers",
            JSON.stringify(existingUsers)
        );

        localStorage.setItem(
            "valoraUser",
            JSON.stringify(newUser)
        );

        /*
         * Registration is pending approval.
         * Do NOT mark the user as logged in yet.
         */
        localStorage.removeItem("valoraLoggedIn");

        navigate("/registration-pending");
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                {/* LEFT SIDE */}

                <div className="auth-sidebar">

                    <div className="auth-logo">
                        <img
                            src="/ValoraLogo.jpeg"
                            alt="VALORA"
                        />
                    </div>

                    <div className="auth-sidebar-content">

                        <p className="auth-eyebrow">
                            PROPERTY & COMMUNITY
                        </p>

                        <h1>
                            Welcome to VALORA
                        </h1>

                        <p>
                            Your intelligent property and
                            community platform.
                        </p>

                    </div>

                </div>


                {/* RIGHT SIDE */}

                <div className="auth-form-panel">

                    <div className="auth-form-content">

                        <h2>
                            Create Your Account
                        </h2>

                        <p className="auth-lead">
                            Register to access VALORA and
                            submit your information for review.
                        </p>


                        {/* ERROR */}

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}


                        <form onSubmit={handleSubmit}>

                            {/* FIRST + LAST NAME */}

                            <div className="auth-row">

                                <div className="auth-field">

                                    <label htmlFor="firstName">
                                        First Name
                                    </label>

                                    <input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(event) =>
                                            setFirstName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter first name"
                                        autoComplete="given-name"
                                        required
                                    />

                                </div>


                                <div className="auth-field">

                                    <label htmlFor="lastName">
                                        Last Name
                                    </label>

                                    <input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(event) =>
                                            setLastName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter last name"
                                        autoComplete="family-name"
                                        required
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="auth-field">

                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter email address"
                                    autoComplete="email"
                                    required
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="auth-field">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                />

                            </div>


                            {/* ROLE */}

                            <div className="auth-role">

                                <label>
                                    Your Role
                                </label>

                                <div className="role-options">

                                    <label
                                        className={`role-option ${
                                            role === "Resident"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Resident"
                                            checked={
                                                role === "Resident"
                                            }
                                            onChange={() =>
                                                handleRoleChange(
                                                    "Resident"
                                                )
                                            }
                                        />

                                        <span>
                                            Resident
                                        </span>
                                    </label>


                                    <label
                                        className={`role-option ${
                                            role === "Investor"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Investor"
                                            checked={
                                                role === "Investor"
                                            }
                                            onChange={() =>
                                                handleRoleChange(
                                                    "Investor"
                                                )
                                            }
                                        />

                                        <span>
                                            Investor
                                        </span>
                                    </label>


                                    <label
                                        className={`role-option ${
                                            role === "Estate Agent"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Estate Agent"
                                            checked={
                                                role === "Estate Agent"
                                            }
                                            onChange={() =>
                                                handleRoleChange(
                                                    "Estate Agent"
                                                )
                                            }
                                        />

                                        <span>
                                            Estate Agent
                                        </span>
                                    </label>


                                    <label
                                        className={`role-option ${
                                            role === "HOA Admin"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="HOA Admin"
                                            checked={
                                                role === "HOA Admin"
                                            }
                                            onChange={() =>
                                                handleRoleChange(
                                                    "HOA Admin"
                                                )
                                            }
                                        />

                                        <span>
                                            HOA Admin
                                        </span>
                                    </label>

                                </div>

                            </div>


                            {/* =================================================
                                RESIDENT / INVESTOR ONLY
                            ================================================= */}

                            {isPropertyUser && (

                                <div className="property-registration-section">

                                    <div className="section-heading">

                                        <h3>
                                            Property Requirements
                                        </h3>

                                        <p>
                                            Tell us what you are
                                            looking for.
                                        </p>

                                    </div>


                                    {/* BUY OR RENT */}

                                    <div className="form-group">

                                        <label>
                                            Are you looking to Buy or Rent?
                                        </label>

                                        <div className="radio-group">

                                            <label
                                                className={`radio-option ${
                                                    propertyGoal === "Buy"
                                                        ? "selected"
                                                        : ""
                                                }`}
                                            >

                                                <input
                                                    type="radio"
                                                    name="propertyGoal"
                                                    value="Buy"
                                                    checked={
                                                        propertyGoal === "Buy"
                                                    }
                                                    onChange={() =>
                                                        handlePropertyGoalChange(
                                                            "Buy"
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Buy
                                                </span>

                                            </label>


                                            <label
                                                className={`radio-option ${
                                                    propertyGoal === "Rent"
                                                        ? "selected"
                                                        : ""
                                                }`}
                                            >

                                                <input
                                                    type="radio"
                                                    name="propertyGoal"
                                                    value="Rent"
                                                    checked={
                                                        propertyGoal === "Rent"
                                                    }
                                                    onChange={() =>
                                                        handlePropertyGoalChange(
                                                            "Rent"
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Rent
                                                </span>

                                            </label>

                                        </div>

                                    </div>


                                    {/* BUY */}

                                    {propertyGoal === "Buy" && (

                                        <>

                                            <div className="form-group">

                                                <label htmlFor="propertyBudget">
                                                    Estimated Property Budget
                                                </label>

                                                <input
                                                    id="propertyBudget"
                                                    type="number"
                                                    min="0"
                                                    value={propertyBudget}
                                                    onChange={(event) =>
                                                        setPropertyBudget(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. 1500000"
                                                    required
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    Purchase Method
                                                </label>

                                                <div className="radio-group finance-options">

                                                    <label
                                                        className={`radio-option ${
                                                            financeMethod === "Cash"
                                                                ? "selected"
                                                                : ""
                                                        }`}
                                                    >

                                                        <input
                                                            type="radio"
                                                            name="financeMethod"
                                                            value="Cash"
                                                            checked={
                                                                financeMethod === "Cash"
                                                            }
                                                            onChange={(event) =>
                                                                setFinanceMethod(
                                                                    event.target.value
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            Cash
                                                        </span>

                                                    </label>


                                                    <label
                                                        className={`radio-option ${
                                                            financeMethod === "Home Loan"
                                                                ? "selected"
                                                                : ""
                                                        }`}
                                                    >

                                                        <input
                                                            type="radio"
                                                            name="financeMethod"
                                                            value="Home Loan"
                                                            checked={
                                                                financeMethod === "Home Loan"
                                                            }
                                                            onChange={(event) =>
                                                                setFinanceMethod(
                                                                    event.target.value
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            Home Loan
                                                        </span>

                                                    </label>


                                                    <label
                                                        className={`radio-option ${
                                                            financeMethod === "Not Sure Yet"
                                                                ? "selected"
                                                                : ""
                                                        }`}
                                                    >

                                                        <input
                                                            type="radio"
                                                            name="financeMethod"
                                                            value="Not Sure Yet"
                                                            checked={
                                                                financeMethod === "Not Sure Yet"
                                                            }
                                                            onChange={(event) =>
                                                                setFinanceMethod(
                                                                    event.target.value
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            Not Sure Yet
                                                        </span>

                                                    </label>

                                                </div>

                                            </div>

                                        </>

                                    )}


                                    {/* RENT */}

                                    {propertyGoal === "Rent" && (

                                        <>

                                            <div className="form-group">

                                                <label htmlFor="monthlyIncome">
                                                    Monthly Income
                                                </label>

                                                <input
                                                    id="monthlyIncome"
                                                    type="number"
                                                    min="0"
                                                    value={monthlyIncome}
                                                    onChange={(event) =>
                                                        setMonthlyIncome(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. 25000"
                                                    required
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label htmlFor="rentalBudget">
                                                    Maximum Monthly Rental Budget
                                                </label>

                                                <input
                                                    id="rentalBudget"
                                                    type="number"
                                                    min="0"
                                                    value={rentalBudget}
                                                    onChange={(event) =>
                                                        setRentalBudget(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. 10000"
                                                    required
                                                />

                                            </div>

                                        </>

                                    )}

                                </div>

                            )}


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="auth-submit"
                            >
                                Submit Registration
                            </button>


                            {/* LOGIN */}

                            <div className="auth-switch">

                                Already have an account?{" "}

                                <Link to="/login">
                                    Login
                                </Link>

                            </div>


                            {/* HOME */}

                            <div className="auth-home-link">

                                <Link to="/">
                                    Back to Home
                                </Link>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;
