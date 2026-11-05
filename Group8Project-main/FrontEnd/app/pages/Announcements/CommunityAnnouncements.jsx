
import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { useSession } from "../../services/session";
import {
    createAnnouncement,
    deleteAnnouncement as deleteAnnouncementRequest,
    listAnnouncements,
    updateAnnouncement,
} from "../../services/announcementApi";
import "./CommunityAnnouncements.css";
import { showConfirm } from "../../components/AppDialog";

/* =========================================================
   ICONS
========================================================= */

function Icon({ type, size = 20 }) {
    const paths = {
        announcement: (
            <>
                <path d="M4 10.5h3l8-4v11l-8-4H4z" />
                <path d="M7 13.5v4" />
                <path d="M17 9c1.5.5 2.5 1.5 2.5 3s-1 2.5-2.5 3" />
            </>
        ),
        plus: <path d="M12 5v14M5 12h14" />,
        eye: (
            <>
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                <circle cx="12" cy="12" r="2.5" />
            </>
        ),
        edit: (
            <>
                <path d="M4 20h4L19 9a2.12 2.12 0 0 0-3-3L5 17v3z" />
                <path d="M13.5 7.5l3 3" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
            </>
        ),
        filter: (
            <>
                <path d="M4 6h16M7 12h10M10 18h4" />
            </>
        ),
        close: <path d="m6 6 12 12M18 6 6 18" />,
        file: (
            <>
                <path d="M6 3h8l4 4v14H6z" />
                <path d="M14 3v5h5M9 12h6M9 16h6" />
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
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
            {paths[type] || paths.file}
        </svg>
    );
}

/* =========================================================
   API
   Announcements are stored by the backend so every resident
   sees what the HOA publishes (they used to live in this
   browser storage only).
========================================================= */

/** The shape this screen renders, from an announcement the API returned. */
function toViewModel(announcement) {
    return {
        id: announcement.id,
        title: announcement.title,
        content: announcement.message,
        category: announcement.category,
        status: announcement.isPublished ? "Published" : "Draft",
        date: announcement.createdAt,
        createdAt: announcement.createdAt,
        updatedAt: announcement.updatedAt,
        expiresAt: announcement.expiresAt,
    };
}

const ADMIN_ROLES = ["hoa_admin", "head_admin"];

/* =========================================================
   MAIN COMPONENT
========================================================= */

function CommunityAnnouncements() {
    const { user } = useSession();
    const isAdmin = ADMIN_ROLES.includes(String(user?.role || "").toLowerCase());

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [message, setMessage] = useState("");
    const [formError, setFormError] = useState("");

    const emptyForm = {
        title: "",
        category: "",
        date: "",
        content: "",
        status: "Draft",
    };

    const [form, setForm] = useState({ ...emptyForm });

    /* =====================================================
       LOAD ANNOUNCEMENTS FROM THE API
       Admins also see drafts and expired announcements.
    ===================================================== */

    async function loadAnnouncements() {
        try {
            const page = await listAnnouncements({ pageSize: 100, includeExpired: true });
            setAnnouncements(page.items.map(toViewModel));
            setFormError("");
        } catch (error) {
            console.error("Unable to load announcements:", error);
            setFormError(
                error?.status === 0
                    ? "Could not connect to the server. Please try again."
                    : error?.message || "Unable to load announcements."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isAdmin) {
            loadAnnouncements();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const publishedCount = announcements.filter(
        item => item.status === "Published"
    ).length;

    const draftCount = announcements.filter(
        item => item.status === "Draft"
    ).length;

    // the newest announcement residents can currently see
    const latestPublished = announcements
        .filter(item => item.status === "Published")
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;

    /* =====================================================
       SEARCH AND CATEGORY FILTER
    ===================================================== */

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(item => {
            const matchesCategory =
                category === "All" ||
                item.category === category;

            const query = search.trim().toLowerCase();

            const matchesSearch =
                !query ||
                item.title?.toLowerCase().includes(query) ||
                item.content?.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [announcements, category, search]);

    /* =====================================================
       SAVE HELPER
       Runs an API call, then reloads the list so the screen
       always shows what the server actually stored.
    ===================================================== */

    async function save(action, successMessage) {
        setIsSaving(true);

        try {
            await action();
            await loadAnnouncements();
            setMessage(successMessage);
            setFormError("");
            return true;
        } catch (error) {
            console.error("Unable to save announcements:", error);
            setFormError(
                (error?.message || "Unable to save the announcement.").replace(/Value error,\s*/gi, "")
            );
            return false;
        } finally {
            setIsSaving(false);
        }
    }

    /* =====================================================
       CREATE ANNOUNCEMENT
    ===================================================== */

    function openCreateForm() {
        setEditingId(null);
        setForm({ ...emptyForm });
        setFormError("");
        setMessage("");
        setShowForm(true);
        setViewing(null);
    }

    /* =====================================================
       EDIT ANNOUNCEMENT
    ===================================================== */

    function openEditForm(announcement) {
        setEditingId(announcement.id);

        setForm({
            title: announcement.title || "",
            category: announcement.category || "",
            date: announcement.date || "",
            content: announcement.content || "",
            status: announcement.status || "Draft",
        });

        setFormError("");
        setMessage("");
        setShowForm(true);
        setViewing(null);
    }

    /* =====================================================
       SUBMIT CREATE / EDIT FORM
    ===================================================== */

    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.title.trim()) {
            setFormError("Please enter an announcement title.");
            return;
        }

        if (!form.category.trim()) {
            setFormError("Please enter or select a category.");
            return;
        }

        if (!form.content.trim()) {
            setFormError("Please enter the announcement message.");
            return;
        }

        const fields = {
            title: form.title.trim(),
            message: form.content.trim(),
            category: form.category.trim(),
            isPublished: form.status === "Published",
        };

        const confirmed = await showConfirm(
            editingId
                ? "Save changes to this announcement?"
                : fields.isPublished
                    ? "Publish this announcement? Residents will see it straight away."
                    : "Save this announcement as a draft?",
            {
                title: editingId ? "Save changes?" : fields.isPublished ? "Publish announcement?" : "Save draft?",
                confirmLabel: editingId ? "Save" : fields.isPublished ? "Publish" : "Save draft",
            }
        );
        if (!confirmed) return;

        const saved = await save(
            () =>
                editingId
                    ? updateAnnouncement(editingId, fields)
                    : createAnnouncement(fields),
            editingId
                ? "Announcement updated successfully."
                : fields.isPublished
                    ? "Announcement published. Residents can now see it."
                    : "Announcement saved as a draft."
        );

        if (!saved) return;

        setShowForm(false);
        setEditingId(null);
        setForm({ ...emptyForm });
        setCategory("All");
        setSearch("");
    }

    /* =====================================================
       PUBLISH / UNPUBLISH
    ===================================================== */

    async function togglePublished(announcement) {
        const publish = announcement.status !== "Published";

        const confirmed = await showConfirm(
            publish
                ? `Publish "${announcement.title}"? Residents will see it straight away.`
                : `Move "${announcement.title}" back to drafts? Residents will no longer see it.`,
            { title: publish ? "Publish announcement?" : "Move to drafts?", confirmLabel: publish ? "Publish" : "Move to drafts" }
        );
        if (!confirmed) return;

        await save(
            () => updateAnnouncement(announcement.id, { isPublished: publish }),
            publish ? "Announcement published." : "Announcement moved back to drafts."
        );
    }

    /* =====================================================
       DELETE ANNOUNCEMENT
    ===================================================== */

    async function deleteAnnouncement(announcement) {
        const confirmed = await showConfirm(
            `Delete "${announcement.title}"? This cannot be undone.`
        );

        if (!confirmed) return;

        const deleted = await save(
            async () => {
                await deleteAnnouncementRequest(announcement.id);
            },
            "Announcement deleted."
        );

        if (!deleted) return;

        if (viewing?.id === announcement.id) {
            setViewing(null);
        }

        if (editingId === announcement.id) {
            setEditingId(null);
            setShowForm(false);
            setForm({ ...emptyForm });
        }
    }

    /* =====================================================
       FORMATTING HELPERS
    ===================================================== */

    function formatDate(value) {
        if (!value) return "Not specified";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function getStatusClass(status) {
        return (status || "Draft")
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    const categories = [
        ...new Set(
            announcements
                .map(item => item.category)
                .filter(Boolean)
        ),
    ];

    /* =====================================================
       RENDER
    ===================================================== */

    if (!isAdmin) {
        return (
            <div className="community-announcements-page">
                <DashboardSidebar />

                <main className="community-announcements-main">
                    <section className="community-announcements-top-bar">
                        <h1>Community Announcements</h1>
                        <p>
                            Only HOA administrators can manage announcements.
                            You can read published announcements on the
                            Announcements page.
                        </p>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="community-announcements-page">
            <DashboardSidebar />

            <main className="community-announcements-main">

                {/* PAGE HEADER */}

                <section className="community-announcements-top-bar">
                    <p className="community-announcements-eyebrow">
                        <span className="community-announcements-eyebrow-dot" />
                        Community Management
                    </p>

                    <h1>Community Announcements</h1>

                    <p>
                        Keep your residents informed with important
                        community news, notices and updates.
                    </p>
                </section>

                {/* SUCCESS MESSAGE */}

                {message && (
                    <div
                        className="community-announcements-message success"
                        role="status"
                    >
                        <span className="community-announcements-message-indicator" />

                        {message}

                        <button
                            type="button"
                            onClick={() => setMessage("")}
                            aria-label="Dismiss success message"
                        >
                            <Icon type="close" size={15} />
                        </button>
                    </div>
                )}

                {/* GENERAL ERROR */}

                {formError && !showForm && (
                    <div
                        className="community-announcements-message error"
                        role="alert"
                    >
                        {formError}

                        <button
                            type="button"
                            onClick={() => setFormError("")}
                            aria-label="Dismiss error message"
                        >
                            <Icon type="close" size={15} />
                        </button>
                    </div>
                )}

                {/* PUBLISHING SUMMARY + WHAT RESIDENTS SEE NOW */}
                <section className="community-announcements-summary" aria-labelledby="community-announcements-summary-title">
                    <div className="community-announcements-summary-status">
                        <p className="community-announcements-summary-eyebrow">Publishing</p>
                        <h2 id="community-announcements-summary-title">
                            {publishedCount === 0
                                ? "Nothing is live for residents yet"
                                : `${publishedCount} ${publishedCount === 1 ? "announcement is" : "announcements are"} live for residents`}
                        </h2>
                        <p className="community-announcements-summary-sub">
                            {draftCount === 0
                                ? "No drafts waiting to be published."
                                : `${draftCount} ${draftCount === 1 ? "draft is" : "drafts are"} waiting to be published.`}
                        </p>

                        <div
                            className="community-announcements-summary-bar"
                            role="img"
                            aria-label={`Published: ${publishedCount}, drafts: ${draftCount}`}
                        >
                            {publishedCount > 0 && (
                                <span className="community-announcements-summary-segment is-published" style={{ flexGrow: publishedCount }} title={`Published: ${publishedCount}`} />
                            )}
                            {draftCount > 0 && (
                                <span className="community-announcements-summary-segment is-draft" style={{ flexGrow: draftCount }} title={`Drafts: ${draftCount}`} />
                            )}
                        </div>

                        <ul className="community-announcements-summary-legend">
                            <li><span className="community-announcements-summary-swatch is-published" aria-hidden="true" />Published <strong>{publishedCount}</strong></li>
                            <li><span className="community-announcements-summary-swatch is-draft" aria-hidden="true" />Drafts <strong>{draftCount}</strong></li>
                            <li>Total <strong>{announcements.length}</strong></li>
                        </ul>
                    </div>

                    <div className="community-announcements-summary-latest">
                        <p className="community-announcements-summary-eyebrow">Residents see now</p>

                        {latestPublished ? (
                            <article className="community-announcements-latest-card">
                                <div className="community-announcements-latest-meta">
                                    {latestPublished.category && (
                                        <span className="community-announcements-latest-category">{latestPublished.category}</span>
                                    )}
                                    <span>{formatDate(latestPublished.createdAt)}</span>
                                </div>
                                <h3>{latestPublished.title || "Community announcement"}</h3>
                                <p>{latestPublished.content || "No message was added."}</p>
                                <button
                                    type="button"
                                    className="community-announcements-latest-open"
                                    onClick={() => setViewing(latestPublished)}
                                >
                                    Open announcement
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                                    </svg>
                                </button>
                            </article>
                        ) : (
                            <div className="community-announcements-latest-empty">
                                <p>Published announcements will be previewed here.</p>
                                <button type="button" className="community-announcements-latest-open" onClick={openCreateForm}>
                                    Write an announcement
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* ANNOUNCEMENTS PANEL */}

                <section className="community-announcements-panel community-announcements-large-panel">

                    <div className="community-announcements-panel-heading">
                        <div className="community-announcements-panel-title">
                            <span className="community-announcements-section-label">
                                ANNOUNCEMENTS
                            </span>

                            <h3>Manage Announcements</h3>

                            <p>
                                Create and manage important updates
                                for your community.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="community-announcements-primary-btn"
                            onClick={openCreateForm}
                            disabled={loading}
                        >
                            <Icon type="plus" size={17} />
                            Create Announcement
                        </button>
                    </div>

                    {/* SEARCH AND FILTERS */}

                    {announcements.length > 0 && (
                        <div className="community-announcements-filter-row">
                            <div className="community-announcements-search-wrap">
                                <Icon type="filter" size={18} />

                                <input
                                    type="search"
                                    className="community-announcements-search"
                                    placeholder="Search by title or message..."
                                    value={search}
                                    onChange={event =>
                                        setSearch(event.target.value)
                                    }
                                    aria-label="Search announcements"
                                />
                            </div>

                            <div className="community-announcements-category-filter">
                                <label htmlFor="announcement-category-filter">
                                    Category
                                </label>

                                <select
                                    id="announcement-category-filter"
                                    className="community-announcements-filter-select"
                                    value={category}
                                    onChange={event =>
                                        setCategory(event.target.value)
                                    }
                                    aria-label="Filter announcements by category"
                                >
                                    <option value="All">
                                        All Categories
                                    </option>

                                    {categories.map(itemCategory => (
                                        <option
                                            key={itemCategory}
                                            value={itemCategory}
                                        >
                                            {itemCategory}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* EMPTY STATE OR ANNOUNCEMENTS TABLE */}

                    {filteredAnnouncements.length === 0 ? (
                        <div className="community-announcements-empty">

                            <div className="community-announcements-empty-decoration community-announcements-empty-decoration-one" />
                            <div className="community-announcements-empty-decoration community-announcements-empty-decoration-two" />

                            <div className="community-announcements-empty-content">

                                <div className="community-announcements-empty-icon">
                                    <Icon type="announcement" size={35} />
                                </div>

                                <span className="community-announcements-empty-label">
                                    {announcements.length === 0
                                        ? "YOUR COMMUNITY, CONNECTED"
                                        : "SEARCH RESULTS"}
                                </span>

                                <h3>
                                    {announcements.length === 0
                                        ? "Your community story starts here"
                                        : "No announcements found"}
                                </h3>

                                <p>
                                    {announcements.length === 0
                                        ? "Share important news, maintenance notices, upcoming events and community updates with your residents. Your announcements will appear here once you create them."
                                        : "We couldn't find any announcements matching your search or selected category. Try adjusting your search or filters."}
                                </p>

                                {announcements.length === 0 ? (
                                    <button
                                        type="button"
                                        className="community-announcements-primary-btn community-announcements-empty-btn"
                                        onClick={openCreateForm}
                                    >
                                        <Icon type="plus" size={17} />
                                        Create Your First Announcement
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="community-announcements-secondary-btn"
                                        onClick={() => {
                                            setSearch("");
                                            setCategory("All");
                                        }}
                                    >
                                        Clear Search and Filters
                                    </button>
                                )}

                                {announcements.length === 0 && (
                                    <span className="community-announcements-empty-note">
                                        <Icon type="file" size={14} />
                                        No sample data. Your content stays yours.
                                    </span>
                                )}

                            </div>
                        </div>
                    ) : (
                        <div className="community-announcements-table-container">

                            <table className="community-announcements-data-table">

                                <thead>
                                    <tr>
                                        <th>Announcement</th>
                                        <th>Category</th>
                                        <th>Relevant Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredAnnouncements.map(announcement => (
                                        <tr key={announcement.id}>

                                            <td>
                                                <strong>
                                                    {announcement.title}
                                                </strong>

                                                <span className="community-announcements-id">
                                                    {announcement.id}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="community-announcements-category-badge">
                                                    {announcement.category}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="community-announcements-date-cell">
                                                    <Icon type="calendar" size={14} />
                                                    {formatDate(announcement.date)}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`community-announcements-status-badge ${getStatusClass(announcement.status)}`}
                                                >
                                                    <span className="community-announcements-status-dot" />
                                                    {announcement.status || "Draft"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="community-announcements-action-buttons">

                                                    <button
                                                        type="button"
                                                        className="community-announcements-secondary-btn"
                                                        onClick={() =>
                                                            setViewing(announcement)
                                                        }
                                                    >
                                                        <Icon type="eye" size={14} />
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="community-announcements-secondary-btn"
                                                        onClick={() =>
                                                            openEditForm(announcement)
                                                        }
                                                    >
                                                        <Icon type="edit" size={14} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`community-announcements-secondary-btn ${announcement.status === "Published" ? "unpublish-btn" : "publish-btn"}`}
                                                        onClick={() =>
                                                            togglePublished(announcement)
                                                        }
                                                    >
                                                        {announcement.status === "Published"
                                                            ? "Unpublish"
                                                            : "Publish"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="community-announcements-secondary-btn delete-btn"
                                                        onClick={() =>
                                                            deleteAnnouncement(announcement)
                                                        }
                                                        aria-label={`Delete ${announcement.title}`}
                                                    >
                                                        <Icon type="trash" size={14} />
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    )}

                </section>

                {/* CREATE / EDIT FORM */}

                {showForm && (
                    <section
                        className="community-announcements-panel community-announcements-form-panel"
                        id="announcement-form"
                    >
                        <div className="community-announcements-panel-heading">

                            <div className="community-announcements-panel-title">
                                <span className="community-announcements-section-label">
                                    ANNOUNCEMENT DETAILS
                                </span>

                                <h3>
                                    {editingId
                                        ? "Edit Announcement"
                                        : "Create Announcement"}
                                </h3>

                                <p>
                                    Enter the information you want to
                                    share with your community.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="community-announcements-secondary-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormError("");
                                }}
                            >
                                <Icon type="close" size={15} />
                                Close
                            </button>
                        </div>

                        {formError && (
                            <div
                                className="community-announcements-message error"
                                role="alert"
                            >
                                {formError}
                            </div>
                        )}

                        <form
                            className="community-announcements-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="community-announcements-form-grid">

                                <label>
                                    <span>Announcement Title *</span>

                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={event =>
                                            setForm({
                                                ...form,
                                                title: event.target.value,
                                            })
                                        }
                                        placeholder="e.g. Scheduled Water Maintenance"
                                        required
                                    />
                                </label>

                                <label>
                                    <span>Category *</span>

                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={event =>
                                            setForm({
                                                ...form,
                                                category: event.target.value,
                                            })
                                        }
                                        placeholder="Enter a category"
                                        required
                                    />
                                </label>

                                <label>
                                    <span>Relevant Date (optional)</span>

                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={event =>
                                            setForm({
                                                ...form,
                                                date: event.target.value,
                                            })
                                        }
                                    />
                                </label>

                                <label>
                                    <span>Publication Status</span>

                                    <select
                                        value={form.status}
                                        onChange={event =>
                                            setForm({
                                                ...form,
                                                status: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Published">Published</option>
                                    </select>
                                </label>

                                <label className="community-announcements-full-width">
                                    <span>Announcement Message *</span>

                                    <textarea
                                        rows="7"
                                        value={form.content}
                                        onChange={event =>
                                            setForm({
                                                ...form,
                                                content: event.target.value,
                                            })
                                        }
                                        placeholder="Write the full announcement and include any important details..."
                                        required
                                    />
                                </label>

                            </div>

                            <div className="community-announcements-form-actions">

                                <button
                                    type="submit"
                                    className="community-announcements-primary-btn"
                                >
                                    <Icon
                                        type={editingId ? "edit" : "plus"}
                                        size={16}
                                    />

                                    {editingId
                                        ? "Save Changes"
                                        : "Create Announcement"}
                                </button>

                                <button
                                    type="button"
                                    className="community-announcements-secondary-btn"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormError("");
                                    }}
                                >
                                    Cancel
                                </button>

                            </div>
                        </form>
                    </section>
                )}

                {/* VIEW ANNOUNCEMENT DETAILS */}

                {viewing && (
                    <section className="community-announcements-panel community-announcements-detail-panel">

                        <div className="community-announcements-panel-heading">

                            <div className="community-announcements-panel-title">
                                <span className="community-announcements-section-label">
                                    ANNOUNCEMENT DETAILS
                                </span>

                                <h3>{viewing.title}</h3>

                                <p>
                                    {viewing.category}
                                    {" · "}
                                    {viewing.status}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="community-announcements-secondary-btn"
                                onClick={() => setViewing(null)}
                            >
                                <Icon type="close" size={15} />
                                Close
                            </button>

                        </div>

                        <div className="community-announcements-detail-body">

                            <div className="community-announcements-detail-meta">
                                <span className="community-announcements-category-badge">
                                    {viewing.category}
                                </span>

                                <span className={`community-announcements-status-badge ${getStatusClass(viewing.status)}`}>
                                    <span className="community-announcements-status-dot" />
                                    {viewing.status}
                                </span>

                                <span className="community-announcements-date-cell">
                                    <Icon type="calendar" size={15} />
                                    {formatDate(viewing.date)}
                                </span>
                            </div>

                            <p className="community-announcements-detail-content">
                                {viewing.content}
                            </p>

                            <button
                                type="button"
                                className="community-announcements-primary-btn"
                                onClick={() => openEditForm(viewing)}
                            >
                                <Icon type="edit" size={15} />
                                Edit Announcement
                            </button>

                        </div>
                    </section>
                )}

            </main>
        </div>
    );
}

export default CommunityAnnouncements;
