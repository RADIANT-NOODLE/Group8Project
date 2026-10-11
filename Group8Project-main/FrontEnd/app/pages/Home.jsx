import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../data/propertyStorage";
import "./Home.css";

function Home() {

  /*
  =========================================================
  SHARED PROPERTY STORAGE
  =========================================================

  Properties are loaded from the shared VALORA property
  storage instead of directly from properties.js.

  This allows the same property record to eventually be
  updated by Residents, Investors, Estate Agents and
  HOA Admin.

  =========================================================
  */

  const [properties, setProperties] = useState([]);

  useEffect(() => {

    const storedProperties =
      getProperties();

    setProperties(storedProperties);

  }, []);


  /*
  =========================================================
  PROFESSIONAL PROPERTY ICON
  =========================================================
  */

  const PropertyIcon = () => (

    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="feature-svg"
    >

      <path
        d="M3 10.5L12 3l9 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 9.5V21h14V9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M9 21v-6h6v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

    </svg>

  );


  /*
  =========================================================
  PROFESSIONAL INTELLIGENCE ICON
  =========================================================
  */

  const IntelligenceIcon = () => (

    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="feature-svg"
    >

      <path
        d="M4 19V5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M4 19h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M7 15l4-4 3 2 5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="7"
        cy="15"
        r="1"
        fill="currentColor"
      />

      <circle
        cx="11"
        cy="11"
        r="1"
        fill="currentColor"
      />

      <circle
        cx="14"
        cy="13"
        r="1"
        fill="currentColor"
      />

      <circle
        cx="19"
        cy="7"
        r="1"
        fill="currentColor"
      />

    </svg>

  );


  /*
  =========================================================
  PROFESSIONAL COMMUNITY ICON
  =========================================================
  */

  const CommunityIcon = () => (

    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="feature-svg"
    >

      <circle
        cx="9"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle
        cx="17"
        cy="9"
        r="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M3.5 20c.5-3.2 2.5-5 5.5-5s5 1.8 5.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M14.5 15.5c2.7.1 4.7 1.6 5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

    </svg>

  );


  /*
  =========================================================
  PUBLIC LISTING CHECK
  =========================================================

  A property is considered publicly listed only after
  the HOA has approved the Estate Agent's submission.

  This prevents pending or rejected listing information
  from appearing publicly.

  =========================================================
  */

  const isPublished = (property) => {

    return (
      property.listing?.listingStatus === "Published" &&
      property.listing?.hoaApprovalStatus === "Approved"
    );

  };


  /*
  =========================================================
  PROPERTY IMAGE
  =========================================================

  Only approved images from a published listing are
  displayed publicly.

  Pending images are never displayed here.

  If there are no approved images, show a professional
  placeholder instead.

  =========================================================
  */

  const renderPropertyImage = (property) => {

    const published =
      isPublished(property);

    const approvedImages =
      published &&
      Array.isArray(property.images)
        ? property.images.filter(Boolean)
        : [];

    if (approvedImages.length > 0) {

      const firstImage =
        approvedImages[0];

      const imageSource =
        typeof firstImage === "string"
          ? firstImage
          : firstImage?.data || "";

      if (imageSource) {

        return (

          <img
            src={imageSource}
            alt={property.title}
          />

        );

      }

    }


    return (

      <div className="property-image-placeholder">

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="property-placeholder-icon"
        >

          <path
            d="M3 10.5L12 3l9 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M5 9.5V21h14V9.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          <path
            d="M9 21v-6h6v6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

        </svg>

        <strong>
          Photos Coming Soon
        </strong>

        <span>
          Property images will be added once they are
          available and approved.
        </span>

      </div>

    );

  };


  /*
  =========================================================
  PROPERTY LISTING TYPE
  =========================================================

  Only published listings can display their listing type.

  =========================================================
  */

  const getListingType = (property) => {

    if (!isPublished(property)) {
      return "UNIT AVAILABLE";
    }

    const listingType =
      property.listing?.listingType;

    if (listingType) {
      return listingType.toUpperCase();
    }

    return "UNIT AVAILABLE";

  };


  /*
  =========================================================
  PROPERTY PRICE
  =========================================================

  Only published listings can display their price.

  =========================================================
  */

  const getPropertyPrice = (property) => {

    if (!isPublished(property)) {
      return "Not currently listed";
    }

    const listing =
      property.listing || {};


    if (
      listing.listingType === "For Sale"
    ) {

      if (listing.askingPrice) {

        return `R${Number(
          listing.askingPrice
        ).toLocaleString()}`;

      }

      return "Price TBC";

    }


    if (
      listing.listingType === "For Rent"
    ) {

      if (listing.rentalPrice) {

        return `R${Number(
          listing.rentalPrice
        ).toLocaleString()} / month`;

      }

      return "Rental Price TBC";

    }


    return "Not currently listed";

  };


  /*
  =========================================================
  PROPERTY BEDROOM LABEL
  =========================================================
  */

  const getBedroomLabel = (property) => {

    if (
      property.propertyType === "Bachelor Suite"
    ) {

      return "Bachelor Suite";

    }

    return `${property.bedrooms} ${
      property.bedrooms === 1
        ? "Bedroom"
        : "Bedrooms"
    }`;

  };


  /*
  =========================================================
  PROPERTY BATHROOM LABEL
  =========================================================
  */

  const getBathroomLabel = (property) => {

    return `${property.bathrooms} ${
      property.bathrooms === 1
        ? "Bathroom"
        : "Bathrooms"
    }`;

  };


  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (

    <div className="app">


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="navbar">

        <div className="logo">

          <img
            src="/assets/valora-logo.svg"
            alt="VALORA Logo"
          />

        </div>


        <div className="nav-links">

          <a
            href="#home"
            className="active"
          >
            HOME
          </a>

          <a href="#properties">
            PROPERTIES
          </a>

          <a href="#valuation">
            VALUATION
          </a>

          <a href="#community">
            COMMUNITY
          </a>

          <a href="#about">
            ABOUT
          </a>

        </div>


        <div className="nav-buttons">

          <Link
            to="/login"
            className="login-btn"
          >
            LOG IN
          </Link>

          <Link
            to="/register"
            className="register-btn"
          >
            REGISTER
          </Link>

        </div>

      </nav>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-content">

          <h1>

            PROPERTY INTELLIGENCE.
            <br />

            BETTER COMMUNITIES.
            <br />

            <span>
              SMARTER DECISIONS.
            </span>

          </h1>


          <p>
            VALORA combines property listings,
            AI-powered property insights and
            community management tools for
            South African gated communities
            and residential complexes.
          </p>


          <div className="hero-buttons">

            <a
              href="#properties"
              className="primary-btn"
            >
              EXPLORE PROPERTIES
            </a>


            <Link
              to="/login"
              className="secondary-btn"
            >
              GET AI VALUATION
            </Link>

          </div>


          <p className="login-text">

            Already a member?{" "}

            <Link to="/login">
              Log in →
            </Link>

          </p>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="features">


        <div className="feature-card">

          <div className="feature-icon">
            <PropertyIcon />
          </div>

          <div>

            <h3>
              PROPERTY
            </h3>

            <h4>
              Find Properties
            </h4>

            <p>
              Explore the eight units within
              the VALORA development and view
              the information available for
              each property.
            </p>

            <a href="#properties">
              Explore Properties →
            </a>

          </div>

        </div>


        <div className="feature-card">

          <div className="feature-icon">
            <IntelligenceIcon />
          </div>

          <div>

            <h3>
              INTELLIGENCE
            </h3>

            <h4>
              Understand Value
            </h4>

            <p>
              Use AI-powered valuation,
              growth scores, rental yield
              and 10-year ROI to make
              informed decisions.
            </p>

            <Link to="/login">
              Try AI Valuation →
            </Link>

          </div>

        </div>


        <div className="feature-card">

          <div className="feature-icon">
            <CommunityIcon />
          </div>

          <div>

            <h3>
              COMMUNITY
            </h3>

            <h4>
              Connect & Manage
            </h4>

            <p>
              Report issues, track complaints,
              find verified service providers
              and stay updated with HOA news.
            </p>

            <Link to="/login">
              Explore Community →
            </Link>

          </div>

        </div>


      </section>


      {/* =====================================================
          PROPERTY LISTINGS
      ===================================================== */}

      <section
        className="property-listings"
        id="properties"
      >

        <div className="listings-header">

          <div>

            <p className="section-label">
              THE VALORA DEVELOPMENT
            </p>

            <h2>
              Explore our eight units.
            </h2>

            <p>
              Explore the units within the VALORA
              development. Property information
              and approved listing details will be
              updated as the development progresses.
            </p>

          </div>


          <a
            href="#properties"
            className="view-all"
          >
            View All Units
          </a>

        </div>


        <div className="property-cards">

          {properties.map((property) => {

            const priceDisplay =
              getPropertyPrice(property);

            const listingType =
              getListingType(property);


            return (

              <div
                className="property-card"
                key={property.id}
              >


                {/* PROPERTY IMAGE */}

                {renderPropertyImage(property)}


                <div className="property-card-content">


                  {/* LISTING TYPE */}

                  <p className="property-type">
                    {listingType}
                  </p>


                  {/* PROPERTY TITLE */}

                  <h3>
                    {property.title}
                  </h3>


                  {/* LOCATION */}

                  <p className="property-location">
                    {property.location}
                  </p>


                  {/* PROPERTY DETAILS */}

                  <div className="property-details">

                    <span>
                      {property.propertyType}
                    </span>

                    <span>
                      {getBedroomLabel(property)}
                    </span>

                    <span>
                      {getBathroomLabel(property)}
                    </span>

                  </div>


                  {/* UNIT INFORMATION */}

                  <div className="property-unit">

                    <span>
                      {property.unitNumber}
                    </span>

                    <span>
                      {property.floor}
                    </span>

                  </div>


                  {/* PRICE + VIEW */}

                  <div className="property-bottom">

                    <strong>
                      {priceDisplay}
                    </strong>

                    <Link
                      to={`/property/${property.id}`}
                      className="property-view-button"
                    >
                      View Property
                    </Link>

                  </div>


                </div>

              </div>

            );

          })}

        </div>

      </section>


      {/* =====================================================
          PROPERTY INTELLIGENCE
      ===================================================== */}

      <section
        className="intelligence-section"
        id="valuation"
      >

        <div className="intelligence-content">

          <div className="intelligence-text">

            <p className="section-label">
              PROPERTY INTELLIGENCE
            </p>

            <h2>
              Know the value.
              <br />
              Understand the future.
            </h2>

            <p>
              VALORA combines property data
              with AI-powered insights to help
              buyers, investors and estate agents
              make smarter property decisions.
            </p>


            <div className="intelligence-features">

              <div>

                <h3>
                  AI Valuation
                </h3>

                <p>
                  Get an estimated property value
                  based on local property data.
                </p>

              </div>


              <div>

                <h3>
                  Growth Score
                </h3>

                <p>
                  Understand the potential growth
                  of the surrounding area.
                </p>

              </div>


              <div>

                <h3>
                  Rental Yield
                </h3>

                <p>
                  Estimate potential rental returns
                  from your property.
                </p>

              </div>


              <div>

                <h3>
                  10-Year ROI
                </h3>

                <p>
                  Explore projected long-term
                  investment returns.
                </p>

              </div>

            </div>


            <Link
              to="/login"
              className="primary-btn"
            >
              GET AI VALUATION
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          COMMUNITY
      ===================================================== */}

      <section
        className="community-section"
        id="community"
      >

        <div className="community-content">

          <div className="community-text">

            <p className="section-label">
              BETTER COMMUNITIES
            </p>

            <h2>
              Connect. Manage.
              <br />
              Live Better.
            </h2>

            <p>
              VALORA brings residents,
              homeowners associations and
              trusted service providers together
              in one connected community platform.
            </p>


            <div className="community-features">


              <div className="community-feature">

                <h3>
                  Report Issues
                </h3>

                <p>
                  Report community issues and
                  keep track of their progress.
                </p>

              </div>


              <div className="community-feature">

                <h3>
                  Find Trusted Services
                </h3>

                <p>
                  Discover verified service
                  providers available within
                  your community.
                </p>

              </div>


              <div className="community-feature">

                <h3>
                  Stay Connected
                </h3>

                <p>
                  Keep up with community
                  announcements, events and
                  HOA updates.
                </p>

              </div>


              <div className="community-feature">

                <h3>
                  Manage Your Community
                </h3>

                <p>
                  Give HOAs the tools they need
                  to manage residents and
                  community information
                  more effectively.
                </p>

              </div>


            </div>


            <Link
              to="/login"
              className="primary-btn"
            >
              EXPLORE COMMUNITY
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="how-it-works">

        <div className="how-content">

          <div className="how-header">

            <p className="section-label">
              HOW VALORA WORKS
            </p>

            <h2>
              From property searching
              <br />
              to smarter decisions.
            </h2>

            <p>
              VALORA brings property discovery,
              intelligent insights and community
              management together in one platform.
            </p>

          </div>


          <div className="steps">


            <div className="step">

              <div className="step-number">
                01
              </div>

              <h3>
                Explore
              </h3>

              <p>
                Find properties within your
                preferred community and explore
                available listings.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                02
              </div>

              <h3>
                Understand
              </h3>

              <p>
                Use AI-powered insights to
                understand property value,
                growth potential and rental returns.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                03
              </div>

              <h3>
                Connect
              </h3>

              <p>
                Stay connected with your
                community, report issues and
                access trusted local services.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                04
              </div>

              <h3>
                Decide
              </h3>

              <p>
                Use the information available
                through VALORA to make more
                informed property decisions.
              </p>

            </div>


          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section
        className="about-section"
        id="about"
      >

        <div className="about-content">

          <p className="section-label">
            ABOUT VALORA
          </p>

          <h2>
            Smarter property decisions.
            <br />
            Stronger communities.
          </h2>

          <p>
            VALORA is a property intelligence
            and community management platform
            designed to bring property information,
            intelligent analysis and community
            services together in one place.
          </p>

        </div>

      </section>


    </div>

  );

}

export default Home;
