import React, { useEffect, useState } from "react";
import { getProperties } from "../../data/propertyStorage";
import { getPropertyRequests } from "../../data/propertyRequests";
import * as authService from "../../services/authService.js";
import { getSessionUser } from "../../services/session.js";
import InlineMessage from "../../components/InlineMessage";
import "./AgentListings.css";

function AgentListings() {

  const [properties, setProperties] = useState([]);
  const [propertyRequests, setPropertyRequests] = useState([]);

  /* Listing details opened from a card, and result messages.
     Both used to be browser alert dialogs. */

  const [selectedListing, setSelectedListing] = useState(null);

  const [notice, setNotice] = useState(null);

  /*
  =========================================================
  LOAD PROPERTY DATA
  =========================================================
  */

  useEffect(() => {

    const storedProperties =
      getProperties();

    const storedRequests =
      getPropertyRequests();

    setProperties(
      storedProperties
    );

    setPropertyRequests(
      storedRequests
    );

  }, []);

  /*
  =========================================================
  GET CURRENT ESTATE AGENT
  =========================================================
  */

  const currentUser =
    getSessionUser();

  /*
  =========================================================
  GET CURRENT AGENT NAME
  =========================================================
  */

  const getCurrentAgentName = () => {

    if (!currentUser) {
      return "";
    }

    if (currentUser.name) {
      return currentUser.name;
    }

    const firstName =
      currentUser.firstName || "";

    const lastName =
      currentUser.lastName || "";

    return (
      `${firstName} ${lastName}`
        .trim()
    );
  };

  const currentAgentName =
    getCurrentAgentName();

  /*
  =========================================================
  GET ASSIGNED PROPERTY REQUESTS
  =========================================================
  */

  const assignedRequests =
    propertyRequests.filter(
      (request) => {

        if (
          currentUser?.id &&
          request.assignedAgentId
        ) {

          return (
            request.assignedAgentId ===
            currentUser.id
          );

        }

        if (
          request.assignedAgentName &&
          currentAgentName
        ) {

          return (
            request.assignedAgentName ===
            currentAgentName
          );

        }

        return false;

      }
    );

  /*
  =========================================================
  COMBINE REQUEST + PROPERTY RECORD
  =========================================================
  */

  const assignedListings =
    assignedRequests.map(
      (request) => {

        const property =
          properties.find(
            (item) =>
              item.id ===
              request.propertyId
          );

        return {
          request,
          property: property || null,
        };

      }
    );

  /*
  =========================================================
  LISTING HELPERS
  =========================================================
  */

  const getListingStatus = ({
    property,
  }) => {

    return (
      property?.listing?.listingStatus ||
      "Not Listed"
    );

  };

  const getListingPrice = ({
    request,
    property,
  }) => {

    const listing =
      property?.listing || {};

    if (
      request.requestType ===
        "Sell" ||
      listing.listingType ===
        "For Sale"
    ) {

      if (
        listing.askingPrice
      ) {

        return `R${Number(
          listing.askingPrice
        ).toLocaleString()}`;

      }

      if (
        request.askingPrice
      ) {

        return `R${Number(
          request.askingPrice
        ).toLocaleString()}`;

      }

      return "Price not set";

    }

    if (
      request.requestType ===
        "Rent" ||
      listing.listingType ===
        "For Rent"
    ) {

      if (
        listing.rentalPrice
      ) {

        return `R${Number(
          listing.rentalPrice
        ).toLocaleString()} / month`;

      }

      return "Rental price not set";

    }

    return "Not listed";

  };

  const getListingType = ({
    request,
    property,
  }) => {

    const listing =
      property?.listing || {};

    if (
      request.requestType ===
      "Sell"
    ) {

      return "For Sale";

    }

    if (
      request.requestType ===
      "Rent"
    ) {

      return "For Rent";

    }

    return (
      listing.listingType ||
      "Not Listed"
    );

  };

  const getOwnerName = ({
    request,
    property,
  }) => {

    return (
      request.requesterName ||
      property?.listing?.ownerName ||
      "Owner not assigned"
    );

  };

  const getViews = ({
    property,
  }) => {

    return (
      property?.listing?.views ||
      0
    );

  };

  const getInquiries = ({
    property,
  }) => {

    return (
      property?.listing?.inquiries ||
      0
    );

  };

  const getRequestStatus = ({
    request,
  }) => {

    return (
      request.status ||
      "Assigned"
    );

  };

  /*
  =========================================================
  DEVELOPMENT METRICS
  =========================================================
  */

  const totalListings =
    assignedListings.length;

  const activeListings =
    assignedListings.filter(
      ({
        property,
      }) =>
        getListingStatus({
          property,
        }) === "Published"
    ).length;

  const underOffer =
    assignedListings.filter(
      ({
        property,
      }) =>
        getListingStatus({
          property,
        }) === "Under Offer"
    ).length;

  const totalInquiries =
    assignedListings.reduce(
      (
        total,
        listing
      ) =>
        total +
        getInquiries(
          listing
        ),
      0
    );

  /*
  =========================================================
  LOGOUT
  =========================================================
  */

  const handleLogout = () => {

    authService.logout();

    authService.logout();

    authService.logout();

    window.location.href = "/";

  };

  /*
  =========================================================
  VIEW LISTING
  =========================================================
  */

  const handleView = ({
    request,
    property,
  }) => {

    const listing =
      property?.listing || {};

    const propertyName =
      property?.unitNumber ||
      request.propertyAddress ||
      request.propertyId ||
      "Property";

    setNotice(null);

    setSelectedListing({

      propertyName,

      rows: [

        [
          "Owner",
          getOwnerName({
            request,
            property,
          }),
        ],

        [
          "Property Type",
          property?.propertyType ||
            request.propertyType ||
            "Not specified",
        ],

        [
          "Bedrooms",
          property?.bedrooms ||
            request.bedrooms ||
            "Not specified",
        ],

        [
          "Bathrooms",
          property?.bathrooms ||
            request.bathrooms ||
            "Not specified",
        ],

        [
          "Property Size",
          property?.size ||
            property?.area ||
            request.propertySize ||
            "Not specified",
        ],

        [
          "Listing Type",
          getListingType({
            request,
            property,
          }),
        ],

        [
          "Price",
          getListingPrice({
            request,
            property,
          }),
        ],

        [
          "Request Status",
          getRequestStatus({
            request,
          }),
        ],

        [
          "Listing Status",
          getListingStatus({
            property,
          }),
        ],

        [
          "HOA Approval",
          listing.hoaApprovalStatus ||
            "Not Submitted",
        ],

      ],

    });

  };

  /*
  =========================================================
  EDIT LISTING
  =========================================================
  */

  const handleEditListing = ({
    request,
    property,
  }) => {

    if (!property) {

      setNotice({
        text: "The property record linked to this request could not be found.",
        tone: "error",
      });

      return;

    }

    localStorage.setItem(
      "valoraAgentSelectedProperty",
      JSON.stringify({
        propertyId:
          property.id,
        requestId:
          request.id,
      })
    );

    window.location.href =
      `/agent-edit-listings?propertyId=${property.id}`;

  };

  /*
  =========================================================
  ADD LISTING
  =========================================================
  */

  const handleAddListing = () => {

    setNotice({
      text: "New listings are created through the HOA property request and agent assignment process.",
      tone: "info",
    });

  };

  /*
  =========================================================
  SVG ICONS
  =========================================================
  */

  const DashboardIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );

  const ListingsIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );

  const EditIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );

  const InquiryIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 5h16v11H8l-4 4Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M9 12h9" />
    </svg>
  );

  const UserIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6" />
    </svg>
  );

  const PropertiesIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M8 21v-5h8v5" />
      <path d="M8 10h2" />
      <path d="M14 10h2" />
      <path d="M8 13h2" />
      <path d="M14 13h2" />
    </svg>
  );

  const ActiveIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );

  const OffersIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 7h14v12H5z" />
      <path d="M8 7V5h8v2" />
      <path d="M8 12h8" />
    </svg>
  );

  const InquiriesIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 5h16v11H8l-4 4Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (

    <div className="agent-listings-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="agent-listings-sidebar">

        <div className="agent-listings-logo-area">

          <img
            src="/assets/valora-logo.svg"
            alt="VALORA Logo"
          />

        </div>

        <div className="agent-listings-role">

          <div className="agent-listings-role-icon">
            <UserIcon />
          </div>

          <div>

            <strong>
              Estate Agent
            </strong>

            <span>
              Agent Portal
            </span>

          </div>

        </div>

        <nav className="agent-listings-nav">

          <a href="/dashboard">

            <DashboardIcon />

            <span>
              Dashboard
            </span>

          </a>

          <a
            href="/agent-listings"
            className="active"
          >

            <ListingsIcon />

            <span>
              My Listings
            </span>

          </a>

          <a href="/agent-edit-listings">

            <EditIcon />

            <span>
              Edit Listings
            </span>

          </a>

          <a href="/agent-inquiries">

            <InquiryIcon />

            <span>
              Inquiry Log
            </span>

          </a>

          <a href="/valuation">

            <PropertiesIcon />

            <span>
              AI Valuation
            </span>

          </a>

          <a href="/profile">

            <UserIcon />

            <span>
              My Profile
            </span>

          </a>

        </nav>

        <div className="agent-listings-logout-area">

          <button
            onClick={handleLogout}
          >

            <LogoutIcon />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="agent-listings-main">

        {/* =================================================
            RESULT MESSAGE
        ================================================= */}

        <InlineMessage tone={notice?.tone}>
          {notice?.text}
        </InlineMessage>


        {/* =================================================
            LISTING DETAILS
        ================================================= */}

        {selectedListing && (

          <section
            className="agent-listings-detail"
            aria-label="Listing details"
          >

            <div className="agent-listings-detail-head">

              <div>

                <h2>
                  {selectedListing.propertyName}
                </h2>

                <p>
                  Listing details
                </p>

              </div>


              <button
                type="button"
                className="agent-listings-detail-close"
                onClick={() =>
                  setSelectedListing(null)
                }
                aria-label="Close listing details"
              >
                Close
              </button>

            </div>


            <dl className="agent-listings-detail-grid">

              {selectedListing.rows.map(
                ([label, value]) => (

                  <div key={label}>

                    <dt>
                      {label}
                    </dt>

                    <dd>
                      {value}
                    </dd>

                  </div>

                )
              )}

            </dl>

          </section>

        )}


        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="agent-listings-topbar">

          <div>

            <div className="agent-listings-breadcrumb">

              <span>
                Estate Agent
              </span>

              <span>
                /
              </span>

              <span>
                My Listings
              </span>

            </div>

            <h1>
              My Listings
            </h1>

            <p>
              Manage properties assigned to you by the HOA.
            </p>

          </div>

          <div className="agent-listings-profile">

            <div className="agent-listings-profile-circle">

              {currentUser?.firstName
                ? currentUser.firstName
                    .charAt(0)
                    .toUpperCase()
                : "E"}

            </div>

            <div>

              <strong>
                {currentAgentName ||
                  "Estate Agent"}
              </strong>

              <span>
                Estate Agent
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="agent-listings-stat-cards">

          <div className="agent-listings-stat-card">

            <div className="agent-listings-stat-icon">
              <PropertiesIcon />
            </div>

            <div>

              <span>
                Assigned Listings
              </span>

              <strong>
                {totalListings}
              </strong>

              <small>
                Properties assigned to you
              </small>

            </div>

          </div>

          <div className="agent-listings-stat-card">

            <div className="agent-listings-stat-icon">
              <ActiveIcon />
            </div>

            <div>

              <span>
                Active Listings
              </span>

              <strong>
                {activeListings}
              </strong>

              <small>
                Currently published
              </small>

            </div>

          </div>

          <div className="agent-listings-stat-card">

            <div className="agent-listings-stat-icon">
              <OffersIcon />
            </div>

            <div>

              <span>
                Under Offer
              </span>

              <strong>
                {underOffer}
              </strong>

              <small>
                Pending sales
              </small>

            </div>

          </div>

          <div className="agent-listings-stat-card">

            <div className="agent-listings-stat-icon">
              <InquiriesIcon />
            </div>

            <div>

              <span>
                Total Inquiries
              </span>

              <strong>
                {totalInquiries}
              </strong>

              <small>
                Buyer inquiries
              </small>

            </div>

          </div>

        </section>

        {/* =================================================
            PROPERTY LISTINGS
        ================================================= */}

        <section className="agent-listings-panel">

          <div className="agent-listings-panel-heading">

            <div>

              <h2>
                Assigned Properties
              </h2>

              <p>
                Properties approved by the HOA and assigned
                to you for listing management.
              </p>

            </div>

            <button
              className="agent-listings-primary-btn"
              onClick={handleAddListing}
            >
              Add Listing
            </button>

          </div>

          <div className="agent-listings-table-container">

            <table className="agent-listings-table">

              <thead>

                <tr>

                  <th>
                    Property
                  </th>

                  <th>
                    Owner
                  </th>

                  <th>
                    Request
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Request Status
                  </th>

                  <th>
                    Listing Status
                  </th>

                  <th>
                    Views
                  </th>

                  <th>
                    Inquiries
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {assignedListings.length === 0 ? (

                  <tr>

                    <td
                      colSpan="9"
                      className="agent-listings-empty"
                    >
                      No properties have been assigned
                      to you yet.
                    </td>

                  </tr>

                ) : (

                  assignedListings.map(
                    ({
                      request,
                      property,
                    }) => {

                      const listingStatus =
                        getListingStatus({
                          property,
                        });

                      const requestStatus =
                        getRequestStatus({
                          request,
                        });

                      return (

                        <tr
                          key={
                            request.id
                          }
                        >

                          {/* PROPERTY */}

                          <td>

                            <div className="agent-listings-primary-text">

                              {property?.unitNumber ||
                                request.propertyAddress ||
                                request.propertyId ||
                                "Property"}

                            </div>

                            <small>

                              {request.propertyId ||
                                property?.id}

                              {" • "}

                              {property?.propertyType ||
                                request.propertyType ||
                                "Property"}

                            </small>

                          </td>

                          {/* OWNER */}

                          <td>

                            <div className="agent-listings-primary-text">

                              {getOwnerName({
                                request,
                                property,
                              })}

                            </div>

                            <small>

                              {request.requesterEmail ||
                                "No email"}

                            </small>

                          </td>

                          {/* REQUEST */}

                          <td>

                            <div className="agent-listings-primary-text">

                              {getListingType({
                                request,
                                property,
                              })}

                            </div>

                            <small>

                              Request{" "}
                              {request.id}

                            </small>

                          </td>

                          {/* PRICE */}

                          <td>

                            <strong className="agent-listings-price">

                              {getListingPrice({
                                request,
                                property,
                              })}

                            </strong>

                          </td>

                          {/* REQUEST STATUS */}

                          <td>

                            <span
                              className={
                                requestStatus ===
                                "Assigned to Estate Agent"
                                  ? "agent-listings-status status-approved"
                                  : "agent-listings-status status-default"
                              }
                            >

                              {requestStatus}

                            </span>

                          </td>

                          {/* LISTING STATUS */}

                          <td>

                            <span
                              className={
                                listingStatus ===
                                "Published"
                                  ? "agent-listings-status status-published"
                                  : listingStatus ===
                                    "Pending HOA Approval"
                                  ? "agent-listings-status status-pending"
                                  : listingStatus ===
                                    "Changes Requested"
                                  ? "agent-listings-status status-rejected"
                                  : "agent-listings-status status-default"
                              }
                            >

                              {listingStatus}

                            </span>

                          </td>

                          {/* VIEWS */}

                          <td>
                            {getViews({
                              property,
                            })}
                          </td>

                          {/* INQUIRIES */}

                          <td>
                            {getInquiries({
                              property,
                            })}
                          </td>

                          {/* ACTION */}

                          <td>

                            <div className="agent-listings-actions">

                              <button
                                className="agent-listings-secondary-btn"
                                onClick={() =>
                                  handleView({
                                    request,
                                    property,
                                  })
                                }
                              >
                                View
                              </button>

                              <button
                                className="agent-listings-primary-small-btn"
                                onClick={() =>
                                  handleEditListing({
                                    request,
                                    property,
                                  })
                                }
                              >
                                Edit
                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =================================================
            LOWER DASHBOARD
        ================================================= */}

        <section className="agent-listings-grid">

          {/* =================================================
              LISTING ACTIONS
          ================================================= */}

          <div className="agent-listings-panel">

            <div className="agent-listings-panel-heading">

              <div>

                <h2>
                  Listing Actions
                </h2>

                <p>
                  Manage your assigned property listings.
                </p>

              </div>

            </div>

            <div className="agent-listings-quick-actions">

              <a
                href="#"
                onClick={(event) => {

                  event.preventDefault();

                  handleAddListing();

                }}
              >
                Add New Listing
              </a>

              <a href="/agent-edit-listings">
                Edit Listings
              </a>

              <a href="/agent-inquiries">
                View Inquiries
              </a>

            </div>

          </div>

          {/* =================================================
              LISTING OVERVIEW
          ================================================= */}

          <div className="agent-listings-panel">

            <div className="agent-listings-panel-heading">

              <div>

                <h2>
                  Listing Overview
                </h2>

                <p>
                  Current status of your assigned properties.
                </p>

              </div>

            </div>

            <div className="agent-listings-summary">

              <div>

                <span>
                  Assigned
                </span>

                <strong>
                  {totalListings}
                </strong>

              </div>

              <div>

                <span>
                  Published
                </span>

                <strong>
                  {activeListings}
                </strong>

              </div>

              <div>

                <span>
                  Under Offer
                </span>

                <strong>
                  {underOffer}
                </strong>

              </div>

              <div>

                <span>
                  Inquiries
                </span>

                <strong>
                  {totalInquiries}
                </strong>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>

  );

}

export default AgentListings;
