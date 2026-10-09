import React, { useState } from "react";

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

  const handleLogout = () => {
    window.location.href = "/";
  };

  const handleEdit = () => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(phone);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const saveProfile = () => {
    if (
      editName.trim() === "" ||
      editEmail.trim() === "" ||
      editPhone.trim() === ""
    ) {
      alert("Please complete all profile fields.");
      return;
    }

    setName(editName);
    setEmail(editEmail);
    setPhone(editPhone);

    setEditing(false);

    alert("Profile updated successfully.");
  };

  const changePassword = () => {
    alert(
      "Password change functionality will be connected to the authentication system."
    );
  };

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo-area">

          {/* VALORA LOGO IMAGE */}
          <img
            src="/ValoraLogo.jpeg"
            alt="VALORA Logo"
          />

          <p>
            Property Intelligence
          </p>

        </div>


        <nav className="side-nav">

          <a href="/dashboard">
            🏠 Dashboard
          </a>

          <a href="/property">
            🏡 My Property
          </a>

          <a href="/valuation">
            🤖 AI Valuation
          </a>

          <a href="/complaints">
            🏘 Complaints
          </a>

          <a href="/providers">
            🔧 Service Providers
          </a>

          <a href="/announcements">
            📢 Announcements
          </a>

          <a
            href="/profile"
            className="active"
          >
            👤 My Profile
          </a>

        </nav>


        <div className="logout-area">

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            🚪 Logout
          </a>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="dashboard-main">

        <div className="top-bar">

          <div>

            <h2>
              My Profile 👤
            </h2>

            <p>
              Manage your VALORA account information.
            </p>

          </div>

        </div>


        {/* PROFILE HEADER */}

        <section className="profile-header-card">

          <div className="profile-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="profile-header-info">

            <span>
              VALORA MEMBER
            </span>

            <h1 id="profileName">
              {name}
            </h1>

            <p>
              Property Owner
            </p>

          </div>

        </section>


        {/* PERSONAL INFORMATION */}

        <section className="dashboard-panel">

          <div className="panel-heading">

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
                className="edit-profile-button"
                onClick={handleEdit}
              >
                ✏️ Edit Profile
              </button>

            )}

          </div>


          {/* VIEW PROFILE */}

          {!editing ? (

            <div className="profile-details-grid">

              <div>

                <span>
                  Full Name
                </span>

                <strong>
                  {name}
                </strong>

              </div>


              <div>

                <span>
                  Email Address
                </span>

                <strong>
                  {email}
                </strong>

              </div>


              <div>

                <span>
                  Phone Number
                </span>

                <strong>
                  {phone}
                </strong>

              </div>


              <div>

                <span>
                  Account Type
                </span>

                <strong>
                  Property Owner
                </strong>

              </div>

            </div>

          ) : (

            /* EDIT PROFILE */

            <div className="profile-edit-form">

              <label>
                Full Name
              </label>

              <input
                type="text"
                value={editName}
                onChange={(e) =>
                  setEditName(e.target.value)
                }
              />


              <label>
                Email Address
              </label>

              <input
                type="email"
                value={editEmail}
                onChange={(e) =>
                  setEditEmail(e.target.value)
                }
              />


              <label>
                Phone Number
              </label>

              <input
                type="text"
                value={editPhone}
                onChange={(e) =>
                  setEditPhone(e.target.value)
                }
              />


              <div className="profile-edit-buttons">

                <button
                  type="button"
                  onClick={saveProfile}
                >
                  Save Changes
                </button>


                <button
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

              </div>

            </div>

          )}

        </section>


        {/* ACCOUNT SETTINGS */}

        <section className="dashboard-panel profile-settings-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Account Settings
              </h3>

              <p>
                Manage your VALORA preferences.
              </p>

            </div>

          </div>


          <div className="settings-list">

            {/* COMMUNITY NOTIFICATIONS */}

            <div className="setting-item">

              <div>

                <strong>
                  📢 Community Notifications
                </strong>

                <span>
                  Receive important HOA announcements.
                </span>

              </div>


              <label className="toggle">

                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) =>
                    setNotifications(e.target.checked)
                  }
                />

                <span className="toggle-slider"></span>

              </label>

            </div>


            {/* PROPERTY UPDATES */}

            <div className="setting-item">

              <div>

                <strong>
                  📊 Property Updates
                </strong>

                <span>
                  Receive updates about your property.
                </span>

              </div>


              <label className="toggle">

                <input
                  type="checkbox"
                  checked={propertyUpdates}
                  onChange={(e) =>
                    setPropertyUpdates(e.target.checked)
                  }
                />

                <span className="toggle-slider"></span>

              </label>

            </div>


            {/* COMPLAINT NOTIFICATIONS */}

            <div className="setting-item">

              <div>

                <strong>
                  🔔 Complaint Notifications
                </strong>

                <span>
                  Receive updates when complaints change status.
                </span>

              </div>


              <label className="toggle">

                <input
                  type="checkbox"
                  checked={complaintNotifications}
                  onChange={(e) =>
                    setComplaintNotifications(e.target.checked)
                  }
                />

                <span className="toggle-slider"></span>

              </label>

            </div>

          </div>

        </section>


        {/* SECURITY */}

        <section className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Security
              </h3>

              <p>
                Keep your account secure.
              </p>

            </div>

          </div>


          <div className="security-actions">

            <button
              type="button"
              onClick={changePassword}
            >
              🔐 Change Password
            </button>


            <button
              type="button"
              onClick={handleLogout}
            >
              🚪 Log Out
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Profile;
