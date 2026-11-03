import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    ListedPropertyCard,
    ListedPropertySkeletons,
    PublicFooter,
    PublicHeader,
    SiteIcon,
} from "../../components/PublicSite";
import { isRental, loadListedProperties } from "../../services/publicListings";
import "./Properties.css";

/*
=========================================================
PROPERTIES

Every unit currently listed for sale or rent. A unit only
appears here once an estate agent has published it; each
card says whether it is for sale or for rent.
=========================================================
*/

const TYPE_TABS = [
    { value: "all", label: "All" },
    { value: "sale", label: "For sale" },
    { value: "rent", label: "For rent" },
];

const SORTS = [
    { value: "newest", label: "Newest first" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
];

function Properties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [minBedrooms, setMinBedrooms] = useState(0);
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        let cancelled = false;

        loadListedProperties()
            .then((listed) => {
                if (!cancelled) setProperties(listed);
            })
            .catch((err) => {
                console.error("Failed to load listed properties:", err);
                if (!cancelled) setLoadError("Listed properties could not be loaded. Please try again shortly.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const counts = {
        all: properties.length,
        sale: properties.filter((property) => !isRental(property)).length,
        rent: properties.filter((property) => isRental(property)).length,
    };

    const shown = useMemo(() => {
        const term = search.trim().toLowerCase();

        const matches = properties.filter((property) => {
            if (type === "rent" && !isRental(property)) return false;
            if (type === "sale" && isRental(property)) return false;
            if (minBedrooms && Number(property.bedrooms || 0) < minBedrooms) return false;
            if (!term) return true;
            return [property.title, property.location, `unit ${property.unitNumber}`]
                .some((value) => String(value || "").toLowerCase().includes(term));
        });

        const price = (property) => Number(property.listing?.price) || 0;
        if (sort === "price-asc") return [...matches].sort((a, b) => price(a) - price(b));
        if (sort === "price-desc") return [...matches].sort((a, b) => price(b) - price(a));
        return matches; // already newest first
    }, [properties, search, type, minBedrooms, sort]);

    const filtersActive = Boolean(search.trim()) || type !== "all" || minBedrooms > 0;

    function clearFilters() {
        setSearch("");
        setType("all");
        setMinBedrooms(0);
    }

    return (
        <div className="lp">
            <PublicHeader current="properties" />

            <main>
                {/* PAGE BANNER */}
                <section className="props-banner">
                    <span className="lp-eyebrow">On the market</span>
                    <h1>Properties for sale and rent</h1>
                    <p>
                        {loading
                            ? "Loading listed properties…"
                            : properties.length === 0
                                ? "No units are listed right now. Check back soon."
                                : `${properties.length} ${properties.length === 1 ? "unit is" : "units are"} listed across VALORA estates — ${counts.sale} for sale and ${counts.rent} for rent.`}
                    </p>
                </section>

                <section className="props-content" aria-label="Listed properties">
                    {/* TOOLBAR */}
                    <div className="props-toolbar">
                        <label className="props-search">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-3.5-3.5" />
                            </svg>
                            <span className="props-visually-hidden">Search properties</span>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by development, address or unit…"
                            />
                        </label>

                        <div className="props-tabs" role="group" aria-label="Sale or rent">
                            {TYPE_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    className={type === tab.value ? "is-active" : undefined}
                                    aria-pressed={type === tab.value}
                                    onClick={() => setType(tab.value)}
                                >
                                    {tab.label}
                                    <span>{counts[tab.value]}</span>
                                </button>
                            ))}
                        </div>

                        <label className="props-select">
                            <span>Bedrooms</span>
                            <select value={minBedrooms} onChange={(event) => setMinBedrooms(Number(event.target.value))}>
                                <option value={0}>Any</option>
                                <option value={1}>1+</option>
                                <option value={2}>2+</option>
                                <option value={3}>3+</option>
                            </select>
                        </label>

                        <label className="props-select">
                            <span>Sort</span>
                            <select value={sort} onChange={(event) => setSort(event.target.value)}>
                                {SORTS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* RESULTS */}
                    {loading ? (
                        <div className="lp-property-grid">
                            <ListedPropertySkeletons count={6} />
                        </div>
                    ) : loadError ? (
                        <div className="lp-empty">
                            <span className="lp-empty-icon"><SiteIcon name="home" size={26} /></span>
                            <h3>Something went wrong</h3>
                            <p>{loadError}</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="lp-empty">
                            <span className="lp-empty-icon"><SiteIcon name="home" size={26} /></span>
                            <h3>No properties are listed right now</h3>
                            <p>New listings appear here as soon as an estate agent publishes them.</p>
                            <Link to="/register" className="lp-button lp-button-solid props-empty-action">Register for updates</Link>
                        </div>
                    ) : shown.length === 0 ? (
                        <div className="lp-empty">
                            <span className="lp-empty-icon"><SiteIcon name="home" size={26} /></span>
                            <h3>No properties match your filters</h3>
                            <p>Try a different search, or clear the filters to see every listed unit.</p>
                            <button type="button" className="lp-button lp-button-ghost props-empty-action" onClick={clearFilters}>
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="props-count">
                                Showing {shown.length} of {properties.length} listed {properties.length === 1 ? "property" : "properties"}
                                {filtersActive && (
                                    <button type="button" onClick={clearFilters}>Clear filters</button>
                                )}
                            </p>
                            <div className="lp-property-grid">
                                {shown.map((property) => (
                                    <ListedPropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

export default Properties;
