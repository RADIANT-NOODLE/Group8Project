import React, { useState } from "react";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import "./Profile.css";

function Profile() {

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("Tabassum");
  const [email, setEmail] = useState("tabassum@example.com");
  const [phone, setPhone] = useState("083 000 0000");

  const [editName, setEditName] = useState("Tabassum");
  const [editEmail, setEditEmail] = useState("tabassum@example.com");
  const [editPhone, setEditPhone] = useState("083 000 0000");

  const [notifications, setNotifications] = useState(true);
  const [propertyUpdates, setPropertyUpdates] = useState(true);
  const [complaintNotifications, setComplaintNotifications] = useState(true);


  /*
  =========================================================
  PROFESSIONAL SVG ICON
  =========================================================
  */

  const Icon = ({ type, size = 20 }) => {

    const commonProps = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
    };

    switch (type) {

      case "edit":
        return (
          <svg {...commonProps}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4L16.5 3.5z" />
          </svg>
        );

      case "notifications":
        return (
          <svg {...commonProps}>
            <path d="M18 9a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
        );

      case "updates":
        return (
          <svg {...commonProps}>
            <path d="M4 19V5" />
            <path d="M4 19h16" />
            <path d="M7 15l4-4 3 2 5-6" />
          </svg>
        );

      case "security":
        return (
          <svg {...commonProps}>
            <path d="M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        );

      case "logout":
        return (
          <svg {...commonProps}>
            <path d="M10 4H5v16h5" />
            <path d="M14 8l4 4-4 4" />
            <path d="M18 12H9" />
          </svg>
        );

      default:
        return null;
    }
  };


  /*
  =========================================================
  EDIT PROFILE
  =========================================================
  */

  const handleEdit = () => {

    setEditName(name);
    setEditEmail(email);
    setEditPhone(phone);

    setEditing(true);
  };


  /*
  =========================================================
  CANCEL EDIT
  =========================================================
  */

  const handleCancel = () => {

    setEditing(false);
  };


  /*
  =========================================================
  SAVE PROFILE
  =========================================================
  */

  const saveProfile = () => {

    if (
      editName.trim() === "" ||
      editEmail.trim() === "" ||
      editPhone.trim() === ""
    ) {

      alert(
        "Please complete all profile fields."
      );

      return;
    }

    setName(editName);
    setEmail(editEmail);
    setPhone(editPhone);

    setEditing(false);

    alert(
      "Profile updated successfully."
    );
  };


  /*
  =========================================================
  CHANGE PASSWORD
  =========================================================
  */

  const changePassword = () => {

    alert(
      "Password change functionality will be connected to the authentication system."
    );
  };


  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (

    <div className="resident-profile-layout">

      {/* =================================================
          SHARED VALORA SIDEBAR
          ================================================= */}

      <DashboardSidebar />


      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main className="resident-profile-main">


        {/* =================================================
            TOP BAR
            ================================================= */}

        <header className="resident-profile-topbar">

          <div>

            <p className="resident-profile-eyebrow">
              ACCOUNT
            </p>

            <h2>
              My Profile
            </h2>

            <p>
              Manage your VALORA account information.
            </p>

          </div>

        </header>


        {/* =================================================
            PROFILE HEADER
            ================================================= */}

        <section className="resident-profile-header-card">

          <div className="resident-profile-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="resident-profile-header-info">

            <span>
              VALORA MEMBER
            </span>

            <h1>
              {name}
            </h1>

            <p>
              Property Owner
            </p>

          </div>

        </section>


        {/* =================================================
            PERSONAL INFORMATION
            ================================================= */}

        <section className="resident-profile-panel">

          <div className="resident-profile-panel-heading">

            <div>

              <h3>
                Personal Information
              </h3>

              <p>
                Your account details.
              </p>

            </div>


            {!editing && (

              <button
                type="button"
                className="resident-profile-edit-button"
                onClick={handleEdit}
              >

                <Icon
                  type="edit"
                  size={17}
                />

                <span>
                  Edit Profile
                </span>

              </button>

            )}

          </div>


          {!editing ? (

            <div className="resident-profile-details-grid">


              <div className="resident-profile-detail">

                <span>
                  Full Name
                </span>

                <strong>
                  {name}
                </strong>

              </div>


              <div className="resident-profile-detail">

                <span>
                  Email Address
                </span>

                <strong>
                  {email}
                </strong>

              </div>


              <div className="resident-profile-detail">

                <span>
                  Phone Number
                </span>

                <strong>
                  {phone}
                </strong>

              </div>


              <div className="resident-profile-detail">

                <span>
                  Account Type
                </span>

                <strong>
                  Property Owner
                </strong>

              </div>


            </div>

          ) : (

            <div className="resident-profile-edit-form">


              <div className="resident-profile-form-field">

                <label htmlFor="profile-name">
                  Full Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(event.target.value)
                  }
                />

              </div>


              <div className="resident-profile-form-field">

                <label htmlFor="profile-email">
                  Email Address
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={editEmail}
                  onChange={(event) =>
                    setEditEmail(event.target.value)
                  }
                />

              </div>


              <div className="resident-profile-form-field">

                <label htmlFor="profile-phone">
                  Phone Number
                </label>

                <input
                  id="profile-phone"
                  type="text"
                  value={editPhone}
                  onChange={(event) =>
                    setEditPhone(event.target.value)
                  }
                />

              </div>


              <div className="resident-profile-edit-buttons">

                <button
                  type="button"
                  className="resident-profile-save-button"
                  onClick={saveProfile}
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  className="resident-profile-cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

              </div>


            </div>

          )}

        </section>


        {/* =================================================
            ACCOUNT SETTINGS
            ================================================= */}

        <section className="resident-profile-panel resident-profile-settings-panel">

          <div className="resident-profile-panel-heading">

            <div>

              <h3>
                Account Settings
              </h3>

              <p>
                Manage your VALORA preferences.
              </p>

            </div>

          </div>


          <div className="resident-profile-settings-list">


            {/* COMMUNITY NOTIFICATIONS */}

            <div className="resident-profile-setting-item">

              <div className="resident-profile-setting-info">

                <div className="resident-profile-setting-icon">

                  <Icon
                    type="notifications"
                    size={19}
                  />

                </div>

                <div>

                  <strong>
                    Community Notifications
                  </strong>

                  <span>
                    Receive important HOA announcements.
                  </span>

                </div>

              </div>


              <label className="resident-profile-toggle">

                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(event) =>
                    setNotifications(
                      event.target.checked
                    )
                  }
                />

                <span className="resident-profile-toggle-slider"></span>

              </label>

            </div>


            {/* PROPERTY UPDATES */}

            <div className="resident-profile-setting-item">

              <div className="resident-profile-setting-info">

                <div className="resident-profile-setting-icon">

                  <Icon
                    type="updates"
                    size={19}
                  />

                </div>

                <div>

                  <strong>
                    Property Updates
                  </strong>

                  <span>
                    Receive updates about your property.
                  </span>

                </div>

              </div>


              <label className="resident-profile-toggle">

                <input
                  type="checkbox"
                  checked={propertyUpdates}
                  onChange={(event) =>
                    setPropertyUpdates(
                      event.target.checked
                    )
                  }
                />

                <span className="resident-profile-toggle-slider"></span>

              </label>

            </div>


            {/* COMPLAINT NOTIFICATIONS */}

            <div className="resident-profile-setting-item">

              <div className="resident-profile-setting-info">

                <div className="resident-profile-setting-icon">

                  <Icon
                    type="notifications"
                    size={19}
                  />

                </div>

                <div>

                  <strong>
                    Complaint Notifications
                  </strong>

                  <span>
                    Receive updates when complaints change status.
                  </span>

                </div>

              </div>


              <label className="resident-profile-toggle">

                <input
                  type="checkbox"
                  checked={complaintNotifications}
                  onChange={(event) =>
                    setComplaintNotifications(
                      event.target.checked
                    )
                  }
                />

                <span className="resident-profile-toggle-slider"></span>

              </label>

            </div>


          </div>

        </section>


        {/* =================================================
            SECURITY
            ================================================= */}

        <section className="resident-profile-panel">

          <div className="resident-profile-panel-heading">

            <div>

              <h3>
                Security
              </h3>

              <p>
                Keep your account secure.
              </p>

            </div>

          </div>


          <div className="resident-profile-security-actions">


            <button
              type="button"
              onClick={changePassword}
            >

              <Icon
                type="security"
                size={18}
              />

              Change Password

            </button>


            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("valoraUser");
                window.location.href = "/";
              }}
            >

              <Icon
                type="logout"
                size={18}
              />

              Log Out

            </button>


          </div>

        </section>


      </main>

    </div>
  );
}

export default Profile;
