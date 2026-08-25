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

    // Save the user's basic details
    localStorage.setItem(
      "valoraUser",
      JSON.stringify({
        firstName,
        lastName,
        email,
        role,
      })
    );

    localStorage.setItem("valoraLoggedIn", "true");

    // Send the new user to your dashboard
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

                  <label
                    className={
                      formData.role === "Property Owner"
                        ? "role-option selected"
                        : "role-option"
                    }
                  >
                    <input
                      type="radio"
                      name="role"
                      value="Property Owner"
                      checked={
                        formData.role === "Property Owner"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      Property Owner
                    </span>

                  </label>


                  <label
                    className={
                      formData.role === "Buyer"
                        ? "role-option selected"
                        : "role-option"
                    }
                  >
                    <input
                      type="radio"
                      name="role"
                      value="Buyer"
                      checked={
                        formData.role === "Buyer"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      Buyer
                    </span>

                  </label>


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


                  <label
                    className={
                      formData.role === "HOA"
                        ? "role-option selected"
                        : "role-option"
                    }
                  >
                    <input
                      type="radio"
                      name="role"
                      value="HOA"
                      checked={
                        formData.role === "HOA"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      HOA
                    </span>

                  </label>

                </div>

              </div>


              <button
                type="submit"
                className="auth-submit"
              >
                Create your account
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
