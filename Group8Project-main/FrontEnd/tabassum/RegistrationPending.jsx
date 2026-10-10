import React from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function RegistrationPending() {
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

                        {/* SUCCESS ICON */}

                        <div className="pending-icon">

                            <svg
                                width="30"
                                height="30"
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

                        </div>


                        <h2>
                            Registration Submitted
                        </h2>


                        <p className="auth-lead">
                            Thank you for registering with VALORA.
                            Your registration has been successfully
                            submitted for review.
                        </p>


                        {/* PENDING MESSAGE */}

                        <div className="pending-message">

                            <h3>
                                Your account is pending approval
                            </h3>

                            <p>
                                A VALORA administrator will review
                                your registration and approve your
                                account before you can access your
                                dashboard.
                            </p>

                            <p>
                                Once your account has been approved,
                                you will be able to log in and access
                                the features available for your role.
                            </p>

                        </div>


                        {/* HOME */}

                        <Link
                            to="/"
                            className="auth-submit auth-home-button"
                        >
                            Back to Home
                        </Link>


                        {/* LOGIN */}

                        <div className="auth-switch">

                            Already have an approved account?{" "}

                            <Link to="/login">
                                Login
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default RegistrationPending;
