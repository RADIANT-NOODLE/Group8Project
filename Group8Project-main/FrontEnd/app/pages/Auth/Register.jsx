import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getRegistrationErrorMessage } from "../../services/authErrorMessages.js";
import { dashboardPathForRole, ROLES } from "../../services/roleMap.js";
import { register } from "../../services/session.js";
import {
    checkPasswordRules,
    validateEmailDomainCase,
    validatePersonName,
    validateRequiredPhone,
    validateRegistrationPassword,
} from "../../services/validation.js";
import PasswordRequirements from "./PasswordRequirements.jsx";
import { FullTerms, TermsSummary } from "./TermsContent.jsx";

import "../../components/ValoraModal.css";
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
    const [termsOpen, setTermsOpen] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState("");
    const termsCheckboxRef = useRef(null);
    const termsButtonRef = useRef(null);
    const termsCloseRef = useRef(null);

    /* While the popup is open: focus its button, and Escape closes it. Focus then returns to the link. */
    useEffect(() => {
        if (!termsOpen) return undefined;

        const opener = termsButtonRef.current;
        termsCloseRef.current?.focus();

        function closeOnEscape(event) {
            if (event.key === "Escape") setTermsOpen(false);
        }

        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            opener?.focus();
        };
    }, [termsOpen]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setTermsError("");

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

        const nameProblem =
            validatePersonName(firstName, "First name") ||
            validatePersonName(lastName, "Last name");
        if (nameProblem) {
            setError(nameProblem);
            return;
        }

        const emailProblem = validateEmailDomainCase(email);
        if (emailProblem) {
            setError(emailProblem);
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

        if (!termsAccepted) {
            setTermsError("Please tick the box to agree before creating your account.");
            termsCheckboxRef.current?.focus();
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
                terms_accepted: termsAccepted,
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

                            {/* PRIVACY AGREEMENT */}
                            <section className="auth-terms" aria-label="Privacy and data protection agreement">
                                <TermsSummary />
                                <button
                                    type="button"
                                    ref={termsButtonRef}
                                    className="auth-terms-link"
                                    onClick={() => setTermsOpen(true)}
                                >
                                    Read the full Terms and Conditions and Privacy Policy
                                </button>
                                <label className="auth-terms-agree" htmlFor="terms-accepted">
                                    <input
                                        id="terms-accepted"
                                        ref={termsCheckboxRef}
                                        type="checkbox"
                                        autoComplete="off"
                                        checked={termsAccepted}
                                        onChange={(event) => {
                                            setTermsAccepted(event.target.checked);
                                            setTermsError("");
                                        }}
                                        aria-invalid={Boolean(termsError)}
                                        aria-describedby={termsError ? "terms-accepted-error" : undefined}
                                    />
                                    <span>I agree to the Terms and Conditions and acknowledge the Privacy Policy.</span>
                                </label>
                                {termsError && (
                                    <p id="terms-accepted-error" className="auth-terms-error" role="alert">
                                        {termsError}
                                    </p>
                                )}
                            </section>

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

            {termsOpen && (
                <div
                    className="valora-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setTermsOpen(false);
                    }}
                >
                    <div
                        className="valora-modal auth-terms-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="auth-terms-title"
                    >
                        <h3 id="auth-terms-title">Terms and Conditions &amp; Privacy Policy</h3>
                        <div className="auth-terms-modal-body" tabIndex={0}>
                            <FullTerms />
                        </div>
                        <div className="valora-modal-actions">
                            <button
                                type="button"
                                ref={termsCloseRef}
                                className="valora-modal-btn valora-modal-btn-confirm"
                                onClick={() => setTermsOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Register;
