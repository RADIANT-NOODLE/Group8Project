import React, { useState } from "react";

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
            icon: "🔧",
            description:
                "Residential plumbing repairs, installations and maintenance.",
            rating: "⭐⭐⭐⭐⭐ 4.8",
            number: "071 234 5678",
        },
        {
            name: "PowerTech Electrical",
            category: "electrical",
            categoryName: "Electrical",
            icon: "⚡",
            description:
                "Electrical installations, repairs and safety inspections.",
            rating: "⭐⭐⭐⭐⭐ 4.7",
            number: "072 345 6789",
        },
        {
            name: "GreenScape Gardens",
            category: "garden",
            categoryName: "Garden Services",
            icon: "🌿",
            description:
                "Landscaping, garden maintenance and outdoor cleaning.",
            rating: "⭐⭐⭐⭐☆ 4.5",
            number: "073 456 7890",
        },
        {
            name: "SecureGuard Solutions",
            category: "security",
            categoryName: "Security",
            icon: "🔒",
            description:
                "Access control, security systems and CCTV installation.",
            rating: "⭐⭐⭐⭐⭐ 4.9",
            number: "074 567 8901",
        },
        {
            name: "Sparkle Cleaning",
            category: "cleaning",
            categoryName: "Cleaning",
            icon: "🧹",
            description:
                "Residential cleaning and common-area maintenance.",
            rating: "⭐⭐⭐⭐☆ 4.6",
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
        <div className="dashboard-layout">

            {/* SIDEBAR */}
            <aside className="sidebar">

                <div className="logo-area">

                    {/* VALORA LOGO IMAGE */}
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

                    <a href="/property">
                        🏡 My Property
                    </a>

                    <a href="/valuation">
                        🤖 AI Valuation
                    </a>

                    <a href="/complaints">
                        🏘 Complaints
                    </a>

                    <a
                        href="/providers"
                        className="active"
                    >
                        🔧 Service Providers
                    </a>

                    <a href="/announcements">
                        📢 Announcements
                    </a>

                    <a href="/profile">
                        👤 My Profile
                    </a>

                </nav>


                <div className="logout-area">

                    <a href="/">
                        🚪 Logout
                    </a>

                </div>

            </aside>


            {/* MAIN CONTENT */}
            <main className="dashboard-main">

                <div className="top-bar">

                    <div>

                        <h2>
                            Service Provider Directory 🔧
                        </h2>

                        <p>
                            Find trusted professionals for your property.
                        </p>

                    </div>

                </div>


                {/* SEARCH */}
                <section className="dashboard-panel provider-search">

                    <h3>
                        Find a Service Provider
                    </h3>

                    <p>
                        Search by name or service category.
                    </p>

                    <div className="search-row">

                        <input
                            type="text"
                            placeholder="Search providers..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

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


                {/* PROVIDER CARDS */}
                <section className="provider-grid">

                    {filteredProviders.length > 0 ? (

                        filteredProviders.map((provider) => (

                            <div
                                className="provider-card"
                                key={provider.name}
                            >

                                <div className="provider-icon">
                                    {provider.icon}
                                </div>

                                <h3>
                                    {provider.name}
                                </h3>

                                <span className="provider-category">
                                    {provider.categoryName}
                                </span>

                                <p>
                                    {provider.description}
                                </p>

                                <div className="provider-rating">
                                    {provider.rating}
                                </div>

                                <div className="provider-status">
                                    ● Available
                                </div>

                                <button
                                    className="contact-provider"
                                    onClick={() =>
                                        showProviderNumber(
                                            provider.number
                                        )
                                    }
                                >
                                    Contact Provider
                                </button>

                            </div>

                        ))

                    ) : (

                        <div className="no-providers">

                            <h3>
                                No providers found
                            </h3>

                            <p>
                                Try another search or service
                                category.
                            </p>

                        </div>

                    )}

                </section>


                {/* CONTACT MODAL */}
                {showModal && (

                    <div
                        className="provider-modal"
                        style={{ display: "flex" }}
                    >

                        <div className="provider-modal-content">

                            <button
                                className="close-modal"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                ×
                            </button>

                            <div className="modal-icon">
                                📞
                            </div>

                            <h2>
                                Contact Provider
                            </h2>

                            <p>
                                You can contact this service
                                provider using the number below.
                            </p>

                            <div className="provider-number">
                                {selectedNumber}
                            </div>

                            <button
                                className="modal-contact-button"
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
