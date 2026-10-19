
import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./Providers.css";

const STORAGE_KEY = "valoraServiceProviders";
const UPDATE_EVENT = "valora:service-providers-updated";

const SERVICE_CATEGORIES = [
    { value: "plumbing", label: "Plumbing", icon: "tools" },
    { value: "electrical", label: "Electrical", icon: "tools" },
    { value: "garden", label: "Garden Services", icon: "cleaning" },
    { value: "security", label: "Security", icon: "shield" },
    { value: "cleaning", label: "Cleaning", icon: "cleaning" },
    { value: "other", label: "Other Services", icon: "tools" },
];

function normalizeRole(value) {
    const role = String(value || "").trim().toLowerCase();

    if (["head admin", "head administrator", "headadministrator"].includes(role)) {
        return "Head Admin";
    }

    if (["hoa", "hoa admin", "hoa administrator", "administrator"].includes(role)) {
        return "HOA Admin";
    }

    if (["property owner", "resident"].includes(role)) return "Resident";
    if (["buyer", "investor"].includes(role)) return "Investor";
    if (role === "estate agent") return "Estate Agent";

    return value || "";
}

function getCurrentRole() {
    try {
        const user = JSON.parse(localStorage.getItem("valoraUser") || "null");
        return normalizeRole(user?.role) || "Resident";
    } catch {
        return "Resident";
    }
}

function readProviders() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];

        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Unable to load service providers:", error);
        return [];
    }
}

function writeProviders(providers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));

    // Notify other components in this tab.
    window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, {
            detail: { providers },
        })
    );
}

function getCategoryLabel(category) {
    return SERVICE_CATEGORIES.find(item => item.value === category)?.label
        || "Other Services";
}

function Icon({ type, size = 20 }) {
    const props = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        focusable: false,
    };

    const paths = {
        search: <>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 5 5" />
        </>,
        phone: <>
            <path d="M6.5 3.5 9.2 3C9.8 2.9 10.3 3.2 10.5 3.8L11.8 7C12 7.5 11.8 8 11.4 8.3L9.5 9.7c1 2.1 2.7 3.8 4.8 4.8l1.4-1.9c.3-.4.8-.6 1.3-.4l3.2 1.3c.6.2.9.7.8 1.3l-.5 2.7c-.1.9-.9 1.5-1.8 1.5C10.9 19 5 13.1 5 5.3c0-.9.6-1.7 1.5-1.8Z" />
        </>,
        tools: <>
            <path d="M14.5 6.5a4 4 0 0 1-5 5L4 17l3 3 5.5-5.5a4 4 0 0 1 5-5" />
            <path d="m16 4 4 4" />
        </>,
        shield: <>
            <path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z" />
            <path d="m9 12 2 2 4.5-4.5" />
        </>,
        cleaning: <>
            <path d="m8 20 7-15m-3 15 7-15M5 20h14" />
            <path d="m14 4 2-2m2 6 3-1M7 11l-3-1" />
        </>,
        users: <>
            <circle cx="9" cy="8" r="3" />
            <path d="M3 20c0-3.3 2.4-5 6-5s6 1.7 6 5" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M17 15c2.5 0 4 1.7 4 4" />
        </>,
        plus: <path d="M12 5v14M5 12h14" />,
        edit: <>
            <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
            <path d="m13.5 7.5 3 3" />
        </>,
        trash: <>
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6m4-6v6" />
        </>,
        close: <path d="m6 6 12 12M18 6 6 18" />,
    };

    return <svg {...props}>{paths[type] || paths.tools}</svg>;
}

const EMPTY_FORM = {
    name: "",
    category: "plumbing",
    description: "",
    number: "",
    status: "Verified",
    rating: "",
};

