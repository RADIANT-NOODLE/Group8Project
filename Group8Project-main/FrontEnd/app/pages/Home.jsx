import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    ListedPropertyCard,
    ListedPropertySkeletons,
    PublicFooter,
    PublicHeader,
} from "../components/PublicSite";
import { loadListedProperties } from "../services/publicListings";
// Home.css also styles the public Properties page (navbar, property cards), so it stays imported.
import "./Home.css";
import "./Landing.css";

/*
=========================================================
VALORA LANDING PAGE

Public home page. The hero preview and the property grid
are built from live data: only units with an active public
listing are shown.
=========================================================
*/

const ICON_PATHS = {
    home: (
        <>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
        </>
    ),
    people: (
        <>
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M3.5 20c.5-3.2 2.5-5 5.5-5s5 1.8 5.5 5" />
            <path d="M14.5 15.5c2.7.1 4.7 1.6 5 4.5" />
        </>
    ),
    key: (
        <>
            <circle cx="8" cy="15" r="4" />
            <path d="m11 12 9-9M17 6l3 3M15 8l2 2" />
        </>
    ),
    briefcase: (
        <>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
        </>
    ),
    shield: (
        <>
            <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: (
        <>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </>
    ),
    pin: (
        <>
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </>
    ),
    bed: (
        <>
            <path d="M4 18v-6h16v6" />
            <path d="M4 12V8h16v4" />
            <path d="M3 18h18" />
        </>
    ),
    bath: (
        <>
            <path d="M4 12h16" />
            <path d="M6 12V6a2 2 0 0 1 4 0v2" />
            <path d="M4 12v2a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-2" />
        </>
    ),
};

function Icon({ name, size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICON_PATHS[name]}
        </svg>
    );
}

const FEATURES = [
    {
        icon: "home",
        title: "Property listings",
        text: "Browse units for sale or rent, with photos, prices and details kept up to date by estate agents.",
    },
    {
        icon: "key",
        title: "Sale and rental requests",
        text: "Ask to sell or rent your unit, follow each step of your request, and work with an agent assigned by your HOA.",
    },
    {
        icon: "people",
        title: "Community tools",
        text: "Announcements, complaints, maintenance and trusted service providers, all in one place.",
    },
];

const ROLES = [
    {
        icon: "key",
        title: "Residents",
        points: ["Stay up to date with announcements", "Request to sell or rent, and track progress", "Log complaints and maintenance"],
    },
    {
        icon: "briefcase",
        title: "Estate agents",
        points: ["Manage the listings assigned to you", "Publish straight to buyers and renters", "Reply to enquiries in one inbox"],
    },
    {
        icon: "shield",
        title: "HOA administrators",
        points: ["Approve residents and requests", "Keep the community informed", "Track complaints to resolution"],
    },
];

const STEPS = [
    { title: "Create your account", text: "Register as a resident. Your HOA approves your access." },
    { title: "Get linked to your unit", text: "The HOA connects your account to your property." },
    { title: "Use your dashboard", text: "Everything for your role, in one place." },
    { title: "Stay connected", text: "Announcements, requests and updates as they happen." },
];

