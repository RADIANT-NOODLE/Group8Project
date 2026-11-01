import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { listAnnouncements } from "../../services/announcementApi";
import "./Announcements.css";

/**
 * Published announcements from the API. The API only returns what a resident
 * may see (published and not expired), so nothing is filtered here.
 */
async function readAnnouncements() {
    const page = await listAnnouncements({ pageSize: 100 });

    return page.items.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.message,
        category: announcement.category,
        status: "Published",
        date: announcement.createdAt,
        createdAt: announcement.createdAt,
        expiresAt: announcement.expiresAt,
    }));
}

function getAnnouncementDate(announcement) {
    return (
        announcement.date ||
        announcement.publishedAt ||
        announcement.createdAt ||
        ""
    );
}

function formatDate(value) {
    if (!value) {
        return "Date not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        // Preserve dates stored as readable text by the admin page.
        return String(value);
    }

    return date.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getCategoryName(category) {
    if (!category) {
        return "Community";
    }

    return String(category)
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCategoryIcon(category) {
    const value = String(category || "").toLowerCase();

    if (value.includes("maintenance") || value.includes("repair")) {
        return "maintenance";
    }

    if (value.includes("security") || value.includes("safety")) {
        return "security";
    }

    if (value.includes("parking")) {
        return "parking";
    }

    return "community";
}

function AnnouncementIcon({ type }) {
    const common = {
        viewBox: "0 0 24 24",
        "aria-hidden": true,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    if (type === "maintenance") {
        return (
            <svg {...common}>
                <path d="M14.5 5.5a4 4 0 0 0-5.1 5.1L4 16a2.1 2.1 0 1 0 3 3l5.4-5.4a4 4 0 0 0 5.1-5.1l-2.4 2.4-2.1-2.1z" />
            </svg>
        );
    }

    if (type === "security") {
        return (
            <svg {...common}>
                <path d="M12 3.5 19 6v5.2c0 4.5-2.8 7.8-7 9.3-4.2-1.5-7-4.8-7-9.3V6z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        );
    }

    if (type === "parking") {
        return (
            <svg {...common}>
                <rect x="5" y="4" width="14" height="16" rx="2" />
                <path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <path d="M4 10v4h3l8 4V6l-8 4z" />
            <path d="M7 14l1.5 5h2L9 14M19 9.5a3.5 3.5 0 0 1 0 5" />
        </svg>
    );
}

function EmptyIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M4 10v4h3l8 4V6l-8 4z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M7 14l1.5 5h2L9 14M19 9.5a3.5 3.5 0 0 1 0 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect
                x="4"
                y="5"
                width="16"
                height="15"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M8 3v4M16 3v4M4 10h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle
                cx="10.5"
                cy="10.5"
                r="5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="m15 15 4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function FilterIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M4 6h16M7 12h10M10 18h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function Announcements() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [announcements, setAnnouncements] = useState([]);
    const [loadError, setLoadError] = useState("");

    const refreshAnnouncements = useCallback(async () => {
        try {
            setAnnouncements(await readAnnouncements());
            setLoadError("");
        } catch (error) {
            console.error("Unable to load community announcements:", error);
            setLoadError("Unable to load announcements right now. Please try again.");
        }
    }, []);

    useEffect(() => {
        refreshAnnouncements();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refreshAnnouncements();
            }
        };

        window.addEventListener("focus", refreshAnnouncements);
        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            window.removeEventListener("focus", refreshAnnouncements);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [refreshAnnouncements]);

    // Residents must not see drafts or unpublished announcements.
    const publishedAnnouncements = useMemo(() => {
        return announcements
            .filter(
                (announcement) =>
                    String(announcement.status || "").toLowerCase() ===
                    "published"
            )
            .sort((a, b) => {
                const dateA = new Date(getAnnouncementDate(a)).getTime();
                const dateB = new Date(getAnnouncementDate(b)).getTime();

                if (Number.isNaN(dateA) && Number.isNaN(dateB)) {
                    return 0;
                }

                if (Number.isNaN(dateA)) {
                    return 1;
                }

                if (Number.isNaN(dateB)) {
                    return -1;
                }

                return dateB - dateA;
            });
    }, [announcements]);

    const categories = useMemo(() => {
        const uniqueCategories = new Map();

        publishedAnnouncements.forEach((announcement) => {
            if (announcement.category) {
                const value = String(announcement.category).trim();
                const key = value.toLowerCase();

                if (key && !uniqueCategories.has(key)) {
                    uniqueCategories.set(key, value);
                }
            }
        });

        return [...uniqueCategories.entries()].sort((a, b) =>
            a[1].localeCompare(b[1])
        );
    }, [publishedAnnouncements]);

    const filteredAnnouncements = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return publishedAnnouncements.filter((announcement) => {
            const title = String(announcement.title || "").toLowerCase();
            const content = String(announcement.content || "").toLowerCase();
            const legacyDescription = String(
                announcement.description || ""
            ).toLowerCase();
            const categoryValue = String(
                announcement.category || ""
            ).toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                title.includes(normalizedSearch) ||
                content.includes(normalizedSearch) ||
                legacyDescription.includes(normalizedSearch) ||
                categoryValue.includes(normalizedSearch);

            const matchesCategory =
                category === "all" ||
                categoryValue === category.toLowerCase();

            return matchesSearch && matchesCategory;
        });
    }, [publishedAnnouncements, search, category]);

    return (
        <div className="announcements-layout">
            <DashboardSidebar />

            <main className="announcements-main">
                <header className="announcements-top-bar">
                    <div>
                        <p className="announcements-eyebrow">
                            RESIDENT PORTAL
                        </p>
                        <h1>Community Announcements</h1>
                        <p>
                            Stay informed about updates published by your HOA.
                        </p>
                    </div>
                </header>

                {loadError && (
                    <p className="announcements-load-error" role="alert">
                        {loadError}
                    </p>
                )}

                <section
                    className="announcements-panel announcements-controls"
                    aria-labelledby="announcements-section-title"
                >
                    <div className="announcements-panel-heading">
                        <div>
                            <h2 id="announcements-section-title">
                                Community Updates
                            </h2>
                            <p>
                                Browse published notices and important community
                                information.
                            </p>
                        </div>

                        <span className="announcements-count">
                            {filteredAnnouncements.length}{" "}
                            {filteredAnnouncements.length === 1
                                ? "announcement"
                                : "announcements"}
                        </span>
                    </div>

                    <div className="announcements-filters">
                        <label className="announcements-search">
                            <SearchIcon />
                            <input
                                type="search"
                                placeholder="Search announcements..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                aria-label="Search announcements"
                            />
                        </label>

                        <label className="announcements-select-wrapper">
                            <FilterIcon />
                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                aria-label="Filter announcements by category"
                            >
                                <option value="all">All Categories</option>

                                {categories.map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {getCategoryName(value)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </section>

                {filteredAnnouncements.length > 0 ? (
                    <section
                        className="announcement-grid"
                        aria-label="Published community announcements"
                    >
                        {filteredAnnouncements.map((announcement, index) => {
                            const categoryName = getCategoryName(
                                announcement.category
                            );
                            const date = getAnnouncementDate(announcement);
                            const content =
                                announcement.content ||
                                announcement.description ||
                                "";

                            return (
                                <article
                                    className="announcement-card"
                                    key={
                                        announcement.id ||
                                        `${announcement.title || "announcement"}-${index}`
                                    }
                                >
                                    <div className="announcement-top">
                                        <span className="announcement-icon">
                                            <AnnouncementIcon
                                                type={getCategoryIcon(
                                                    announcement.category
                                                )}
                                            />
                                        </span>

                                        <span className="announcement-published">
                                            Published
                                        </span>
                                    </div>

                                    <span className="announcement-category">
                                        {categoryName}
                                    </span>

                                    <h2>
                                        {announcement.title ||
                                            "Community Announcement"}
                                    </h2>

                                    <p className="announcement-description">
                                        {content ||
                                            "No additional details were provided."}
                                    </p>

                                    <div className="announcement-footer">
                                        <span className="announcement-date">
                                            <CalendarIcon />
                                            {formatDate(date)}
                                        </span>

                                        {announcement.author && (
                                            <span className="announcement-author">
                                                {announcement.author}
                                            </span>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                ) : (
                    <section className="announcements-empty">
                        <div className="announcements-empty-icon">
                            {search || category !== "all" ? (
                                <SearchIcon />
                            ) : (
                                <EmptyIcon />
                            )}
                        </div>

                        <h2>
                            {search || category !== "all"
                                ? "No matching announcements"
                                : "No published announcements yet"}
                        </h2>

                        <p>
                            {search || category !== "all"
                                ? "Try changing your search term or selecting a different category."
                                : "When your HOA publishes a community announcement, it will appear here."}
                        </p>

                        {(search || category !== "all") && (
                            <button
                                type="button"
                                className="announcements-reset-button"
                                onClick={() => {
                                    setSearch("");
                                    setCategory("all");
                                }}
                            >
                                Clear Search and Filters
                            </button>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

export default Announcements;
