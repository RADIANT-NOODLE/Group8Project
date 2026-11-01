import React, { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/authApi.js";
import { AUTH_MESSAGES } from "../../services/authErrorMessages.js";
import { validateEmail } from "../../services/validation.js";

import "./Auth.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [devLink, setDevLink] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");
        setDevLink("");

        const emailProblem = validateEmail(email);
        if (emailProblem) {
            setError(emailProblem);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await forgotPassword(email);
            setNotice(
                response?.message ||
                    "If an account exists for that e-mail address, a password reset link has been sent."
            );
            // only present when the API runs with EXPOSE_RESET_LINK=true (local development)
            if (response?.dev_reset_link) setDevLink(response.dev_reset_link);
        } catch (requestError) {
            setError(
                requestError?.status === 0
                    ? AUTH_MESSAGES.connection
                    : AUTH_MESSAGES.forgotFallback
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-sidebar">
                    <div className="auth-logo">
                        <img src="/assets/valora-logo.svg" alt="VALORA" />
                    </div>

                    <div className="auth-sidebar-content">
                        <p className="auth-eyebrow">PROPERTY &amp; COMMUNITY</p>
                        <h1>Forgot your password?</h1>
                        <p>
                            Enter the e-mail address you registered with and we
                            will send you a link to choose a new password.
                        </p>
                    </div>
                </div>

                <div className="auth-form-panel">
                    <div className="auth-form-content">
                        <h2>Reset your password</h2>

                        <p className="auth-lead">
                            The link is valid for a short time and can be used once.
                        </p>

                        {error && (
                            <div className="auth-error" role="alert">
                                {error}
                            </div>
                        )}

                        {notice && (
                            <div className="auth-success" role="status">
                                {notice}
                            </div>
                        )}

                        {devLink && (
                            <div className="auth-account-note">
                                <strong>Development mode:</strong> no mail server is
                                configured, so use this link directly:{" "}
                                <a href={devLink}>Open reset link</a>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="auth-field">
                                <label htmlFor="forgot-email">Email Address</label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Enter email address"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending…" : "Send reset link"}
                            </button>

                            <div className="auth-switch">
                                Remembered it? <Link to="/login">Back to login</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
