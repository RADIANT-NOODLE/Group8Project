import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession, getSessionToken } from "../../services/session";
import "./Providers.css";
import { showConfirm, showAlert } from "../../components/AppDialog";
import { getApiBaseUrl } from "../../services/apiClient";

const SERVICE_CATEGORIES = [
    { value: "plumbing", label: "Plumbing", icon: "tools" },
    { value: "electrical", label: "Electrical", icon: "tools" },
    { value: "garden", label: "Garden Services", icon: "cleaning" },
    { value: "security", label: "Security", icon: "shield" },
    { value: "cleaning", label: "Cleaning", icon: "cleaning" },
    { value: "other", label: "Other Services", icon: "tools" },
];

function findCategory(trade) {
    return SERVICE_CATEGORIES.find(item => item.value === trade);
}

/* A provider's trade is a listed category, or the service typed in under "Other Services". */
function getCategoryLabel(trade) {
    return findCategory(trade)?.label || trade || "Other Services";
}

/* What to save as the trade. A typed name that matches a listed category uses that category. */
function tradeFromForm(form) {
    if (form.category !== "other") return form.category;

    const typed = form.customService.trim();
    const match = SERVICE_CATEGORIES.find(item =>
        [item.value, item.label.toLowerCase()].includes(typed.toLowerCase())
    );
    return match ? match.value : typed;
}

function Icon({ type, size = 20 }) {
    const props = {
        width: size, height: size, viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round",
        strokeLinejoin: "round", "aria-hidden": true, focusable: false,
    };

    const paths = {
        search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></>,
        phone: <><path d="M6.5 3.5 9.2 3C9.8 2.9 10.3 3.2 10.5 3.8L11.8 7C12 7.5 11.8 8 11.4 8.3L9.5 9.7c1 2.1 2.7 3.8 4.8 4.8l1.4-1.9c.3-.4.8-.6 1.3-.4l3.2 1.3c.6.2.9.7.8 1.3l-.5 2.7c-.1.9-.9 1.5-1.8 1.5C10.9 19 5 13.1 5 5.3c0-.9.6-1.7 1.5-1.8Z" /></>,
        tools: <><path d="M14.5 6.5a4 4 0 0 1-5 5L4 17l3 3 5.5-5.5a4 4 0 0 1 5-5" /><path d="m16 4 4 4" /></>,
        shield: <><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z" /><path d="m9 12 2 2 4.5-4.5" /></>,
        cleaning: <><path d="m8 20 7-15m-3 15 7-15M5 20h14" /><path d="m14 4 2-2m2 6 3-1M7 11l-3-1" /></>,
        users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.4-5 6-5s6 1.7 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M17 15c2.5 0 4 1.7 4 4" /></>,
        plus: <path d="M12 5v14M5 12h14" />,
        edit: <><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m13.5 7.5 3 3" /></>,
        trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6m4-6v6" /></>,
        close: <path d="m6 6 12 12M18 6 6 18" />,
    };

    return <svg {...props}>{paths[type] || paths.tools}</svg>;
}

const EMPTY_FORM = {
    full_name: "",
    email: "",
    category: "plumbing",
    customService: "",
    description: "",
    number: "",
    status: "Verified",
    rating: "",
};

