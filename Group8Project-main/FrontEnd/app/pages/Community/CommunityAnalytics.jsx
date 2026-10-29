import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../../data/propertyStorage";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./CommunityAnalytics.css";

const STORAGE_KEYS = {
    users: "valoraUsers",
    properties: "valoraProperties",
    complaints: "valoraComplaints",
    maintenance: "valoraMaintenanceRequests",
    announcements: "valoraCommunityAnnouncements",
};

const UPDATE_EVENTS = [
    "valoraComplaintsUpdated",
    "valoraMaintenanceUpdated",
    "valoraCommunityAnnouncementsUpdated",
    "valoraAnnouncementsUpdated",
    "valoraServiceProvidersUpdated",
    "valoraProvidersUpdated",
    "valoraPropertiesUpdated",
    "valoraUsersUpdated",
];

/* =========================================================
   SHARED DATA HELPERS
========================================================= */

function readStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");

        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function readStoredUser() {
    try {
        const user = JSON.parse(
            localStorage.getItem("valoraUser") || "null"
        );

        return user && typeof user === "object" ? user : null;
    } catch {
        return null;
    }
}

function normalizeRole(value = "") {
    const role = String(value).trim().toLowerCase();

    if (
        role === "head admin" ||
        role === "head administrator" ||
        role === "headadministrator"
    ) {
        return "Head Admin";
    }

    if (
        role === "hoa" ||
        role === "hoa admin" ||
        role === "hoa administrator" ||
        role === "administrator" ||
        role === "admin"
    ) {
        return "HOA Admin";
    }

    if (role === "resident" || role === "property owner") {
        return "Resident";
    }

    if (role === "investor" || role === "buyer") {
        return "Investor";
    }

    if (role === "estate agent" || role === "agent") {
        return "Estate Agent";
    }

    return value || "User";
}

function getUserName(user) {
    return (
        user?.fullName ||
        user?.name ||
        [
            user?.firstName || user?.firstname || user?.first_name,
            user?.lastName || user?.lastname || user?.last_name,
        ]
            .filter(Boolean)
            .join(" ") ||
        user?.email ||
        "User"
    ).trim();
}

function getInitials(name) {
    return String(name || "User")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();
}

function getRecordDate(record) {
    const value =
        record?.createdAt ||
        record?.created_at ||
        record?.submittedAt ||
        record?.submittedDate ||
        record?.dateCreated ||
        record?.date ||
        record?.publishedAt ||
        record?.timestamp;

    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function isApproved(user) {
    return String(user?.status || "").trim().toLowerCase() === "approved";
}

function isOpenStatus(status) {
    return !["resolved", "cancelled", "closed", "completed"].includes(
        String(status || "Submitted").trim().toLowerCase()
    );
}

function formatPercentage(value) {
    if (value === null || value === undefined) return "—";

    return `${value.toFixed(1)}%`;
}

function formatTrend(current, previous) {
    if (previous === null || previous === undefined) {
        return "No historical data";
    }

    if (previous === 0 && current === 0) {
        return "No change";
    }

    if (previous === 0) {
        return "New activity";
    }

    const change = ((current - previous) / previous) * 100;
    const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";

    return `${arrow} ${Math.abs(change).toFixed(1)}%`;
}

function getMonthlyCreatedCount(records, offset = 0) {
    const now = new Date();

    const start = new Date(
        now.getFullYear(),
        now.getMonth() + offset,
        1
    );

    const end = new Date(
        now.getFullYear(),
        now.getMonth() + offset + 1,
        1
    );

    return records.filter((record) => {
        const date = getRecordDate(record);

        return date && date >= start && date < end;
    }).length;
}

/* =========================================================
   PROPERTY DATA

   Use the existing shared property helper. The fallback
   reads the existing property storage; it creates no data.
========================================================= */

function loadProperties() {
    try {
        const properties = getProperties();

        if (Array.isArray(properties)) {
            return properties;
        }
    } catch (error) {
        console.error("Unable to load shared properties:", error);
    }

    return readStoredArray(STORAGE_KEYS.properties);
}

function getPropertyStatus(property) {
    return String(
        property?.unitStatus ||
        property?.occupancyStatus ||
        property?.occupancy ||
        property?.status ||
        ""
    ).trim().toLowerCase();
}

function isOccupied(property) {
    const status = getPropertyStatus(property);

    return [
        "occupied",
        "owner occupied",
        "tenant occupied",
        "rented",
    ].includes(status);
}

function isVacant(property) {
    const status = getPropertyStatus(property);

    return [
        "vacant",
        "unoccupied",
        "available",
    ].includes(status);
}

function isPublishedProperty(property) {
    const listing = property?.listing || property || {};

    return (
        String(listing.listingStatus || "").toLowerCase() === "published" ||
        String(property?.listingStatus || "").toLowerCase() === "published"
    );
}

/* =========================================================
   PROVIDER DATA

   Discover existing provider-related arrays without creating
   a new storage key or inventing provider records.
========================================================= */

function loadProviders() {
    const providers = [];
    const seen = new Set();

    try {
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);

            if (
                !key ||
                !/provider/i.test(key) ||
                /updated|event|cache|settings/i.test(key)
            ) {
                continue;
            }

            let parsed;

            try {
                parsed = JSON.parse(localStorage.getItem(key) || "null");
            } catch {
                continue;
            }

            const records = Array.isArray(parsed)
                ? parsed
                : Array.isArray(parsed?.providers)
                    ? parsed.providers
                    : null;

            if (!records) continue;

            records.forEach((provider) => {
                if (!provider || typeof provider !== "object") return;

                const identifier =
                    provider.id ||
                    provider.providerId ||
                    provider.email ||
                    provider.name ||
                    provider.businessName;

                if (!identifier) return;

                const uniqueKey = String(identifier).toLowerCase();

                if (seen.has(uniqueKey)) return;

                seen.add(uniqueKey);
                providers.push(provider);
            });
        }
    } catch (error) {
        console.error("Unable to load provider records:", error);
    }

    return providers;
}

