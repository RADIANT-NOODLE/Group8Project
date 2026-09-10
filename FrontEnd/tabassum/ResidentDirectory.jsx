import React, { useState } from "react";

function ResidentDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const residents = [
    {
      id: "RES-001",
      name: "Ahmed Khan",
      unit: "Unit 12",
      email: "ahmed.khan@example.com",
      phone: "082 555 1023",
      property: "2 Bedroom",
      occupancy: "Occupied",
      status: "Active",
    },
    {
      id: "RES-002",
      name: "Fatima Ismail",
      unit: "Unit 24",
      email: "fatima.ismail@example.com",
      phone: "083 555 2145",
      property: "3 Bedroom",
      occupancy: "Occupied",
      status: "Active",
    },
    {
      id: "RES-003",
      name: "Yusuf Patel",
      unit: "Unit 31",
      email: "yusuf.patel@example.com",
      phone: "084 555 3267",
      property: "2 Bedroom",
      occupancy: "Occupied",
      status: "Active",
    },
    {
      id: "RES-004",
      name: "Ayesha Mohammed",
      unit: "Unit 08",
      email: "ayesha.mohammed@example.com",
      phone: "081 555 4389",
      property: "1 Bedroom",
      occupancy: "Occupied",
      status: "Active",
    },
    {
      id: "RES-005",
      name: "Imran Sayed",
      unit: "Unit 19",
      email: "imran.sayed@example.com",
      phone: "079 555 5412",
      property: "2 Bedroom",
      occupancy: "Vacant",
      status: "Inactive",
    },
  ];

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch =
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || resident.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const occupiedUnits = residents.filter(
    (resident) => resident.occupancy === "Occupied"
  ).length;

  const vacantUnits = residents.filter(
    (resident) => resident.occupancy === "Vacant"
  ).length;

  const activeResidents = residents.filter(
    (resident) => resident.status === "Active"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  return (
    <div className="dashboard-layout">

      {/* =================================================
          SIDEBAR
          SAME AS ORIGINAL DASHBOARD
          ================================================= */}

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


          {/* HOA ADMIN NAVIGATION */}

          <a
            href="/resident-directory"
            className="active"
          >
            👥 Resident Directory
          </a>

          <a href="/resident-complaints">
            📋 Resident Complaints
          </a>

          <a href="/maintenance">
            🔧 Maintenance
          </a>

          <a href="/community-announcements">
            📢 Community Announcements
          </a>

          <a href="/ai-training-data">
            🤖 AI Training Data
          </a>

          <a href="/community-analytics">
            📊 Community Analytics
          </a>

          <a href="/profile">
            👤 My Profile
          </a>

        </nav>


        {/* LOGOUT */}

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


      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main className="dashboard-main">

        {/* TOP BAR */}

        <div className="top-bar">

          <div>

            <h2>
              Resident Directory
            </h2>

            <p>
              Manage community residents and their property information.
            </p>

          </div>


          <div className="profile-small">

            <div className="profile-circle">
              HOA
            </div>

            <span>
              HOA Admin
            </span>

          </div>

        </div>


        {/* =================================================
            SUMMARY CARDS
            ================================================= */}

        <section className="stat-cards">

          <div className="stat-card">

            <span className="stat-icon">
              👥
            </span>

            <div>

              <p>
                Total Residents
              </p>

              <h3>
                {residents.length}
              </h3>

              <small>
                Registered residents
              </small>

            </div>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              🏠
            </span>

            <div>

              <p>
                Occupied Units
              </p>

              <h3>
                {occupiedUnits}
              </h3>

              <small>
                Currently occupied
              </small>

            </div>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              🔑
            </span>

            <div>

              <p>
                Vacant Units
              </p>

              <h3>
                {vacantUnits}
              </h3>

              <small>
                Currently vacant
              </small>

            </div>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              🟢
            </span>

            <div>

              <p>
                Active Residents
              </p>

              <h3>
                {activeResidents}
              </h3>

              <small>
                Active accounts
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            DIRECTORY
            ================================================= */}

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Community Residents
              </h3>

              <p>
                View and manage residents registered within the community.
              </p>

            </div>


            <button
              className="primary-btn"
              onClick={() =>
                alert("Add Resident feature coming soon.")
              }
            >
              + Add Resident
            </button>

          </div>


          {/* SEARCH AND FILTER */}

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >

            <input
              type="text"
              placeholder="Search by name, unit or email..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              style={{
                flex: "1",
                minWidth: "250px",
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              style={{
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                minWidth: "150px",
              }}
            >

              <option value="All">
                All Residents
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>


          {/* RESIDENT TABLE */}

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Resident
                  </th>

                  <th>
                    Unit
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Property
                  </th>

                  <th>
                    Occupancy
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredResidents.length > 0 ? (

                  filteredResidents.map((resident) => (

                    <tr key={resident.id}>

                      <td>

                        <strong>
                          {resident.name}
                        </strong>

                        <small
                          style={{
                            display: "block",
                            color: "#777",
                            marginTop: "4px",
                          }}
                        >
                          {resident.id}
                        </small>

                      </td>


                      <td>
                        {resident.unit}
                      </td>


                      <td>

                        <div>
                          {resident.phone}
                        </div>

                        <small
                          style={{
                            color: "#777",
                          }}
                        >
                          {resident.email}
                        </small>

                      </td>


                      <td>
                        {resident.property}
                      </td>


                      <td>

                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "15px",
                            background:
                              resident.occupancy === "Occupied"
                                ? "#eee7f3"
                                : "#f1f1f1",
                            color:
                              resident.occupancy === "Occupied"
                                ? "#563F6B"
                                : "#666",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {resident.occupancy}
                        </span>

                      </td>


                      <td>

                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "15px",
                            background:
                              resident.status === "Active"
                                ? "#e8f5e9"
                                : "#eeeeee",
                            color:
                              resident.status === "Active"
                                ? "#2e7d32"
                                : "#666",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {resident.status}
                        </span>

                      </td>


                      <td>

                        <button
                          className="secondary-btn"
                          onClick={() =>
                            alert(
                              `Viewing resident: ${resident.name}`
                            )
                          }
                        >
                          View
                        </button>


                        <button
                          className="secondary-btn"
                          style={{
                            marginLeft: "6px",
                          }}
                          onClick={() =>
                            alert(
                              `Edit resident: ${resident.name}`
                            )
                          }
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No residents found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ResidentDirectory;
