import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ValoraLogo from "./ValoraLogo";

import { formatListingPrice, isRental } from "../services/publicListings";
import { me as fetchCurrentUser } from "../services/authApi";
import { dashboardPathForRole, ROLES } from "../services/roleMap";
import { updateSessionUser, useSession } from "../services/session";
import "../pages/Landing.css";

/*
=========================================================
PUBLIC SITE PIECES

Header, footer and listed-property card shared by the home
page and the Properties page, so the two always match.
Styles live in pages/Landing.css ("lp-" classes).
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

export function SiteIcon({ name, size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICON_PATHS[name]}
        </svg>
    );
}

/* On the home page the section links scroll; elsewhere they go back to the home page section.
   A signed-in visitor sees a way back to their dashboard instead of Log in / Register.
   A resident still waiting for approval has no dashboard yet, so they only get Log out. */
export function PublicHeader({ current = "home" }) {
    const section = (hash) => (current === "home" ? `#${hash}` : `/#${hash}`);
    const { user, token, logout } = useSession();
    const awaitingApproval = user?.role === ROLES.resident && user.hoa_approved !== true;

    // the HOA may have approved them since they signed in, so ask rather than trust the stored copy
    useEffect(() => {
        if (!awaitingApproval || !token) return undefined;
        let cancelled = false;
        fetchCurrentUser(token)
            .then((latest) => {
                if (!cancelled && latest?.hoa_approved === true) updateSessionUser({ hoa_approved: true });
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [awaitingApproval, token]);

    return (
        <header className="lp-header">
            <Link to="/" className="lp-logo" aria-label="VALORA home">
                <ValoraLogo alt="VALORA" />
            </Link>

            <nav className="lp-nav" aria-label="Main">
                <Link to="/properties" className={current === "properties" ? "is-current" : undefined} aria-current={current === "properties" ? "page" : undefined}>
                    Properties
                </Link>
                <a href={section("features")}>Features</a>
                <a href={section("how-it-works")}>How it works</a>
                <a href={section("about")}>About</a>
            </nav>

            <div className="lp-header-actions">
                {awaitingApproval ? (
                    <button type="button" className="lp-button lp-button-ghost" onClick={logout}>Log out</button>
                ) : user ? (
                    <Link to={dashboardPathForRole(user.role)} className="lp-button lp-button-solid">My dashboard</Link>
                ) : (
                    <>
                        <Link to="/login" className="lp-button lp-button-ghost">Log in</Link>
                        <Link to="/register" className="lp-button lp-button-solid">Register</Link>
                    </>
                )}
            </div>
        </header>
    );
}

export function PublicFooter() {
    return (
        <footer className="lp-footer">
            <img src="/assets/valora-logo-white.png" alt="VALORA" className="lp-footer-logo" />
            <nav aria-label="Footer">
                <Link to="/properties">Properties</Link>
                <a href="/#features">Features</a>
                <a href="/#how-it-works">How it works</a>
                <Link to="/login">Log in</Link>
                <Link to="/register">Register</Link>
                <Link to="/terms">Terms &amp; Privacy</Link>
            </nav>
            <p>© {new Date().getFullYear()} VALORA — Property Intelligence</p>
        </footer>
    );
}

/* One listed unit: photo (or placeholder), sale/rent tag, price and key facts. */
export function ListedPropertyCard({ property }) {
    const [photoFailed, setPhotoFailed] = useState(false);
    const showPhoto = property.photo && !photoFailed;

    return (
        <Link to={`/property/${property.id}`} className="lp-property">
            <div className="lp-property-media">
                {showPhoto ? (
                    <img
                        src={property.photo}
                        alt={`${property.title}, unit ${property.unitNumber}`}
                        onError={() => setPhotoFailed(true)}
                    />
                ) : (
                    <span className="lp-property-placeholder">
                        <SiteIcon name="home" size={34} />
                        <small>Photos coming soon</small>
                    </span>
                )}
                <span className="lp-property-tag">{isRental(property) ? "For rent" : "For sale"}</span>
            </div>
            <div className="lp-property-body">
                <p className="lp-property-price">{formatListingPrice(property.listing)}</p>
                <h3>{property.title}</h3>
                <p className="lp-property-location">
                    <SiteIcon name="pin" size={15} /> {property.location || "VALORA estate"}
                </p>
                <ul className="lp-property-facts">
                    <li>Unit {property.unitNumber}</li>
                    {property.bedrooms != null && (
                        <li><SiteIcon name="bed" size={15} /> {property.bedrooms} bed</li>
                    )}
                    {property.bathrooms != null && (
                        <li><SiteIcon name="bath" size={15} /> {property.bathrooms} bath</li>
                    )}
                    {property.sizeM2 ? <li>{Number(property.sizeM2)} m²</li> : null}
                </ul>
            </div>
        </Link>
    );
}

/* Shimmering cards shown while listings load. */
export function ListedPropertySkeletons({ count = 3 }) {
    return Array.from({ length: count }, (_, index) => (
        <div key={index} className="lp-property lp-property-skeleton" aria-hidden="true">
            <div className="lp-skeleton lp-skeleton-media" />
            <div className="lp-property-body">
                <div className="lp-skeleton lp-skeleton-line short" />
                <div className="lp-skeleton lp-skeleton-line" />
                <div className="lp-skeleton lp-skeleton-line medium" />
            </div>
        </div>
    ));
}
