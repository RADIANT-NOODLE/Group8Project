
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { getProperties } from "../../data/propertyStorage";
import "./ResidentDirectory.css";

const DIRECTORY_KEY = "valoraResidentDirectory";
const DIRECTORY_EVENT = "valoraResidentDirectoryUpdated";
const PROPERTY_EVENT = "valoraPropertiesUpdated";
const USER_EVENT = "valoraUsersUpdated";

/* =========================================================
   STORAGE HELPERS
========================================================= */

function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        return value === null ? fallback : value;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return fallback;
    }
}

function getDirectoryRecords() {
    const records = readJSON(DIRECTORY_KEY, []);
    return Array.isArray(records) ? records : [];
}

function saveDirectoryRecords(records) {
    localStorage.setItem(DIRECTORY_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent(DIRECTORY_EVENT));
}

function getStoredUsers() {
    const users = readJSON("valoraUsers", []);
    return Array.isArray(users) ? users : [];
}

function getCurrentUser() {
    return readJSON("valoraUser", null);
}

function normalizeRole(value) {
    const role = String(value || "").trim().toLowerCase();

    if (["hoa", "hoa admin", "hoa administrator", "administrator"].includes(role)) {
        return "HOA Admin";
    }

    if (["head admin", "head administrator", "headadministrator"].includes(role)) {
        return "Head Admin";
    }

    if (["property owner", "resident"].includes(role)) {
        return "Resident";
    }

    if (role === "investor") return "Investor";

    return String(value || "").trim();
}

function normalizeStatus(value) {
    return String(value || "").trim().toLowerCase();
}

function isApprovedAccount(user) {
    return ["approved", "active"].includes(normalizeStatus(user?.status));
}

function getUserName(user) {
    const firstName =
        user?.firstName || user?.firstname || user?.first_name || "";
    const lastName =
        user?.lastName || user?.lastname || user?.last_name || "";

    return (
        user?.fullName ||
        user?.name ||
        `${firstName} ${lastName}`.trim() ||
        user?.email ||
        "Unnamed account"
    );
}

function getUserId(user) {
    return String(user?.id || user?.userId || user?.email || "");
}

function getPropertyUnit(property) {
    return (
        property?.unitNumber ||
        property?.unit ||
        property?.name ||
        property?.id ||
        "Unlabelled unit"
    );
}

function getPropertyType(property) {
    return (
        property?.propertyType ||
        property?.type ||
        "Property"
    );
}

function getPropertyLabel(property) {
    if (!property) return "Property not found";

    const unit = getPropertyUnit(property);
    const type = getPropertyType(property);
    const location = property.location ? ` · ${property.location}` : "";

    return `${unit} · ${type}${location}`;
}

function getContactPhone(user) {
    return (
        user?.phone ||
        user?.phoneNumber ||
        user?.mobile ||
        user?.contactNumber ||
        ""
    );
}

function makeDirectoryId() {
    return (
        "RES-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2, 7).toUpperCase()
    );
}

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, size = 18 }) {
    const icons = {
        total: (
            <>
                <circle cx="8" cy="8" r="3" />
                <circle cx="16" cy="8" r="3" />
                <path d="M2.5 20c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5" />
                <path d="M10.5 20c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5" />
            </>
        ),
        occupied: (
            <>
                <path d="M4 11h16v8H4z" />
                <path d="M7 11V8h10v3" />
                <path d="M3 19h18" />
            </>
        ),
        vacant: (
            <>
                <path d="M4 10.5 12 4l8 6.5V20H4V10.5Z" />
                <path d="M9 20v-6h6v6" />
            </>
        ),
        active: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m7.5 12 3 3 6-6" />
            </>
        ),
        search: (
            <>
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        eye: (
            <>
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
            </>
        ),
        edit: (
            <>
                <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                <path d="m13.5 8.5 3 3" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18M9 6V4h6v2M6 6l1 14h10l1-14" />
                <path d="M10 10v6M14 10v6" />
            </>
        ),
        close: (
            <>
                <path d="m6 6 12 12M18 6 6 18" />
            </>
        ),
        people: (
            <>
                <circle cx="9" cy="8" r="3" />
                <path d="M3.5 20c.4-3.4 2.2-5 5.5-5s5.1 1.6 5.5 5" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M15.5 15c2.7-.1 4.4 1.5 5 4.5" />
            </>
        ),
        shield: (
            <>
                <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" />
                <path d="m8.5 12 2.3 2.3 4.7-5" />
            </>
        ),
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[name] || icons.people}
        </svg>
    );
}