function Providers() {
    const { user } = useSession();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");
    const [reviewError, setReviewError] = useState("");
        const [reviewToDelete, setReviewToDelete] = useState(null);

    const role = user?.role || "";
    const canManage = role === "hoa_admin" || role === "head_admin";

    // 1. Fetch providers from the backend
    const fetchProviders = async () => {
        setLoading(true);
        try {
            const token = getSessionToken();
            const response = await fetch(`${getApiBaseUrl()}/api/v1/providers`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Handle paginated response: { count, providers }
                const list = data.providers || data.items || data || [];
                setProviders(list);
            } else {
                setError("Failed to load providers.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not connect to the backend server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    // 2. Filter
    const filteredProviders = useMemo(() => {
        const query = search.trim().toLowerCase();
        return providers.filter(provider => {
            const matchesSearch =
                !query ||
                provider.full_name?.toLowerCase().includes(query) ||
                provider.trade?.toLowerCase().includes(query) ||
                provider.email?.toLowerCase().includes(query);

            // "Other Services" also covers every service typed in by hand
            const matchesCategory =
                category === "all" ||
                provider.trade === category ||
                (category === "other" && !findCategory(provider.trade));

            return matchesSearch && matchesCategory;
        });
    }, [providers, search, category]);

    function openCreateForm() {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setError("");
        setMessage("");
        setShowForm(true);
        setSelectedProvider(null);
    }

    function openEditForm(provider) {
        setEditingId(provider.provider_id || provider.id);
        setForm({
            full_name: provider.full_name || "",
            email: provider.email || "",
            category: findCategory(provider.trade) ? provider.trade : "other",
            customService: findCategory(provider.trade) ? "" : provider.trade || "",
            description: provider.description || "",
            number: provider.phone || "",
            status: provider.verified ? "Verified" : "Pending Verification",
            rating: provider.avg_rating ?? "",
        });
        setError("");
        setMessage("");
        setShowForm(true);
        setSelectedProvider(null);
    }

    // 3. Submit Provider (POST or PATCH)
    async function handleSubmit(event) {
        event.preventDefault();
        if (!canManage) return;

        // Fixed validation to use full_name
        if (!form.full_name.trim() || !form.email.trim() || !form.number.trim()) {
            setError("Please enter the provider name, email, and contact number.");
            return;
        }

        if (form.category === "other" && form.customService.trim().length < 2) {
            setError("Please type the service this provider offers.");
            return;
        }

        const providerName = form.full_name.trim();
        const confirmed = await showConfirm(
            editingId ? `Save changes to ${providerName}?` : `Add ${providerName} to the service provider directory?`,
            { title: editingId ? "Save changes?" : "Add provider?", confirmLabel: editingId ? "Save" : "Add provider" }
        );
        if (!confirmed) return;

        try {
            const token = getSessionToken();
            
            const url = editingId 
                ? `${getApiBaseUrl()}/api/v1/providers/${editingId}`
                : `${getApiBaseUrl()}/api/v1/providers`;
                
            const method = editingId ? "PATCH" : "POST";

            // This payload matches the ServiceProviderCreate schema exactly
            const payload = {
                full_name: form.full_name.trim(), 
                email: form.email.trim(),
                trade: tradeFromForm(form),
                phone: form.number.trim(),
                verified: form.status === "Verified",
                emergency_available: false, 
                description: form.description.trim(),
                // Optional rating field not in backend schema, we send it only if needed
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                console.log("FULL BACKEND ERROR:", errData); 
                
                let errorMsg = "Failed to save provider";
                if (Array.isArray(errData.detail)) {
                    errorMsg = errData.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(", ");
                } else if (typeof errData.detail === 'string') {
                    errorMsg = errData.detail;
                }
                throw new Error(errorMsg);
            }

            setMessage(editingId ? "Service provider updated." : "Service provider added.");
            setShowForm(false);
            await fetchProviders(); // Refresh list

        } catch (err) {
            setError(err.message);
        }
    }

    // 4. Delete Provider
    async function deleteProvider(provider) {
        if (!canManage) return;
        if (!await showConfirm(`Remove "${provider.full_name}"?`)) return;

        const id = provider.provider_id || provider.id;

        try {
            const token = getSessionToken();
            const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to delete provider");

            setMessage("Service provider removed.");
            await fetchProviders(); 

        } catch (err) {
            setError(err.message);
        }
    }

    function openPhoneApp() {
        if (selectedProvider?.phone) {
            window.location.href = `tel:${selectedProvider.phone.replace(/[^\d+]/g, "")}`;
        }
    }

    function clearFilters() {
        setSearch("");
        setCategory("all");
    }

        // Fetch reviews when a provider modal is opened
    const fetchReviews = async (providerId) => {
        setReviewsLoading(true);
        try {
            const token = getSessionToken();
            const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/reviews`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReviews(data.items || data.reviews || data || []);
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Open the modal and fetch its reviews
    const openProviderModal = (provider) => {
        setSelectedProvider(provider);
        setReviewMessage("");
        setReviewError("");
        fetchReviews(provider.provider_id || provider.id);
    };

    // Submit a new review
    const submitReview = async (e) => {
        e.preventDefault();
        setReviewMessage("");
        setReviewError("");

        try {
            const token = getSessionToken();
            const providerId = selectedProvider.provider_id || selectedProvider.id;
            
            const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/reviews`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    rating: Number(reviewForm.rating),
                    comment: reviewForm.comment.trim()
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to submit review");
            }

            setReviewMessage("Review submitted successfully!");
            setReviewForm({ rating: 5, comment: "" });
            
            // Refresh the provider list (to update the average rating on the card) 
            // and the reviews list
            await fetchProviders();
            await fetchReviews(providerId);

        } catch (err) {
            setReviewError(err.message);
        }
    };

        const deleteReview = async (reviewId) => {
        if (!reviewToDelete) return;

        try {
            const token = getSessionToken();
            const providerId = selectedProvider.provider_id || selectedProvider.id;

            const response = await fetch(`${getApiBaseUrl()}/api/v1/providers/${providerId}/reviews/${reviewToDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to delete review");

            // Refresh the reviews and the provider stats
            setReviewToDelete(null);
            await fetchReviews(providerId);
            await fetchProviders();
            
        } catch (err) {
            showAlert(err.message);
        }
    };

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
                        <p>Find trusted professionals for property and community needs.</p>
                    </div>

                    {canManage && (
                        <button type="button" className="providers-primary-button providers-add-button" onClick={openCreateForm}>
                            <Icon type="plus" size={17} /> Add Provider
                        </button>
                    )}
                </header>

                {message && <div className="providers-message success" role="status">{message}</div>}
                {error && !showForm && <div className="providers-message error" role="alert">{error}</div>}

                <section className="providers-search-panel">
                    <div className="providers-section-heading">
                        <div className="providers-heading-icon"><Icon type="search" size={21} /></div>
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
                            <select id="provider-category" value={category} onChange={event => setCategory(event.target.value)}>
                                <option value="all">All Services</option>
                                {SERVICE_CATEGORIES.map(item => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
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
                                <p>Changes are saved to the database.</p>
                            </div>
                            <button type="button" className="providers-icon-button" onClick={() => { setShowForm(false); setError(""); }}>
                                <Icon type="close" size={18} />
                            </button>
                        </div>

                        {error && <div className="providers-message error" role="alert">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="providers-form-grid">
                                <label>
                                    Provider Name *
                                    <input value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })} required />
                                </label>
                                <label>
                                    Email Address *
                                    <input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required />
                                </label>
                                <label>
                                    Service Category *
                                    <select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} required>
                                        {SERVICE_CATEGORIES.map(item => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </label>
                                {form.category === "other" && (
                                    <label>
                                        What service do they offer? *
                                        <input
                                            value={form.customService}
                                            onChange={event => setForm({ ...form, customService: event.target.value })}
                                            placeholder="For example: Pool cleaning"
                                            minLength={2}
                                            maxLength={50}
                                            required
                                        />
                                    </label>
                                )}
                                <label>
                                    Contact Number *
                                    <input type="tel" value={form.number} onChange={event => setForm({ ...form, number: event.target.value })} required />
                                </label>
                                <label>
                                    Directory Status
                                    <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}>
                                        <option value="Verified">Verified</option>
                                        <option value="Pending Verification">Pending Verification</option>
                                    </select>
                                </label>
                                <label className="providers-form-full">
                                    Description *
                                    <textarea rows="4" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} required />
                                </label>
                            </div>

                            <div className="providers-form-actions">
                                <button type="submit" className="providers-primary-button">
                                    <Icon type={editingId ? "edit" : "plus"} size={16} />
                                    {editingId ? "Save Changes" : "Add Provider"}
                                </button>
                                <button type="button" className="providers-secondary-button" onClick={() => { setShowForm(false); setError(""); }}>
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
                            <p>{filteredProviders.length} provider{filteredProviders.length === 1 ? "" : "s"} found</p>
                        </div>
                        {(search || category !== "all") && (
                            <button type="button" className="providers-clear-button" onClick={clearFilters}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="providers-empty"><h3>Loading providers...</h3></div>
                    ) : filteredProviders.length > 0 ? (

                        <div className="providers-grid">
                            {filteredProviders.map(provider => (
                                <article className="provider-card" key={provider.provider_id || provider.id}>
                                    <div className="provider-card-top">
                                        <div className="provider-icon">
                                            <Icon type={provider.icon || "tools"} size={25} />
                                        </div>
                                        <span className={`provider-status ${!provider.verified ? "pending" : ""}`}>
                                            <span className="provider-status-dot" />
                                            {provider.verified ? "Verified" : "Pending Verification"}
                                        </span>
                                    </div>
                                    <h3>{provider.full_name}</h3>
                                    <span className="provider-category">{getCategoryLabel(provider.trade)}</span>
                                    <p className="provider-description">{provider.description || "No description provided."}</p>

                                    {provider.avg_rating ? (
                                        <div className="provider-rating" style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                                            <span className="rating-stars" aria-hidden="true">
                                                ★★★★★
                                            </span>
                                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#563f6b" }}>
                                                {Number(provider.avg_rating).toFixed(1)} / 5
                                            </span>
                                            <span style={{ fontSize: "11px", color: "#8a848f" }}>
                                                ({provider.total_reviews || 0} reviews)
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ marginBottom: "10px", fontSize: "11px", color: "#8a848f" }}>
                                            No reviews yet
                                        </div>
                                    )}

                                    <button type="button" className="provider-contact-button" onClick={() => openProviderModal(provider)}>
                                        <Icon type="phone" size={17} /> Contact Provider
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
                                <h3>No service providers added yet</h3>
                                {canManage && (
                                    <button type="button" className="providers-primary-button" onClick={openCreateForm}>
                                        <Icon type="plus" size={16} /> Add First Provider
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                                {selectedProvider && (
                    <div className="providers-modal" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedProvider(null); }}>
                        <section className="providers-modal-content" role="dialog" aria-modal="true" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                            <button type="button" className="providers-modal-close" onClick={() => setSelectedProvider(null)}>
                                <Icon type="close" size={19} />
                            </button>
                            
                            <div className="providers-modal-icon"><Icon type="phone" size={27} /></div>
                            <span className="providers-modal-eyebrow">PROVIDER DETAILS</span>
                            <h2>{selectedProvider.full_name}</h2>
                            <p>{getCategoryLabel(selectedProvider.trade)}</p>
                            
                            <div className="providers-number">{selectedProvider.phone || "No number available"}</div>
                            <div style={{ margin: "0 0 10px 0", color: "#563f6b", fontSize: "14px", fontWeight: "600" }}>
                                {selectedProvider.email}
                            </div>

                            <button type="button" className="providers-modal-button" onClick={openPhoneApp}>
                                <Icon type="phone" size={17} /> Call Provider
                            </button>

                            {/* ========================================== */}
                            {/* REVIEWS SECTION */}
                            {/* ========================================== */}
                            <div style={{ textAlign: "left", marginTop: "30px", borderTop: "1px solid #eeeaf0", paddingTop: "20px" }}>
                                <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#29242d" }}>Reviews</h3>
                                
                                {reviewsLoading ? (
                                    <p>Loading reviews...</p>
                                ) : reviews.length === 0 ? (
                                    <p style={{ fontSize: "13px", color: "#8a848f" }}>No reviews yet. Be the first to leave one!</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                                                                                {reviews.map(review => (
                                            <div key={review.review_id || review.id} style={{ background: "#faf9fb", padding: "12px", borderRadius: "8px", border: "1px solid #e8e3eb" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                                    <strong style={{ fontSize: "13px", color: "#563f6b" }}>{review.reviewer_name || review.full_name || "Resident"}</strong>
                                                    
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <span style={{ color: "var(--valora-purple)", fontSize: "13px" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                                                        
                                                        {/* DELETE BUTTON */}
                                                        {canManage && (
                                                            <button 
                                                                onClick={() => setReviewToDelete(review.review_id || review.id)}
                                                                style={{ background: "none", border: "none", color: "#d32f2f", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                                                                title="Delete Review"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p style={{ margin: 0, fontSize: "13px", color: "#504558" }}>{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* REVIEW FORM (Only visible to Residents/Agents) */}
                                {["resident", "estate_agent"].includes(role) && (
                                    <form onSubmit={submitReview} style={{ marginTop: "20px", background: "#f5f3f7", padding: "15px", borderRadius: "8px" }}>
                                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#29242d" }}>Leave a Review</h4>
                                        
                                        {reviewMessage && <div style={{ color: "green", fontSize: "12px", marginBottom: "10px" }}>{reviewMessage}</div>}
                                        {reviewError && <div style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>{reviewError}</div>}

                                        <div style={{ marginBottom: "10px" }}>
                                            <label style={{ display: "block", fontSize: "12px", marginBottom: "5px" }}>Rating</label>
                                            <select 
                                                value={reviewForm.rating} 
                                                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                                                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd7e1" }}
                                            >
                                                <option value="5">5 Stars - Excellent</option>
                                                <option value="4">4 Stars - Good</option>
                                                <option value="3">3 Stars - Average</option>
                                                <option value="2">2 Stars - Poor</option>
                                                <option value="1">1 Star - Terrible</option>
                                            </select>
                                        </div>

                                        <div style={{ marginBottom: "15px" }}>
                                            <label style={{ display: "block", fontSize: "12px", marginBottom: "5px" }}>Comment</label>
                                            <textarea
                                                required
                                                rows="3"
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                placeholder="How was your experience?"
                                                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd7e1", fontFamily: "inherit" }}
                                            />
                                        </div>

                                        <button type="submit" className="providers-modal-button" style={{ marginTop: 0 }}>
                                            Submit Review
                                        </button>
                                    </form>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/*DELETE REVIEW MODAL */}
            {reviewToDelete && (
                <div 
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(30, 20, 40, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        animation: "fadeIn 0.2s ease-out"
                    }}
                >
                    <div 
                        style={{
                            background: "#ffffff",
                            padding: "24px",
                            borderRadius: "12px",
                            maxWidth: "400px",
                            width: "90%",
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                            animation: "slideUp 0.2s ease-out"
                        }}
                    >
                        <h3 style={{ margin: "0 0 10px", color: "#29242d", fontSize: "18px" }}>Delete Review</h3>
                        <p style={{ margin: "0 0 24px", color: "#77717d", fontSize: "13px", lineHeight: "1.5" }}>
                            Are you sure you want to permanently delete this review? This action cannot be undone.
                        </p>
                        
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button 
                                onClick={() => setReviewToDelete(null)}
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    border: "none",
                                    background: "#f5f3f7",
                                    color: "#563f6b"
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={deleteReview}
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    border: "none",
                                    background: "#d32f2f",
                                    color: "#ffffff"
                                }}
                            >
                                Delete Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Providers;