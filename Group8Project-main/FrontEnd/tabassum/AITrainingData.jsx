import React, { useState } from "react";

function AITrainingData() {
  const [categoryFilter, setCategoryFilter] = useState("All");

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
    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUser");
    localStorage.removeItem("valoraUserEmail");

    window.location.href = "/";
  };

  const handleView = (data) => {
    alert(
      `${data.id}\n\n${data.description}\n\nRecords: ${data.records}`
    );
  };

  const handleAddData = () => {
    alert("Add Training Data feature coming soon.");
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

          <a href="/resident-directory">
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

          <a
            href="/ai-training-data"
            className="active"
          >
            🤖 AI Training Data
          </a>

          <a href="/community-analytics">
            📊 Community Analytics
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
              AI Training Data
            </h2>

            <p>
              Manage property and community data used to improve VALORA's AI models.
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

        <section className="stat-cards">

          <div className="stat-card">

            <span className="stat-icon">
              🤖
            </span>

            <div>

              <p>
                Total Datasets
              </p>

              <h3>
                {totalDatasets}
              </h3>

              <small>
                Available datasets
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              ✅
            </span>

            <div>

              <p>
                Active Datasets
              </p>

              <h3>
                {activeDatasets}
              </h3>

              <small>
                Currently used by AI
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              ⏳
            </span>

            <div>

              <p>
                Pending Review
              </p>

              <h3>
                {pendingDatasets}
              </h3>

              <small>
                Require admin review
              </small>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              📊
            </span>

            <div>

              <p>
                Total Records
              </p>

              <h3>
                {totalRecords}
              </h3>

              <small>
                Training records
              </small>

            </div>

          </div>

        </section>

        <section className="dashboard-panel large-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Training Data Management
              </h3>

              <p>
                Review datasets used for property intelligence and AI analysis.
              </p>

            </div>

            <button
              className="primary-btn"
              onClick={handleAddData}
            >
              + Add Training Data
            </button>

          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              style={{
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                minWidth: "200px",
              }}
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

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Dataset
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Data Type
                  </th>

                  <th>
                    Records
                  </th>

                  <th>
                    Last Updated
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

                {filteredData.length > 0 ? (

                  filteredData.map((data) => (

                    <tr key={data.id}>

                      <td>

                        <strong>
                          {data.description}
                        </strong>

                        <small
                          style={{
                            display: "block",
                            color: "#777",
                            marginTop: "4px",
                          }}
                        >
                          {data.id}
                        </small>

                      </td>

                      <td>

                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "15px",
                            background: "#eee7f3",
                            color: "#563F6B",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
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
                          style={{
                            padding: "5px 10px",
                            borderRadius: "15px",
                            background:
                              data.status === "Active"
                                ? "#e8f5e9"
                                : "#fff4d6",
                            color:
                              data.status === "Active"
                                ? "#2e7d32"
                                : "#8a6500",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {data.status}
                        </span>

                      </td>

                      <td>

                        <button
                          className="secondary-btn"
                          onClick={() =>
                            handleView(data)
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
                              `Review ${data.id} feature coming soon.`
                            )
                          }
                        >
                          Review
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
                      No training data found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

        <section className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  AI Data Management
                </h3>

                <p>
                  Manage datasets used by VALORA's AI features.
                </p>

              </div>

            </div>

            <div className="quick-actions">

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handleAddData();
                }}
              >
                ➕ Add Training Data
              </a>

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  alert(
                    "Dataset review feature coming soon."
                  );
                }}
              >
                🔍 Review Pending Data
              </a>

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  alert(
                    "AI model update feature coming soon."
                  );
                }}
              >
                🔄 Update AI Data
              </a>

            </div>

          </div>

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  AI Data Overview
                </h3>

                <p>
                  Current training data status.
                </p>

              </div>

            </div>

            <div className="property-summary">

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