/* =========================================================
   RESIDENT DIRECTORY
========================================================= */

function ResidentDirectory() {
    const [currentUser, setCurrentUser] = useState(getCurrentUser);
    const [residents, setResidents] = useState([]);
    const [properties, setProperties] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [roleFilter, setRoleFilter] = useState("All");
    const [modalMode, setModalMode] = useState("");
    const [selectedResident, setSelectedResident] = useState(null);
    const [form, setForm] = useState({
        userId: "",
        propertyId: "",
        name: "",
        email: "",
        phone: "",
        role: "Resident",
        occupancy: "Occupied",
        status: "Active",
        notes: "",
    });
    const [feedback, setFeedback] = useState({ type: "", text: "" });
    const [formError, setFormError] = useState("");

    const loadData = useCallback(() => {
        setResidents(getDirectoryRecords());
        setProperties(getProperties());
        setUsers(getStoredUsers());
        setCurrentUser(getCurrentUser());
    }, []);

    useEffect(() => {
        loadData();

        const handleStorage = (event) => {
            if (
                !event.key ||
                [
                    DIRECTORY_KEY,
                    "valoraProperties",
                    "valoraUsers",
                    "valoraUser",
                ].includes(event.key)
            ) {
                loadData();
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener(DIRECTORY_EVENT, loadData);
        window.addEventListener(PROPERTY_EVENT, loadData);
        window.addEventListener(USER_EVENT, loadData);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(DIRECTORY_EVENT, loadData);
            window.removeEventListener(PROPERTY_EVENT, loadData);
            window.removeEventListener(USER_EVENT, loadData);
        };
    }, [loadData]);

    const currentRole = normalizeRole(currentUser?.role);
    const currentStatus = normalizeStatus(currentUser?.status);

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!["approved", "active"].includes(currentStatus)) {
        return <Navigate to="/registration-pending" replace />;
    }

    if (!["HOA Admin", "Head Admin"].includes(currentRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    const isHeadAdmin = currentRole === "Head Admin";

    /* =====================================================
       ELIGIBLE ACCOUNTS
       Only approved Resident / Investor accounts can be
       linked to a directory entry.
    ===================================================== */

    const eligibleUsers = useMemo(() => {
        return users.filter((user) => {
            const role = normalizeRole(user?.role);
            return (
                ["Resident", "Investor"].includes(role) &&
                isApprovedAccount(user) &&
                Boolean(getUserId(user))
            );
        });
    }, [users]);

    const propertyById = useMemo(() => {
        return new Map(
            properties.map((property) => [String(property.id), property])
        );
    }, [properties]);

    const usedPropertyIds = useMemo(() => {
        return new Set(
            residents
                .filter((resident) => resident.occupancy === "Occupied")
                .map((resident) => String(resident.propertyId))
                .filter(Boolean)
        );
    }, [residents]);

    const selectedUser = users.find(
        (user) => getUserId(user) === String(form.userId)
    );

    const filteredResidents = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return residents.filter((resident) => {
            const property = propertyById.get(String(resident.propertyId));
            const searchValues = [
                resident.name,
                resident.id,
                resident.email,
                resident.phone,
                resident.role,
                getPropertyUnit(property) !== "Unlabelled unit"
                    ? getPropertyUnit(property)
                    : resident.unit,
                getPropertyType(property),
                property?.location,
            ];

            const matchesSearch =
                !query ||
                searchValues.some((value) =>
                    String(value || "").toLowerCase().includes(query)
                );

            const matchesStatus =
                statusFilter === "All" || resident.status === statusFilter;

            const matchesRole =
                roleFilter === "All" || normalizeRole(resident.role) === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [residents, searchTerm, statusFilter, roleFilter, propertyById]);

    const occupiedUnits = new Set(
        residents
            .filter((resident) => resident.occupancy === "Occupied")
            .map((resident) => String(resident.propertyId))
            .filter(Boolean)
    ).size;

    const vacantUnits = Math.max(0, properties.length - occupiedUnits);

    const activeResidents = residents.filter(
        (resident) => resident.status === "Active"
    ).length;

    function showFeedback(type, text) {
        setFeedback({ type, text });
    }

    function resetForm() {
        setForm({
            userId: "",
            propertyId: "",
            name: "",
            email: "",
            phone: "",
            role: "Resident",
            occupancy: "Occupied",
            status: "Active",
            notes: "",
        });
        setFormError("");
    }

    function openAddModal() {
        resetForm();
        setSelectedResident(null);
        setModalMode("add");
        setFeedback({ type: "", text: "" });
    }

    function openEditModal(resident) {
        setSelectedResident(resident);
        setForm({
            userId: String(resident.userId || ""),
            propertyId: String(resident.propertyId || ""),
            name: resident.name || "",
            email: resident.email || "",
            phone: resident.phone || "",
            role: normalizeRole(resident.role) || "Resident",
            occupancy: resident.occupancy || "Occupied",
            status: resident.status || "Active",
            notes: resident.notes || "",
        });
        setFormError("");
        setModalMode("edit");
        setFeedback({ type: "", text: "" });
    }

    function openViewModal(resident) {
        setSelectedResident(resident);
        setModalMode("view");
        setFeedback({ type: "", text: "" });
    }

    function closeModal() {
        setModalMode("");
        setSelectedResident(null);
        setFormError("");
    }

    function handleUserChange(userId) {
        const user = users.find(
            (item) => getUserId(item) === String(userId)
        );

        if (!user) {
            setForm((previous) => ({ ...previous, userId: "" }));
            return;
        }

        setForm((previous) => ({
            ...previous,
            userId: String(userId),
            name: getUserName(user),
            email: user.email || "",
            phone: getContactPhone(user),
            role: normalizeRole(user.role),
        }));
    }

    function handleSave(event) {
        event.preventDefault();
        setFormError("");

        const name = form.name.trim();
        const email = form.email.trim();
        const phone = form.phone.trim();
        const propertyId = String(form.propertyId || "");
        const userId = String(form.userId || "");

        if (!name) {
            setFormError("Please enter the property holder's name.");
            return;
        }

        if (!email) {
            setFormError("Please enter an email address.");
            return;
        }

        if (!propertyId || !propertyById.has(propertyId)) {
            setFormError("Please select a valid VALORA property.");
            return;
        }

        if (!userId) {
            setFormError("Please link this record to an approved Resident or Investor account.");
            return;
        }

        const account = users.find(
            (user) => getUserId(user) === userId
        );

        if (
            !account ||
            !["Resident", "Investor"].includes(normalizeRole(account.role)) ||
            !isApprovedAccount(account)
        ) {
            setFormError(
                "The selected account must be an approved Resident or Investor."
            );
            return;
        }

        const duplicateAccount = residents.some(
            (resident) =>
                String(resident.userId) === userId &&
                resident.id !== selectedResident?.id
        );

        if (duplicateAccount) {
            setFormError(
                "This account is already in the Resident Directory. Edit its existing record instead."
            );
            return;
        }

        const duplicateProperty = residents.some(
            (resident) =>
                String(resident.propertyId) === propertyId &&
                resident.occupancy === "Occupied" &&
                resident.id !== selectedResident?.id
        );

        if (duplicateProperty && form.occupancy === "Occupied") {
            setFormError(
                "This property already has a confirmed holder in the directory. Edit or remove the existing assignment before assigning another person."
            );
            return;
        }

        const property = propertyById.get(propertyId);
        const timestamp = new Date().toISOString();

        const record = {
            ...(selectedResident || {}),
            id: selectedResident?.id || makeDirectoryId(),
            userId,
            propertyId,
            name,
            email,
            phone,
            role: normalizeRole(account.role),
            unit: getPropertyUnit(property),
            property: getPropertyType(property),
            occupancy: form.occupancy,
            status: form.status,
            notes: form.notes.trim(),
            hoaApproved: true,
            hoaApprovedBy:
                selectedResident?.hoaApprovedBy ||
                getUserName(currentUser),
            hoaApprovedAt:
                selectedResident?.hoaApprovedAt || timestamp,
            updatedAt: timestamp,
        };

        let updatedRecords;

        if (modalMode === "edit" && selectedResident) {
            updatedRecords = residents.map((resident) =>
                resident.id === selectedResident.id ? record : resident
            );
        } else {
            updatedRecords = [...residents, record];
        }

        try {
            saveDirectoryRecords(updatedRecords);
            setResidents(updatedRecords);
            closeModal();

            showFeedback(
                "success",
                modalMode === "edit"
                    ? "Resident directory record updated. The linked login account and historical records were not deleted."
                    : "Property holder approved and added to the Resident Directory."
            );
        } catch (error) {
            console.error("Unable to save directory record:", error);
            setFormError("Unable to save this record. Please try again.");
        }
    }

    function handleRemove(resident) {
        const property = propertyById.get(String(resident.propertyId));
        const propertyName = getPropertyUnit(property);

        const confirmed = window.confirm(
            `Remove ${resident.name} from the Resident Directory for ${propertyName}?\n\nThis removes only the directory assignment. The person's VALORA login account and historical records will remain.`
        );

        if (!confirmed) return;

        try {
            const updatedRecords = residents.filter(
                (item) => item.id !== resident.id
            );

            saveDirectoryRecords(updatedRecords);
            setResidents(updatedRecords);

            showFeedback(
                "success",
                `${resident.name} was removed from the directory. Their VALORA account and historical records remain intact.`
            );
        } catch (error) {
            console.error("Unable to remove directory record:", error);
            showFeedback("error", "Unable to remove this directory record.");
        }
    }

    function getRecordProperty(resident) {
        return propertyById.get(String(resident?.propertyId));
    }

    function getStatusClass(status) {
        return status === "Active"
            ? "resident-directory-status-active"
            : "resident-directory-status-inactive";
    }

    function getOccupancyClass(occupancy) {
        return occupancy === "Occupied"
            ? "resident-directory-occupancy-occupied"
            : "resident-directory-occupancy-vacant";
    }

    const modalTitle = {
        add: "Approve Property Holder",
        edit: "Edit Directory Record",
        view: "Resident Details",
    }[modalMode];

    return (
        <div className="resident-directory-layout">
            <DashboardSidebar />

            <main className="resident-directory-main">
                <header className="resident-directory-top-bar">
                    <div>
                        <span className="resident-directory-eyebrow">
                            COMMUNITY MANAGEMENT
                        </span>
                        <h2>Resident Directory</h2>
                        <p>
                            Confirm property holders and manage approved
                            resident and investor assignments.
                        </p>
                    </div>

                    <div className="resident-directory-profile-small">
                        <div className="resident-directory-profile-circle">
                            {getUserName(currentUser)
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                        </div>
                        <span>
                            {isHeadAdmin ? "Head Admin" : "HOA Admin"}
                        </span>
                    </div>
                </header>

                {feedback.text && (
                    <div
                        className={`resident-directory-feedback resident-directory-feedback-${feedback.type}`}
                        role="status"
                    >
                        <span>{feedback.text}</span>
                        <button
                            type="button"
                            onClick={() => setFeedback({ type: "", text: "" })}
                            aria-label="Dismiss message"
                        >
                            <Icon name="close" size={15} />
                        </button>
                    </div>
                )}

                <section className="resident-directory-stat-cards">
                    <div className="resident-directory-stat-card">
                        <div className="resident-directory-stat-icon">
                            <Icon name="total" size={19} />
                        </div>
                        <div>
                            <p>Approved Holders</p>
                            <h3>{residents.length}</h3>
                            <small>Confirmed directory records</small>
                        </div>
                    </div>

                    <div className="resident-directory-stat-card">
                        <div className="resident-directory-stat-icon">
                            <Icon name="occupied" size={19} />
                        </div>
                        <div>
                            <p>Occupied Units</p>
                            <h3>{occupiedUnits}</h3>
                            <small>Confirmed property assignments</small>
                        </div>
                    </div>

                    <div className="resident-directory-stat-card">
                        <div className="resident-directory-stat-icon">
                            <Icon name="vacant" size={19} />
                        </div>
                        <div>
                            <p>Unassigned Units</p>
                            <h3>{vacantUnits}</h3>
                            <small>Units without a directory holder</small>
                        </div>
                    </div>

                    <div className="resident-directory-stat-card">
                        <div className="resident-directory-stat-icon">
                            <Icon name="active" size={19} />
                        </div>
                        <div>
                            <p>Active Records</p>
                            <h3>{activeResidents}</h3>
                            <small>Active directory entries</small>
                        </div>
                    </div>
                </section>

                <section className="resident-directory-panel">
                    <div className="resident-directory-panel-heading">
                        <div>
                            <h3>Community Residents</h3>
                            <p>
                                Only people explicitly confirmed by the HOA
                                appear in this directory.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="resident-directory-primary-btn"
                            onClick={openAddModal}
                        >
                            <Icon name="plus" size={15} />
                            <span>Approve Property Holder</span>
                        </button>
                    </div>

                    <div className="resident-directory-notice">
                        <Icon name="shield" size={17} />
                        <p>
                            Approving a sell/rent request or assigning an
                            Estate Agent does not automatically confirm
                            ownership or occupancy. Add a person here only
                            after the HOA has verified the property assignment.
                        </p>
                    </div>

                    <div className="resident-directory-filters">
                        <div className="resident-directory-search">
                            <Icon name="search" size={16} />
                            <input
                                type="text"
                                placeholder="Search name, unit, email or phone..."
                                aria-label="Search residents"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                        </div>

                        <select
                            className="resident-directory-filter-select"
                            aria-label="Filter residents by status"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>

                        <select
                            className="resident-directory-filter-select resident-directory-role-filter"
                            aria-label="Filter by account role"
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                        >
                            <option value="All">All Account Types</option>
                            <option value="Resident">Residents</option>
                            <option value="Investor">Investors</option>
                        </select>
                    </div>

                    <div className="resident-directory-results">
                        <span>
                            Showing {filteredResidents.length} of {residents.length} approved holders
                        </span>
                    </div>

                    {residents.length === 0 ? (
                        <div className="resident-directory-empty">
                            <div className="resident-directory-empty-icon">
                                <Icon name="people" size={28} />
                            </div>
                            <h3>No Approved Property Holders Yet</h3>
                            <p>
                                The directory is currently empty. Once the HOA
                                verifies that an approved Resident or Investor
                                actually holds a property, use the button below
                                to link their account to that unit.
                            </p>
                            <button
                                type="button"
                                className="resident-directory-primary-btn"
                                onClick={openAddModal}
                            >
                                <Icon name="plus" size={15} />
                                <span>Approve Property Holder</span>
                            </button>
                        </div>
                    ) : filteredResidents.length === 0 ? (
                        <div className="resident-directory-empty resident-directory-empty-compact">
                            <h3>No Matching Residents</h3>
                            <p>
                                Try another search term or change your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="resident-directory-table-container">
                            <table className="resident-directory-table">
                                <thead>
                                    <tr>
                                        <th>Property Holder</th>
                                        <th>Unit</th>
                                        <th>Contact</th>
                                        <th>Account Type</th>
                                        <th>Occupancy</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResidents.map((resident) => {
                                        const property = getRecordProperty(resident);

                                        return (
                                            <tr key={resident.id}>
                                                <td>
                                                    <div className="resident-directory-resident-cell">
                                                        <strong>{resident.name}</strong>
                                                        <small>{resident.id}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="resident-directory-unit-cell">
                                                        <span className="resident-directory-unit">
                                                            {getPropertyUnit(property) !== "Unlabelled unit"
                                                                ? getPropertyUnit(property)
                                                                : resident.unit || "—"}
                                                        </span>
                                                        <small>
                                                            {property?.location || "VALORA property"}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="resident-directory-contact">
                                                        <span>{resident.phone || "No phone recorded"}</span>
                                                        <small>{resident.email}</small>
                                                    </div>
                                                </td>
                                                <td>{normalizeRole(resident.role) || "—"}</td>
                                                <td>
                                                    <span className={getOccupancyClass(resident.occupancy)}>
                                                        {resident.occupancy || "Unknown"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={getStatusClass(resident.status)}>
                                                        {resident.status || "Inactive"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="resident-directory-actions">
                                                        <button
                                                            type="button"
                                                            className="resident-directory-secondary-btn"
                                                            onClick={() => openViewModal(resident)}
                                                        >
                                                            <Icon name="eye" size={13} />
                                                            <span>View</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="resident-directory-secondary-btn"
                                                            onClick={() => openEditModal(resident)}
                                                        >
                                                            <Icon name="edit" size={13} />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="resident-directory-remove-btn"
                                                            onClick={() => handleRemove(resident)}
                                                        >
                                                            <Icon name="trash" size={13} />
                                                            <span>Remove</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {modalMode && (
                <div
                    className="resident-directory-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    <section
                        className="resident-directory-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="resident-directory-modal-title"
                    >
                        <header className="resident-directory-modal-header">
                            <div>
                                <span className="resident-directory-eyebrow">
                                    HOA VERIFICATION
                                </span>
                                <h2 id="resident-directory-modal-title">
                                    {modalTitle}
                                </h2>
                                <p>
                                    Link an approved account to a verified
                                    property assignment.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="resident-directory-modal-close"
                                onClick={closeModal}
                                aria-label="Close dialog"
                            >
                                <Icon name="close" size={19} />
                            </button>
                        </header>

                        {modalMode === "view" && selectedResident ? (
                            <div className="resident-directory-modal-body">
                                <div className="resident-directory-detail-grid">
                                    <div>
                                        <span>Property Holder</span>
                                        <strong>{selectedResident.name}</strong>
                                    </div>
                                    <div>
                                        <span>Directory Reference</span>
                                        <strong>{selectedResident.id}</strong>
                                    </div>
                                    <div>
                                        <span>Email</span>
                                        <strong>{selectedResident.email || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Phone</span>
                                        <strong>{selectedResident.phone || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Linked Account</span>
                                        <strong>{selectedResident.userId || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Account Type</span>
                                        <strong>{normalizeRole(selectedResident.role) || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Property</span>
                                        <strong>
                                            {getPropertyLabel(getRecordProperty(selectedResident))}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Occupancy</span>
                                        <strong>{selectedResident.occupancy || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Directory Status</span>
                                        <strong>{selectedResident.status || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Approved By</span>
                                        <strong>{selectedResident.hoaApprovedBy || "—"}</strong>
                                    </div>
                                    <div className="resident-directory-detail-full">
                                        <span>Notes</span>
                                        <strong>{selectedResident.notes || "No notes recorded."}</strong>
                                    </div>
                                </div>
                                <div className="resident-directory-modal-footer">
                                    <button
                                        type="button"
                                        className="resident-directory-secondary-btn"
                                        onClick={closeModal}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="resident-directory-primary-btn"
                                        onClick={() => openEditModal(selectedResident)}
                                    >
                                        <Icon name="edit" size={14} />
                                        <span>Edit Record</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form
                                className="resident-directory-modal-body"
                                onSubmit={handleSave}
                            >
                                {modalMode === "add" && (
                                    <div className="resident-directory-form-group">
                                        <label htmlFor="resident-user">
                                            Approved Resident / Investor Account *
                                        </label>
                                        <select
                                            id="resident-user"
                                            value={form.userId}
                                            onChange={(event) =>
                                                handleUserChange(event.target.value)
                                            }
                                            required
                                        >
                                            <option value="">
                                                Select an approved account
                                            </option>
                                            {eligibleUsers.map((user) => (
                                                <option
                                                    key={getUserId(user)}
                                                    value={getUserId(user)}
                                                    disabled={residents.some(
                                                        (resident) =>
                                                            String(resident.userId) === getUserId(user)
                                                    )}
                                                >
                                                    {getUserName(user)} — {normalizeRole(user.role)} ({user.email || getUserId(user)})
                                                    {residents.some(
                                                        (resident) =>
                                                            String(resident.userId) === getUserId(user)
                                                    )
                                                        ? " — Already in directory"
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {eligibleUsers.length === 0 && (
                                            <small>
                                                No approved Resident or Investor accounts were found in
                                                valoraUsers. Approve the user's account first.
                                            </small>
                                        )}
                                    </div>
                                )}

                                {modalMode === "edit" && (
                                    <div className="resident-directory-linked-account">
                                        <Icon name="shield" size={17} />
                                        <p>
                                            Linked account: <strong>{selectedResident?.userId}</strong>.
                                            Editing this record does not change or delete the login account.
                                        </p>
                                    </div>
                                )}

                                <div className="resident-directory-form-grid">
                                    <div className="resident-directory-form-group">
                                        <label htmlFor="resident-name">Full Name *</label>
                                        <input
                                            id="resident-name"
                                            value={form.name}
                                            onChange={(event) =>
                                                setForm({ ...form, name: event.target.value })
                                            }
                                            required
                                            placeholder="Property holder's full name"
                                        />
                                    </div>

                                    <div className="resident-directory-form-group">
                                        <label htmlFor="resident-email">Email Address *</label>
                                        <input
                                            id="resident-email"
                                            type="email"
                                            value={form.email}
                                            onChange={(event) =>
                                                setForm({ ...form, email: event.target.value })
                                            }
                                            required
                                            placeholder="name@example.com"
                                        />
                                    </div>

                                    <div className="resident-directory-form-group">
                                        <label htmlFor="resident-phone">Phone Number</label>
                                        <input
                                            id="resident-phone"
                                            value={form.phone}
                                            onChange={(event) =>
                                                setForm({ ...form, phone: event.target.value })
                                            }
                                            placeholder="Contact number"
                                        />
                                    </div>

                                    <div className="resident-directory-form-group">
                                        <label htmlFor="resident-property">Verified Property *</label>
                                        <select
                                            id="resident-property"
                                            value={form.propertyId}
                                            onChange={(event) =>
                                                setForm({ ...form, propertyId: event.target.value })
                                            }
                                            required
                                        >
                                            <option value="">Select a property</option>
                                            {properties.map((property) => {
                                                const propertyId = String(property.id);
                                                const assignedToAnother = residents.some(
                                                    (resident) =>
                                                        String(resident.propertyId) === propertyId &&
                                                        resident.occupancy === "Occupied" &&
                                                        resident.id !== selectedResident?.id
                                                );

                                                return (
                                                    <option
                                                        key={propertyId}
                                                        value={propertyId}
                                                        disabled={assignedToAnother}
                                                    >
                                                        {getPropertyLabel(property)}
                                                        {assignedToAnother ? " — Already assigned" : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <div className="resident-directory-form-group">
                                        <label htmlFor="resident-occupancy">Occupancy</label>
                                        <select
                                            id="resident-occupancy"
                                            value={form.occupancy}
                                            onChange={(event) =>
                                                setForm({ ...form, occupancy: event.target.value })
                                            }
                                        >
                                            <option value="Occupied">Occupied</option>
                                            <option value="Vacant">Vacant</option>
                                        </select>
                                    </div>

                                    <div className="resident-directory-form-group">
                                        <label htmlFor="resident-status">Directory Status</label>
                                        <select
                                            id="resident-status"
                                            value={form.status}
                                            onChange={(event) =>
                                                setForm({ ...form, status: event.target.value })
                                            }
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="resident-directory-form-group resident-directory-form-full">
                                        <label htmlFor="resident-notes">HOA Notes</label>
                                        <textarea
                                            id="resident-notes"
                                            rows={3}
                                            value={form.notes}
                                            onChange={(event) =>
                                                setForm({ ...form, notes: event.target.value })
                                            }
                                            placeholder="Optional verification or ownership notes"
                                        />
                                    </div>
                                </div>

                                {formError && (
                                    <div className="resident-directory-form-error" role="alert">
                                        {formError}
                                    </div>
                                )}

                                <div className="resident-directory-modal-footer">
                                    <button
                                        type="button"
                                        className="resident-directory-secondary-btn"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="resident-directory-primary-btn"
                                        disabled={modalMode === "add" && eligibleUsers.length === 0}
                                    >
                                        <Icon name={modalMode === "edit" ? "edit" : "shield"} size={14} />
                                        <span>
                                            {modalMode === "edit"
                                                ? "Save Changes"
                                                : "Confirm HOA Approval"}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

export default ResidentDirectory;
