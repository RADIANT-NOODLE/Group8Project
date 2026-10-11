import React, { useState } from "react";
import * as authService from "../../services/authService.js";
import InlineMessage from "../../components/InlineMessage";
import "./AITrainingData.css";

function AITrainingData() {
  const [categoryFilter, setCategoryFilter] = useState("All");

  /* Dataset rows and actions used to raise browser alerts. */

  const [notice, setNotice] = useState("");

  const trainingData = [
    {
      id: "AI-001",
      category: "Property Valuation",
      dataType: "Property",
      description: "Residential property valuation data",
      records: 245,
      status: "Active",
      lastUpdated: "28 Aug 2026",
    },
    {
      id: "AI-002",
      category: "Property Valuation",
      dataType: "Sales",
      description: "Historical property sales information",
      records: 318,
      status: "Active",
      lastUpdated: "27 Aug 2026",
    },
    {
      id: "AI-003",
      category: "Rental Yield",
      dataType: "Rental",
      description: "Rental prices and rental yield information",
      records: 186,
      status: "Active",
      lastUpdated: "26 Aug 2026",
    },
    {
      id: "AI-004",
      category: "Community Trends",
      dataType: "Complaints",
      description: "Community complaint and maintenance trends",
      records: 142,
      status: "Active",
      lastUpdated: "25 Aug 2026",
    },
    {
      id: "AI-005",
      category: "Property Valuation",
      dataType: "Features",
      description: "Property features used for valuation analysis",
      records: 205,
      status: "Pending Review",
      lastUpdated: "24 Aug 2026",
    },
  ];

  const filteredData = trainingData.filter((data) => {
    return (
      categoryFilter === "All" ||
      data.category === categoryFilter
    );
  });

  const totalDatasets = trainingData.length;

  const activeDatasets = trainingData.filter(
    (data) => data.status === "Active"
  ).length;

  const pendingDatasets = trainingData.filter(
    (data) => data.status === "Pending Review"
  ).length;

  const totalRecords = trainingData.reduce(
    (total, data) => total + data.records,
    0
  );

  const handleLogout = () => {
    authService.logout();

    window.location.href = "/";
  };

  const handleView = (data) => {
    setNotice(
      `${data.id} — ${data.description}. Records: ${data.records}.`
    );
  };

  const handleAddData = () => {
    setNotice("Add Training Data feature coming soon.");
  };

  return (
    <div className="ai-training-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="ai-training-sidebar">

        <div className="ai-training-logo-area">

          <img
            src="/assets/valora-logo.svg"
            alt="VALORA Logo"
          />

          <p>
            Property Intelligence
          </p>

        </div>

        <nav className="ai-training-side-nav">

          <a href="/dashboard">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-5v6h-5A1.5 1.5 0 0 1 3 19.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            <span>Dashboard</span>
          </a>

          <a href="/resident-directory">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="9"
                cy="8"
                r="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M3.5 20c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M16 5.5a2.5 2.5 0 1 1 0 5M16 14c2.5.1 4 1.8 4.5 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <span>Resident Directory</span>
          </a>

          <a href="/resident-complaints">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 8h8M8 12h8M8 16h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <span>Resident Complaints</span>
          </a>

          <a href="/maintenance">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14.5 5.5a4 4 0 0 0-5.1 5.1L4 16a2.1 2.1 0 1 0 3 3l5.4-5.4a4 4 0 0 0 5.1-5.1l-2.4 2.4-2.1-2.1z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            <span>Maintenance</span>
          </a>

          <a href="/community-announcements">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 10v4h3l8 4V6l-8 4z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M7 14l1.5 5h2L9 14M19 9.5a3.5 3.5 0 0 1 0 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <span>Community Announcements</span>
          </a>

          <a
            href="/ai-training-data"
            className="active"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="6"
                y="6"
                width="12"
                height="12"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>

            <span>AI Training Data</span>
          </a>

          <a href="/community-analytics">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 19V9M12 19V5M19 19v-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <span>Community Analytics</span>
          </a>

          <a href="/profile">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="12"
                cy="8"
                r="3.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <span>My Profile</span>
          </a>

        </nav>

        <div className="ai-training-logout-area">

          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              handleLogout();
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M14 8l4 4-4 4M18 12H9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>Logout</span>
          </a>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="ai-training-main">

        {/* ===================================================
            RESULT MESSAGE
        =================================================== */}

        <InlineMessage tone="info">
          {notice}
        </InlineMessage>


        <div className="ai-training-top-bar">

          <div>

            <h2>
              AI Training Data
            </h2>

            <p>
              Manage property and community data used to improve
              VALORA's AI models.
            </p>

          </div>

          <div className="ai-training-profile-small">

            <div className="ai-training-profile-circle">
              HOA
            </div>

            <span>
              HOA Admin
            </span>

          </div>

        </div>


        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <section className="ai-training-stat-cards">

          <div className="ai-training-stat-card">

            <span className="ai-training-stat-icon">

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect
                  x="6"
                  y="6"
                  width="12"
                  height="12"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>

            </span>

            <div>

              <p>Total Datasets</p>

              <h3>{totalDatasets}</h3>

              <small>
                Available datasets
              </small>

            </div>

          </div>


          <div className="ai-training-stat-card">

            <span className="ai-training-stat-icon">

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m8.5 12 2.3 2.3 4.8-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

            </span>

            <div>

              <p>Active Datasets</p>

              <h3>{activeDatasets}</h3>

              <small>
                Currently used by AI
              </small>

            </div>

          </div>


          <div className="ai-training-stat-card">

            <span className="ai-training-stat-icon">

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 8v4l2.5 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

            </span>

            <div>

              <p>Pending Review</p>

              <h3>{pendingDatasets}</h3>

              <small>
                Require admin review
              </small>

            </div>

          </div>


          <div className="ai-training-stat-card">

            <span className="ai-training-stat-icon">

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 19V9M12 19V5M19 19v-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

            </span>

            <div>

              <p>Total Records</p>

              <h3>{totalRecords}</h3>

              <small>
                Training records
              </small>

            </div>

          </div>

        </section>


        {/* =====================================================
            TRAINING DATA MANAGEMENT
        ===================================================== */}

        <section className="ai-training-panel ai-training-large-panel">

          <div className="ai-training-panel-heading">

            <div>

              <h3>
                Training Data Management
              </h3>

              <p>
                Review datasets used for property intelligence
                and AI analysis.
              </p>

            </div>

            <button
              className="ai-training-primary-btn"
              onClick={handleAddData}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              Add Training Data
            </button>

          </div>


          {/* FILTER */}

          <div className="ai-training-filter-row">

            <div className="ai-training-filter-group">

              <label htmlFor="categoryFilter">
                Category
              </label>

              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
              >

                <option value="All">
                  All Categories
                </option>

                <option value="Property Valuation">
                  Property Valuation
                </option>

                <option value="Rental Yield">
                  Rental Yield
                </option>

                <option value="Community Trends">
                  Community Trends
                </option>

              </select>

            </div>

          </div>


          {/* TABLE */}

          <div className="ai-training-table-container">

            <table className="ai-training-data-table">

              <thead>

                <tr>

                  <th>Dataset</th>
                  <th>Category</th>
                  <th>Data Type</th>
                  <th>Records</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {filteredData.length > 0 ? (

                  filteredData.map((data) => (

                    <tr key={data.id}>

                      <td>

                        <strong>
                          {data.description}
                        </strong>

                        <small>
                          {data.id}
                        </small>

                      </td>

                      <td>

                        <span className="ai-training-category-badge">
                          {data.category}
                        </span>

                      </td>

                      <td>
                        {data.dataType}
                      </td>

                      <td>
                        {data.records}
                      </td>

                      <td>
                        {data.lastUpdated}
                      </td>

                      <td>

                        <span
                          className={`ai-training-status-badge ${
                            data.status === "Active"
                              ? "active"
                              : "pending"
                          }`}
                        >
                          {data.status}
                        </span>

                      </td>

                      <td>

                        <div className="ai-training-action-buttons">

                          <button
                            className="ai-training-secondary-btn"
                            onClick={() =>
                              handleView(data)
                            }
                          >
                            View
                          </button>

                          <button
                            className="ai-training-secondary-btn"
                            onClick={() =>
                              setNotice(
                                `Review ${data.id} feature coming soon.`
                              )
                            }
                          >
                            Review
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="ai-training-empty-state"
                    >
                      No training data found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =====================================================
            LOWER PANELS
        ===================================================== */}

        <section className="ai-training-dashboard-grid">

          <div className="ai-training-panel">

            <div className="ai-training-panel-heading">

              <div>

                <h3>
                  AI Data Management
                </h3>

                <p>
                  Manage datasets used by VALORA's AI features.
                </p>

              </div>

            </div>


            <div className="ai-training-quick-actions">

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handleAddData();
                }}
              >

                <span className="ai-training-action-icon">

                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 5v14M5 12h14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                </span>

                <span>
                  Add Training Data
                </span>

              </a>


              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setNotice(
                    "Dataset review feature coming soon."
                  );
                }}
              >

                <span className="ai-training-action-icon">

                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle
                      cx="10.5"
                      cy="10.5"
                      r="5.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="m15 15 4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                </span>

                <span>
                  Review Pending Data
                </span>

              </a>


              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setNotice(
                    "AI model update feature coming soon."
                  );
                }}
              >

                <span className="ai-training-action-icon">

                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M19 8a7 7 0 0 0-12-2L5 8M5 8V4M5 8h4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 16a7 7 0 0 0 12 2l2-2M19 16v4M19 16h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </span>

                <span>
                  Update AI Data
                </span>

              </a>

            </div>

          </div>


          <div className="ai-training-panel">

            <div className="ai-training-panel-heading">

              <div>

                <h3>
                  AI Data Overview
                </h3>

                <p>
                  Current training data status.
                </p>

              </div>

            </div>


            <div className="ai-training-property-summary">

              <div>

                <span>
                  Datasets
                </span>

                <strong>
                  {totalDatasets}
                </strong>

              </div>

              <div>

                <span>
                  Active
                </span>

                <strong>
                  {activeDatasets}
                </strong>

              </div>

              <div>

                <span>
                  Pending
                </span>

                <strong>
                  {pendingDatasets}
                </strong>

              </div>

              <div>

                <span>
                  Records
                </span>

                <strong>
                  {totalRecords}
                </strong>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AITrainingData;
