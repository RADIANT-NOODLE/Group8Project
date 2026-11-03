import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../shared/DashboardSidebar";
import ComplaintStatusRing from "../../../components/ComplaintStatusRing";
import { COMPLAINT_STATUS, toComplaintStatus } from "../../../services/statusMap";
import { listComplaints } from "../../../services/complaintApi";
import { listProperties } from "../../../services/propertyApi";
import { listUsers, roleLabel } from "../../../services/userApi";
import { useSession } from "../../../services/session";
import "../HOAAdmin/HOAAdminDashboard.css";
import "./HeadAdminDashboard.css";

/*
=========================================================
VALORA HEAD ADMIN DASHBOARD

Same building blocks as the HOA Admin dashboard: what needs
attention, the platform at a glance (users by role), the
newest accounts and the complaint ring. Navigation lives in
the sidebar, so it is not repeated here.
=========================================================
*/

/* users by role, in the order the bar draws them */
const ROLE_SEGMENTS = [
    { role: "resident", label: "Residents", color: "#563f6b" },
    { role: "estate_agent", label: "Estate agents", color: "#8f72aa" },
    { role: "hoa_admin", label: "HOA admins", color: "#b49ccb" },
    { role: "head_admin", label: "Head admins", color: "#d9cbe5" },
];

const RECENT_LIMIT = 5;

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function initials(name = "") {
    return (
        String(name)
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "?"
    );
}

const ICON_PATHS = {
    people: (
        <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
    ),
    building: (
        <>
            <path d="M3 21h18" />
            <path d="M5 21V8l7-5 7 5v13" />
            <path d="M9 21v-5h6v5" />
            <path d="M9 10h6" />
        </>
    ),
    userPlus: (
        <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M16 11h6" />
        </>
    ),
    megaphone: (
        <>
            <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
            <path d="M20 9v6" />
        </>
    ),
    bell: (
        <>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
            <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
        </>
    ),
    arrow: (
        <>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </>
    ),
    refresh: (
        <>
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
        </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
};

function Icon({ name, size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICON_PATHS[name]}
        </svg>
    );
}

