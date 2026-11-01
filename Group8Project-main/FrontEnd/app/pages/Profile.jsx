import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import { useSession } from "../services/session"
import {
  changePassword as changePasswordRequest,
  me as fetchMe,
  updateProfile,
} from "../services/authApi.js";
import { getPasswordErrorMessage } from "../services/authErrorMessages.js";
import { checkPasswordRules, validateNewPassword } from "../services/validation.js";
import PasswordRequirements from "./Auth/PasswordRequirements.jsx";
import "./Profile.css";

function Profile() {

  const navigate = useNavigate();
  const { user, logout, updateSessionUser } = useSession();

  const [editing, setEditing] = useState(false);

  // user info states
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phoneno || user?.phone || "");

  // edit form states
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);

  // saving state
  const [isSaving, setIsSaving] = useState(false)

  // Sync state if the user object loads asynchronously
  useEffect(() => {
    if (user) {
      setName(user.fullName || "");
      setEmail(user.email || "");
      setEditName(user.fullName || "");
      setEditEmail(user.email || "");
      if (user.phoneno || user.phone) {
        setPhone(user.phoneno || user.phone);
      }
    }
  }, [user]);

  // Sessions started before phone numbers were returned have none cached: read it once.
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetchMe(token)
      .then((fresh) => {
        setPhone(fresh?.phoneno || "");
        updateSessionUser({ phoneno: fresh?.phoneno || null });
      })
      .catch((error) => console.error("Unable to refresh profile:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // notification states
  const [notifications, setNotifications] = useState(true);
  const [propertyUpdates, setPropertyUpdates] = useState(true);
  const [complaintNotifications, setComplaintNotifications] = useState(true);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

   const saveProfile = async () => {
    if (editName.trim().length < 2) {
      alert("Please enter your full name.");
      return;
    }

    setIsSaving(true);

    try {
      const data = await updateProfile({ fullName: editName, phone: editPhone });

      // Update the local React state
      setName(data.full_name);
      setPhone(data.phoneno || "");

      // Update the session so the sidebar and other pages see the change immediately
      updateSessionUser({
        full_name: data.full_name,
        phoneno: data.phoneno || null,
      });

      setEditing(false);
      alert("Profile updated successfully.");

    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };


  /*
  =========================================================
  CHANGE PASSWORD
  =========================================================
  */

    const changePassword = () => {
    setIsPasswordModalOpen(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const passwordProblem = validateNewPassword(newPassword);
    if (passwordProblem) {
      setPasswordError(passwordProblem);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("Your new password must be different from your current password.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePasswordRequest({ currentPassword, newPassword });

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
      }, 2000); // Close modal after 2 seconds
    } catch (error) {
      setPasswordError(getPasswordErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
    }
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
            {user?.initials || name.charAt(0).toUpperCase()}
          </div>

          <div className="resident-profile-header-info">

            <span>
              {user?.roleLabel ? user.roleLabel.toUpperCase() : "VALORA MEMBER"}
            </span>

            <h1>
              {name || "Loading..."}
            </h1>

            <p>
              {user?.roleLabel || "Member"}
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
                  {phone || "Not provided"}
                </strong>

              </div>


              <div className="resident-profile-detail">

                <span>
                  Account Type
                </span>

                <strong>
                  {user?.roleLabel || "Member"}
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
                  readOnly
                  disabled
                  title="Your email address cannot be changed here."
                />

              </div>


              <div className="resident-profile-form-field">

                <label htmlFor="profile-phone">
                  Phone Number
                </label>

                <input
                  id="profile-phone"
                  type="tel"
                  maxLength={20}
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
                logout(); // Clears the token from authService/session
                navigate("/login", { replace: true }); // Redirects to login page
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

       {/* =================================================
            PASSWORD CHANGE MODAL  
            ================================================= */}
        {isPasswordModalOpen && (
          <div className="password-modal-overlay">
            <div className="password-modal">
              <h3>Change Password</h3>
              
              {passwordError && (
                <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div style={{ color: '#388e3c', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={submitPasswordChange}>
                <div className="resident-profile-form-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="resident-profile-form-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <PasswordRequirements
                    id="profile-password-requirements"
                    rules={checkPasswordRules(newPassword)}
                    touched={newPassword.length > 0}
                  />
                </div>

                <div className="resident-profile-form-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="resident-profile-edit-buttons">
                  <button
                    type="submit"
                    className="resident-profile-save-button"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Updating…" : "Update Password"}
                  </button>
                  <button 
                    type="button" 
                    className="resident-profile-cancel-button"
                    onClick={() => setIsPasswordModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

export default Profile;
