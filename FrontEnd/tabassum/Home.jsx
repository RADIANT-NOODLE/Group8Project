import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="app">

      {/* ================================
          NAVIGATION BAR
      ================================= */}

      <nav className="navbar">

        <div className="logo">
          <img
            src="/ValoraLogo.jpeg"
            alt="VALORA Logo"
          />
        </div>

        <div className="nav-links">

          <a href="#home" className="active">
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


      {/* ================================
          HOME / HERO SECTION
      ================================= */}

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
            <span>SMARTER DECISIONS.</span>
          </h1>

          <p>
            VALORA combines property listings, AI-powered
            property insights and community management
            tools for South African gated communities
            and residential complexes.
          </p>

          <div className="hero-buttons">

            {/* Login required */}
            <Link
              to="/login"
              className="primary-btn"
            >
              EXPLORE PROPERTIES
            </Link>

            {/* Login required */}
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


      {/* ================================
          MAIN FEATURES
      ================================= */}

      <section className="features">

        {/* PROPERTY */}

        <div className="feature-card">

          <div className="feature-icon">
            🏠
          </div>

          <div>

            <h3>
              PROPERTY
            </h3>

            <h4>
              Find Properties
            </h4>

            <p>
              Search properties within the community
              and explore available listings.
            </p>

            {/* Login required */}
            <Link to="/login">
              Explore Properties →
            </Link>

          </div>

        </div>


        {/* INTELLIGENCE */}

        <div className="feature-card">

          <div className="feature-icon">
            📊
          </div>

          <div>

            <h3>
              INTELLIGENCE
            </h3>

            <h4>
              Understand Value
            </h4>

            <p>
              Use AI-powered valuation, growth scores,
              rental yield and 10-year ROI to make
              informed decisions.
            </p>

            {/* Login required */}
            <Link to="/login">
              Try AI Valuation →
            </Link>

          </div>

        </div>


        {/* COMMUNITY */}

        <div className="feature-card">

          <div className="feature-icon">
            👥
          </div>

          <div>

            <h3>
              COMMUNITY
            </h3>

            <h4>
              Connect & Manage
            </h4>

            <p>
              Report issues, track complaints, find
              verified service providers and stay
              updated with HOA news.
            </p>

            {/* Login required */}
            <Link to="/login">
              Explore Community →
            </Link>

          </div>

        </div>

      </section>


      {/* ================================
          PROPERTY LISTINGS
      ================================= */}

      <section
        className="property-listings"
        id="properties"
      >

        <div className="listings-header">

          <div>

            <p className="section-label">
              EXPLORE PROPERTIES
            </p>

            <h2>
              Find a place that fits your future.
            </h2>

            <p>
              Explore properties within the community
              and discover the information you need to
              make a smarter decision.
            </p>

          </div>

          {/* Login required */}
          <Link
            to="/login"
            className="view-all"
          >
            View All Properties
          </Link>

        </div>


        <div className="property-cards">

          {/* PROPERTY 1 */}

          <div className="property-card">

            <img
              src="/property_building.png"
              alt="Property in VALORA community"
            />

            <div className="property-card-content">

              <p className="property-type">
                FOR SALE
              </p>

              <h3>
                Modern Family Home
              </h3>

              <p className="property-location">
                VALORA Community
              </p>

              <div className="property-details">

                <span>
                  3 Beds
                </span>

                <span>
                  2 Baths
                </span>

                <span>
                  120 m²
                </span>

              </div>

              <div className="property-bottom">

                <strong>
                  R1,850,000
                </strong>

                {/* Login required */}
                <Link
                  to="/login"
                  className="property-view-button"
                >
                  View Property
                </Link>

              </div>

            </div>

          </div>


          {/* PROPERTY 2 */}

          <div className="property-card">

            <img
              src="/property_building.png"
              alt="Property in VALORA community"
            />

            <div className="property-card-content">

              <p className="property-type">
                FOR SALE
              </p>

              <h3>
                Contemporary Townhouse
              </h3>

              <p className="property-location">
                VALORA Community
              </p>

              <div className="property-details">

                <span>
                  2 Beds
                </span>

                <span>
                  2 Baths
                </span>

                <span>
                  95 m²
                </span>

              </div>

              <div className="property-bottom">

                <strong>
                  R1,450,000
                </strong>

                {/* Login required */}
                <Link
                  to="/login"
                  className="property-view-button"
                >
                  View Property
                </Link>

              </div>

            </div>

          </div>


          {/* PROPERTY 3 */}

          <div className="property-card">

            <img
              src="/property_building.png"
              alt="Property in VALORA community"
            />

            <div className="property-card-content">

              <p className="property-type">
                FOR SALE
              </p>

              <h3>
                Spacious Garden Home
              </h3>

              <p className="property-location">
                VALORA Community
              </p>

              <div className="property-details">

                <span>
                  4 Beds
                </span>

                <span>
                  3 Baths
                </span>

                <span>
                  165 m²
                </span>

              </div>

              <div className="property-bottom">

                <strong>
                  R2,250,000
                </strong>

                {/* Login required */}
                <Link
                  to="/login"
                  className="property-view-button"
                >
                  View Property
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================================
          PROPERTY INTELLIGENCE / VALUATION
      ================================= */}

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
              VALORA combines property data with
              AI-powered insights to help buyers,
              investors and estate agents make smarter
              property decisions.
            </p>

            <div className="intelligence-features">

              <div>

                <h3>
                  AI Valuation
                </h3>

                <p>
                  Get an estimated property value based
                  on local property data.
                </p>

              </div>

              <div>

                <h3>
                  Growth Score
                </h3>

                <p>
                  Understand the potential growth of
                  the surrounding area.
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

            {/* Login required */}
            <Link
              to="/login"
              className="primary-btn"
            >
              GET AI VALUATION
            </Link>

          </div>

        </div>

      </section>


      {/* ================================
          COMMUNITY
      ================================= */}

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
              VALORA brings residents, homeowners
              associations and trusted service providers
              together in one connected community
              platform.
            </p>

            <div className="community-features">

              <div className="community-feature">

                <h3>
                  Report Issues
                </h3>

                <p>
                  Report community issues and keep
                  track of their progress.
                </p>

              </div>

              <div className="community-feature">

                <h3>
                  Find Trusted Services
                </h3>

                <p>
                  Discover verified service providers
                  available within your community.
                </p>

              </div>

              <div className="community-feature">

                <h3>
                  Stay Connected
                </h3>

                <p>
                  Keep up with community announcements,
                  events and HOA updates.
                </p>

              </div>

              <div className="community-feature">

                <h3>
                  Manage Your Community
                </h3>

                <p>
                  Give HOAs the tools they need to manage
                  residents and community information
                  more effectively.
                </p>

              </div>

            </div>

            {/* Login required */}
            <Link
              to="/login"
              className="primary-btn"
            >
              EXPLORE COMMUNITY
            </Link>

          </div>

        </div>

      </section>


      {/* ================================
          HOW VALORA WORKS
      ================================= */}

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
                Find properties within your preferred
                community and explore available listings.
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
                Use AI-powered insights to understand
                property value, growth potential and
                rental returns.
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
                Stay connected with your community,
                report issues and access trusted local
                services.
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
                Use the information available through
                VALORA to make more informed property
                decisions.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================================
          ABOUT
      ================================= */}

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
            VALORA is a property intelligence and
            community management platform designed
            to bring property information, intelligent
            analysis and community services together
            in one place.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Home;
