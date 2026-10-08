import React, { useState } from "react";

function AgentEditListings() {
  const [listings, setListings] = useState([
    {
      id: "VAL-001",
      property: "3 Bedroom Family Home",
      location: "Parlock Hills",
      price: "R1,250,000",
      bedrooms: 3,
      bathrooms: 2,
      status: "Active",
    },
    {
      id: "VAL-002",
      property: "2 Bedroom Apartment",
      location: "Summerstrand",
      price: "R895,000",
      bedrooms: 2,
      bathrooms: 1,
      status: "Active",
    },
    {
      id: "VAL-003",
      property: "4 Bedroom Family Home",
      location: "Walmer",
      price: "R1,850,000",
      bedrooms: 4,
      bathrooms: 3,
      status: "Under Offer",
    },
    {
      id: "VAL-004",
      property: "2 Bedroom Townhouse",
      location: "Lorraine",
      price: "R980,000",
      bedrooms: 2,
      bathrooms: 1,
      status: "Sold",
    },
  ]);

  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    property: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    status: "",
  });

  const activeListings = listings.filter(
    (listing) => listing.status === "Active"
  ).length;

  const underOffer = listings.filter(
    (listing) => listing.status === "Under Offer"
  ).length;

  const soldListings = listings.filter(
    (listing) => listing.status === "Sold"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  const handleEdit = (listing) => {
    setEditingId(listing.id);

    setEditForm({
      property: listing.property,
      location: listing.location,
      price: listing.price,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      status: listing.status,
    });
  };

  const handleCancel = () => {
    setEditingId(null);

    setEditForm({
      property: "",
      location: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      status: "",
    });
  };

  const handleChange = (event) => {
    setEditForm({
      ...editForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleSave = (event) => {
    event.preventDefault();

    setListings(
      listings.map((listing) =>
        listing.id === editingId
          ? {
              ...listing,
              property: editForm.property,
              location: editForm.location,
              price: editForm.price,
              bedrooms: editForm.bedrooms,
              bathrooms: editForm.bathrooms,
              status: editForm.status,
            }
          : listing
      )
    );

    alert("Listing updated successfully.");

    handleCancel();
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this listing?"
    );

    if (confirmed) {
      setListings(
        listings.filter((listing) => listing.id !== id)
      );
    }
  };

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">

        <div className="logo-area">

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

          <a href="/agent-listings">
            🏠 My Listings
          </a>

          <a
            href="/agent-edit-listings"
            className="active"
          >
            ✏️ Edit Listings
          </a>

          <a href="/agent-inquiries">
            👥 Inquiry Log
          </a>

          <a href="/valuation">
            🤖 AI Valuation
          </a>

          <a href="/profile">
            👤 My Profile
          </a>

        </nav>

        <div className="logout-area">

          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              handleLogout();
            }}
          >
            🚪 Logout
          </a>

        </div>

      </aside>

      <main className="dashboard-main">

        <div className="top-bar">

          <div>

            <h2>
              Edit Listings
            </h2>

            <p>
              Update and manage your property listing information.
            </p>

          </div>

          <div className="profile-small">

            <div className="profile-circle">
              EA
            </div>

            <span>
              Estate Agent
            </span>

          </div>

        </div>

        <section className="stat-cards">

          <div className="stat-card">

            <span className="stat-icon">
              🏠
            </span>

            <div>

              <p>
                Total Listings
              </p>

              <h3>
                {listings.length}
              </h3>

              <small>
                Properties managed
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              ✅
            </span>

            <div>

              <p>
                Active
              </p>

              <h3>
                {activeListings}
              </h3>

              <small>
                Currently available
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              🤝
            </span>

            <div>

              <p>
                Under Offer
              </p>

              <h3>
                {underOffer}
              </h3>

              <small>
                Pending sales
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              💰
            </span>

            <div>

              <p>
                Sold
              </p>

              <h3>
                {soldListings}
              </h3>

              <small>
                Completed sales
              </small>

            </div>

          </div>

        </section>

        {editingId && (

          <section className="dashboard-panel large-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Edit Property
                </h3>

                <p>
                  Update the details of your selected property.
                </p>

              </div>

            </div>

            <form onSubmit={handleSave}>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >

                <div>

                  <label>
                    Property Name
                  </label>

                  <input
                    type="text"
                    name="property"
                    value={editForm.property}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />

                </div>

                <div>

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />

                </div>

                <div>

                  <label>
                    Price
                  </label>

                  <input
                    type="text"
                    name="price"
                    value={editForm.price}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />

                </div>

                <div>

                  <label>
                    Bedrooms
                  </label>

                  <input
                    type="number"
                    name="bedrooms"
                    value={editForm.bedrooms}
                    onChange={handleChange}
                    required
                    min="1"
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />

                </div>

                <div>

                  <label>
                    Bathrooms
                  </label>

                  <input
                    type="number"
                    name="bathrooms"
                    value={editForm.bathrooms}
                    onChange={handleChange}
                    required
                    min="1"
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />

                </div>

                <div>

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Under Offer">
                      Under Offer
                    </option>

                    <option value="Sold">
                      Sold
                    </option>

                  </select>

                </div>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "25px",
                }}
              >

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>

        )}

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Your Property Listings
              </h3>

              <p>
                Select a listing to edit its information.
              </p>

            </div>

          </div>

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Property
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Bedrooms
                  </th>

                  <th>
                    Bathrooms
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {listings.map((listing) => (

                  <tr key={listing.id}>

                    <td>

                      <strong>
                        {listing.property}
                      </strong>

                      <small
                        style={{
                          display: "block",
                          color: "#777",
                          marginTop: "4px",
                        }}
                      >
                        {listing.id}
                      </small>

                    </td>

                    <td>
                      {listing.location}
                    </td>

                    <td>
                      <strong>
                        {listing.price}
                      </strong>
                    </td>

                    <td>
                      {listing.bedrooms}
                    </td>

                    <td>
                      {listing.bathrooms}
                    </td>

                    <td>

                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "15px",
                          background:
                            listing.status === "Active"
                              ? "#e8f5e9"
                              : listing.status === "Under Offer"
                              ? "#fff4d6"
                              : "#eee7f3",
                          color:
                            listing.status === "Active"
                              ? "#2e7d32"
                              : listing.status === "Under Offer"
                              ? "#8a6500"
                              : "#563F6B",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {listing.status}
                      </span>

                    </td>

                    <td>

                      <button
                        className="secondary-btn"
                        onClick={() =>
                          handleEdit(listing)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="secondary-btn"
                        style={{
                          marginLeft: "6px",
                        }}
                        onClick={() =>
                          handleDelete(listing.id)
                        }
                      >
                        Remove
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AgentEditListings;
