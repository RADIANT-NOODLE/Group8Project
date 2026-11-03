import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getRegistrationErrorMessage } from "../../services/authErrorMessages.js";
import { dashboardPathForRole, ROLES } from "../../services/roleMap.js";
import { register } from "../../services/session.js";
import {
    checkPasswordRules,
    validateRequiredPhone,
    validateRegistrationPassword,
} from "../../services/validation.js";
import PasswordRequirements from "./PasswordRequirements.jsx";

import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError("Please complete all registration fields.");
            return;
        }

        const phoneProblem = validateRequiredPhone(phone);
        if (phoneProblem) {
            setError(phoneProblem);
            return;
        }

        const passwordProblem = validateRegistrationPassword(password);
        if (passwordProblem) {
            setError(passwordProblem);
            return;
        }

        if (confirmPassword !== password) {
            setError("The passwords do not match. Please re-enter your password.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await register({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                password,
                role: ROLES.resident,
            });

            if (result?.user?.hoa_approved === false) {
                navigate("/registration-pending", { replace: true });
            } else {
                navigate(dashboardPathForRole(result?.user?.role || ROLES.resident), { replace: true });
            }
        } catch (registrationError) {
            setError(getRegistrationErrorMessage(registrationError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* LEFT SIDE */}
                <div className="auth-sidebar">
                    <Link to="/" className="auth-logo">
                        <img
                            src="/assets/valora-logo-white.png"
                            alt="VALORA - go to home page"
                        />
                    </Link>

                    <div className="auth-sidebar-content">
                        <p className="auth-eyebrow">
                            PROPERTY &amp; COMMUNITY
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
                        <h2>Create Your Account</h2>

                        <p className="auth-lead">
                            Register as a resident to access
                            VALORA and your estate community.
                        </p>

                        {error && (
                            <div className="auth-error" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* NAME FIELDS */}
                            <div className="form-row">
                                <div className="auth-field">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(event) =>
                                            setFirstName(event.target.value)
                                        }
                                        placeholder="Enter your first name"
                                        autoComplete="given-name"
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(event) =>
                                            setLastName(event.target.value)
                                        }
                                        placeholder="Enter your last name"
                                        autoComplete="family-name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="auth-field">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="Enter email address"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            {/* PHONE */}
                            <div className="auth-field">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(event.target.value)
                                    }
                                    placeholder="e.g. 082 123 4567"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    maxLength={20}
                                    required
                                />
                            </div>

                            {/* PASSWORD */}
                            <div className="auth-field">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    aria-describedby="password-requirements"
                                    required
                                />
                                <PasswordRequirements
                                    id="password-requirements"
                                    rules={checkPasswordRules(password)}
                                    touched={password.length > 0}
                                />
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="auth-field">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    aria-describedby="confirm-password-status"
                                    aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
                                    required
                                />
                                {confirmPassword.length > 0 && (
                                    <p
                                        id="confirm-password-status"
                                        className={`auth-match-hint ${passwordsMatch ? "is-match" : "is-mismatch"}`}
                                        aria-live="polite"
                                    >
                                        {passwordsMatch ? "✓ Passwords match" : "✕ Passwords don't match"}
                                    </p>
                                )}
                            </div>

                            {/* ACCOUNT TYPE */}
                            <div className="auth-account-note">
                                You are registering as a <strong>Resident</strong>. HOA
                                administrator and estate agent accounts
                                are issued by a VALORA administrator.
                            </div>

                            {/* REGISTER BUTTON */}
                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Creating account…"
                                    : "Create Account"}
                            </button>

                            {/* LOGIN */}
                            <div className="auth-switch">
                                Already have an account?{" "}
                                <Link to="/login">Login</Link>
                            </div>

                            {/* HOME */}
                            <div className="auth-home-link">
                                <Link to="/">Back to Home</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