function getProviderName(provider) {
    return (
        provider?.businessName ||
        provider?.providerName ||
        provider?.name ||
        provider?.companyName ||
        ""
    );
}

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, size = 19 }) {
    const icons = {
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
        properties: (
            <>
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5M9 21v-6h6v6" />
            </>
        ),
        maintenance: (
            <>
                <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-6.4 6.4a2 2 0 0 0 2.8 2.8l6.4-6.4a4 4 0 0 0 5.6-5.6l-2.2 2.2-2.8-2.8z" />
            </>
        ),
        announcements: (
            <>
                <path d="M4 10v4a2 2 0 0 0 2 2h2l2 5h2l-2-5h2l7 3V5l-7 3H6a2 2 0 0 0-2 2Z" />
            </>
        ),
        complaints: (
            <>
                <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6.59L9 21.41V18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                <path d="M6 8h12M6 12h8" />
            </>
        ),
        providers: (
            <>
                <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
            </>
        ),
        profile: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
            </>
        ),
        trend: (
            <>
                <path d="m3 17 6-6 4 4 8-9" />
                <path d="M15 6h6v6" />
            </>
        ),
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icons[name] || icons.profile}
        </svg>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, label, value, description }) {
    return (
        <div className="community-analytics-stat-card">
            <span className="community-analytics-stat-icon">
                <Icon name={icon} />
            </span>

            <div>
                <p>{label}</p>
                <h3>{value}</h3>
                <small>{description}</small>
            </div>
        </div>
    );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ message }) {
    return (
        <div className="community-analytics-empty">
            <p>{message}</p>
        </div>
    );
}

/* =========================================================
   MAIN COMMUNITY ANALYTICS
========================================================= */

