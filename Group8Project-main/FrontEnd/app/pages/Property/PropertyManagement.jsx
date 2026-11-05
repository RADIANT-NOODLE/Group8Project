import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import PropertyTabs from "../Dashboards/shared/PropertyTabs";
import { deletePropertyPhoto, photoSrc, uploadPropertyPhoto } from "../../services/propertyApi";
import { listListings } from "../../services/listingApi";
import { listPropertyRequests } from "../../services/propertyRequestApi";
import { formatListingPrice } from "../../services/publicListings";
import "./PropertyManagement.css";
import "../../components/ValoraModal.css";

import { showAlert, showConfirm } from "../../components/AppDialog";
import { getSessionToken } from "../../services/session";
import StageSummary from "../../components/StageSummary";
import { getApiBaseUrl } from "../../services/apiClient";
import { IMAGE_ACCEPT, imageFileProblem } from "../../services/imageFiles";

/*
=========================================================
VALORA PROPERTY MANAGEMENT
=========================================================
*/

/* Labels from withListingStatus that count as "Awaiting action" in the summary. */
const AWAITING_ACTION_STATUSES = ["pending", "assigned"];

/* An open property request, by API status, as the label shown for its unit. */
const OPEN_REQUEST_LABELS = { pending_review: "Pending", approved: "Pending", assigned: "Assigned" };

const CLOSED_LISTING_LABELS = { sold: "Sold", rented: "Rented" };

/**
 * `/properties` knows nothing about the market, so each unit's status comes from
 * its listings and requests. A live listing wins, then an open request, then a
 * finished sale or rental. A withdrawn listing counts as not listed.
 */
function withListingStatus(property, listings, requests) {
    const unitId = property.id ?? property.unit_id;
    const own = listings
        .filter(listing => listing.unitId === unitId)
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

    const active = own.find(listing => listing.status === "active");
    const openRequest = requests.find(request => request.unitId === unitId && OPEN_REQUEST_LABELS[request.rawStatus]);
    const closed = own.find(listing => CLOSED_LISTING_LABELS[listing.status]);

    const listing_status = active
        ? "Published"
        : openRequest
            ? OPEN_REQUEST_LABELS[openRequest.rawStatus]
            : closed
                ? CLOSED_LISTING_LABELS[closed.status]
                : "Not Listed";

    return { ...property, listing_status, listing: active || (openRequest ? null : closed) || null };
}

function getLocation(property) {
    const address = property.street_address || "";
    const suburb = property.suburb || "";
    return [address, suburb].filter(Boolean).join(", ") || "Location not provided";
}

function getListingStatus(property) {
    return property.listing_status || "Not Listed";
}

function getListingPrice(property) {
    return property.listing ? formatListingPrice(property.listing) : null;
}

function getPropertyType(property) {
    return property.property_type || "House"; 
}

function getPropertyImage(property) {
    return photoSrc(property.image_url);
}