function Providers() {
    const [role, setRole] = useState(getCurrentRole);
    const [providers, setProviders] = useState(readProviders);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const canManage = role === "HOA Admin" || role === "Head Admin";

    useEffect(() => {
        const refresh = () => setProviders(readProviders());

        const handleStorage = event => {
            if (!event.key || event.key === STORAGE_KEY) refresh();
            if (!event.key || event.key === "valoraUser") {
                setRole(getCurrentRole());
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener(UPDATE_EVENT, refresh);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(UPDATE_EVENT, refresh);
        };
    }, []);

    const filteredProviders = useMemo(() => {
        const query = search.trim().toLowerCase();

        return providers.filter(provider => {
            const matchesSearch =
                !query ||
                provider.name?.toLowerCase().includes(query) ||
                provider.categoryName?.toLowerCase().includes(query) ||
                provider.description?.toLowerCase().includes(query);

            return matchesSearch &&
                (category === "all" || provider.category === category);
        });
    }, [providers, search, category]);

    function persist(nextProviders, successMessage) {
        try {
            writeProviders(nextProviders);
            setProviders(nextProviders);
            setMessage(successMessage);
            setError("");
        } catch (saveError) {
            console.error("Unable to save service providers:", saveError);
            setError("Could not save changes in this browser. Check browser storage.");
        }
    }

    function openCreateForm() {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setError("");
        setMessage("");
        setShowForm(true);
        setSelectedProvider(null);
    }

    function openEditForm(provider) {
        setEditingId(provider.id);
        setForm({
            name: provider.name || "",
            category: provider.category || "other",
            description: provider.description || "",
            number: provider.number || "",
            status: provider.status || "Verified",
            rating: provider.rating ?? "",
        });
        setError("");
        setMessage("");
        setShowForm(true);
        setSelectedProvider(null);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!canManage) return;

        if (!form.name.trim() || !form.number.trim() || !form.description.trim()) {
            setError("Please enter the provider name, contact number and description.");
            return;
        }

        const categoryInfo = SERVICE_CATEGORIES.find(
            item => item.value === form.category
        ) || SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1];

        const record = {
            id: editingId || `PROV-${Date.now()}`,
            name: form.name.trim(),
            category: categoryInfo.value,
            categoryName: categoryInfo.label,
            icon: categoryInfo.icon,
            description: form.description.trim(),
            number: form.number.trim(),
            status: form.status,
            ...(form.rating !== "" && Number.isFinite(Number(form.rating))
                ? { rating: Math.min(5, Math.max(0, Number(form.rating))) }
                : {}),
            updatedAt: new Date().toISOString(),
        };

        let nextProviders;

        if (editingId) {
            nextProviders = providers.map(provider =>
                provider.id === editingId ? record : provider
            );
        } else {
            nextProviders = [{ ...record, createdAt: record.updatedAt }, ...providers];
        }

        persist(
            nextProviders,
            editingId ? "Service provider updated." : "Service provider added."
        );

        setShowForm(false);
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
    }

    function deleteProvider(provider) {
        if (!canManage) return;

        const confirmed = window.confirm(
            `Remove "${provider.name}" from the service provider directory?`
        );
        if (!confirmed) return;

        persist(
            providers.filter(item => item.id !== provider.id),
            "Service provider removed."
        );

        if (selectedProvider?.id === provider.id) {
            setSelectedProvider(null);
        }
    }

    function openPhoneApp() {
        if (selectedProvider?.number) {
            window.location.href = `tel:${selectedProvider.number.replace(/[^\d+]/g, "")}`;
        }
    }

    function clearFilters() {
        setSearch("");
        setCategory("all");
    }

    return (
        <div className="providers-page">
            <DashboardSidebar />

            <main className="providers-main">
                <header className="providers-topbar">
                    <div className="providers-heading-copy">
                        <span className="providers-eyebrow">
                            <span className="providers-eyebrow-dot" />
                            COMMUNITY SERVICES
                        </span>
                        <h1>Service Provider Directory</h1>
                        <p>
                            Find trusted professionals for property and community needs.
                        </p>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            className="providers-primary-button providers-add-button"
                            onClick={openCreateForm}
                        >
                            <Icon type="plus" size={17} />
                            Add Provider
                        </button>
                    )}
                </header>

                {message && (
                    <div className="providers-message success" role="status">
                        {message}
                        <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">
                            <Icon type="close" size={15} />
                        </button>
                    </div>
                )}

                {error && !showForm && (
                    <div className="providers-message error" role="alert">
                        {error}
                        <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                            <Icon type="close" size={15} />
                        </button>
                    </div>
                )}

                <section className="providers-search-panel">
                    <div className="providers-section-heading">
                        <div className="providers-heading-icon">
                            <Icon type="search" size={21} />
                        </div>
                        <div>
                            <h2>Find a Service Provider</h2>
                            <p>Search by provider name, service or description.</p>
                        </div>
                    </div>

                    <div className="providers-search-row">
                        <label className="providers-search-input" htmlFor="provider-search">
                            <Icon type="search" size={19} />
                            <input
                                id="provider-search"
                                type="search"
                                placeholder="Search service providers..."
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                            />
                        </label>

                        <label className="providers-category-select" htmlFor="provider-category">
                            <span>Service category</span>
                            <select
                                id="provider-category"
                                value={category}
                                onChange={event => setCategory(event.target.value)}
                            >
                                <option value="all">All Services</option>
                                {SERVICE_CATEGORIES.map(item => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </section>

                {showForm && canManage && (
                    <section className="providers-management-panel" id="provider-form">
                        <div className="providers-form-heading">
                            <div>
                                <span className="providers-section-label">PROVIDER MANAGEMENT</span>
                                <h2>{editingId ? "Edit Service Provider" : "Add Service Provider"}</h2>
                                <p>Changes are saved to the shared directory for this browser.</p>
                            </div>
                            <button
                                type="button"
                                className="providers-icon-button"
                                onClick={() => { setShowForm(false); setError(""); }}
                                aria-label="Close provider form"
                            >
                                <Icon type="close" size={18} />
                            </button>
                        </div>

                        {error && <div className="providers-message error" role="alert">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="providers-form-grid">
                                <label>
                                    Provider Name *
                                    <input
                                        value={form.name}
                                        onChange={event => setForm({ ...form, name: event.target.value })}
                                        placeholder="Business or provider name"
                                        required
                                    />
                                </label>

                                <label>
                                    Service Category *
                                    <select
                                        value={form.category}
                                        onChange={event => setForm({ ...form, category: event.target.value })}
                                        required
                                    >
                                        {SERVICE_CATEGORIES.map(item => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Contact Number *
                                    <input
                                        type="tel"
                                        value={form.number}
                                        onChange={event => setForm({ ...form, number: event.target.value })}
                                        placeholder="Enter verified contact number"
                                        required
                                    />
                                </label>

                                <label>
                                    Directory Status
                                    <select
                                        value={form.status}
                                        onChange={event => setForm({ ...form, status: event.target.value })}
                                    >
                                        <option value="Verified">Verified</option>
                                        <option value="Pending Verification">Pending Verification</option>
                                    </select>
                                </label>

                                <label>
                                    Rating (optional, 0–5)
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={form.rating}
                                        onChange={event => setForm({ ...form, rating: event.target.value })}
                                        placeholder="Only enter a genuine rating"
                                    />
                                </label>

                                <label className="providers-form-full">
                                    Description *
                                    <textarea
                                        rows="4"
                                        value={form.description}
                                        onChange={event => setForm({ ...form, description: event.target.value })}
                                        placeholder="Describe the provider's services"
                                        required
                                    />
                                </label>
                            </div>

                            <div className="providers-form-actions">
                                <button type="submit" className="providers-primary-button">
                                    <Icon type={editingId ? "edit" : "plus"} size={16} />
                                    {editingId ? "Save Changes" : "Add Provider"}
                                </button>
                                <button
                                    type="button"
                                    className="providers-secondary-button"
                                    onClick={() => { setShowForm(false); setError(""); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="providers-results-section">
                    <div className="providers-results-header">
                        <div>
                            <span className="providers-section-label">DIRECTORY</span>
                            <h2>Available Providers</h2>
                            <p>
                                {filteredProviders.length} provider{filteredProviders.length === 1 ? "" : "s"} found
                            </p>
                        </div>

                        {(search || category !== "all") && (
                            <button type="button" className="providers-clear-button" onClick={clearFilters}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    {filteredProviders.length > 0 ? (
                        <div className="providers-grid">
                            {filteredProviders.map(provider => (
                                <article className="provider-card" key={provider.id}>
                                    <div className="provider-card-top">
                                        <div className="provider-icon">
                                            <Icon type={provider.icon || "tools"} size={25} />
                                        </div>
                                        <span className={`provider-status ${provider.status === "Pending Verification" ? "pending" : ""}`}>
                                            <span className="provider-status-dot" />
                                            {provider.status || "Verified"}
                                        </span>
                                    </div>

                                    <h3>{provider.name}</h3>
                                    <span className="provider-category">
                                        {provider.categoryName || getCategoryLabel(provider.category)}
                                    </span>
                                    <p className="provider-description">{provider.description}</p>

                                    {provider.rating !== undefined && provider.rating !== null && (
                                        <div className="provider-rating">
                                            <span className="rating-stars" aria-hidden="true">★★★★★</span>
                                            <span>{provider.rating} / 5</span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="provider-contact-button"
                                        onClick={() => setSelectedProvider(provider)}
                                        disabled={!provider.number}
                                    >
                                        <Icon type="phone" size={17} />
                                        Contact Provider
                                    </button>

                                    {canManage && (
                                        <div className="provider-admin-actions">
                                            <button type="button" className="providers-secondary-button" onClick={() => openEditForm(provider)}>
                                                <Icon type="edit" size={15} /> Edit
                                            </button>
                                            <button type="button" className="providers-danger-button" onClick={() => deleteProvider(provider)}>
                                                <Icon type="trash" size={15} /> Remove
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="providers-empty">
                            <div className="providers-empty-content">
                                <div className="providers-empty-icon">
                                    <Icon type={search || category !== "all" ? "search" : "users"} size={28} />
                                </div>
                                <span className="providers-empty-label">
                                    {search || category !== "all" ? "NO MATCHES" : "COMMUNITY DIRECTORY"}
                                </span>
                                <h3>
                                    {search || category !== "all"
                                        ? "No providers found"
                                        : "No service providers added yet"}
                                </h3>
                                <p>
                                    {search || category !== "all"
                                        ? "Try a different search term or category."
                                        : canManage
                                            ? "Add a verified service provider to make it available in the community directory."
                                            : "Providers added by the community administrators will appear here."}
                                </p>
                                {canManage && !search && category === "all" && (
                                    <button type="button" className="providers-primary-button" onClick={openCreateForm}>
                                        <Icon type="plus" size={16} /> Add First Provider
                                    </button>
                                )}
                                {(search || category !== "all") && (
                                    <button type="button" className="providers-primary-button" onClick={clearFilters}>
                                        Clear Search &amp; Filters
                                    </button>
                                )}
                                <span className="providers-empty-note">
                                    <Icon type="shield" size={15} />
                                    Verify provider details before publishing them to residents.
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                {selectedProvider && (
                    <div className="providers-modal" onMouseDown={event => {
                        if (event.target === event.currentTarget) setSelectedProvider(null);
                    }}>
                        <section className="providers-modal-content" role="dialog" aria-modal="true" aria-labelledby="providers-modal-title">
                            <button type="button" className="providers-modal-close" onClick={() => setSelectedProvider(null)} aria-label="Close contact details">
                                <Icon type="close" size={19} />
                            </button>
                            <div className="providers-modal-icon"><Icon type="phone" size={27} /></div>
                            <span className="providers-modal-eyebrow">PROVIDER CONTACT</span>
                            <h2 id="providers-modal-title">{selectedProvider.name}</h2>
                            <p>{selectedProvider.categoryName || getCategoryLabel(selectedProvider.category)}</p>
                            <div className="providers-number">{selectedProvider.number}</div>
                            <button type="button" className="providers-modal-button" onClick={openPhoneApp}>
                                <Icon type="phone" size={17} /> Call Provider
                            </button>
                            <button type="button" className="providers-modal-cancel" onClick={() => setSelectedProvider(null)}>
                                Close
                            </button>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Providers;
