import { Link } from "react-router-dom";
import "../Auth.css";

function RegistrationPending() {

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LEFT SIDE */}

        <div className="auth-sidebar">

          <div className="auth-logo">

            <img
              src="/ValoraLogo.jpeg"
              alt="VALORA Logo"
            />

          </div>

          <div className="auth-sidebar-content">

            <p className="auth-eyebrow">
              REGISTRATION SUBMITTED
            </p>

            <h1>
              Your request is
              <br />
              under review.
            </h1>

            <p>
              Your VALORA registration has been
              successfully submitted and is now
              awaiting administrator approval.
            </p>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="auth-form-panel">

          <div className="auth-form-content">

            <p className="auth-eyebrow">
              ACCOUNT PENDING
            </p>

            <h2>
              Registration received.
            </h2>

            <p className="auth-lead">
              Thank you for registering with VALORA.
              Your account request is currently being
              reviewed by the Head Administrator.
            </p>


            <div className="auth-error">
              Your account is currently pending approval.
              You will be able to access your selected
              dashboard once your registration has been
              approved.
            </div>


            <p className="auth-lead">
              Requested accounts are reviewed to ensure
              that users receive the correct level of
              access within VALORA.
            </p>


            <Link
              to="/login"
              className="auth-submit"
              style={{
                display: "block",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Return to Sign In
            </Link>


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

export default RegistrationPending;