function HeadAdminDashboard() {
    const { user } = useSession();

    const [users, setUsers] = useState({ loading: true, error: "", items: [] });
    const [propertiesCount, setPropertiesCount] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboard = useCallback(async () => {
        setRefreshing(true);

        // each figure loads on its own, so one failing endpoint doesn't blank the rest
        const [userResult, propertyResult, complaintResult] = await Promise.allSettled([
            listUsers(),
            listProperties({ pageSize: 1 }),
            listComplaints({ pageSize: 100 }),
        ]);

        setUsers(
            userResult.status === "fulfilled"
                ? { loading: false, error: "", items: userResult.value }
                : { loading: false, error: "Could not load user accounts.", items: [] }
        );
        setPropertiesCount(propertyResult.status === "fulfilled" ? propertyResult.value.count : null);
        setComplaints(complaintResult.status === "fulfilled" ? complaintResult.value.items : []);
        setComplaintsLoading(false);
        setRefreshing(false);

        [userResult, propertyResult, complaintResult]
            .filter((result) => result.status === "rejected")
            .forEach((result) => console.error("Head admin dashboard:", result.reason));
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    /* ----- figures ----- */
    const pendingUsers = users.items.filter((account) => account.hoa_approved !== true);
    const openComplaints = complaints.filter((complaint) => {
        const status = toComplaintStatus(complaint.status);
        return status !== COMPLAINT_STATUS.resolved && status !== COMPLAINT_STATUS.closed;
    }).length;

    const attention = [
        {
            key: "registrations",
            count: pendingUsers.length,
            one: "registration to review",
            many: "registrations to review",
            to: "/registration-requests",
            icon: "userPlus",
        },
        {
            key: "complaints",
            count: openComplaints,
            one: "open complaint in the estate",
            many: "open complaints in the estate",
            to: "/resident-complaints",
            icon: "megaphone",
        },
    ];
    const attentionLoading = users.loading || complaintsLoading;
    const attentionTotal = attention.reduce((sum, item) => sum + item.count, 0);

    const roleCounts = ROLE_SEGMENTS.map((segment) => ({
        ...segment,
        count: users.items.filter((account) => String(account.role).toLowerCase() === segment.role).length,
    }));
    const recentUsers = [...users.items].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, RECENT_LIMIT);

    const firstName = user?.firstName || "Administrator";
    const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });

    return (
        <div className="hoa-admin-dashboard-layout">
            <DashboardSidebar suppliedUser={user} />

            <main className="hoa-admin-dashboard-main dashboard-main-content">
                {/* HEADER */}
                <header className="hoa-dash-header">
                    <div>
                        <p className="hoa-dash-eyebrow">Head Admin Portal · {today}</p>
                        <h1>{greeting()}, {firstName}</h1>
                        <p>Here is how the VALORA platform is doing today.</p>
                    </div>

                    <div className="hoa-dash-header-actions">
                        <button
                            type="button"
                            className="hoa-dash-button hoa-dash-button-secondary"
                            onClick={loadDashboard}
                            disabled={refreshing}
                        >
                            <Icon name="refresh" size={16} />
                            {refreshing ? "Refreshing…" : "Refresh"}
                        </button>
                        <Link to="/create-agent" className="hoa-dash-button hoa-dash-button-primary">
                            <Icon name="plus" size={16} />
                            Create agent account
                        </Link>
                    </div>
                </header>

                {/* ATTENTION + PLATFORM AT A GLANCE */}
                <div className="hoa-dash-top">
                    <section className="hoa-dash-attention" aria-labelledby="head-dash-attention-title">
                        <div className="hoa-dash-attention-head">
                            <span className="hoa-dash-attention-icon">
                                <Icon name="bell" size={22} />
                            </span>
                            <div>
                                <p className="hoa-dash-attention-label" id="head-dash-attention-title">
                                    Needs your attention
                                </p>
                                <p className="hoa-dash-attention-number">{attentionLoading ? "…" : attentionTotal}</p>
                            </div>
                        </div>

                        {!attentionLoading && attentionTotal === 0 ? (
                            <p className="hoa-dash-attention-clear">You're all caught up. Nothing is waiting for a decision.</p>
                        ) : (
                            <ul className="hoa-dash-attention-list">
                                {attention.map((item) => (
                                    <li key={item.key}>
                                        <Link
                                            to={item.to}
                                            className={`hoa-dash-attention-item${item.count > 0 ? " has-items" : ""}`}
                                        >
                                            <span className="hoa-dash-attention-item-icon">
                                                <Icon name={item.icon} size={17} />
                                            </span>
                                            <span className="hoa-dash-attention-item-text">
                                                <strong>{attentionLoading ? "…" : item.count}</strong>{" "}
                                                {item.count === 1 ? item.one : item.many}
                                            </span>
                                            <Icon name="arrow" size={15} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="hoa-dash-glance" aria-labelledby="head-dash-glance-title">
                        <h2 id="head-dash-glance-title">Platform at a glance</h2>

                        <ul className="hoa-dash-glance-list">
                            <li>
                                <span className="hoa-dash-glance-icon"><Icon name="people" size={18} /></span>
                                <span className="hoa-dash-glance-label">User accounts</span>
                                <strong>{users.loading ? "…" : users.items.length}</strong>
                            </li>
                            <li>
                                <span className="hoa-dash-glance-icon"><Icon name="building" size={18} /></span>
                                <span className="hoa-dash-glance-label">Properties</span>
                                <strong>{propertiesCount ?? "…"}</strong>
                            </li>
                        </ul>

                        <div className="head-dash-roles">
                            <p className="head-dash-roles-title">Users by role</p>
                            <div
                                className="head-dash-roles-bar"
                                role="img"
                                aria-label={roleCounts.map((segment) => `${segment.label}: ${segment.count}`).join(", ")}
                            >
                                {!users.loading &&
                                    roleCounts
                                        .filter((segment) => segment.count > 0)
                                        .map((segment) => (
                                            <span
                                                key={segment.role}
                                                style={{ flexGrow: segment.count, background: segment.color }}
                                                title={`${segment.label}: ${segment.count}`}
                                            />
                                        ))}
                            </div>
                            <ul className="head-dash-roles-legend">
                                {roleCounts.map((segment) => (
                                    <li key={segment.role}>
                                        <span style={{ background: segment.color }} aria-hidden="true" />
                                        {segment.label}
                                        <strong>{users.loading ? "…" : segment.count}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>

                {/* RECENT ACCOUNTS + COMPLAINT STATUS */}
                <div className="hoa-dash-middle">
                    <section className="hoa-dash-card" aria-labelledby="head-dash-recent-title">
                        <div className="hoa-dash-card-header">
                            <div>
                                <h2 id="head-dash-recent-title">Newest accounts</h2>
                                <p>The latest people to join VALORA.</p>
                            </div>
                            <Link to="/user-management" className="hoa-dash-link">
                                Manage users <Icon name="arrow" size={14} />
                            </Link>
                        </div>

                        {users.loading ? (
                            <ul className="hoa-dash-list" aria-hidden="true">
                                {[0, 1, 2].map((index) => (
                                    <li key={index} className="hoa-dash-row hoa-dash-row-skeleton">
                                        <span className="hoa-dash-skeleton hoa-dash-skeleton-avatar" />
                                        <span className="hoa-dash-skeleton hoa-dash-skeleton-line" />
                                        <span className="hoa-dash-skeleton hoa-dash-skeleton-pill" />
                                    </li>
                                ))}
                            </ul>
                        ) : users.error ? (
                            <p className="hoa-dash-note hoa-dash-note-error">{users.error}</p>
                        ) : recentUsers.length === 0 ? (
                            <div className="hoa-dash-empty">
                                <span className="hoa-dash-empty-icon"><Icon name="people" size={22} /></span>
                                <h3>No accounts yet</h3>
                                <p>New registrations will appear here.</p>
                            </div>
                        ) : (
                            <ul className="hoa-dash-list">
                                {recentUsers.map((account) => (
                                    <li key={account.id} className="hoa-dash-row hoa-dash-registration">
                                        <span className="hoa-dash-avatar" aria-hidden="true">
                                            {initials(account.full_name)}
                                        </span>
                                        <div className="hoa-dash-row-copy">
                                            <strong>{account.full_name || "VALORA user"}</strong>
                                            <span>{account.email}</span>
                                        </div>
                                        <span className="hoa-dash-pill is-neutral">{roleLabel(account.role)}</span>
                                        <span className={`hoa-dash-pill ${account.hoa_approved ? "is-done" : "is-open"}`}>
                                            {account.hoa_approved ? "Approved" : "Pending"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <aside className="hoa-dash-card hoa-dash-ring-card" aria-label="Complaint status overview">
                        <div className="hoa-dash-card-header">
                            <div>
                                <h2>Complaints</h2>
                                <p>Where community complaints stand.</p>
                            </div>
                        </div>
                        <ComplaintStatusRing complaints={complaints} loading={complaintsLoading} />
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default HeadAdminDashboard;
