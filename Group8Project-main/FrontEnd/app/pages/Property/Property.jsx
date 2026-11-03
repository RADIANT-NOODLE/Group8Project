import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiRequest } from "../../services/apiClient";
import { listListings } from "../../services/listingApi";
import { getProperty, photoSrc } from "../../services/propertyApi";
import { dashboardPathForRole } from "../../services/roleMap";
import { getStoredUser, updateSessionUser, useSession } from "../../services/session";
import { LISTING_STATUSES, listingStatusLabel, toStatus } from "../../services/statusMap";
import "./Property.css";

/*
=========================================================
VALORA PROPERTY DETAIL PAGE

One template for every unit: it is built only from what the
API knows about the unit (details + photos) and its listing
(price, description, agent), so new properties need nothing
extra to look complete.
=========================================================
*/

const ICONS = {
    bed: (
        <>
            <path d="M4 18v-6h16v6" />
            <path d="M4 12V8h16v4" />
            <path d="M7 10v2M17 10v2" />
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
    area: <path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6" />,
    pin: (
        <>
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </>
    ),
    home: (
        <>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
        </>
    ),
    heart: <path d="M12 20s-7-4.4-9-9.2C1.7 7.6 3.7 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.3 0 5.3 3.1 4 6.3-2 4.8-9 9.2-9 9.2Z" />,
    eye: (
        <>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    back: (
        <>
            <path d="M19 12H5" />
            <path d="m11 6-6 6 6 6" />
        </>
    ),
    send: (
        <>
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        </>
    ),
};

function Icon({ name, size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONS[name]}
        </svg>
    );
}

function formatPrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return null;
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(number);
}

/* The listing to show: an active one first, otherwise the most recent. */
function pickListing(listings) {
    if (!listings.length) return null;
    const active = listings.find((item) => toStatus(LISTING_STATUSES, item.status) === "active");
    if (active) return active;
    return [...listings].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
}

/* A readable summary built from the unit's own details. */
function describe(property) {
    const facts = [
        property.bedrooms != null && `${property.bedrooms}-bedroom`,
        property.bathrooms != null && `${property.bathrooms}-bathroom`,
    ].filter(Boolean);
    const size = property.sizeM2 ? ` of ${Number(property.sizeM2)} m²` : "";
    const where = [property.streetAddress, property.suburb].filter(Boolean).join(", ");

    return `Unit ${property.unitNo} is a ${facts.length ? `${facts.join(", ")} ` : ""}home${size} in ${
        property.complexName || "a VALORA development"
    }${where ? `, ${where}` : ""}.`;
}

