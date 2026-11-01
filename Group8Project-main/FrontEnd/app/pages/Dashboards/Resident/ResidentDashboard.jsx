import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../../../services/session";
import DashboardSidebar from "../shared/DashboardSidebar";
import { listAnnouncements } from "../../../services/announcementApi";
import { apiRequest } from "../../../services/apiClient";
import { listComplaints } from "../../../services/complaintApi";
import { listWorkOrders } from "../../../services/workOrderApi";
import "./ResidentDashboard.css";

async function readPublishedAnnouncements() {
    const page = await listAnnouncements({ pageSize: 20 });

    return page.items.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.message,
        category: announcement.category,
        date: announcement.createdAt,
    }));
}

function formatAnnouncementDate(dateValue) {
    if (!dateValue) return "Community announcement";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Community announcement";

    return date.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function ResidentDashboard({ user: suppliedUser }) {
    const { user: sessionUser } = useSession();
    const user = suppliedUser || sessionUser || {};

    const [myProperty, setMyProperty] = useState(null);
    const [complaintsCount, setComplaintsCount] = useState(0);
    const [maintenanceCount, setMaintenanceCount] = useState(0);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        const results = await Promise.allSettled([
            apiRequest("/api/v1/resident-directory"),
            listComplaints({ pageSize: 100 }),
            listWorkOrders({ pageSize: 100 }),
            readPublishedAnnouncements(),
        ]);
        const [directory, complaints, workOrders, published] = results;

        if (directory.status === "fulfilled") {
            const payload = directory.value;
            const records = Array.isArray(payload)
                ? payload
                : payload?.items || payload?.records || (payload?.unit_no ? [payload] : []);

            setMyProperty(
                records.length > 0
                    ? {
                          unit_no: records[0].unit_no,
                          complex_name: records[0].complex_name,
                          address: records[0].street_address,
                      }
                    : null
            );
        }

        if (complaints.status === "fulfilled") setComplaintsCount(complaints.value.items.length);
        if (workOrders.status === "fulfilled") setMaintenanceCount(workOrders.value.items.length);
        if (published.status === "fulfilled") setAnnouncements(published.value);

        results.forEach((result) => {
            if (result.status === "rejected") {
                console.error("Unable to load part of the dashboard:", result.reason);
            }
        });

        setLoading(false);
    }, []);

    useEffect(() => {
        loadDashboard();

        window.addEventListener("focus", loadDashboard);

        return () => {
            window.removeEventListener("focus", loadDashboard);
        };
    }, [loadDashboard]);

    const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "Resident";
    const initials = user?.initials || firstName.charAt(0).toUpperCase();

    return (
        <div className="resident-dashboard-layout">
            <DashboardSidebar suppliedUser={user} />

            <main className="resident-dashboard-main">
                {/* DASHBOARD HEADER */}
                <div className="resident-dashboard-header">
                    <div>
                        <span className="resident-dashboard-header-eyebrow">
                            RESIDENT PORTAL
                        </span>
                        <h1>Welcome back, {firstName}</h1>
                        <p>Manage your property and community activity.</p>
                    </div>
                    <div className="resident-dashboard-header-user">
                        <div className="resident-dashboard-header-avatar">
                            {initials}
                        </div>
                    </div>
                </div>

                {/* STATS */}
                <div className="resident-dashboard-stats-grid">
                    <div className="resident-dashboard-stat-card">
                        <div className="resident-dashboard-stat-top">
                            <div className="resident-dashboard-stat-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 10.5 12 3l9 7.5" />
                                    <path d="M5.5 9.5V21h13V9.5" />
                                    <path d="M9 21v-6h6v6" />
                                </svg>
                            </div>
                            <span className="resident-dashboard-stat-label">My Property</span>
                        </div>
                        <div className="resident-dashboard-stat-number">
                            {loading ? "..." : (myProperty ? "1" : "0")}
                        </div>
                    </div>

                    <div className="resident-dashboard-stat-card">
                        <div className="resident-dashboard-stat-top">
                            <div className="resident-dashboard-stat-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 3 21 6v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9V6l9-3Z" />
                                    <path d="M12 8v5" />
                                    <path d="M12 16h.01" />
                                </svg>
                            </div>
                            <span className="resident-dashboard-stat-label">Complaints</span>
                        </div>
                        <div className="resident-dashboard-stat-number">
                            {loading ? "..." : complaintsCount}
                        </div>
                    </div>

                    <div className="resident-dashboard-stat-card">
                        <div className="resident-dashboard-stat-top">
                            <div className="resident-dashboard-stat-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.2 2.2-2.8-.8-.8-2.8 2.8-2.2Z" />
                                </svg>
                            </div>
                            <span className="resident-dashboard-stat-label">Maintenance</span>
                        </div>
                        <div className="resident-dashboard-stat-number">
                            {loading ? "..." : maintenanceCount}
                        </div>
                    </div>

                    <div className="resident-dashboard-stat-card">
                        <div className="resident-dashboard-stat-top">
                            <div className="resident-dashboard-stat-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                                    <path d="M20 9v6" />
                                </svg>
                            </div>
                            <span className="resident-dashboard-stat-label">Announcements</span>
                        </div>
                        <div className="resident-dashboard-stat-number">
                            {loading ? "..." : announcements.length}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="resident-dashboard-content-grid">
                    {/* MY PROPERTY CARD */}
                    <div className="resident-dashboard-card">
                        <div className="resident-dashboard-card-header">
                            <div>
                                <h2>My Property</h2>
                                <p>Property information linked to your account.</p>
                            </div>
                            <Link to="/property" className="resident-dashboard-view-all">View Property</Link>
                        </div>

                        {loading ? (
                            <p style={{ padding: "20px", color: "#8a848f" }}>Loading property details...</p>
                        ) : myProperty ? (
                            <div className="resident-dashboard-property-summary">
                                <div className="resident-dashboard-property-summary-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M3 10.5 12 3l9 7.5" />
                                        <path d="M5.5 9.5V21h13V9.5" />
                                        <path d="M9 21v-6h6v6" />
                                    </svg>
                                </div>
                                <div className="resident-dashboard-property-summary-content">
                                    <strong>Unit {myProperty.unit_no}</strong>
                                    <span>{myProperty.complex_name} · {myProperty.address}</span>
                                </div>
                                <span className="resident-dashboard-property-status">Registered</span>
                            </div>
                        ) : (
                            <div className="resident-dashboard-empty-state">
                                <div className="resident-dashboard-empty-icon">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M3 10.5 12 3l9 7.5" />
                                        <path d="M5.5 9.5V21h13V9.5" />
                                        <path d="M9 21v-6h6v6" />
                                    </svg>
                                </div>
                                <h3>No property linked yet</h3>
                                <p>Your property will appear here once the HOA has verified and assigned it to your account.</p>
                            </div>
                        )}
                    </div>

                    {/* PROPERTY REQUEST CARD */}
                    <div className="resident-dashboard-card resident-dashboard-request-card">
                        <div className="resident-dashboard-request-content">
                            <div className="resident-dashboard-request-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="4" y="3" width="16" height="18" rx="2" />
                                    <path d="M8 7h8" />
                                    <path d="M8 11h8" />
                                    <path d="M8 15h4" />
                                    <path d="M16 14v5" />
                                    <path d="M13.5 16.5h5" />
                                </svg>
                            </div>
                            <div>
                                <h2>Want to sell or rent your property?</h2>
                                <p>Submit a request to the HOA for review.</p>
                                <Link to="/request-to-sell" className="resident-dashboard-primary-button">
                                    Request to Sell/Rent
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="resident-dashboard-card resident-dashboard-quick-actions-card">
                        <div className="resident-dashboard-card-header">
                            <div>
                                <h2>Quick Actions</h2>
                                <p>Common resident actions.</p>
                            </div>
                        </div>
                        <div className="resident-dashboard-quick-actions">
                            <Link to="/complaints" className="resident-dashboard-quick-action">
                                <span className="resident-dashboard-quick-action-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M12 3 21 6v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9V6l9-3Z" />
                                        <path d="M12 8v5" />
                                        <path d="M12 16h.01" />
                                    </svg>
                                </span>
                                <span>Complaints</span>
                            </Link>

                            <Link
                                to="/announcements"
                                className="resident-dashboard-quick-action"
                            >
                                <span className="resident-dashboard-quick-action-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                                        <path d="M20 9v6" />
                                    </svg>
                                </span>
                                <span>Announcements</span>
                            </Link>
                        </div>
                    </div>

                    {/* COMMUNITY ANNOUNCEMENTS */}
                    <section className="resident-dashboard-card resident-dashboard-announcements-card">
                        <div className="resident-dashboard-card-header">
                            <div>
                                <h2>Community Announcements</h2>
                                <p>The latest updates published by your community administrators.</p>
                            </div>
                            <Link to="/announcements" className="resident-dashboard-view-all">View All</Link>
                        </div>

                        {announcements.length > 0 ? (
                            <div className="resident-dashboard-announcements-list">
                                {announcements.slice(0, 4).map((announcement, index) => (
                                    <article className="resident-dashboard-announcement-item" key={announcement.id || index}>
                                        <div className="resident-dashboard-announcement-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                                                <path d="M20 9v6" />
                                            </svg>
                                        </div>
                                        <div className="resident-dashboard-announcement-copy">
                                            <div className="resident-dashboard-announcement-meta">
                                                {announcement.category && <span>{announcement.category}</span>}
                                            </div>
                                            <h3>{announcement.title || "Community Announcement"}</h3>
                                            <p>{announcement.content || announcement.description || "Open the announcements page to view this update."}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="resident-dashboard-announcements-empty">
                                <div className="resident-dashboard-announcement-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M4 11v2a2 2 0 0 0 2 2h2l3 5h2l-1.5-5H14l6 3V6l-6 3H6a2 2 0 0 0-2 2Z" />
                                        <path d="M20 9v6" />
                                    </svg>
                                </div>
                                <h3>No announcements yet</h3>
                                <p>Published community updates will appear here.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default ResidentDashboard;