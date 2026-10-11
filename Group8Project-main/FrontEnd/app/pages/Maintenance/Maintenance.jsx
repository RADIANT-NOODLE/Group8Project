import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";

import { ROLES, toRole } from "../../services/roleMap.js";
import { useSession } from "../../services/session.js";
import InlineMessage from "../../components/InlineMessage";
import "./Maintenance.css";


/*
=========================================================
STORAGE
=========================================================
*/

const MAINTENANCE_STORAGE_KEY =
  "valoraMaintenanceRequests";




/*
=========================================================
GET USER ROLE
=========================================================
*/

function getUserRole(user) {

  if (!user) {
    return "";
  }

  return toRole(
    user.role ||
    user.userType ||
    user.accountType ||
    ""
  );

}


/*
=========================================================
GET USER NAME
=========================================================
*/

function getUserName(user) {

  if (!user) {
    return "";
  }

  if (user.fullName) {
    return user.fullName;
  }

  if (user.name) {
    return user.name;
  }

  const combinedName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return combinedName;

}


/*
=========================================================
INITIAL MAINTENANCE DATA
=========================================================
*/

const initialMaintenanceRequests = [

  {
    id: "MNT-001",
    issue: "Street Light Not Working",
    location: "Unit 12 / Main Road",
    reportedBy: "Ahmed Khan",
    provider: "Bright Electrical",
    priority: "High",
    status: "In Progress",
    date: "18 Aug 2026",
    category: "Electrical",
    description:
      "Street light near Unit 12 is not functioning.",
  },

  {
    id: "MNT-002",
    issue: "Water Leak",
    location: "Unit 24",
    reportedBy: "Fatima Ismail",
    provider: "AquaFix Plumbing",
    priority: "High",
    status: "Submitted",
    date: "17 Aug 2026",
    category: "Plumbing",
    description:
      "Water is leaking near the kitchen sink.",
  },

  {
    id: "MNT-003",
    issue: "Garden Maintenance",
    location: "Community Park",
    reportedBy: "HOA Admin",
    provider: "GreenScape Gardens",
    priority: "Medium",
    status: "Scheduled",
    date: "16 Aug 2026",
    category: "Landscaping",
    description:
      "Community park requires routine garden maintenance.",
  },

  {
    id: "MNT-004",
    issue: "Gate Remote Issue",
    location: "Main Entrance",
    reportedBy: "Yusuf Patel",
    provider: "SecureAccess",
    priority: "Medium",
    status: "Resolved",
    date: "15 Aug 2026",
    category: "Security",
    description:
      "Gate remote was not opening the main entrance.",
  },

  {
    id: "MNT-005",
    issue: "Broken Window",
    location: "Unit 08",
    reportedBy: "Ayesha Mohammed",
    provider: "GlassPro",
    priority: "Low",
    status: "Submitted",
    date: "14 Aug 2026",
    category: "General",
    description:
      "Bedroom window has been damaged.",
  },

];


/*
=========================================================
LOAD REQUESTS
=========================================================
*/

function loadMaintenanceRequests() {

  const storedRequests =
    localStorage.getItem(
      MAINTENANCE_STORAGE_KEY
    );


  if (!storedRequests) {

    localStorage.setItem(
      MAINTENANCE_STORAGE_KEY,
      JSON.stringify(
        initialMaintenanceRequests
      )
    );

    return initialMaintenanceRequests;

  }


  try {

    return JSON.parse(
      storedRequests
    );

  } catch (error) {

    console.error(
      "Unable to load maintenance requests:",
      error
    );

    return initialMaintenanceRequests;

  }

}


/*
=========================================================
SAVE REQUESTS
=========================================================
*/

function saveMaintenanceRequests(
  requests
) {

  localStorage.setItem(
    MAINTENANCE_STORAGE_KEY,
    JSON.stringify(requests)
  );

}


/*
=========================================================
GENERATE REQUEST ID
=========================================================
*/

function generateRequestId(
  requests
) {

  let highestNumber = 0;


  requests.forEach(
    (request) => {

      const number =
        parseInt(
          String(request.id).replace(
            "MNT-",
            ""
          ),
          10
        );


      if (
        !Number.isNaN(number) &&
        number > highestNumber
      ) {
        highestNumber = number;
      }

    }
  );


  return `MNT-${String(
    highestNumber + 1
  ).padStart(3, "0")}`;

}


/*
=========================================================
CURRENT DATE
=========================================================
*/