function CommunityAnalytics() {
    const [currentUser, setCurrentUser] = useState(readStoredUser);
    const [data, setData] = useState(() => ({
        users: readStoredArray(STORAGE_KEYS.users),
        properties: loadProperties(),
        complaints: readStoredArray(STORAGE_KEYS.complaints),
        maintenance: readStoredArray(STORAGE_KEYS.maintenance),
        announcements: readStoredArray(STORAGE_KEYS.announcements),
        providers: loadProviders(),
    }));

    const refreshData = useCallback(() => {
        setCurrentUser(readStoredUser());

        setData({
            users: readStoredArray(STORAGE_KEYS.users),
            properties: loadProperties(),
            complaints: readStoredArray(STORAGE_KEYS.complaints),
            maintenance: readStoredArray(STORAGE_KEYS.maintenance),
            announcements: readStoredArray(STORAGE_KEYS.announcements),
            providers: loadProviders(),
        });
    }, []);

    useEffect(() => {
        const handleStorage = () => refreshData();
        const handleFocus = () => refreshData();
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                refreshData();
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibility);

        UPDATE_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, handleStorage);
        });

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );

            UPDATE_EVENTS.forEach((eventName) => {
                window.removeEventListener(eventName, handleStorage);
            });
        };
    }, [refreshData]);

    const currentRole = normalizeRole(
        currentUser?.role ||
        currentUser?.userRole ||
        currentUser?.userType ||
        currentUser?.accountType
    );

    const currentName = getUserName(currentUser);

    const analytics = useMemo(() => {
        const approvedUsers = data.users.filter(isApproved);

        const residents = approvedUsers.filter(
            (user) => normalizeRole(
                user.role || user.userRole || user.userType || user.accountType
            ) === "Resident"
        );

        const investors = approvedUsers.filter(
            (user) => normalizeRole(
                user.role || user.userRole || user.userType || user.accountType
            ) === "Investor"
        );

        const agents = approvedUsers.filter(
            (user) => normalizeRole(
                user.role || user.userRole || user.userType || user.accountType
            ) === "Estate Agent"
        );

        const pendingRegistrations = data.users.filter(
            (user) =>
                String(user.status || "").trim().toLowerCase() === "pending"
        );

        const occupiedProperties = data.properties.filter(isOccupied);
        const vacantProperties = data.properties.filter(isVacant);
        const propertiesWithKnownOccupancy =
            occupiedProperties.length + vacantProperties.length;

        const occupancyRate =
            propertiesWithKnownOccupancy > 0
                ? (occupiedProperties.length / propertiesWithKnownOccupancy) * 100
                : null;

        const openComplaints = data.complaints.filter((complaint) =>
            isOpenStatus(complaint.status)
        );

        const openMaintenance = data.maintenance.filter((request) =>
            isOpenStatus(request.status)
        );

        const activeProviders = data.providers.filter((provider) => {
            const status = String(
                provider.status || provider.providerStatus || ""
            ).trim().toLowerCase();

            return ![
                "inactive",
                "removed",
                "disabled",
                "deleted",
            ].includes(status);
        });

        const publishedAnnouncements = data.announcements.filter(
            (announcement) => {
                const status = String(
                    announcement.status || announcement.visibility || ""
                ).trim().toLowerCase();

                if (
                    ["draft", "unpublished", "archived", "deleted"].includes(status)
                ) {
                    return false;
                }

                if (
                    announcement.isPublished === false ||
                    announcement.published === false
                ) {
                    return false;
                }

                return true;
            }
        );

        return {
            approvedUsers,
            residents,
            investors,
            agents,
            pendingRegistrations,
            occupiedProperties,
            vacantProperties,
            propertiesWithKnownOccupancy,
            occupancyRate,
            openComplaints,
            openMaintenance,
            activeProviders,
            publishedAnnouncements,
            residentsAddedThisMonth: getMonthlyCreatedCount(residents, 0),
            residentsAddedPreviousMonth: getMonthlyCreatedCount(residents, -1),
            propertiesAddedThisMonth: getMonthlyCreatedCount(data.properties, 0),
            propertiesAddedPreviousMonth: getMonthlyCreatedCount(data.properties, -1),
            complaintsAddedThisMonth: getMonthlyCreatedCount(data.complaints, 0),
            complaintsAddedPreviousMonth: getMonthlyCreatedCount(data.complaints, -1),
            maintenanceAddedThisMonth: getMonthlyCreatedCount(data.maintenance, 0),
            maintenanceAddedPreviousMonth: getMonthlyCreatedCount(data.maintenance, -1),
            announcementsAddedThisMonth: getMonthlyCreatedCount(
                publishedAnnouncements,
                0
            ),
            announcementsAddedPreviousMonth: getMonthlyCreatedCount(
                publishedAnnouncements,
                -1
            ),
        };
    }, [data]);

    const performanceRows = useMemo(() => {
        return [
            {
                category: "Residents",
                metric: "Approved Residents",
                current: analytics.residents.length,
                previous: analytics.residentsAddedPreviousMonth,
                currentMonth: analytics.residentsAddedThisMonth,
                explanation: "New approved resident accounts this month",
                link: "/resident-directory",
            },
            {
                category: "Properties",
                metric: "Total Properties",
                current: data.properties.length,
                previous: analytics.propertiesAddedPreviousMonth,
                currentMonth: analytics.propertiesAddedThisMonth,
                explanation: "New property records this month",
                link: "/properties",
            },
            {
                category: "Complaints",
                metric: "Open Complaints",
                current: analytics.openComplaints.length,
                previous: analytics.complaintsAddedPreviousMonth,
                currentMonth: analytics.complaintsAddedThisMonth,
                explanation: "New complaint records this month",
                link: "/resident-complaints",
            },
            {
                category: "Maintenance",
                metric: "Open Requests",
                current: analytics.openMaintenance.length,
                previous: analytics.maintenanceAddedPreviousMonth,
                currentMonth: analytics.maintenanceAddedThisMonth,
                explanation: "New maintenance records this month",
                link: "/maintenance",
            },
            {
                category: "Announcements",
                metric: "Published Notices",
                current: analytics.publishedAnnouncements.length,
                previous: analytics.announcementsAddedPreviousMonth,
                currentMonth: analytics.announcementsAddedThisMonth,
                explanation: "New announcement records this month",
                link: "/community-announcements",
            },
        ];
    }, [analytics, data.properties.length]);

    return (
        <div className="community-analytics-layout">
            <DashboardSidebar />

            <main className="community-analytics-main">
                <header className="community-analytics-top-bar">
                    <div className="community-analytics-heading">
                        <h2>Community Analytics</h2>
                        <p>
                            Monitor actual community records, property activity,
                            maintenance and resident trends.
                        </p>
                    </div>

                    <div className="community-analytics-profile-small">
                        <div className="community-analytics-profile-circle">
                            <Icon name="profile" />
                        </div>

                        <div className="community-analytics-profile-details">
                            <span className="community-analytics-profile-name">
                                {currentName}
                            </span>

                            <span className="community-analytics-profile-role">
                                {currentRole}
                            </span>
                        </div>
                    </div>
                </header>

                {/* =================================================
                    LIVE SUMMARY CARDS
                ================================================= */}

                <section className="community-analytics-stat-cards">
                    <StatCard
                        icon="users"
                        label="Approved Residents"
                        value={analytics.residents.length}
                        description="From approved user accounts"
                    />

                    <StatCard
                        icon="properties"
                        label="Total Properties"
                        value={data.properties.length}
                        description="Records in shared property storage"
                    />

                    <StatCard
                        icon="maintenance"
                        label="Open Requests"
                        value={analytics.openMaintenance.length}
                        description="Unresolved maintenance requests"
                    />

                    <StatCard
                        icon="announcements"
                        label="Announcements"
                        value={analytics.publishedAnnouncements.length}
                        description="Available announcement records"
                    />
                </section>

                {/* =================================================
                    RESIDENT AND PROPERTY OVERVIEW
                ================================================= */}

                <section className="community-analytics-grid">
                    <div className="community-analytics-panel">
                        <div className="community-analytics-panel-heading">
                            <div>
                                <h3>Resident Overview</h3>
                                <p>Account totals from VALORA registration records.</p>
                            </div>

                            <Link
                                to="/resident-directory"
                                className="community-analytics-secondary-btn"
                            >
                                View
                            </Link>
                        </div>

                        {data.users.length === 0 ? (
                            <EmptyState message="No registered user records are available yet." />
                        ) : (
                            <div className="community-analytics-property-summary">
                                <div>
                                    <span>Approved Residents</span>
                                    <strong>{analytics.residents.length}</strong>
                                </div>

                                <div>
                                    <span>Investors</span>
                                    <strong>{analytics.investors.length}</strong>
                                </div>

                                <div>
                                    <span>Estate Agents</span>
                                    <strong>{analytics.agents.length}</strong>
                                </div>

                                <div>
                                    <span>Pending Registrations</span>
                                    <strong>{analytics.pendingRegistrations.length}</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="community-analytics-panel">
                        <div className="community-analytics-panel-heading">
                            <div>
                                <h3>Property Overview</h3>
                                <p>Occupancy is calculated only where status is recorded.</p>
                            </div>

                            <Link
                                to="/properties"
                                className="community-analytics-secondary-btn"
                            >
                                View
                            </Link>
                        </div>

                        {data.properties.length === 0 ? (
                            <EmptyState message="No property records are available yet." />
                        ) : (
                            <div className="community-analytics-property-summary">
                                <div>
                                    <span>Total Units</span>
                                    <strong>{data.properties.length}</strong>
                                </div>

                                <div>
                                    <span>Occupied</span>
                                    <strong>{analytics.occupiedProperties.length}</strong>
                                </div>

                                <div>
                                    <span>Vacant</span>
                                    <strong>{analytics.vacantProperties.length}</strong>
                                </div>

                                <div>
                                    <span>Occupancy</span>
                                    <strong>
                                        {formatPercentage(analytics.occupancyRate)}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* =================================================
                    COMMUNITY PERFORMANCE
                ================================================= */}

                <section className="community-analytics-panel community-analytics-large-panel">
                    <div className="community-analytics-panel-heading">
                        <div>
                            <h3>Community Performance</h3>
                            <p>
                                Current totals and actual record creation activity.
                                Historical record dates are required for monthly comparisons.
                            </p>
                        </div>
                    </div>

                    <div className="community-analytics-table-container">
                        <table className="community-analytics-data-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Metric</th>
                                    <th>Current Total</th>
                                    <th>Created This Month</th>
                                    <th>Created Previous Month</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>

                            <tbody>
                                {performanceRows.map((row) => {
                                    const hasCurrentHistory =
                                        row.currentMonth > 0 ||
                                        row.previous > 0;

                                    const trend = hasCurrentHistory
                                        ? formatTrend(
                                            row.currentMonth,
                                            row.previous
                                        )
                                        : "No historical data";

                                    const trendClass =
                                        trend.startsWith("↑")
                                            ? "community-analytics-positive-trend"
                                            : trend.startsWith("↓")
                                                ? "community-analytics-negative-trend"
                                                : "";

                                    return (
                                        <tr key={row.category}>
                                            <td>{row.category}</td>
                                            <td>
                                                <Link to={row.link}>
                                                    {row.metric}
                                                </Link>
                                            </td>
                                            <td>{row.current}</td>
                                            <td>{row.currentMonth}</td>
                                            <td>{row.previous}</td>
                                            <td className={trendClass}>
                                                {trend}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* =================================================
                    COMPLAINTS AND MAINTENANCE
                ================================================= */}

                <section className="community-analytics-grid">
                    <div className="community-analytics-panel">
                        <div className="community-analytics-panel-heading">
                            <div>
                                <h3>Complaint Overview</h3>
                                <p>Live status of submitted community complaints.</p>
                            </div>

                            <Link
                                to="/resident-complaints"
                                className="community-analytics-secondary-btn"
                            >
                                View
                            </Link>
                        </div>

                        {data.complaints.length === 0 ? (
                            <EmptyState message="No complaints have been submitted yet." />
                        ) : (
                            <div className="community-analytics-property-summary">
                                <div>
                                    <span>Total</span>
                                    <strong>{data.complaints.length}</strong>
                                </div>

                                <div>
                                    <span>Open</span>
                                    <strong>{analytics.openComplaints.length}</strong>
                                </div>

                                <div>
                                    <span>Resolved</span>
                                    <strong>
                                        {data.complaints.filter(
                                            (item) =>
                                                String(item.status || "").toLowerCase() ===
                                                "resolved"
                                        ).length}
                                    </strong>
                                </div>

                                <div>
                                    <span>Cancelled</span>
                                    <strong>
                                        {data.complaints.filter(
                                            (item) =>
                                                String(item.status || "").toLowerCase() ===
                                                "cancelled"
                                        ).length}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="community-analytics-panel">
                        <div className="community-analytics-panel-heading">
                            <div>
                                <h3>Maintenance Overview</h3>
                                <p>Live maintenance request records and statuses.</p>
                            </div>

                            <Link
                                to="/maintenance"
                                className="community-analytics-secondary-btn"
                            >
                                View
                            </Link>
                        </div>

                        {data.maintenance.length === 0 ? (
                            <EmptyState message="No maintenance requests have been submitted yet." />
                        ) : (
                            <div className="community-analytics-property-summary">
                                <div>
                                    <span>Total</span>
                                    <strong>{data.maintenance.length}</strong>
                                </div>

                                <div>
                                    <span>Open</span>
                                    <strong>{analytics.openMaintenance.length}</strong>
                                </div>

                                <div>
                                    <span>Scheduled</span>
                                    <strong>
                                        {data.maintenance.filter(
                                            (item) =>
                                                String(item.status || "").toLowerCase() ===
                                                "scheduled"
                                        ).length}
                                    </strong>
                                </div>

                                <div>
                                    <span>Resolved</span>
                                    <strong>
                                        {data.maintenance.filter(
                                            (item) =>
                                                String(item.status || "").toLowerCase() ===
                                                "resolved"
                                        ).length}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* =================================================
                    COMMUNITY SERVICES
                ================================================= */}

                <section className="community-analytics-grid">
                    <div className="community-analytics-panel">
                        <div className="community-analytics-panel-heading">
                            <div>
                                <h3>Service Providers</h3>
                                <p>Provider records found in existing shared storage.</p>
                            </div>

                            <Link
                                to="/providers"
                                className="community-analytics-secondary-btn"
                            >
                                View
                            </Link>
                        </div>

                        {analytics.activeProviders.length === 0 ? (
                            <EmptyState message="No service provider records are available yet." />
                        ) : (
                            <>
                                <div className="community-analytics-property-summary">
                                    <div>
                                        <span>Available Records</span>
                                        <strong>{analytics.activeProviders.length}</strong>
                                    </div>
                                </div>

                                <ul className="community-analytics-record-list">
                                    {analytics.activeProviders
                                        .slice(0, 5)
                                        .map((provider, index) => (
                                            <li
                                                key={
                                                    provider.id ||
                                                    provider.providerId ||
                                                    provider.email ||
                                                    getProviderName(provider) ||
                                                    index
                                                }
                                            >
                                                {getProviderName(provider) ||
                                                    "Unnamed provider"}
                                            </li>
                                        ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="community-analytics-panel">
                        <div className="community-analytics-panel-heading">
                            <div>
                                <h3>Community Announcements</h3>
                                <p>Announcement records from shared storage.</p>
                            </div>

                            <Link
                                to="/community-announcements"
                                className="community-analytics-secondary-btn"
                            >
                                View
                            </Link>
                        </div>

                        {analytics.publishedAnnouncements.length === 0 ? (
                            <EmptyState message="No published announcements are available yet." />
                        ) : (
                            <ul className="community-analytics-record-list">
                                {analytics.publishedAnnouncements
                                    .slice(0, 5)
                                    .map((announcement, index) => (
                                        <li
                                            key={
                                                announcement.id ||
                                                announcement.announcementId ||
                                                index
                                            }
                                        >
                                            <strong>
                                                {announcement.title ||
                                                    announcement.heading ||
                                                    announcement.subject ||
                                                    "Untitled announcement"}
                                            </strong>

                                            {getRecordDate(announcement) && (
                                                <small>
                                                    {getRecordDate(
                                                        announcement
                                                    ).toLocaleDateString("en-GB")}
                                                </small>
                                            )}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* =================================================
                    COMMUNITY HEALTH
                ================================================= */}

                <section className="community-analytics-panel community-analytics-large-panel">
                    <div className="community-analytics-panel-heading">
                        <div>
                            <h3>Community Health</h3>
                            <p>
                                A factual summary of the records currently
                                available to VALORA.
                            </p>
                        </div>
                    </div>

                    <div className="community-analytics-property-summary">
                        <div>
                            <span>Approved Residents</span>
                            <strong>{analytics.residents.length}</strong>
                        </div>

                        <div>
                            <span>Open Complaints</span>
                            <strong>{analytics.openComplaints.length}</strong>
                        </div>

                        <div>
                            <span>Open Maintenance</span>
                            <strong>{analytics.openMaintenance.length}</strong>
                        </div>

                        <div>
                            <span>Active Providers</span>
                            <strong>{analytics.activeProviders.length}</strong>
                        </div>
                    </div>

                    <p className="community-analytics-health-note">
                        No overall community rating is displayed because the
                        current records do not provide a verified rating source.
                    </p>
                </section>
            </main>
        </div>
    );
}

export default CommunityAnalytics;