function getStatusClass(status) {
    return String(status)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function PropertyManagement() {
    const [properties, setProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // --- TOAST STATE ---
    const [toastMessage, setToastMessage] = useState("");

    // photos whose file is missing (uploaded on another computer) show the placeholder instead
    const [brokenImages, setBrokenImages] = useState([]);

    // EDIT MODAL STATE
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [editForm, setEditForm] = useState({
        unit_no: "",
        complex_name: "",
        street_address: "",
        suburb: "",
        size_m2: "",
        bedrooms: 1,
        bathrooms: 1
    });
       
    // PHOTO STATE
    const [photoBusy, setPhotoBusy] = useState(false);
    const [photoError, setPhotoError] = useState("");
    const [newPhotos, setNewPhotos] = useState([]);

    // ADD MODAL STATE
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        unit_no: "",
        complex_name: "",
        street_address: "",
        suburb: "",
        size_m2: "",
        bedrooms: 1,
        bathrooms: 1
    });

    /*
    =========================================================
    LOAD PROPERTY RECORDS FROM API
    =========================================================
    */
    const loadProperties = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = getSessionToken();
            const [response, listings, requests] = await Promise.all([
                fetch(`${getApiBaseUrl()}/api/v1/properties`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                listListings({ pageSize: 100 }),
                listPropertyRequests(),
            ]);

            if (!response.ok) {
                throw new Error("Failed to fetch properties from the server.");
            }

            const data = await response.json();
            const records = data.properties || data.items || data || [];
            setProperties(records.map(record => withListingStatus(record, listings.items, requests.items)));
        } catch (err) {
            console.error("Unable to load property records:", err);
            setProperties([]);
            setError("We couldn't load property records. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    /*
    =========================================================
    EDIT HANDLERS
    =========================================================
    */
    const openEditModal = (property) => {
        setEditingProperty(property);
        setEditForm({
            unit_no: property.unit_no || "",
            complex_name: property.complex_name || "",
            street_address: property.street_address || "",
            suburb: property.suburb || "",
            size_m2: property.size_m2 || "",
            bedrooms: property.bedrooms || 1,
            bathrooms: property.bathrooms || 1
        });
        setPhotoError("");
        setIsEditModalOpen(true);
    };

    const handleUpdateProperty = async (e) => {
        e.preventDefault();
        const unitLabel = editingProperty?.unit_no ? `Unit ${editingProperty.unit_no}` : "this property";
        if (!(await showConfirm(`Save changes to ${unitLabel}?`, { title: "Save changes?", confirmLabel: "Save" }))) return;
        try {
            const token = getSessionToken();
            const id = editingProperty.id || editingProperty.unit_id;

            const response = await fetch(`${getApiBaseUrl()}/api/v1/properties/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    unit_no: editForm.unit_no,
                    complex_name: editForm.complex_name,
                    street_address: editForm.street_address,
                    suburb: editForm.suburb,
                    size_m2: Number(editForm.size_m2) || null,
                    bedrooms: Number(editForm.bedrooms),
                    bathrooms: Number(editForm.bathrooms)
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to update property");
            }

            setIsEditModalOpen(false);
            await loadProperties(); 
            setToastMessage("Property updated successfully!");
            setTimeout(() => setToastMessage(""), 3000);
        } catch (err) {
            showAlert(err.message);
        }
    };

    /*
    =========================================================
    PHOTOS
    =========================================================
    */
    const handleUploadPhotos = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = "";
        if (!files.length || !editingProperty) return;

        const id = editingProperty.id || editingProperty.unit_id;
        setPhotoBusy(true);
        setPhotoError("");

        const problems = [];
        for (const file of files) {
            const problem = await imageFileProblem(file);
            if (problem) {
                problems.push(problem);
                continue;
            }

            try {
                const updated = await uploadPropertyPhoto(id, file);
                setEditingProperty(previous => ({ ...previous, image_url: updated.imageUrl, photos: updated.photos }));
            } catch (uploadError) {
                problems.push(`${file.name}: ${uploadError.message}`);
            }
        }

        setPhotoError(problems.join(" "));
        setPhotoBusy(false);
        await loadProperties();
    };

    const handleDeletePhoto = async (photoId) => {
        const id = editingProperty.id || editingProperty.unit_id;
        setPhotoBusy(true);
        setPhotoError("");

        try {
            const updated = await deletePropertyPhoto(id, photoId);
            setEditingProperty(previous => ({ ...previous, image_url: updated.imageUrl, photos: updated.photos }));
            await loadProperties();
        } catch (deleteError) {
            setPhotoError(deleteError.message);
        } finally {
            setPhotoBusy(false);
        }
    };

    const handlePickNewPhotos = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = "";

        const problems = await Promise.all(files.map(file => imageFileProblem(file)));
        setPhotoError(problems.filter(Boolean).join(" "));
        setNewPhotos(previous => [...previous, ...files.filter((_, index) => !problems[index])]);
    };

    const handleAddProperty = async (e) => {
        e.preventDefault();
        if (!(await showConfirm("Add this property to the estate?", { title: "Add property?", confirmLabel: "Add property" }))) return;
        try {
            const token = getSessionToken();
            const response = await fetch(`${getApiBaseUrl()}/api/v1/properties`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    unit_no: addForm.unit_no,
                    complex_name: addForm.complex_name,
                    street_address: addForm.street_address,
                    suburb: addForm.suburb,
                    size_m2: Number(addForm.size_m2) || null,
                    bedrooms: Number(addForm.bedrooms),
                    bathrooms: Number(addForm.bathrooms)
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to add property");
            }

            const created = await response.json();
            const createdId = created.id || created.unit_id;
            const failedPhotos = [];

            for (const file of newPhotos) {
                try {
                    await uploadPropertyPhoto(createdId, file);
                } catch (uploadError) {
                    failedPhotos.push(`${file.name}: ${uploadError.message}`);
                }
            }

            setIsAddModalOpen(false);
            setAddForm({ unit_no: "", complex_name: "", street_address: "", suburb: "", size_m2: "", bedrooms: 1, bathrooms: 1 });
            setNewPhotos([]);
            setPhotoError("");
            await loadProperties();
            if (failedPhotos.length) {
                showAlert(`The property was added, but some photos could not be uploaded:\n${failedPhotos.join("\n")}\nYou can add them with Edit.`);
            }
            setToastMessage("Property added successfully!");
            setTimeout(() => setToastMessage(""), 3000);
        } catch (err) {
            showAlert(err.message);
        }
    };

    /*
    =========================================================
    FILTER OPTIONS
    =========================================================
    */
    const propertyTypes = useMemo(() => {
        return [...new Set(properties.map(getPropertyType).filter(Boolean))].sort();
    }, [properties]);

    const propertyStatuses = useMemo(() => {
        return [...new Set(properties.map(getListingStatus).filter(Boolean))].sort();
    }, [properties]);

    const filteredProperties = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        return properties.filter(property => {
            const id = String(property.id || property.unit_id || "").toLowerCase();
            const name = String(property.unit_no || property.complex_name || "").toLowerCase();
            const location = getLocation(property).toLowerCase();
            const type = getPropertyType(property).toLowerCase();
            const status = getListingStatus(property);

            const matchesSearch = !search || id.includes(search) || name.includes(search) || location.includes(search) || type.includes(search);
            const matchesStatus = statusFilter === "All" || status === statusFilter;
            const matchesType = typeFilter === "All" || getPropertyType(property) === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [properties, searchTerm, statusFilter, typeFilter]);

    const totalProperties = properties.length;
    const publishedProperties = properties.filter(p => getListingStatus(p).toLowerCase() === "published").length;
    const pendingProperties = properties.filter(p => AWAITING_ACTION_STATUSES.includes(getListingStatus(p).toLowerCase())).length;

    /*
    =========================================================
    RENDER
    =========================================================
    */
    return (
        <div className="property-management-page">
            <DashboardSidebar />

            <main className="property-management-main">
                <PropertyTabs />
                
                {/* SUCCESS TOAST NOTIFICATION */}
                {toastMessage && (
                    <div style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        background: "#f0fdf4",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                        padding: "15px 25px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontWeight: "600",
                        animation: "slideIn 0.3s ease-out"
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {toastMessage}
                    </div>
                )}

                <header className="property-management-header">
                    <div>
                        <p className="property-management-eyebrow">VALORA / PROPERTY MANAGEMENT</p>
                        <h1>Property Management</h1>
                        <p className="property-management-subtitle">View and manage property records across the community.</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button type="button" className="property-refresh-button" onClick={loadProperties} disabled={loading}>
                            <span aria-hidden="true">↻</span> {loading ? "Loading..." : "Refresh"}
                        </button>
                        <button type="button" className="property-add-button" onClick={() => { setNewPhotos([]); setPhotoError(""); setIsAddModalOpen(true); }}>
                            + Add Property
                        </button>
                    </div>
                </header>
            
                {/* SUMMARY */}
                <StageSummary
                    eyebrow="Listing status"
                    title={`${publishedProperties} of ${totalProperties} ${totalProperties === 1 ? "property" : "properties"} published`}
                    subtitle="Where every property in the estate stands."
                    stages={[
                        { key: "published", label: "Published", hint: "Approved and live", count: publishedProperties, tone: "done" },
                        { key: "action", label: "Awaiting action", hint: "Pending or assigned", count: pendingProperties, tone: "waiting" },
                        { key: "unlisted", label: "Not listed", hint: "Not on the market", count: Math.max(totalProperties - publishedProperties - pendingProperties, 0), tone: "neutral" },
                    ]}
                />

                {/* SEARCH AND FILTERS */}
                <section className="property-management-toolbar">
                    <div className="property-search">
                        <span className="property-search-icon" aria-hidden="true">⌕</span>
                        <input type="search" aria-label="Search properties" placeholder="Search by property ID, name or location..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
                    </div>
                    <div className="property-filter">
                        <label htmlFor="property-status-filter">Status</label>
                        <select id="property-status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
                            <option value="All">All statuses</option>
                            {propertyStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <div className="property-filter">
                        <label htmlFor="property-type-filter">Property Type</label>
                        <select id="property-type-filter" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>
                            <option value="All">All types</option>
                            {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </section>

                {/* RESULTS */}
                <section className="property-results-section">
                    <div className="property-results-header">
                        <div>
                            <h2>Property Records</h2>
                            <p>{loading ? "Retrieving property records..." : `${filteredProperties.length} ${filteredProperties.length === 1 ? "property" : "properties"} found`}</p>
                        </div>
                    </div>

                    {loading && <div className="property-state-card" role="status"><div className="property-loading-spinner" /><h3>Loading properties</h3><p>Please wait while property records are retrieved.</p></div>}
                    {!loading && error && <div className="property-state-card property-error-state" role="alert"><div className="property-empty-icon">!</div><h3>Unable to load properties</h3><p>{error}</p><button type="button" className="property-primary-button" onClick={loadProperties}>Try Again</button></div>}
                    {!loading && !error && properties.length === 0 && <div className="property-state-card"><div className="property-empty-icon"><span aria-hidden="true">⌂</span></div><h3>No property records found</h3><p>Property records will appear here once they are available from the VALORA database.</p></div>}
                    {!loading && !error && properties.length > 0 && filteredProperties.length === 0 && <div className="property-state-card"><div className="property-empty-icon"><span aria-hidden="true">⌕</span></div><h3>No matching properties</h3><p>Try changing your search term or selected filters.</p><button type="button" className="property-secondary-button" onClick={() => { setSearchTerm(""); setStatusFilter("All"); setTypeFilter("All"); }}>Clear Filters</button></div>}

                    {!loading && !error && filteredProperties.length > 0 && (
                        <div className="property-management-grid">
                            {filteredProperties.map((property, index) => {
                                const propertyId = property.id || property.unit_id;
                                const complexName = property.complex_name || "";
                                const unitNo = property.unit_no || property.complex_name || `Property ${propertyId || index + 1}`;
                                const image = getPropertyImage(property);
                                const status = getListingStatus(property);
                                const price = getListingPrice(property);

                                return (
                                    <article className="managed-property-card" key={propertyId || `property-${index}`}>
                                        <div className="managed-property-image">
                                            {image && !brokenImages.includes(image) ? (
                                                <img
                                                    src={image}
                                                    alt={complexName}
                                                    onError={() => setBrokenImages(previous => (previous.includes(image) ? previous : [...previous, image]))}
                                                />
                                            ) : <div className="managed-property-image-placeholder"><span aria-hidden="true">⌂</span><p>No image available</p></div>}
                                            <span className={`property-status-badge status-${getStatusClass(status)}`}>{status}</span>
                                        </div>

                                        <div className="managed-property-content">
                                            <div className="managed-property-title-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                                                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827"}}>{complexName}</h3>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                                    <span style={{ color: "#9ca3af", fontSize: "0.95rem"}}>{unitNo}</span>
                                                    <span style={{ color: "#9ca3af", fontSize: "0.75rem"}}>•</span>
                                                    <p className="managed-property-id" style={{ margin: 0, color: "#6b7280", fontSize: "0.85rem"}}>ID: {propertyId || "Not assigned"}</p>
                                                </div>
                                            </div>
                                            <p className="managed-property-location"><span aria-hidden="true">⌖</span> {getLocation(property)}</p>
                                            <div className="managed-property-details">
                                                <span>{getPropertyType(property)}</span>
                                                {property.bedrooms != null && <span>{property.bedrooms} bed</span>}
                                                {property.bathrooms != null && <span>{property.bathrooms} bath</span>}
                                                {property.size_m2 != null && <span>{property.size_m2} m²</span>}
                                            </div>

                                            <div className="managed-property-footer">
                                                <div>
                                                    <span className="managed-property-price-label">Listing Price</span>
                                                    <strong>{price || "Not specified"}</strong>
                                                </div>

                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button 
                                                        type="button" 
                                                        className="property-view-button"
                                                        style={{ backgroundColor: "#f5f3f7", color: "#563f6b" }}
                                                        onClick={() => openEditModal(property)}
                                                    >
                                                        Edit
                                                    </button>

                                                    {propertyId ? (
                                                        <Link className="property-view-button" to={`/property/${encodeURIComponent(String(propertyId))}`}>
                                                            View Details <span aria-hidden="true">→</span>
                                                        </Link>
                                                    ) : (
                                                        <button type="button" className="property-view-button" disabled>View Details</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* EDIT PROPERTY MODAL */}
                {isEditModalOpen && (
                    <div className="valora-modal-overlay">
                        <div className="valora-modal" style={{ maxWidth: "600px" }}>
                            <h3>Edit Property: {editingProperty?.unit_no}</h3>
                            <form onSubmit={handleUpdateProperty} style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
                                
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div>
                                        <label>Unit Number</label>
                                        <input value={editForm.unit_no} onChange={e => setEditForm({...editForm, unit_no: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} required />
                                    </div>
                                    <div>
                                        <label>Complex Name</label>
                                        <input value={editForm.complex_name} onChange={e => setEditForm({...editForm, complex_name: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} required />
                                    </div>
                                </div>

                                <div>
                                    <label>Street Address</label>
                                    <input value={editForm.street_address} onChange={e => setEditForm({...editForm, street_address: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} required />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div>
                                        <label>Size (m²)</label>
                                        <input type="number" value={editForm.size_m2} onChange={e => setEditForm({...editForm, size_m2: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
                                    </div>
                                    <div>
                                        <label>Suburb</label>
                                        <input value={editForm.suburb} onChange={e => setEditForm({...editForm, suburb: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div>
                                        <label>Bedrooms</label>
                                        <input type="number" value={editForm.bedrooms} onChange={e => setEditForm({...editForm, bedrooms: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
                                    </div>
                                    <div>
                                        <label>Bathrooms</label>
                                        <input type="number" value={editForm.bathrooms} onChange={e => setEditForm({...editForm, bathrooms: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
                                    </div>
                                </div>

                                <div>
                                    <label>Photos ({(editingProperty?.photos || []).length})</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
                                        {(editingProperty?.photos || []).map((photo, index) => (
                                            <div key={photo.id} style={{ position: "relative", width: "96px", height: "72px" }}>
                                                {photo.available === false || brokenImages.includes(photoSrc(photo.url)) ? (
                                                    <div
                                                        title="This photo's image is missing. Remove it and upload it again."
                                                        style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", textAlign: "center", borderRadius: "6px", border: "1px dashed #cfc3da", background: "#f5f3f7", color: "#8f8698", fontSize: "10px", lineHeight: 1.3 }}
                                                    >
                                                        Image<br />missing
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={photoSrc(photo.url)}
                                                        alt={`Property photo ${index + 1}`}
                                                        onError={() => {
                                                            const src = photoSrc(photo.url);
                                                            setBrokenImages(previous => (previous.includes(src) ? previous : [...previous, src]));
                                                        }}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px", border: "1px solid #ddd" }}
                                                    />
                                                )}
                                                {index === 0 && (
                                                    <span style={{ position: "absolute", left: "4px", bottom: "4px", background: "#563f6b", color: "#fff", fontSize: "10px", padding: "1px 5px", borderRadius: "4px" }}>
                                                        Cover
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    aria-label={`Remove photo ${index + 1}`}
                                                    disabled={photoBusy}
                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                    style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", border: "none", background: "#8a3b3b", color: "#fff", cursor: "pointer", lineHeight: "20px", padding: 0 }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="file"
                                        accept={IMAGE_ACCEPT}
                                        multiple
                                        disabled={photoBusy}
                                        onChange={handleUploadPhotos}
                                        style={{ marginTop: "10px" }}
                                    />
                                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "6px 0 0" }}>
                                        {photoBusy ? "Uploading..." : "JPEG, PNG or WebP, up to 4 MB each. The first photo is the cover image."}
                                    </p>
                                    {photoError && <p role="alert" style={{ fontSize: "12px", color: "#8a3b3b", margin: "6px 0 0" }}>{photoError}</p>}
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
                                        Cancel
                                    </button>
                                    <button type="submit" style={{ padding: "10px 15px", borderRadius: "6px", border: "none", background: "#563f6b", color: "white", cursor: "pointer" }}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ADD PROPERTY MODAL */}
                {isAddModalOpen && (
                    <div className="valora-modal-overlay">
                        <div className="valora-modal" style={{ maxWidth: "600px" }}>
                            <h3>Register New Property</h3>
                            <form onSubmit={handleAddProperty} style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div><label>Unit Number</label><input value={addForm.unit_no} onChange={e => setAddForm({...addForm, unit_no: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} required /></div>
                                    <div><label>Complex Name</label><input value={addForm.complex_name} onChange={e => setAddForm({...addForm, complex_name: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} required /></div>
                                </div>
                                <div><label>Street Address</label><input value={addForm.street_address} onChange={e => setAddForm({...addForm, street_address: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} required /></div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div><label>Size (m²)</label><input type="number" value={addForm.size_m2} onChange={e => setAddForm({...addForm, size_m2: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} /></div>
                                    <div><label>Suburb</label><input value={addForm.suburb} onChange={e => setAddForm({...addForm, suburb: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} /></div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div><label>Bedrooms</label><input type="number" value={addForm.bedrooms} onChange={e => setAddForm({...addForm, bedrooms: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} /></div>
                                    <div><label>Bathrooms</label><input type="number" value={addForm.bathrooms} onChange={e => setAddForm({...addForm, bathrooms: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} /></div>
                                </div>
                                <div>
                                    <label>Photos (optional)</label>
                                    <input
                                        type="file"
                                        accept={IMAGE_ACCEPT}
                                        multiple
                                        onChange={handlePickNewPhotos}
                                        style={{ display: "block", marginTop: "10px" }}
                                    />
                                    {newPhotos.length > 0 && (
                                        <p style={{ fontSize: "12px", color: "#6b7280", margin: "6px 0 0" }}>
                                            {newPhotos.map(file => file.name).join(", ")}
                                            {" "}
                                            <button type="button" onClick={() => setNewPhotos([])} style={{ border: "none", background: "none", color: "#563f6b", cursor: "pointer", padding: 0 }}>Clear</button>
                                        </p>
                                    )}
                                    {photoError && <p role="alert" style={{ fontSize: "12px", color: "#8a3b3b", margin: "6px 0 0" }}>{photoError}</p>}
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #ddd", background: "white", cursor: "pointer" }}>Cancel</button>
                                    <button type="submit" style={{ padding: "10px 15px", borderRadius: "6px", border: "none", background: "#563f6b", color: "white", cursor: "pointer" }}>Add Property</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PropertyManagement;
