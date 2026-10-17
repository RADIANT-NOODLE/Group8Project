import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/authService.js";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email address and password.");
            return;
        }

        setLoading(true);

        try {
            // Call the real backend
            const result = await login({ email, password });

            // Backend response shape (typical FastAPI):
            // { access_token, token_type, user: {...} }
            const { access_token, user } = result;

            if (!access_token || !user) {
                setError("Login failed: unexpected response from server.");
                return;
            }

            const normalizedUser = {
                ...user,
                id: user.id ?? user.user_id,
                firstName: user.first_name ?? user.firstName ?? "",
                lastName: user.last_name ?? user.lastName ?? "",
                fullName: user.full_name ?? user.fullName ?? "",
                status: user.hoa_approved ? "Approved" : "Pending",
            };
            
            // Store auth info
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("valora_token", access_token);
            localStorage.setItem("valoraUser", JSON.stringify(normalizedUser));
            localStorage.setItem("valoraUserEmail", normalizedUser.email);
            localStorage.setItem("valoraLoggedIn", "true");

            // Role-based redirect
            const role = String(user.role || "").trim().toLowerCase();

            if (role === "hoa_admin" || role === "head_admin" || role === "admin") {
                navigate("/head-admin");
            } else if (role === "estate_agent" || role === "agent") {
                navigate("/dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            // Extract error message from backend
            const message =
                err?.body?.detail ||
                err?.body?.message ||
                err?.message ||
                "Login failed. Please check your email and password.";
            setError(message);
        } finally {
            setLoading(false);
        }
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
                        <p className="auth-eyebrow">PROPERTY &amp; COMMUNITY</p>
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

                        {error && (
                            <div className="auth-error" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="auth-field">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    autoComplete="username"
                                    required
                                />
                            </div>

                            <div className="auth-field">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>

                            <div className="auth-switch">
                                Don't have an account?{" "}
                                <Link to="/register">Register</Link>
                            </div>

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
