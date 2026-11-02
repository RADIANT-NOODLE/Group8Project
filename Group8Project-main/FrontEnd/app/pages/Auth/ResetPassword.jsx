import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { resetPassword } from "../../services/authApi.js";
import { getResetPasswordErrorMessage } from "../../services/authErrorMessages.js";
import {
    checkPasswordRules,
    validateNewPassword,
} from "../../services/validation.js";
import PasswordRequirements from "./PasswordRequirements.jsx";

import "./Auth.css";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const problem = validateNewPassword(password);
        if (problem) {
            setError(problem);
            return;
        }

        if (password !== confirmPassword) {
            setError("The two passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            await resetPassword({ token, newPassword: password });
            setDone(true);
            setTimeout(() => navigate("/login", { replace: true }), 2500);
        } catch (resetError) {
            setError(getResetPasswordErrorMessage(resetError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-sidebar">
                    <Link to="/" className="auth-logo">
                        <img src="/assets/valora-logo.jpg" alt="VALORA - go to home page" />
                    </Link>

                    <div className="auth-sidebar-content">
                        <p className="auth-eyebrow">PROPERTY &amp; COMMUNITY</p>
                        <h1>Choose a new password</h1>
                        <p>Pick something strong that you do not use anywhere else.</p>
                    </div>
                </div>

                <div className="auth-form-panel">
                    <div className="auth-form-content">
                        <h2>Set a new password</h2>

                        {!token && (
                            <div className="auth-error" role="alert">
                                This reset link is incomplete.{" "}
                                <Link to="/forgot-password">Request a new one</Link>.
                            </div>
                        )}

                        {error && (
                            <div className="auth-error" role="alert">
                                {error}{" "}
                                {error.includes("invalid or has expired") && (
                                    <Link to="/forgot-password">Request a new link</Link>
                                )}
                            </div>
                        )}

                        {done ? (
                            <div className="auth-success" role="status">
                                Your password has been reset. Taking you to the login page…
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="auth-field">
                                    <label htmlFor="reset-password">New Password</label>
                                    <input
                                        id="reset-password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Create a new password"
                                        autoComplete="new-password"
                                        aria-describedby="reset-password-requirements"
                                        required
                                    />
                                    <PasswordRequirements
                                        id="reset-password-requirements"
                                        rules={checkPasswordRules(password)}
                                        touched={password.length > 0}
                                    />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="reset-confirm">Confirm New Password</label>
                                    <input
                                        id="reset-confirm"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="Repeat the new password"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="auth-submit"
                                    disabled={isSubmitting || !token}
                                >
                                    {isSubmitting ? "Saving…" : "Reset password"}
                                </button>

                                <div className="auth-switch">
                                    <Link to="/login">Back to login</Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
