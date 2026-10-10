import React, { useState } from "react";
import "./ResidentDirectory.css";


/* =========================================================
   VALORA ICONS
========================================================= */

function Icon({ name, size = 18 }) {

  const icons = {

    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    residents: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.5-3 2.4-4.5 5.5-4.5s5 1.5 5.5 4.5" />
        <path d="M15 5.5c2.2-.2 4 1.2 4 3.5 0 1.5-.8 2.7-2 3.3" />
        <path d="M16 14.5c2.4.4 3.9 1.8 4.5 4" />
      </>
    ),

    complaints: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8.5 8h7" />
        <path d="M8.5 12h7" />
        <path d="M8.5 16h4.5" />
      </>
    ),

    maintenance: (
      <path d="M14.5 5.5a4 4 0 0 0-5.1 5.1L4 16l4 4 5.4-5.4a4 4 0 0 0 5.1-5.1l-2.6 2.6-3-3 2.6-2.6Z" />
    ),

    announcements: (
      <>
        <path d="M4 10v4h4l7 4V6l-7 4H4Z" />
        <path d="M8 14l1.5 5" />
        <path d="M18 9c1 .8 1.5 1.7 1.5 3s-.5 2.2-1.5 3" />
      </>
    ),

    ai: (
      <>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
        <path d="M10 10h4v4h-4z" />
      </>
    ),

    analytics: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19V3" />
      </>
    ),

    profile: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6" />
      </>
    ),

    logout: (
      <>
        <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),

    total: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M2.5 20c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5" />
        <path d="M10.5 20c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5" />
      </>
    ),

    occupied: (
      <>
        <path d="M4 11h16v8H4z" />
        <path d="M7 11V8h10v3" />
        <path d="M3 19h18" />
      </>
    ),

    vacant: (
      <>
        <path d="M4 10.5 12 4l8 6.5V20H4V10.5Z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),

    active: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m7.5 12 3 3 6-6" />
      </>
    ),

    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    eye: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),

    edit: (
      <>
        <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
        <path d="m13.5 8.5 3 3" />
      </>
    )

  };


  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
}


/* =========================================================
   RESIDENT DIRECTORY
========================================================= */