function Home() {
    const [properties, setProperties] = useState([]);
    const [propertiesLoading, setPropertiesLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        loadListedProperties()
            .then((listed) => {
                if (!cancelled) setProperties(listed);
            })
            .catch((err) => console.error("Failed to fetch properties for home page:", err))
            .finally(() => {
                if (!cancelled) setPropertiesLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="lp">
            <PublicHeader current="home" />

            <main>
                {/* HERO */}
                <section
                    className="lp-hero"
                    id="home"
                    // set here, not in CSS: the bundler cannot resolve /assets paths inside stylesheets
                    style={{ "--lp-hero-image": 'url("/assets/landing-hero.jpg")' }}
                >
                    <div className="lp-hero-copy">
                        <span className="lp-pill">Property &amp; community platform</span>
                        <h1>
                            Smarter property decisions.
                            <span> Stronger communities.</span>
                        </h1>
                        <p>
                            VALORA brings property listings, sale and rental requests and
                            community management together for residents, estate agents
                            and HOA administrators.
                        </p>

                        <div className="lp-hero-actions">
                            <a href="#properties" className="lp-button lp-button-solid lp-button-large">
                                Browse properties <Icon name="arrow" size={18} />
                            </a>
                            <Link to="/register" className="lp-button lp-button-ghost lp-button-large">
                                Create an account
                            </Link>
                        </div>

                        <ul className="lp-hero-facts">
                            <li>
                                <strong>{propertiesLoading ? "…" : properties.length}</strong>
                                <span>{properties.length === 1 ? "unit listed now" : "units listed now"}</span>
                            </li>
                            <li>
                                <strong>3</strong>
                                <span>roles, one platform</span>
                            </li>
                            <li>
                                <strong>24/7</strong>
                                <span>access to your estate</span>
                            </li>
                        </ul>
                    </div>

                    {/* see-through welcome card over the estate photo */}
                    <div className="lp-hero-visual" aria-hidden="true">
                        <div className="lp-hero-glow" />
                        <div className="lp-preview-card lp-preview-welcome">
                            <img src="/assets/valora-logo-white.png" alt="" />
                            <h3>Welcome to VALORA</h3>
                            <p>Property, community and estate management in one place.</p>
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section className="lp-section" id="features">
                    <div className="lp-section-head">
                        <span className="lp-eyebrow">What VALORA does</span>
                        <h2>Everything your estate needs, in one place</h2>
                    </div>

                    <div className="lp-feature-grid">
                        {FEATURES.map((feature) => (
                            <article key={feature.title} className="lp-feature">
                                <span className="lp-feature-icon"><Icon name={feature.icon} size={24} /></span>
                                <h3>{feature.title}</h3>
                                <p>{feature.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* LISTED PROPERTIES */}
                <section className="lp-section lp-section-tinted" id="properties">
                    <div className="lp-section-head lp-section-head-row">
                        <div>
                            <span className="lp-eyebrow">On the market</span>
                            <h2>Listed properties</h2>
                            <p>Units currently listed for sale or rent in VALORA estates.</p>
                        </div>
                        <Link to="/properties" className="lp-link">
                            View all properties <Icon name="arrow" size={16} />
                        </Link>
                    </div>

                    {propertiesLoading ? (
                        <div className="lp-property-grid">
                            <ListedPropertySkeletons count={3} />
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="lp-empty">
                            <span className="lp-empty-icon"><Icon name="home" size={26} /></span>
                            <h3>No properties are listed right now</h3>
                            <p>Check back soon. New listings appear as soon as an estate agent publishes them.</p>
                        </div>
                    ) : (
                        <div className="lp-property-grid">
                            {properties.slice(0, 6).map((property) => (
                                <ListedPropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ROLES */}
                <section className="lp-section" id="about">
                    <div className="lp-section-head">
                        <span className="lp-eyebrow">Built for everyone in the estate</span>
                        <h2>One platform, the right tools for each role</h2>
                        <p>
                            VALORA connects the people who live in, sell and run an
                            estate, so information moves without the back-and-forth.
                        </p>
                    </div>

                    <div className="lp-role-grid">
                        {ROLES.map((role) => (
                            <article key={role.title} className="lp-role">
                                <span className="lp-role-icon"><Icon name={role.icon} size={22} /></span>
                                <h3>{role.title}</h3>
                                <ul>
                                    {role.points.map((point) => (
                                        <li key={point}><Icon name="check" size={16} /> {point}</li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="lp-section lp-section-tinted" id="how-it-works">
                    <div className="lp-section-head">
                        <span className="lp-eyebrow">How it works</span>
                        <h2>Up and running in four steps</h2>
                    </div>

                    <ol className="lp-steps">
                        {STEPS.map((step, index) => (
                            <li key={step.title}>
                                <span className="lp-step-number">{String(index + 1).padStart(2, "0")}</span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* CALL TO ACTION */}
                <section className="lp-cta">
                    <div>
                        <h2>Ready to join your community?</h2>
                        <p>Register as a resident in minutes. Your HOA will approve your access.</p>
                    </div>
                    <div className="lp-cta-actions">
                        <Link to="/register" className="lp-button lp-button-solid lp-button-large">Register now</Link>
                        <Link to="/login" className="lp-button lp-button-ghost lp-button-large">Log in</Link>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

export default Home;
