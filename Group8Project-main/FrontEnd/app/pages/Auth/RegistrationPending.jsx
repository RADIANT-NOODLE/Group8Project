import React from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function RegistrationPending() {
    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* LEFT SIDE */}

                <div className="auth-sidebar">
                    <Link to="/" className="auth-logo">
                        <img
                            src="/assets/valora-logo.jpg"
                            alt="VALORA - go to home page"
                        />
                    </Link>

                    <div className="auth-sidebar-content">
                        <p className="auth-eyebrow">
                            PROPERTY & COMMUNITY
                        </p>

                        <h1>Welcome to VALORA</h1>

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

                        <h2>Registration Submitted</h2>

                        <p className="auth-lead">
                            Thank you for registering with VALORA.
                            Your registration request has been
                            successfully submitted.
                        </p>

                        {/* YELLOW PENDING NOTIFICATION */}

                        <div
                            className="pending-message"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="pending-message-heading">
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    />

                                    <path
                                        d="M12 7.5V12.5L15 14.5"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                                <h3>
                                    Your Registration Is Under Review
                                </h3>
                            </div>

                            <p>
                                Your registration request has been
                                received and is awaiting review by
                                the VALORA HOA Admin.
                            </p>

                            <p>
                                You will be able to access the
                                dashboard and features assigned to
                                your selected role once your account
                                has been approved.
                            </p>

                            <p className="pending-message-note">
                                Please check back later to see
                                whether your registration has been
                                approved.
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