function ResidentDirectory() {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");


  /* =======================================================
     RESIDENT DATA
  ======================================================= */

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
      email: "079 555 5412",
      property: "2 Bedroom",
      occupancy: "Vacant",
      status: "Inactive",
    },
  ];


  /* =======================================================
     FILTER RESIDENTS
  ======================================================= */

  const filteredResidents = residents.filter((resident) => {

    const matchesSearch =
      resident.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||

      resident.unit
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||

      resident.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());


    const matchesStatus =
      statusFilter === "All" ||
      resident.status === statusFilter;


    return matchesSearch && matchesStatus;
  });


  /* =======================================================
     STATISTICS
  ======================================================= */

  const occupiedUnits = residents.filter(
    (resident) =>
      resident.occupancy === "Occupied"
  ).length;


  const vacantUnits = residents.filter(
    (resident) =>
      resident.occupancy === "Vacant"
  ).length;


  const activeResidents = residents.filter(
    (resident) =>
      resident.status === "Active"
  ).length;


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {

    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };


  return (

    <div className="resident-directory-layout">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="resident-directory-sidebar">


        {/* LOGO */}

        <div className="resident-directory-logo-area">

          <img
            src="/ValoraLogo.jpeg"
            alt="VALORA Logo"
          />

          <p>
            Property Intelligence
          </p>

        </div>


        {/* NAVIGATION */}

        <nav className="resident-directory-side-nav">

          <a href="/dashboard">

            <Icon
              name="dashboard"
              size={17}
            />

            <span>
              Dashboard
            </span>

          </a>


          <a
            href="/resident-directory"
            className="active"
          >

            <Icon
              name="residents"
              size={17}
            />

            <span>
              Resident Directory
            </span>

          </a>


          <a href="/resident-complaints">

            <Icon
              name="complaints"
              size={17}
            />

            <span>
              Resident Complaints
            </span>

          </a>


          <a href="/maintenance">

            <Icon
              name="maintenance"
              size={17}
            />

            <span>
              Maintenance
            </span>

          </a>


          <a href="/community-announcements">

            <Icon
              name="announcements"
              size={17}
            />

            <span>
              Community Announcements
            </span>

          </a>


          <a href="/ai-training-data">

            <Icon
              name="ai"
              size={17}
            />

            <span>
              AI Training Data
            </span>

          </a>


          <a href="/community-analytics">

            <Icon
              name="analytics"
              size={17}
            />

            <span>
              Community Analytics
            </span>

          </a>


          <a href="/profile">

            <Icon
              name="profile"
              size={17}
            />

            <span>
              My Profile
            </span>

          </a>

        </nav>


        {/* LOGOUT */}

        <div className="resident-directory-logout-area">

          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              handleLogout();
            }}
          >

            <Icon
              name="logout"
              size={17}
            />

            <span>
              Logout
            </span>

          </a>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="resident-directory-main">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="resident-directory-top-bar">

          <div>

            <span className="resident-directory-eyebrow">
              COMMUNITY MANAGEMENT
            </span>

            <h2>
              Resident Directory
            </h2>

            <p>
              Manage community residents and their property information.
            </p>

          </div>


          <div className="resident-directory-profile-small">

            <div className="resident-directory-profile-circle">
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

        <section className="resident-directory-stat-cards">


          {/* TOTAL RESIDENTS */}

          <div className="resident-directory-stat-card">

            <div className="resident-directory-stat-icon">

              <Icon
                name="total"
                size={19}
              />

            </div>

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


          {/* OCCUPIED */}

          <div className="resident-directory-stat-card">

            <div className="resident-directory-stat-icon">

              <Icon
                name="occupied"
                size={19}
              />

            </div>

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


          {/* VACANT */}

          <div className="resident-directory-stat-card">

            <div className="resident-directory-stat-icon">

              <Icon
                name="vacant"
                size={19}
              />

            </div>

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


          {/* ACTIVE */}

          <div className="resident-directory-stat-card">

            <div className="resident-directory-stat-icon">

              <Icon
                name="active"
                size={19}
              />

            </div>

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
            DIRECTORY PANEL
        ================================================= */}

        <section className="resident-directory-panel">


          {/* PANEL HEADER */}

          <div className="resident-directory-panel-heading">

            <div>

              <h3>
                Community Residents
              </h3>

              <p>
                View and manage residents registered within the community.
              </p>

            </div>


            <button
              className="resident-directory-primary-btn"
              onClick={() =>
                alert("Add Resident feature coming soon.")
              }
            >

              <Icon
                name="plus"
                size={15}
              />

              <span>
                Add Resident
              </span>

            </button>

          </div>


          {/* =================================================
              SEARCH AND FILTER
          ================================================= */}

          <div className="resident-directory-filters">


            <div className="resident-directory-search">

              <Icon
                name="search"
                size={16}
              />

              <input
                type="text"
                placeholder="Search by name, unit or email..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

            </div>


            <select
              className="resident-directory-filter-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
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


          {/* =================================================
              RESULT COUNT
          ================================================= */}

          <div className="resident-directory-results">

            <span>
              Showing {filteredResidents.length} of {residents.length} residents
            </span>

          </div>


          {/* =================================================
              RESIDENT TABLE
          ================================================= */}

          <div className="resident-directory-table-container">

            <table className="resident-directory-table">

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


                      {/* RESIDENT */}

                      <td>

                        <div className="resident-directory-resident-cell">

                          <strong>
                            {resident.name}
                          </strong>

                          <small>
                            {resident.id}
                          </small>

                        </div>

                      </td>


                      {/* UNIT */}

                      <td>

                        <span className="resident-directory-unit">
                          {resident.unit}
                        </span>

                      </td>


                      {/* CONTACT */}

                      <td>

                        <div className="resident-directory-contact">

                          <span>
                            {resident.phone}
                          </span>

                          <small>
                            {resident.email}
                          </small>

                        </div>

                      </td>


                      {/* PROPERTY */}

                      <td>
                        {resident.property}
                      </td>


                      {/* OCCUPANCY */}

                      <td>

                        <span
                          className={
                            resident.occupancy === "Occupied"
                              ? "resident-directory-occupancy-occupied"
                              : "resident-directory-occupancy-vacant"
                          }
                        >
                          {resident.occupancy}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            resident.status === "Active"
                              ? "resident-directory-status-active"
                              : "resident-directory-status-inactive"
                          }
                        >
                          {resident.status}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="resident-directory-actions">

                          <button
                            className="resident-directory-secondary-btn"
                            onClick={() =>
                              alert(
                                `Viewing resident: ${resident.name}`
                              )
                            }
                          >

                            <Icon
                              name="eye"
                              size={13}
                            />

                            <span>
                              View
                            </span>

                          </button>


                          <button
                            className="resident-directory-secondary-btn"
                            onClick={() =>
                              alert(
                                `Edit resident: ${resident.name}`
                              )
                            }
                          >

                            <Icon
                              name="edit"
                              size={13}
                            />

                            <span>
                              Edit
                            </span>

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="resident-directory-no-results"
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
