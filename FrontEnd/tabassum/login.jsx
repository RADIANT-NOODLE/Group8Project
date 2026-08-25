import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    // Save a simple login session
    localStorage.setItem("valoraLoggedIn", "true");
    localStorage.setItem("valoraUserEmail", email);

    // Go to your existing VALORA dashboard
    navigate("/dashboard");
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LEFT SIDE */}
        <div className="auth-sidebar">

          <div className="auth-logo">
            VALORA
          </div>

          <div className="auth-sidebar-content">

            <p className="auth-eyebrow">
              ACCOUNT ACCESS
            </p>

            <h1>
              A clearer view
              <br />
              of where you live.
            </h1>

            <p>
              Return to one considered place for property
              and community intelligence that helps you
              stay informed.
            </p>

          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="auth-form-panel">

          <div className="auth-form-content">

            <p className="auth-eyebrow">
              WELCOME BACK
            </p>

            <h2>
              Sign in to VALORA.
            </h2>

            <p className="auth-lead">
              Sign in to return to your property and
              community intelligence.
            </p>


            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}


            <form onSubmit={handleSubmit}>

              <div className="auth-field">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                />

              </div>


              <div className="auth-field">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

              </div>


              <button
                type="submit"
                className="auth-submit"
              >
                Sign in securely
              </button>

            </form>


            <p className="auth-switch">
              New to VALORA?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </p>


            <p className="auth-home-link">
              <Link to="/">
                ← Back to homepage
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
