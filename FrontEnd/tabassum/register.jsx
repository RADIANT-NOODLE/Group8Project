import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
  event.preventDefault();

  const {
    firstName,
    lastName,
    email,
    password,
    role,
  } = formData;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !role
  ) {
    setError("Please complete all registration fields.");
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

  // Get existing VALORA users
  const existingUsers =
    JSON.parse(localStorage.getItem("valoraUsers")) || [];

  // Check if email already exists
  const emailExists = existingUsers.some(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase()
  );

  if (emailExists) {
    setError(
      "An account with this email address already exists."
    );
    return;
  }

  // Create new pending registration
  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    password,
    role,
    status: "Pending",
    rejectionReason: "",
  };

  // Add new user to the existing users
  const updatedUsers = [
    ...existingUsers,
    newUser,
  ];

  localStorage.setItem(
    "valoraUsers",
    JSON.stringify(updatedUsers)
  );

  // Remove old login session information
  localStorage.removeItem("valoraLoggedIn");
  localStorage.removeItem("valoraUserEmail");

  // Go to pending registration page
  navigate("/registration-pending");
}

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
              CREATE YOUR ACCOUNT
            </p>

            <h1>
              Begin with a
              <br />
              clearer point of view.
            </h1>

            <p>
              Create your VALORA profile and connect
              with the property and community information
              that matters to you.
            </p>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="auth-form-panel">

          <div className="auth-form-content">

            <p className="auth-eyebrow">
              JOIN VALORA
            </p>

            <h2>
              Start your VALORA profile.
            </h2>

            <p className="auth-lead">
              Share your details and choose how you
              will use VALORA.
            </p>


            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}


            <form onSubmit={handleSubmit}>

              {/* FIRST + LAST NAME */}

              <div className="auth-row">

                <div className="auth-field">

                  <label htmlFor="firstName">
                    First Name
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Your name"
                  />

                </div>


                <div className="auth-field">

                  <label htmlFor="lastName">
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Surname"
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="auth-field">

                <label htmlFor="registerEmail">
                  Email
                </label>

                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />

              </div>


              {/* PASSWORD */}

              <div className="auth-field">

                <label htmlFor="registerPassword">
                  Password
                </label>

                <input
                  id="registerPassword"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                />

              </div>


              {/* ROLE */}

              <div className="auth-role">

                <label>
                  Your Role
                </label>

                <div className="role-options">

                  {/* RESIDENT */}

                  <label
                    className={
                      formData.role === "Resident"
                        ? "role-option selected"
                        : "role-option"
                    }
                  >

                    <input
                      type="radio"
                      name="role"
                      value="Resident"
                      checked={
                        formData.role === "Resident"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      Resident
                    </span>

                  </label>


                  {/* INVESTOR */}

                  <label
                    className={
                      formData.role === "Investor"
                        ? "role-option selected"
                        : "role-option"
                    }
                  >

                    <input
                      type="radio"
                      name="role"
                      value="Investor"
                      checked={
                        formData.role === "Investor"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      Investor
                    </span>

                  </label>


                  {/* ESTATE AGENT */}

                  <label
                    className={
                      formData.role === "Estate Agent"
                        ? "role-option selected"
                        : "role-option"
                    }
                  >

                    <input
                      type="radio"
                      name="role"
                      value="Estate Agent"
                      checked={
                        formData.role === "Estate Agent"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      Estate Agent
                    </span>

                  </label>


                  {/* HOA ADMIN */}

                  <label
                    className={
                      formData.role === "HOA Admin"
                        ? "role-option selected"
                        : "role-option"
                    }
                  >

                    <input
                      type="radio"
                      name="role"
                      value="HOA Admin"
                      checked={
                        formData.role === "HOA Admin"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      HOA Admin
                    </span>

                  </label>

                </div>

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                className="auth-submit"
              >
                Submit registration
              </button>

            </form>


            <p className="auth-switch">
              Already have an account?{" "}

              <Link to="/login">
                Sign in
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

export default Register;
