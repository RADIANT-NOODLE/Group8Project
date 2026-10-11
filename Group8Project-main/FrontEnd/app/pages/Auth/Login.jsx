import React, { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { getLoginErrorMessage } from "../../services/authErrorMessages.js";
import { getSafeNextPath } from "../../services/navigation.js";
import { dashboardPathForRole } from "../../services/roleMap.js";
import { login } from "../../services/session.js";

import "./Auth.css";


function Login() {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);


    /*
    =========================================================
    LOGIN

    Authentication is the backend's: this page sends the
    credentials to /api/v1/auth/login and stores the JWT the
    API returns. There is no local account list and no local
    password check.
    =========================================================
    */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        if (
            !email.trim() ||
            !password.trim()
        ) {

            setError(
                "Please enter your email address and password."
            );

            return;
        }


        setIsSubmitting(true);

        try {

            const { user } =
                await login({
                    email,
                    password,
                });


            /*
            =================================================
            WHERE TO GO NEXT

            A `?next=` target wins when it is safe;
            otherwise the user's own role decides.
            =================================================
            */

            navigate(
                getSafeNextPath(
                    location.search,
                    dashboardPathForRole(user.role)
                ),
                { replace: true }
            );

        } catch (loginError) {

            setError(
                getLoginErrorMessage(loginError)
            );

        } finally {

            setIsSubmitting(false);

        }

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
                            src="/assets/valora-logo.svg"
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

                            <div
                                className="auth-error"
                                role="alert"
                            >
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
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Signing in…"
                                    : "Login"}
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
