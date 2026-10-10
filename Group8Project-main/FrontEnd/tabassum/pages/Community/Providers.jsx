import React, { useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./Providers.css";

function Icon({ type, size = 20 }) {
    const commonProps = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": "true",
    };

    switch (type) {
        case "search":
            return (
                <svg {...commonProps}>
                    <circle
                        cx="11"
                        cy="11"
                        r="6.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />
                    <path
                        d="M16 16L21 21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "phone":
            return (
                <svg {...commonProps}>
                    <path
                        d="M6.5 3.5L9.2 3C9.8 2.9 10.3 3.2 10.5 3.8L11.8 7C12 7.5 11.8 8 11.4 8.3L9.5 9.7C10.5 11.8 12.2 13.5 14.3 14.5L15.7 12.6C16 12.2 16.5 12 17 12.2L20.2 13.5C20.8 13.7 21.1 14.2 21 14.8L20.5 17.5C20.4 18.4 19.6 19 18.7 19C10.9 19 5 13.1 5 5.3C5 4.4 5.6 3.6 6.5 3.5Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );

        case "close":
            return (
                <svg {...commonProps}>
                    <path
                        d="M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "tools":
            return (
                <svg {...commonProps}>
                    <path
                        d="M14.5 6.5C14.5 8.43 12.93 10 11 10C9.07 10 7.5 8.43 7.5 6.5C7.5 5.83 7.69 5.2 8.02 4.67L4 8.69L15.31 20L19.33 15.98C18.8 16.31 18.17 16.5 17.5 16.5C15.57 16.5 14 14.93 14 13C14 11.07 15.57 9.5 17.5 9.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M4 20L9 15"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "valuation":
            return (
                <svg {...commonProps}>
                    <path
                        d="M12 3V5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M12 19V21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M5.64 5.64L7.05 7.05"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M16.95 16.95L18.36 18.36"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M3 12H5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M19 12H21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="12"
                        cy="12"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />
                    <path
                        d="M10 13.5C10.5 14.2 11.2 14.5 12 14.5C13.1 14.5 14 13.9 14 13C14 11.5 10 12.2 10 10.5C10 9.6 10.9 9 12 9C12.8 9 13.5 9.3 14 10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "property":
            return (
                <svg {...commonProps}>
                    <path
                        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9 21V14H15V21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                    />
                </svg>
            );

        case "profile":
            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="8"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />
                    <path
                        d="M4 21C4.7 16.9 7.5 15 12 15C16.5 15 19.3 16.9 20 21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            );

        default:
            return null;
    }
}

function Providers() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [selectedNumber, setSelectedNumber] = useState("");
    const [showModal, setShowModal] = useState(false);

    const providers = [
        {
            name: "Aqua Plumbing",
            category: "plumbing",
            categoryName: "Plumbing",
            icon: "tools",
            description:
                "Residential plumbing repairs, installations and maintenance.",
            rating: "4.8",
            number: "071 234 5678",
        },
        {
            name: "PowerTech Electrical",
            category: "electrical",
            categoryName: "Electrical",
            icon: "valuation",
            description:
                "Electrical installations, repairs and safety inspections.",
            rating: "4.7",
            number: "072 345 6789",
        },
        {
            name: "GreenScape Gardens",
            category: "garden",
            categoryName: "Garden Services",
            icon: "property",
            description:
                "Landscaping, garden maintenance and outdoor cleaning.",
            rating: "4.5",
            number: "073 456 7890",
        },
        {
            name: "SecureGuard Solutions",
            category: "security",
            categoryName: "Security",
            icon: "profile",
            description:
                "Access control, security systems and CCTV installation.",
            rating: "4.9",
            number: "074 567 8901",
        },
        {
            name: "Sparkle Cleaning",
            category: "cleaning",
            categoryName: "Cleaning",
            icon: "tools",
            description:
                "Residential cleaning and common-area maintenance.",
            rating: "4.6",
            number: "075 678 9012",
        },
    ];

    const filteredProviders = providers.filter((provider) => {
        const matchesSearch =
            provider.name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            provider.categoryName
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "all" || provider.category === category;

        return matchesSearch && matchesCategory;
    });

    const showProviderNumber = (number) => {
        setSelectedNumber(number);
        setShowModal(true);
    };

    return (
        <div className="providers-page">

            <DashboardSidebar />

            <main className="providers-main">

                <header className="providers-topbar">

                    <div>
                        <span className="providers-eyebrow">
                            COMMUNITY SERVICES
                        </span>

                        <h1>
                            Service Provider Directory
                        </h1>

                        <p>
                            Find trusted professionals for your property.
                        </p>
                    </div>

                </header>

                <section className="providers-search-panel">

                    <div className="providers-section-heading">

                        <div className="providers-heading-icon">
                            <Icon
                                type="search"
                                size={21}
                            />
                        </div>

                        <div>
                            <h2>
                                Find a Service Provider
                            </h2>

                            <p>
                                Search by provider name or service category.
                            </p>
                        </div>

                    </div>

                    <div className="providers-search-row">

                        <div className="providers-search-input">

                            <Icon
                                type="search"
                                size={19}
                            />

                            <input
                                type="text"
                                placeholder="Search providers..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                        >
                            <option value="all">
                                All Services
                            </option>

                            <option value="plumbing">
                                Plumbing
                            </option>

                            <option value="electrical">
                                Electrical
                            </option>

                            <option value="garden">
                                Garden
                            </option>

                            <option value="security">
                                Security
                            </option>

                            <option value="cleaning">
                                Cleaning
                            </option>
                        </select>

                    </div>

                </section>

                <section className="providers-results-section">

                    <div className="providers-results-header">

                        <div>
                            <h2>
                                Available Providers
                            </h2>

                            <p>
                                {filteredProviders.length} service provider
                                {filteredProviders.length !== 1 ? "s" : ""} found
                            </p>
                        </div>

                    </div>

                    <div className="providers-grid">

                        {filteredProviders.length > 0 ? (

                            filteredProviders.map((provider) => (

                                <article
                                    className="provider-card"
                                    key={provider.name}
                                >

                                    <div className="provider-card-top">

                                        <div className="provider-icon">
                                            <Icon
                                                type={provider.icon}
                                                size={25}
                                            />
                                        </div>

                                        <span className="provider-available">
                                            Available
                                        </span>

                                    </div>

                                    <h3>
                                        {provider.name}
                                    </h3>

                                    <span className="provider-category">
                                        {provider.categoryName}
                                    </span>

                                    <p className="provider-description">
                                        {provider.description}
                                    </p>

                                    <div className="provider-rating">

                                        <span className="rating-stars">
                                            ★★★★★
                                        </span>

                                        <span>
                                            {provider.rating}
                                        </span>

                                    </div>

                                    <button
                                        type="button"
                                        className="provider-contact-button"
                                        onClick={() =>
                                            showProviderNumber(
                                                provider.number
                                            )
                                        }
                                    >
                                        <Icon
                                            type="phone"
                                            size={17}
                                        />

                                        <span>
                                            Contact Provider
                                        </span>
                                    </button>

                                </article>

                            ))

                        ) : (

                            <div className="providers-empty">

                                <div className="providers-empty-icon">
                                    <Icon
                                        type="search"
                                        size={26}
                                    />
                                </div>

                                <h3>
                                    No providers found
                                </h3>

                                <p>
                                    Try another search or service category.
                                </p>

                            </div>

                        )}

                    </div>

                </section>

                {showModal && (

                    <div className="providers-modal">

                        <div className="providers-modal-content">

                            <button
                                type="button"
                                className="providers-modal-close"
                                onClick={() =>
                                    setShowModal(false)
                                }
                                aria-label="Close"
                            >
                                <Icon
                                    type="close"
                                    size={19}
                                />
                            </button>

                            <div className="providers-modal-icon">
                                <Icon
                                    type="phone"
                                    size={28}
                                />
                            </div>

                            <span className="providers-modal-eyebrow">
                                SERVICE PROVIDER
                            </span>

                            <h2>
                                Contact Provider
                            </h2>

                            <p>
                                You can contact this service provider
                                using the number below.
                            </p>

                            <div className="providers-number">
                                {selectedNumber}
                            </div>

                            <button
                                type="button"
                                className="providers-modal-button"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                Done
                            </button>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default Providers;
