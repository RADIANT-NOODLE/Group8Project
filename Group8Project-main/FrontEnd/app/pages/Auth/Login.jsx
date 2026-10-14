
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email address and password.");
            return;
        }

        /*
        =====================================================
        HEAD ADMIN ACCOUNT
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

        /*
        =====================================================
        DEFAULT HOA ADMIN ACCOUNT
        =====================================================
        */

        const hoaAdmin = {
            id: "hoa-admin-001",
            firstName: "HOA",
            lastName: "Administrator",
            email: "hoa.admin@valora.co.za",
            password: "HOAAdmin12345",
            role: "HOA Admin",
            status: "Approved",
        };

        const enteredEmail = email.trim().toLowerCase();

        /*
        =====================================================
        DIRECT HEAD ADMIN LOGIN
        =====================================================
        */

        if (
            enteredEmail === headAdmin.email.toLowerCase() &&
            password === headAdmin.password
        ) {
            localStorage.setItem("valoraUser", JSON.stringify(headAdmin));
            localStorage.setItem("valoraUserEmail", headAdmin.email);
            localStorage.setItem("valoraLoggedIn", "true");

            navigate("/head-admin");
            return;
        }

        /*
        =====================================================
        DIRECT DEFAULT HOA ADMIN LOGIN
        =====================================================
        */

        if (
            enteredEmail === hoaAdmin.email.toLowerCase() &&
            password === hoaAdmin.password
        ) {
            // Ensure the default HOA Admin exists in the user list.
            let existingUsers = [];

            try {
                const savedUsers = JSON.parse(
                    localStorage.getItem("valoraUsers") || "[]"
                );

                if (Array.isArray(savedUsers)) {
                    existingUsers = savedUsers;
                }
            } catch {
                existingUsers = [];
            }

            const hoaAdminExists = existingUsers.some(
                (storedUser) =>
                    String(storedUser.email || "").toLowerCase() ===
                    hoaAdmin.email.toLowerCase()
            );

            if (!hoaAdminExists) {
                existingUsers.push(hoaAdmin);
                localStorage.setItem(
                    "valoraUsers",
                    JSON.stringify(existingUsers)
                );
            }

            localStorage.setItem("valoraUser", JSON.stringify(hoaAdmin));
            localStorage.setItem("valoraUserEmail", hoaAdmin.email);
            localStorage.setItem("valoraLoggedIn", "true");

            navigate("/dashboard");
            return;
        }

        /*
        =====================================================
        LOAD REGISTERED USERS
        =====================================================
        */

        let existingUsers = [];

        try {
            const savedUsers = JSON.parse(
                localStorage.getItem("valoraUsers") || "[]"
            );

            if (Array.isArray(savedUsers)) {
                existingUsers = savedUsers;
            }
        } catch {
            existingUsers = [];
        }

        /*
        =====================================================
        FIND USER
        =====================================================
        */

        const user = existingUsers.find(
            (storedUser) =>
                storedUser.email &&
                storedUser.email.trim().toLowerCase() === enteredEmail
        );

        if (!user) {
            setError("No account was found with this email address.");
            return;
        }

        /*
        =====================================================
        CHECK PASSWORD
        =====================================================
        */

        if (user.password !== password) {
            setError("Incorrect password. Please try again.");
            return;
        }

        /*
        =====================================================
        CHECK APPROVAL STATUS
        =====================================================
        */

        if (user.status !== "Approved") {
            localStorage.setItem("valoraUser", JSON.stringify(user));
            localStorage.removeItem("valoraLoggedIn");

            navigate("/registration-pending");
            return;
        }

        /*
        =====================================================
        NORMALISE USER ROLE
        =====================================================
        */

        const rawRole = String(user.role || "").trim().toLowerCase();

        const normalisedRole =
            rawRole === "head admin"
                ? "Head Admin"
                : [
                      "hoa admin",
                      "hoa administrator",
                      "hoa",
                  ].includes(rawRole)
                  ? "HOA Admin"
                  : rawRole === "estate agent" || rawRole === "agent"
                    ? "Estate Agent"
                    : rawRole === "investor"
                      ? "Investor"
                      : rawRole === "resident"
                        ? "Resident"
                        : user.role;

        const updatedUser = {
            ...user,
            role: normalisedRole,
        };

        /*
        =====================================================
        SAVE LOGIN SESSION
        =====================================================
        */

        localStorage.setItem("valoraUser", JSON.stringify(updatedUser));
        localStorage.setItem("valoraUserEmail", updatedUser.email);
        localStorage.setItem("valoraLoggedIn", "true");

        /*
        =====================================================
        ROLE-BASED REDIRECTION
        =====================================================
        */

        if (normalisedRole === "Head Admin") {
            navigate("/head-admin");
            return;
        }

        navigate("/dashboard");
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* LEFT SIDE */}

                <div className="auth-sidebar">
                    <div className="auth-logo">
                        <img src="/ValoraLogo.jpeg" alt="VALORA" />
                    </div>

                    <div className="auth-sidebar-content">
                        <p className="auth-eyebrow">
                            PROPERTY &amp; COMMUNITY
                        </p>

                        <h1>Welcome Back</h1>

                        <p>
                            Sign in to access your VALORA property and
                            community platform.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE */}

                <div className="auth-form-panel">
                    <div className="auth-form-content">
                        <h2>Login to VALORA</h2>

                        <p className="auth-lead">
                            Enter your account details to continue.
                        </p>

                        {/* ERROR MESSAGE */}

                        {error && (
                            <div className="auth-error" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
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
                                    autoComplete="username"
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
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            {/* LOGIN BUTTON */}

                            <button
                                type="submit"
                                className="auth-submit"
                            >
                                Login
                            </button>

                            {/* REGISTER */}

                            <div className="auth-switch">
                                Don't have an account?{" "}
                                <Link to="/register">Register</Link>
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

export default Login;
