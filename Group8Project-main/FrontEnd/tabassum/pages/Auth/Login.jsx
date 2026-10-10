import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    /*
    =========================================================
    LOGIN
    =========================================================
    */

    const handleSubmit = (event) => {

        event.preventDefault();

        setError("");


        /*
        =====================================================
        VALIDATION
        =====================================================
        */

        if (
            !email.trim() ||
            !password.trim()
        ) {

            setError(
                "Please enter your email address and password."
            );

            return;
        }


        /*
        =====================================================
        HEAD ADMIN LOGIN
        =====================================================
        */

        const headAdmin = {

            id: "head-admin-001",

            firstName: "Head",

            lastName: "Administrator",

            email: "admin@valora.co.za",

            password: "Admin12345",

            role: "Head Admin",

            status: "Approved",

        };


        if (
            email.trim().toLowerCase() ===
                headAdmin.email.toLowerCase() &&
            password === headAdmin.password
        ) {

            localStorage.setItem(
                "valoraUser",
                JSON.stringify(headAdmin)
            );

            localStorage.setItem(
                "valoraLoggedIn",
                "true"
            );

            navigate("/head-admin");

            return;
        }


        /*
        =====================================================
        REGISTERED USER LOGIN
        =====================================================
        */

        let existingUsers = [];


        try {

            existingUsers = JSON.parse(
                localStorage.getItem(
                    "valoraUsers"
                ) || "[]"
            );


            if (
                !Array.isArray(existingUsers)
            ) {

                existingUsers = [];

            }

        } catch (storageError) {

            existingUsers = [];

        }


        /*
        =====================================================
        FIND USER
        =====================================================
        */

        const user =
            existingUsers.find(
                (storedUser) =>
                    storedUser.email &&
                    storedUser.email.toLowerCase() ===
                        email.trim().toLowerCase()
            );


        if (!user) {

            setError(
                "No account was found with this email address."
            );

            return;
        }


        /*
        =====================================================
        PASSWORD CHECK
        =====================================================
        */

        if (
            user.password !== password
        ) {

            setError(
                "Incorrect password. Please try again."
            );

            return;
        }


        /*
        =====================================================
        PENDING ACCOUNT
        =====================================================
        */

        if (
            user.status !== "Approved"
        ) {

            localStorage.setItem(
                "valoraUser",
                JSON.stringify(user)
            );

            navigate(
                "/registration-pending"
            );

            return;
        }


        /*
        =====================================================
        SUCCESSFUL LOGIN
        =====================================================
        */

        localStorage.setItem(
            "valoraUser",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "valoraLoggedIn",
            "true"
        );


        /*
        =====================================================
        NORMALISE ROLE
        =====================================================

        This keeps older role values compatible with
        the current VALORA role names.

        =====================================================
        */

        const rawRole =
            String(
                user.role || ""
            ).trim().toLowerCase();


        const normalisedRole =
            rawRole === "head admin"
                ? "Head Admin"
                : rawRole === "hoa admin" ||
                  rawRole === "hoa administrator"
                    ? "HOA Admin"
                    : rawRole === "estate agent" ||
                      rawRole === "agent"
                        ? "Estate Agent"
                        : rawRole === "investor"
                            ? "Investor"
                            : rawRole === "resident"
                                ? "Resident"
                                : user.role;


        /*
        =====================================================
        UPDATE STORED ROLE IF NEEDED
        =====================================================
        */

        if (
            normalisedRole !== user.role
        ) {

            const updatedUser = {
                ...user,
                role: normalisedRole,
            };


            localStorage.setItem(
                "valoraUser",
                JSON.stringify(updatedUser)
            );

        }


        /*
        =====================================================
        ROLE-BASED REDIRECTION
        =====================================================
        */

        if (
            normalisedRole === "Head Admin"
        ) {

            navigate(
                "/head-admin"
            );

            return;
        }


        /*
        =====================================================
        STANDARD USER DASHBOARD
        =====================================================
        */

        navigate(
            "/dashboard"
        );

    };


    /*
    =========================================================
    PAGE
    =========================================================
    */

    return (

        <div className="auth-page">

            <div className="auth-card">


                {/* =================================================
                    LEFT SIDE
                ================================================== */}

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
                            Welcome Back
                        </h1>


                        <p>
                            Sign in to access your VALORA
                            property and community platform.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    RIGHT SIDE
                ================================================== */}

                <div className="auth-form-panel">

                    <div className="auth-form-content">


                        <h2>
                            Login to VALORA
                        </h2>


                        <p className="auth-lead">
                            Enter your account details to
                            continue.
                        </p>


                        {/* =================================================
                            ERROR MESSAGE
                        ================================================== */}

                        {error && (

                            <div className="auth-error">
                                {error}
                            </div>

                        )}


                        <form
                            onSubmit={handleSubmit}
                        >


                            {/* =================================================
                                EMAIL
                            ================================================== */}

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


                            {/* =================================================
                                PASSWORD
                            ================================================== */}

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
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                    required
                                />

                            </div>


                            {/* =================================================
                                LOGIN BUTTON
                            ================================================== */}

                            <button
                                type="submit"
                                className="auth-submit"
                            >
                                Login
                            </button>


                            {/* =================================================
                                REGISTER
                            ================================================== */}

                            <div className="auth-switch">

                                Don't have an account?{" "}

                                <Link to="/register">
                                    Register
                                </Link>

                            </div>


                            {/* =================================================
                                HOME
                            ================================================== */}

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

export default Login;