function getCurrentDate() {

  return new Date().toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}


/*
=========================================================
MAINTENANCE
=========================================================
*/

function Maintenance() {

  const { user: currentUser } =
    useSession();

  const userRole =
    getUserRole(currentUser);

  const currentUserName =
    getUserName(currentUser);


  const isHOAAdmin =
    userRole === ROLES.hoaAdmin;

  const isResident =
    userRole === ROLES.resident;


  /*
  =========================================================
  STATE
  =========================================================
  */

  const [
    maintenanceRequests,
    setMaintenanceRequests
  ] = useState(
    loadMaintenanceRequests
  );


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    priorityFilter,
    setPriorityFilter
  ] = useState("All");


  const [
    showAddRequest,
    setShowAddRequest
  ] = useState(false);


  const [
    selectedRequest,
    setSelectedRequest
  ] = useState(null);


  const [
    formData,
    setFormData
  ] = useState({
    issue: "",
    category: "General",
    location: "",
    description: "",
    priority: "Medium",
  });


  /* Result messages used to be browser alert dialogs. */

  const [notice, setNotice] =
    useState(null);


  function showNotice(
    text,
    tone = "success"
  ) {

    setNotice({ text, tone });

  }


  /*
  =========================================================
  SAVE REQUESTS
  =========================================================
  */

  useEffect(
    () => {

      saveMaintenanceRequests(
        maintenanceRequests
      );

    },
    [
      maintenanceRequests
    ]
  );


  /*
  =========================================================
  ROLE BASED REQUESTS
  =========================================================
  */

  const roleBasedRequests =
    isHOAAdmin
      ? maintenanceRequests
      : isResident
        ? maintenanceRequests.filter(
            (request) =>
              request.reportedBy
                .toLowerCase()
                .trim() ===
              currentUserName
                .toLowerCase()
                .trim()
          )
        : [];


  /*
  =========================================================
  FILTERED REQUESTS
  =========================================================
  */

  const filteredRequests =
    roleBasedRequests.filter(
      (request) => {

        const matchesStatus =
          statusFilter === "All" ||
          request.status === statusFilter;


        const matchesPriority =
          priorityFilter === "All" ||
          request.priority === priorityFilter;


        return (
          matchesStatus &&
          matchesPriority
        );

      }
    );


  /*
  =========================================================
  STATISTICS
  =========================================================
  */

  const totalRequests =
    roleBasedRequests.length;


  const activeRequests =
    roleBasedRequests.filter(
      (request) =>
        request.status !== "Resolved" &&
        request.status !== "Cancelled"
    ).length;


  const scheduledRequests =
    roleBasedRequests.filter(
      (request) =>
        request.status === "Scheduled"
    ).length;


  const resolvedRequests =
    roleBasedRequests.filter(
      (request) =>
        request.status === "Resolved"
    ).length;


  /*
  =========================================================
  FORM HANDLER
  =========================================================
  */

  const handleFormChange =
    (event) => {

      const {
        name,
        value
      } = event.target;


      setFormData(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

    };


  /*
  =========================================================
  OPEN ADD REQUEST
  =========================================================
  */

  const handleOpenAddRequest =
    () => {

      setFormData({
        issue: "",
        category: "General",
        location: "",
        description: "",
        priority: "Medium",
      });


      setShowAddRequest(
        true
      );

    };


  /*
  =========================================================
  CLOSE ADD REQUEST
  =========================================================
  */

  const handleCloseAddRequest =
    () => {

      setShowAddRequest(
        false
      );

    };


  /*
  =========================================================
  SUBMIT REQUEST
  =========================================================
  */

  const handleSubmitRequest =
    (event) => {

      event.preventDefault();


      if (!currentUser) {

        showNotice(
          "Please log in before submitting a maintenance request.",
          "error"
        );

        return;

      }


      if (
        !formData.issue.trim() ||
        !formData.location.trim() ||
        !formData.description.trim()
      ) {

        showNotice(
          "Please complete all required fields.",
          "error"
        );

        return;

      }


      const newRequest = {

        id:
          generateRequestId(
            maintenanceRequests
          ),

        issue:
          formData.issue.trim(),

        location:
          formData.location.trim(),

        reportedBy:
          currentUserName ||
          "Resident",

        provider:
          "Not Assigned",

        priority:
          formData.priority,

        status:
          "Submitted",

        date:
          getCurrentDate(),

        category:
          formData.category,

        description:
          formData.description.trim(),

      };


      setMaintenanceRequests(
        (previous) => [
          newRequest,
          ...previous,
        ]
      );


      setShowAddRequest(
        false
      );


      setFormData({
        issue: "",
        category: "General",
        location: "",
        description: "",
        priority: "Medium",
      });


      showNotice(
        `${newRequest.id} has been submitted successfully.`
      );

    };


  /*
  =========================================================
  VIEW REQUEST
  =========================================================
  */

  const handleViewRequest =
    (request) => {

      setSelectedRequest(
        request
      );

    };


  /*
  =========================================================
  CHANGE STATUS
  =========================================================
  */

  const handleStatusChange =
    (id, newStatus) => {

      if (!isHOAAdmin) {

        showNotice(
          "Only the HOA Admin can update maintenance request status.",
          "error"
        );

        return;

      }


      setMaintenanceRequests(
        (previousRequests) =>
          previousRequests.map(
            (request) =>
              request.id === id
                ? {
                    ...request,
                    status:
                      newStatus,
                  }
                : request
          )
      );


      setSelectedRequest(
        (previousRequest) => {

          if (
            !previousRequest ||
            previousRequest.id !== id
          ) {
            return previousRequest;
          }


          return {
            ...previousRequest,
            status:
              newStatus,
          };

        }
      );

    };


  /*
  =========================================================
  ICON
  =========================================================
  */

  const Icon = ({
    name,
    size = 19,
  }) => {

    const commonProps = {

      width: size,

      height: size,

      viewBox:
        "0 0 24 24",

      fill:
        "none",

      stroke:
        "currentColor",

      strokeWidth:
        "1.8",

      strokeLinecap:
        "round",

      strokeLinejoin:
        "round",

      "aria-hidden":
        "true",

    };


    switch (name) {

      case "wrench":

        return (
          <svg {...commonProps}>

            <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-6.4 6.4a2 2 0 0 0 2.8 2.8l6.4-6.4a4 4 0 0 0 5.6-5.6l-2.2 2.2-2.8-2.8z" />

          </svg>
        );


      case "clock":

        return (
          <svg {...commonProps}>

            <circle
              cx="12"
              cy="12"
              r="9"
            />

            <path d="M12 7v5l3 2" />

          </svg>
        );


      case "calendar":

        return (
          <svg {...commonProps}>

            <rect
              x="3"
              y="4"
              width="18"
              height="17"
              rx="2"
            />

            <path d="M16 2v4" />

            <path d="M8 2v4" />

            <path d="M3 9h18" />

          </svg>
        );


      case "check":

        return (
          <svg {...commonProps}>

            <path d="M20 6L9 17l-5-5" />

          </svg>
        );


      case "providers":

        return (
          <svg {...commonProps}>

            <path d="M3 21h18" />

            <path d="M5 21V9l7-5 7 5v12" />

            <path d="M9 21v-6h6v6" />

          </svg>
        );


      case "star":

        return (
          <svg {...commonProps}>

            <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />

          </svg>
        );


      case "plus":

        return (
          <svg {...commonProps}>

            <path d="M12 5v14" />

            <path d="M5 12h14" />

          </svg>
        );


      case "eye":

        return (
          <svg {...commonProps}>

            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />

            <circle
              cx="12"
              cy="12"
              r="2.5"
            />

          </svg>
        );


      case "close":

        return (
          <svg {...commonProps}>

            <path d="M6 6l12 12" />

            <path d="M18 6L6 18" />

          </svg>
        );


      case "send":

        return (
          <svg {...commonProps}>

            <path d="M22 2L11 13" />

            <path d="M22 2l-7 20-4-9-9-4z" />

          </svg>
        );


      default:

        return null;

    }

  };


  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (

    <div className="maintenance-page">


      <DashboardSidebar />


      <main className="maintenance-main">


        {/* =================================================
            HEADER
            ================================================= */}

        <header className="maintenance-header">

          <div>

            <p className="maintenance-eyebrow">

              {isHOAAdmin
                ? "HOA ADMINISTRATION"
                : "MY MAINTENANCE"}

            </p>


            <h1>
              Maintenance
            </h1>


            <p>

              {isHOAAdmin
                ? "Manage community maintenance requests and service providers."
                : "Submit and track your maintenance requests."}

            </p>

          </div>

        </header>


        {/* =================================================
            RESULT MESSAGE
        ================================================= */}

        <InlineMessage tone={notice?.tone}>
          {notice?.text}
        </InlineMessage>


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="maintenance-stat-grid">


          <div className="maintenance-stat-card">

            <div className="maintenance-stat-icon purple">

              <Icon name="wrench" />

            </div>


            <div>

              <span>
                Total Requests
              </span>

              <strong>
                {totalRequests}
              </strong>

              <small>

                {isHOAAdmin
                  ? "Community requests"
                  : "Your requests"}

              </small>

            </div>

          </div>


          <div className="maintenance-stat-card">

            <div className="maintenance-stat-icon orange">

              <Icon name="clock" />

            </div>


            <div>

              <span>
                Active Requests
              </span>

              <strong>
                {activeRequests}
              </strong>

              <small>
                Require attention
              </small>

            </div>

          </div>


          <div className="maintenance-stat-card">

            <div className="maintenance-stat-icon blue">

              <Icon name="calendar" />

            </div>


            <div>

              <span>
                Scheduled
              </span>

              <strong>
                {scheduledRequests}
              </strong>

              <small>
                Upcoming maintenance
              </small>

            </div>

          </div>


          <div className="maintenance-stat-card">

            <div className="maintenance-stat-icon green">

              <Icon name="check" />

            </div>


            <div>

              <span>
                Resolved
              </span>

              <strong>
                {resolvedRequests}
              </strong>

              <small>
                Completed requests
              </small>

            </div>

          </div>


        </section>


        {/* =================================================
            REQUEST PANEL
            ================================================= */}

        <section className="maintenance-panel maintenance-large-panel">


          <div className="maintenance-panel-heading">

            <div>

              <h2>
                Maintenance Requests
              </h2>

              <p>

                {isHOAAdmin
                  ? "Review and manage community maintenance issues."
                  : "View and track your submitted maintenance issues."}

              </p>

            </div>


            <button
              type="button"
              className="maintenance-primary-btn"
              onClick={
                handleOpenAddRequest
              }
            >

              <Icon
                name="plus"
                size={17}
              />

              <span>
                Add Request
              </span>

            </button>

          </div>


          {/* =================================================
              ADD REQUEST FORM
              ================================================= */}

          {showAddRequest && (

            <div className="maintenance-add-form">


              <div className="maintenance-form-header">

                <div>

                  <p className="maintenance-eyebrow">
                    NEW REQUEST
                  </p>

                  <h2>
                    Submit Maintenance Request
                  </h2>

                  <p>
                    Enter the details of the maintenance
                    issue you want to report.
                  </p>

                </div>


                <button
                  type="button"
                  className="maintenance-modal-close"
                  onClick={
                    handleCloseAddRequest
                  }
                  aria-label="Close form"
                >

                  <Icon
                    name="close"
                    size={18}
                  />

                </button>

              </div>


              <form
                className="maintenance-form"
                onSubmit={
                  handleSubmitRequest
                }
              >


                <div className="maintenance-form-group">

                  <label htmlFor="maintenance-issue">
                    Issue *
                  </label>

                  <input
                    id="maintenance-issue"
                    name="issue"
                    type="text"
                    value={
                      formData.issue
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. Water leak"
                    required
                  />

                </div>


                <div className="maintenance-form-row">


                  <div className="maintenance-form-group">

                    <label htmlFor="maintenance-category">
                      Category *
                    </label>

                    <select
                      id="maintenance-category"
                      name="category"
                      value={
                        formData.category
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="General">
                        General
                      </option>

                      <option value="Plumbing">
                        Plumbing
                      </option>

                      <option value="Electrical">
                        Electrical
                      </option>

                      <option value="Security">
                        Security
                      </option>

                      <option value="Landscaping">
                        Landscaping
                      </option>

                      <option value="Cleaning">
                        Cleaning
                      </option>

                      <option value="Structural">
                        Structural
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>


                  <div className="maintenance-form-group">

                    <label htmlFor="maintenance-priority">
                      Priority *
                    </label>

                    <select
                      id="maintenance-priority"
                      name="priority"
                      value={
                        formData.priority
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>

                    </select>

                  </div>


                </div>


                <div className="maintenance-form-group">

                  <label htmlFor="maintenance-location">
                    Location / Unit *
                  </label>

                  <input
                    id="maintenance-location"
                    name="location"
                    type="text"
                    value={
                      formData.location
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. Unit 15 / Bathroom"
                    required
                  />

                </div>


                <div className="maintenance-form-group">

                  <label htmlFor="maintenance-description">
                    Description *
                  </label>

                  <textarea
                    id="maintenance-description"
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Describe the issue..."
                    rows="5"
                    required
                  />

                </div>


                <div className="maintenance-form-actions">

                  <button
                    type="button"
                    className="maintenance-secondary-btn"
                    onClick={
                      handleCloseAddRequest
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="maintenance-primary-btn"
                  >

                    <Icon
                      name="send"
                      size={16}
                    />

                    Submit Request

                  </button>

                </div>


              </form>

            </div>

          )}


          {/* =================================================
              FILTERS
              ================================================= */}

          {!showAddRequest && (

            <div className="maintenance-filters">


              <div className="maintenance-filter-group">

                <label htmlFor="maintenance-status-filter">
                  Status
                </label>

                <select
                  id="maintenance-status-filter"
                  value={
                    statusFilter
                  }
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="All">
                    All Statuses
                  </option>

                  <option value="Submitted">
                    Submitted
                  </option>

                  <option value="Acknowledged">
                    Acknowledged
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>


              <div className="maintenance-filter-group">

                <label htmlFor="maintenance-priority-filter">
                  Priority
                </label>

                <select
                  id="maintenance-priority-filter"
                  value={
                    priorityFilter
                  }
                  onChange={(event) =>
                    setPriorityFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="All">
                    All Priorities
                  </option>

                  <option value="High">
                    High Priority
                  </option>

                  <option value="Medium">
                    Medium Priority
                  </option>

                  <option value="Low">
                    Low Priority
                  </option>

                </select>

              </div>


            </div>

          )}


          {/* =================================================
              TABLE
              ================================================= */}

          {!showAddRequest && (

            <div className="maintenance-table-wrapper">

              <table className="maintenance-table">

                <thead>

                  <tr>

                    <th>
                      Request
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Reported By
                    </th>

                    <th>
                      Service Provider
                    </th>

                    <th>
                      Priority
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredRequests.length > 0 ? (

                    filteredRequests.map(
                      (request) => (

                        <tr
                          key={request.id}
                        >


                          <td>

                            <div className="maintenance-request-cell">

                              <strong>
                                {request.issue}
                              </strong>

                              <small>
                                {request.id}
                              </small>

                            </div>

                          </td>


                          <td>
                            {request.location}
                          </td>


                          <td>
                            {request.reportedBy}
                          </td>


                          <td>
                            {request.provider}
                          </td>


                          <td>

                            <span
                              className={`maintenance-badge priority-${request.priority
                                .toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )}`}
                            >

                              {request.priority}

                            </span>

                          </td>


                          <td>

                            <span
                              className={`maintenance-badge status-${request.status
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >

                              {request.status}

                            </span>

                          </td>


                          <td>
                            {request.date}
                          </td>


                          <td>

                            <div className="maintenance-actions">


                              <button
                                type="button"
                                className="maintenance-view-btn"
                                onClick={() =>
                                  handleViewRequest(
                                    request
                                  )
                                }
                              >

                                <Icon
                                  name="eye"
                                  size={15}
                                />

                                View

                              </button>


                              {isHOAAdmin && (

                                <select
                                  className="maintenance-status-select"
                                  value={
                                    request.status
                                  }
                                  onChange={(event) =>
                                    handleStatusChange(
                                      request.id,
                                      event.target.value
                                    )
                                  }
                                >

                                  <option value="Submitted">
                                    Submitted
                                  </option>

                                  <option value="Acknowledged">
                                    Acknowledged
                                  </option>

                                  <option value="In Progress">
                                    In Progress
                                  </option>

                                  <option value="Scheduled">
                                    Scheduled
                                  </option>

                                  <option value="Resolved">
                                    Resolved
                                  </option>

                                  <option value="Cancelled">
                                    Cancelled
                                  </option>

                                </select>

                              )}


                            </div>

                          </td>


                        </tr>

                      )

                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="8"
                        className="maintenance-empty"
                      >

                        {isResident
                          ? "You have no maintenance requests yet."
                          : "No maintenance requests found."}

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          )}


        </section>


        {/* =================================================
            LOWER PANELS
            ================================================= */}

        <section className="maintenance-content-grid">


          <div className="maintenance-panel">

            <div className="maintenance-panel-heading">

              <div>

                <h2>
                  Service Providers
                </h2>

                <p>
                  {isHOAAdmin
                    ? "Manage trusted community providers."
                    : "View trusted community service providers."}
                </p>

              </div>


              <Link
                to="/providers"
                className="maintenance-panel-link"
              >

                {isHOAAdmin
                  ? "Manage"
                  : "View"}

              </Link>

            </div>


            <div className="maintenance-quick-actions">


              <Link to="/providers">

                <Icon name="providers" />

                <span>
                  View Providers
                </span>

              </Link>


              {isHOAAdmin && (

                <Link to="/providers">

                  <Icon name="check" />

                  <span>
                    Verify Providers
                  </span>

                </Link>

              )}


              <Link to="/providers">

                <Icon name="star" />

                <span>
                  View Ratings
                </span>

              </Link>


            </div>

          </div>


          <div className="maintenance-panel">

            <div className="maintenance-panel-heading">

              <div>

                <h2>
                  Maintenance Overview
                </h2>

                <p>
                  {isHOAAdmin
                    ? "Current community maintenance activity."
                    : "Your current maintenance activity."}
                </p>

              </div>

            </div>


            <div className="maintenance-overview">


              <div>

                <span>
                  High Priority
                </span>

                <strong>

                  {
                    roleBasedRequests.filter(
                      (request) =>
                        request.priority ===
                        "High"
                    ).length
                  }

                </strong>

              </div>


              <div>

                <span>
                  Scheduled
                </span>

                <strong>
                  {scheduledRequests}
                </strong>

              </div>


              <div>

                <span>
                  In Progress
                </span>

                <strong>

                  {
                    roleBasedRequests.filter(
                      (request) =>
                        request.status ===
                        "In Progress"
                    ).length
                  }

                </strong>

              </div>


              <div>

                <span>
                  Resolved
                </span>

                <strong>
                  {resolvedRequests}
                </strong>

              </div>


            </div>

          </div>


        </section>


      </main>


      {/* =================================================
          VIEW REQUEST
          ================================================= */}

      {selectedRequest && (

        <div className="maintenance-modal-overlay">

          <div className="maintenance-modal">


            <div className="maintenance-form-header">

              <div>

                <p className="maintenance-eyebrow">
                  {selectedRequest.id}
                </p>

                <h2>
                  {selectedRequest.issue}
                </h2>

                <p>
                  Maintenance request details
                </p>

              </div>


              <button
                type="button"
                className="maintenance-modal-close"
                onClick={() =>
                  setSelectedRequest(null)
                }
                aria-label="Close"
              >

                <Icon
                  name="close"
                  size={18}
                />

              </button>

            </div>


            <div className="maintenance-request-details">


              <div>

                <span>
                  Category
                </span>

                <strong>
                  {selectedRequest.category}
                </strong>

              </div>


              <div>

                <span>
                  Priority
                </span>

                <strong>
                  {selectedRequest.priority}
                </strong>

              </div>


              <div>

                <span>
                  Location
                </span>

                <strong>
                  {selectedRequest.location}
                </strong>

              </div>


              <div>

                <span>
                  Reported By
                </span>

                <strong>
                  {selectedRequest.reportedBy}
                </strong>

              </div>


              <div>

                <span>
                  Service Provider
                </span>

                <strong>
                  {selectedRequest.provider}
                </strong>

              </div>


              <div>

                <span>
                  Date
                </span>

                <strong>
                  {selectedRequest.date}
                </strong>

              </div>


              <div className="maintenance-request-detail-full">

                <span>
                  Status
                </span>

                <strong>
                  {selectedRequest.status}
                </strong>

              </div>


              <div className="maintenance-request-detail-full">

                <span>
                  Description
                </span>

                <p>
                  {selectedRequest.description}
                </p>

              </div>


            </div>


            {isHOAAdmin && (

              <div className="maintenance-admin-status">

                <label htmlFor="maintenance-view-status">
                  Update Status
                </label>

                <select
                  id="maintenance-view-status"
                  value={
                    selectedRequest.status
                  }
                  onChange={(event) =>
                    handleStatusChange(
                      selectedRequest.id,
                      event.target.value
                    )
                  }
                >

                  <option value="Submitted">
                    Submitted
                  </option>

                  <option value="Acknowledged">
                    Acknowledged
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            )}


            <div className="maintenance-form-actions">

              <button
                type="button"
                className="maintenance-secondary-btn"
                onClick={() =>
                  setSelectedRequest(null)
                }
              >
                Close
              </button>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}


export default Maintenance;