function PublicHeader({ user }) {
    return (
        <header className="pd-header">
            <Link to="/" className="pd-logo" aria-label="VALORA home">
                <img src="/assets/valora-logo-white.png" alt="VALORA" />
            </Link>
            <nav className="pd-header-actions" aria-label="Account">
                {user ? (
                    <Link to={dashboardPathForRole(user.role)} className="pd-header-button is-solid">
                        My dashboard
                    </Link>
                ) : (
                    <>
                        <Link to="/login" className="pd-header-button">Login</Link>
                        <Link to="/register" className="pd-header-button is-solid">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}

export default function Property() {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const { user } = useSession();

    const [property, setProperty] = useState(null);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activePhoto, setActivePhoto] = useState(0);
    // photos whose file could not be loaded (e.g. uploaded on another machine)
    const [brokenPhotos, setBrokenPhotos] = useState([]);
    const [isSaved, setIsSaved] = useState(false);

    const [enquiry, setEnquiry] = useState({ contact: "", message: "" });
    const [enquiryState, setEnquiryState] = useState({ sending: false, sent: false, error: "" });

    /* ----- load the unit and its listing ----- */
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setNotFound(false);
            setActivePhoto(0);
            setBrokenPhotos([]);

            try {
                const unit = await getProperty(propertyId);
                if (cancelled) return;
                setProperty(unit);

                try {
                    const { items } = await listListings({ unitId: unit.id, pageSize: 10 });
                    if (!cancelled) setListing(pickListing(items));
                } catch {
                    if (!cancelled) setListing(null); // no listing info is not an error for the page
                }
            } catch (err) {
                console.error("Error fetching property:", err);
                if (!cancelled) {
                    setProperty(null);
                    setNotFound(true);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [propertyId]);

    /* ----- saved properties live on the signed-in profile ----- */
    useEffect(() => {
        const stored = getStoredUser();
        const saved = Array.isArray(stored?.savedProperties) ? stored.savedProperties : [];
        setIsSaved(Boolean(property) && saved.some((id) => String(id) === String(property.id)));
    }, [property, user]);

    function toggleSave() {
        const stored = getStoredUser();
        if (!stored?.hoa_approved) {
            navigate("/login");
            return;
        }
        const saved = Array.isArray(stored.savedProperties) ? stored.savedProperties : [];
        const next = isSaved
            ? saved.filter((id) => String(id) !== String(property.id))
            : [...saved, property.id];
        updateSessionUser({ savedProperties: next });
        setIsSaved(!isSaved);
    }

    async function sendEnquiry(event) {
        event.preventDefault();
        const stored = getStoredUser();
        if (!stored || !listing) return;

        setEnquiryState({ sending: true, sent: false, error: "" });
        try {
            await apiRequest("/api/v1/inquiries", {
                method: "POST",
                body: {
                    property_id: property.id,
                    agent_id: listing.agentId,
                    buyer_name: stored.full_name || stored.fullName || "VALORA user",
                    buyer_email: stored.email,
                    buyer_contact: enquiry.contact.trim() || stored.phoneno || null,
                    message: enquiry.message.trim() || null,
                },
            });
            setEnquiry({ contact: "", message: "" });
            setEnquiryState({ sending: false, sent: true, error: "" });
        } catch (err) {
            setEnquiryState({
                sending: false,
                sent: false,
                error: err?.message || "Your enquiry could not be sent. Please try again.",
            });
        }
    }

    /* ----- loading ----- */
    if (loading) {
        return (
            <div className="pd-page">
                <PublicHeader user={user} />
                <main className="pd-main" aria-busy="true">
                    <span className="pd-visually-hidden" role="status">Loading property details…</span>
                    <div className="pd-skeleton pd-skeleton-back" />
                    <div className="pd-skeleton pd-skeleton-gallery" />
                    <div className="pd-layout">
                        <div className="pd-content">
                            <div className="pd-skeleton pd-skeleton-line short" />
                            <div className="pd-skeleton pd-skeleton-title" />
                            <div className="pd-skeleton pd-skeleton-line" />
                            <div className="pd-skeleton-chips">
                                {[0, 1, 2].map((index) => <div key={index} className="pd-skeleton pd-skeleton-chip" />)}
                            </div>
                            <div className="pd-skeleton pd-skeleton-block" />
                        </div>
                        <aside className="pd-aside">
                            <div className="pd-skeleton pd-skeleton-card" />
                        </aside>
                    </div>
                </main>
            </div>
        );
    }

    /* ----- not found ----- */
    if (notFound || !property) {
        return (
            <div className="pd-page">
                <PublicHeader user={user} />
                <main className="pd-main">
                    <section className="pd-not-found">
                        <span className="pd-not-found-icon"><Icon name="home" size={34} /></span>
                        <h1>Property not found</h1>
                        <p>This property could not be found. It may have been removed, or the link may be incorrect.</p>
                        <div className="pd-not-found-actions">
                            <button type="button" className="pd-button is-ghost" onClick={() => navigate(-1)}>Go back</button>
                            <Link to="/properties" className="pd-button is-solid">Browse properties</Link>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    /* ----- page ----- */
    const allPhotos = property.photos.map((photo) => photoSrc(photo.url)).filter(Boolean);
    if (!allPhotos.length && property.imageUrl) allPhotos.push(photoSrc(property.imageUrl));
    const photos = allPhotos.filter((src) => !brokenPhotos.includes(src));
    const markBroken = (src) => setBrokenPhotos((previous) => (previous.includes(src) ? previous : [...previous, src]));
    const mainPhoto = photos[Math.min(activePhoto, photos.length - 1)];

    const listingStatus = listing ? toStatus(LISTING_STATUSES, listing.status) : "";
    const isOnMarket = listingStatus === "active";
    const price = listing ? formatPrice(listing.price) : null;
    const statusText = !listing ? "Not listed" : isOnMarket ? "On the market" : listingStatusLabel(listing.status);

    const facts = [
        { icon: "bed", label: "Bedrooms", value: property.bedrooms },
        { icon: "bath", label: "Bathrooms", value: property.bathrooms },
        { icon: "area", label: "Floor area", value: property.sizeM2 ? `${Number(property.sizeM2)} m²` : null },
    ];

    const details = [
        ["Unit number", property.unitNo],
        ["Development", property.complexName],
        ["Street address", property.streetAddress],
        ["Suburb", property.suburb],
        ["Floor area", property.sizeM2 ? `${Number(property.sizeM2)} m²` : null],
        ["Bedrooms", property.bedrooms],
        ["Bathrooms", property.bathrooms],
    ];

    const signedIn = Boolean(user);

    return (
        <div className="pd-page">
            <PublicHeader user={user} />

            <main className="pd-main">
                <button type="button" className="pd-back" onClick={() => navigate(-1)}>
                    <Icon name="back" size={16} /> Back
                </button>

                {/* GALLERY */}
                <section className={`pd-gallery${photos.length > 1 ? " has-thumbs" : ""}`} aria-label="Property photos">
                    {mainPhoto ? (
                        <img
                            className="pd-gallery-main"
                            src={mainPhoto}
                            alt={`${property.complexName}, unit ${property.unitNo}`}
                            onError={() => markBroken(mainPhoto)}
                        />
                    ) : (
                        <div className="pd-gallery-empty">
                            <span><Icon name="home" size={36} /></span>
                            <strong>Photos coming soon</strong>
                            <small>Approved photographs of this unit will appear here.</small>
                        </div>
                    )}

                    {photos.length > 1 && (
                        <ul className="pd-gallery-thumbs">
                            {photos.map((src, index) => (
                                <li key={src}>
                                    <button
                                        type="button"
                                        className={index === activePhoto ? "is-active" : undefined}
                                        onClick={() => setActivePhoto(index)}
                                        aria-label={`Show photo ${index + 1} of ${photos.length}`}
                                        aria-pressed={index === activePhoto}
                                    >
                                        <img src={src} alt="" onError={() => markBroken(src)} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <span className={`pd-gallery-badge${isOnMarket ? " is-live" : ""}`}>{statusText}</span>
                </section>

                <div className="pd-layout">
                    {/* MAIN COLUMN */}
                    <div className="pd-content">
                        <p className="pd-eyebrow">Unit {property.unitNo}</p>
                        <h1 className="pd-title">{property.complexName || "VALORA property"}</h1>
                        <p className="pd-address">
                            <Icon name="pin" size={17} />
                            {[property.streetAddress, property.suburb].filter(Boolean).join(", ") || "Address not provided"}
                        </p>

                        <ul className="pd-facts">
                            {facts.map((fact) => (
                                <li key={fact.label}>
                                    <span className="pd-fact-icon"><Icon name={fact.icon} size={19} /></span>
                                    <span>
                                        <strong>{fact.value ?? "—"}</strong>
                                        <small>{fact.label}</small>
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <section className="pd-section">
                            <h2>About this property</h2>
                            <p className="pd-description">{listing?.description || describe(property)}</p>
                        </section>

                        <section className="pd-section">
                            <h2>Property details</h2>
                            <dl className="pd-details">
                                {details.map(([label, value]) => (
                                    <div key={label}>
                                        <dt>{label}</dt>
                                        <dd>{value ?? "Not specified"}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    </div>

                    {/* SIDE PANEL */}
                    <aside className="pd-aside">
                        <section className="pd-card pd-price-card" aria-label="Price and status">
                            <span className={`pd-status${isOnMarket ? " is-live" : ""}`}>{statusText}</span>
                            <p className="pd-price">{price || "Price on request"}</p>
                            <p className="pd-price-note">
                                {isOnMarket
                                    ? "Listed by a VALORA estate agent."
                                    : listing
                                        ? "This listing is no longer active."
                                        : "This unit is not on the market right now."}
                            </p>

                            <button
                                type="button"
                                className={`pd-button pd-save${isSaved ? " is-saved" : ""}`}
                                onClick={toggleSave}
                                aria-pressed={isSaved}
                            >
                                <Icon name="heart" size={17} />
                                {isSaved ? "Saved" : "Save property"}
                            </button>

                            {listing?.views != null && (
                                <p className="pd-views"><Icon name="eye" size={15} /> {listing.views} {listing.views === 1 ? "view" : "views"}</p>
                            )}
                        </section>

                        <section className="pd-card pd-contact-card" aria-labelledby="pd-contact-title">
                            <h2 id="pd-contact-title">Interested in this unit?</h2>

                            {!isOnMarket ? (
                                <p className="pd-contact-note">
                                    Enquiries open when this unit is listed. Save it to find it again quickly.
                                </p>
                            ) : !signedIn ? (
                                <>
                                    <p className="pd-contact-note">Log in or register to send the estate agent an enquiry.</p>
                                    <div className="pd-contact-actions">
                                        <Link to="/login" className="pd-button is-solid">Log in</Link>
                                        <Link to="/register" className="pd-button is-ghost">Register</Link>
                                    </div>
                                </>
                            ) : enquiryState.sent ? (
                                <p className="pd-contact-success" role="status">
                                    Your enquiry has been sent. The estate agent will be in touch.
                                </p>
                            ) : (
                                <form className="pd-enquiry" onSubmit={sendEnquiry}>
                                    <p className="pd-contact-note">Send the listing agent a message about this unit.</p>
                                    <label htmlFor="pd-enquiry-contact">Phone number (optional)</label>
                                    <input
                                        id="pd-enquiry-contact"
                                        type="tel"
                                        inputMode="tel"
                                        value={enquiry.contact}
                                        maxLength={50}
                                        placeholder="e.g. 082 123 4567"
                                        onChange={(event) => setEnquiry({ ...enquiry, contact: event.target.value })}
                                    />
                                    <label htmlFor="pd-enquiry-message">Message</label>
                                    <textarea
                                        id="pd-enquiry-message"
                                        rows={4}
                                        maxLength={5000}
                                        value={enquiry.message}
                                        placeholder="I'd like to arrange a viewing…"
                                        onChange={(event) => setEnquiry({ ...enquiry, message: event.target.value })}
                                    />
                                    {enquiryState.error && <p className="pd-contact-error" role="alert">{enquiryState.error}</p>}
                                    <button type="submit" className="pd-button is-solid" disabled={enquiryState.sending}>
                                        <Icon name="send" size={16} />
                                        {enquiryState.sending ? "Sending…" : "Send enquiry"}
                                    </button>
                                </form>
                            )}
                        </section>
                    </aside>
                </div>
            </main>

            <footer className="pd-footer">
                <p>© {new Date().getFullYear()} VALORA — Property Intelligence</p>
            </footer>
        </div>
    );
}
