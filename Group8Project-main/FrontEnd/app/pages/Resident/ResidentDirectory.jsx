import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./ResidentDirectory.css";
import { useSession, getSessionToken } from "../../services/session";
import { showConfirm } from "../../components/AppDialog";

/*
=========================================================
RESIDENT DIRECTORY (API CONNECTED)
=========================================================
*/

function Icon({ name, size = 18 }) {
    const icons = {
        total: (<><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2.5 20c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5" /><path d="M10.5 20c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5" /></>),
        occupied: (<><path d="M4 11h16v8H4z" /><path d="M7 11V8h10v3" /><path d="M3 19h18" /></>),
        vacant: (<><path d="M4 10.5 12 4l8 6.5V20H4V10.5Z" /><path d="M9 20v-6h6v6" /></>),
        active: (<><circle cx="12" cy="12" r="9" /><path d="m7.5 12 3 3 6-6" /></>),
        search: (<><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>),
        plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
        eye: (<><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>),
        edit: (<><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m13.5 8.5 3 3" /></>),
        trash: (<><path d="M3 6h18M9 6V4h6v2M6 6l1 14h10l1-14" /><path d="M10 10v6M14 10v6" /></>),
        close: (<path d="m6 6 12 12M18 6 6 18" />),
        people: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.4-3.4 2.2-5 5.5-5s5.1 1.6 5.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 15c2.7-.1 4.4 1.5 5 4.5" /></>),
        shield: (<><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.3 2.3 4.7-5" /></>),
    };

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {icons[name] || icons.people}
        </svg>
    );
}

function ResidentDirectory() {
    const { user } = useSession();

    const [residents, setResidents] = useState([]);
    const [properties, setProperties] = useState([]);
    const [users, setUsers] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [roleFilter, setRoleFilter] = useState("All");
    
    const [modalMode, setModalMode] = useState("");
    const [selectedResident, setSelectedResident] = useState(null);
    const [form, setForm] = useState({
        userId: "", propertyId: "", name: "", email: "", phone: "", role: "Resident", occupancy: "Occupied", status: "Active", notes: "",
    });
    const [feedback, setFeedback] = useState({ type: "", text: "" });
    const [formError, setFormError] = useState("");

    // 1. Fetch all necessary data from the API
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = getSessionToken();
            const headers = { "Authorization": `Bearer ${token}` };

            const usersRes = await fetch("http://127.0.0.1:8000/api/v1/users/", { headers });
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                const userList = usersData.users || usersData || [];
                setUsers(userList.filter(u => 
                    String(u.role).toLowerCase() === "resident" && u.hoa_approved === true
                ));
            }

            const propRes = await fetch("http://127.0.0.1:8000/api/v1/properties", { headers });
            if (propRes.ok) {
                const propData = await propRes.json();
                setProperties(propData.properties || propData.items || propData || []);
            }

            const dirRes = await fetch("http://127.0.0.1:8000/api/v1/resident-directory", { headers });
            if (dirRes.ok) {
                const dirData = await dirRes.json();
                setResidents(dirData.items || dirData || []);
            }

        } catch (err) {
            console.error("Failed to load directory data:", err);
            setFeedback({ type: "error", text: "Failed to connect to the server." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- ACCESS CONTROL ---
    if (user === undefined) {
        return <div style={{ padding: "50px", textAlign: "center" }}>Loading directory...</div>;
    }

    if (user === null) {
        return <Navigate to="/login" replace />;
    }

    const currentRole = String(user.role || "").toLowerCase();
    if (!["head_admin", "hoa_admin"].includes(currentRole)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    const isHeadAdmin = currentRole === "head_admin";

    // 2. Derived Data
    const propertyById = useMemo(() => {
        return new Map(properties.map(p => [String(p.id || p.unit_id), p]));
    }, [properties]);

    const usedPropertyIds = useMemo(() => {
        return new Set(
            residents
                .filter(r => r.occupancy === "Occupied")
                .map(r => String(r.property_id ?? r.propertyId))
        );
    }, [residents]);

    const filteredResidents = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return residents.filter((resident) => {
            const property = propertyById.get(String(resident.propertyId));
            const searchValues = [
                resident.name, resident.id, resident.email, resident.phone, resident.role,
                property?.unit_no, property?.complex_name, property?.street_address
            ];
            const matchesSearch = !query || searchValues.some((value) => String(value || "").toLowerCase().includes(query));
            const matchesStatus = statusFilter === "All" || resident.status === statusFilter;
            const matchesRole = roleFilter === "All" || resident.role === roleFilter;
            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [residents, searchTerm, statusFilter, roleFilter, propertyById]);

    const occupiedUnits = residents.filter(r => r.occupancy === "Occupied").length;
    const vacantUnits = Math.max(0, properties.length - occupiedUnits);
    const activeResidents = residents.filter(r => r.status === "Active").length;

    // one tile per unit for the occupancy map, in unit-number order
    const holderByProperty = new Map(
        residents
            .filter(r => r.occupancy === "Occupied")
            .map(r => [String(r.property_id ?? r.propertyId), r.name])
    );
    const unitTiles = [...properties]
        .map((property) => {
            const id = String(property.id ?? property.unit_id);
            return { id, unitNo: property.unit_no || id, holder: holderByProperty.get(id) || "" };
        })
        .sort((a, b) => String(a.unitNo).localeCompare(String(b.unitNo), undefined, { numeric: true }));
    const occupancyShare = properties.length > 0 ? Math.round((occupiedUnits / properties.length) * 100) : 0;

    // 3. Form Handlers
    function resetForm() {
        setForm({ userId: "", propertyId: "", name: "", email: "", phone: "", role: "Resident", occupancy: "Occupied", status: "Active", notes: "" });
        setFormError("");
    }

    function openAddModal() { resetForm(); setSelectedResident(null); setModalMode("add"); setFeedback({ type: "", text: "" }); }

    function openEditModal(resident) {
        setSelectedResident(resident);
        setForm({
            userId: String(resident.userId || resident.id || ""),
            propertyId: String(resident.propertyId || ""),
            name: resident.name || "", email: resident.email || "", phone: resident.phone || "",
            role: resident.role || "Resident", occupancy: resident.occupancy || "Occupied",
            status: resident.status || "Active", notes: resident.notes || "",
        });
        setFormError(""); setModalMode("edit"); setFeedback({ type: "", text: "" });
    }

    function closeModal() { setModalMode(""); setSelectedResident(null); setFormError(""); }

    function handleUserChange(userId) {
        const user = users.find((item) => String(item.id) === String(userId));
        if (!user) return setForm((prev) => ({ ...prev, userId: "" }));
        setForm((prev) => ({
            ...prev, userId: String(userId),
            name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            email: user.email || "", role: user.role || "Resident"
        }));
    }

    // 4. Save (POST to API)
    async function handleSave(event) {
        event.preventDefault();
        setFormError("");

        if (!form.userId || !form.propertyId) {
            return setFormError("Please select an account and a property.");
        }

        const confirmed = await showConfirm(
            modalMode === "edit" ? "Save changes to this directory record?" : "Add this resident to the directory?",
            { title: modalMode === "edit" ? "Save changes?" : "Add resident?", confirmLabel: modalMode === "edit" ? "Save" : "Add resident" }
        );
        if (!confirmed) return;

        try {
            const token = getSessionToken();
            
            const response = await fetch("http://127.0.0.1:8000/api/v1/resident-directory", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: Number(form.userId),
                    property_id: Number(form.propertyId),
                    occupancy: form.occupancy,
                    status: form.status,
                    notes: form.notes
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to save directory record.");
            }

            closeModal();
            setFeedback({ type: "success", text: "Property holder successfully assigned to the property." });
            await loadData(); // Refresh the table

        } catch (err) {
            setFormError(err.message);
        }
    }

    // Delete / Unassign Record
    async function handleUnassign(resident) {
        if (!await showConfirm(`Unassign ${resident.name} from this property? The user account will not be deleted.`)) {
            return;
        }

        try {
            const token = getSessionToken();
            
            const response = await fetch(`http://127.0.0.1:8000/api/v1/resident-directory/${resident.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error("Failed to unassign property holder.");
            }

            setFeedback({ type: "success", text: "Property holder successfully unassigned." });
            await loadData(); // Refresh the table
        } catch (err) {
            setFeedback({ type: "error", text: err.message });
        }
    }


    // 5. UI Helpers
    function getPropertyUnit(property) { return property?.unit_no || property?.unitNumber || property?.id || "Unlabelled"; }
    function getPropertyType(property) { return property?.property_type || property?.type || "Property"; }
    function getPropertyLabel(property) { 
        if (!property) return "Unknown property";
        return `${getPropertyUnit(property)} · ${getPropertyType(property)} · ${property.street_address || property.location || ""}`;
    }

    const modalTitle = { add: "Approve Property Holder", edit: "Edit Directory Record", view: "Resident Details" }[modalMode];

    return (
        <div className="resident-directory-layout">
            <DashboardSidebar />
            <main className="resident-directory-main">
                {/* HEADER */}
                <header className="resident-directory-top-bar">
                    <div>
                        <span className="resident-directory-eyebrow">COMMUNITY MANAGEMENT</span>
                        <h2>Resident Directory</h2>
                        <p>Confirm property holders and manage approved resident assignments.</p>
                    </div>
                    <div className="resident-directory-profile-small">
                        <div className="resident-directory-profile-circle">
                            {(user.fullName || user.email || "HA").split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase()}
                        </div>
                        <span>{isHeadAdmin ? "Head Admin" : "HOA Admin"}</span>
                    </div>
                </header>

                {/* FEEDBACK */}
                {feedback.text && (
                    <div className={`resident-directory-feedback resident-directory-feedback-${feedback.type}`} role="status">
                        <span>{feedback.text}</span>
                        <button type="button" onClick={() => setFeedback({ type: "", text: "" })}><Icon name="close" size={15} /></button>
                    </div>
                )}

                {/* STATS */}
                {/* UNIT OCCUPANCY: one tile per unit in the estate */}
                <section className="resident-directory-occupancy" aria-labelledby="resident-directory-occupancy-title">
                    <div className="resident-directory-occupancy-summary">
                        <p className="resident-directory-occupancy-eyebrow">Unit occupancy</p>
                        <h2 id="resident-directory-occupancy-title">
                            {loading
                                ? "Loading units…"
                                : `${occupiedUnits} of ${properties.length} ${properties.length === 1 ? "unit" : "units"} occupied`}
                        </h2>
                        <p className="resident-directory-occupancy-percent">{loading ? "" : `${occupancyShare}% of the estate has a confirmed holder`}</p>

                        <dl className="resident-directory-occupancy-figures">
                            <div>
                                <dt>Approved holders</dt>
                                <dd>{residents.length}</dd>
                            </div>
                            <div>
                                <dt>Active records</dt>
                                <dd>{activeResidents}</dd>
                            </div>
                            <div>
                                <dt>Unassigned units</dt>
                                <dd>{vacantUnits}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="resident-directory-unit-map">
                        <ul className="resident-directory-unit-grid" aria-label="Units in the estate">
                            {unitTiles.map((tile) => (
                                <li
                                    key={tile.id}
                                    className={`resident-directory-unit-tile${tile.holder ? " is-occupied" : ""}`}
                                    title={tile.holder ? `Unit ${tile.unitNo} · ${tile.holder}` : `Unit ${tile.unitNo} · Unassigned`}
                                    aria-label={tile.holder ? `Unit ${tile.unitNo}, occupied by ${tile.holder}` : `Unit ${tile.unitNo}, unassigned`}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M3 10.5 12 3l9 7.5" />
                                        <path d="M5.5 9.5V21h13V9.5" />
                                    </svg>
                                    <span>{tile.unitNo}</span>
                                </li>
                            ))}
                        </ul>

                        <ul className="resident-directory-unit-legend">
                            <li><span className="resident-directory-unit-swatch is-occupied" aria-hidden="true" />Occupied <strong>{occupiedUnits}</strong></li>
                            <li><span className="resident-directory-unit-swatch" aria-hidden="true" />Unassigned <strong>{vacantUnits}</strong></li>
                        </ul>
                    </div>
                </section>

                {/* TABLE */}
                <section className="resident-directory-panel">
                    <div className="resident-directory-panel-heading">
                        <div><h3>Community Residents</h3><p>Only people explicitly confirmed by the HOA appear in this directory.</p></div>
                        <button type="button" className="resident-directory-primary-btn" onClick={openAddModal}><Icon name="plus" size={15} /><span>Approve Property Holder</span></button>
                    </div>

                    <div className="resident-directory-notice">
                        <Icon name="shield" size={17} />
                        <p>Approving a sell/rent request or assigning an Estate Agent does not automatically confirm ownership. Add a person here only after the HOA has verified the property assignment.</p>
                    </div>

                    <div className="resident-directory-filters">
                        <div className="resident-directory-search">
                            <Icon name="search" size={16} />
                            <input type="text" placeholder="Search name, unit, email or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="resident-directory-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
                        </select>
                        <select className="resident-directory-filter-select resident-directory-role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="All">All Account Types</option><option value="resident">Residents</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="resident-directory-empty"><h3>Loading directory records...</h3></div>
                    ) : filteredResidents.length === 0 ? (
                        <div className="resident-directory-empty">
                            <div className="resident-directory-empty-icon"><Icon name="people" size={28} /></div>
                            <h3>No Approved Property Holders Yet</h3>
                            <p>Click the button to link an approved resident to a property.</p>
                        </div>
                    ) : (
                        <div className="resident-directory-table-container">
                            <table className="resident-directory-table">
                                <thead>
                                    <tr><th>Property Holder</th><th>Unit</th><th>Contact</th><th>Account Type</th><th>Occupancy</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {filteredResidents.map((resident) => {
                                        const property = propertyById.get(String(resident.propertyId));
                                        return (
                                            <tr key={resident.id}>
                                                <td><div className="resident-directory-resident-cell"><strong>{resident.name}</strong><small>{resident.id}</small></div></td>
                                                <td><div className="resident-directory-unit-cell"><span className="resident-directory-unit">{resident.unit_no || "Unassigned"}</span><small>{resident.street_address || "VALORA property"}</small></div></td>
                                                <td><div className="resident-directory-contact"><span>{resident.phone || "No phone recorded"}</span><small>{resident.email}</small></div></td>
                                                <td>{resident.role || "—"}</td>
                                                <td><span className={resident.occupancy === "Occupied" ? "resident-directory-occupancy-occupied" : "resident-directory-occupancy-vacant"}>{resident.occupancy || "Unknown"}</span></td>
                                                <td><span className={resident.status === "Active" ? "resident-directory-status-active" : "resident-directory-status-inactive"}>{resident.status || "Inactive"}</span></td>
                                                <td>
                                                    <div className="resident-directory-actions">
                                                        <button type="button" className="resident-directory-secondary-btn" onClick={() => openEditModal(resident)}><Icon name="edit" size={13} /><span>Edit</span></button>
                                                        <button 
                                                        type="button" 
                                                        className="resident-directory-remove-btn" 
                                                        onClick={() => handleUnassign(resident)}
                                                        style={{ marginLeft: "8px" }} // Add a bit of space
                                                    >
                                                        <Icon name="trash" size={13} />
                                                        <span>Unassign</span>
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

            {/* MODAL */}
            {modalMode && (
                <div className="resident-directory-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <section className="resident-directory-modal" role="dialog" aria-modal="true">
                        <header className="resident-directory-modal-header">
                            <div>
                                <span className="resident-directory-eyebrow">HOA VERIFICATION</span>
                                <h2>{modalTitle}</h2>
                                <p>Link an approved account to a verified property assignment.</p>
                            </div>
                            <button type="button" className="resident-directory-modal-close" onClick={closeModal}><Icon name="close" size={19} /></button>
                        </header>

                        <form className="resident-directory-modal-body" onSubmit={handleSave}>
                            {modalMode === "add" && (
                                <div className="resident-directory-form-group">
                                    <label>Approved Resident Account *</label>
                                    <select value={form.userId} onChange={(e) => handleUserChange(e.target.value)} required>
                                        <option value="">Select an approved account</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name || user.email} ({user.role})
                                            </option>
                                        ))}
                                    </select>
                                    {users.length === 0 && <small style={{ color: "red" }}>No approved residents found.</small>}
                                </div>
                            )}

                            <div className="resident-directory-form-grid">
                                <div className="resident-directory-form-group"><label>Full Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required readOnly={modalMode === "add"} /></div>
                                <div className="resident-directory-form-group"><label>Email Address *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required readOnly={modalMode === "add"} /></div>
                                
                                <div className="resident-directory-form-group">
                                    <label>Verified Property *</label>
                                    <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required>
                                        <option value="">Select a property</option>
                                        {properties.map((property) => {
                                            const propertyId = String(property.id || property.unit_id);
                                            const assignedToAnother = residents.some(r => String(r.propertyId) === propertyId && r.occupancy === "Occupied" && r.id !== selectedResident?.id);
                                            return <option key={propertyId} value={propertyId} disabled={assignedToAnother}>{getPropertyLabel(property)} {assignedToAnother ? "— Already assigned" : ""}</option>;
                                        })}
                                    </select>
                                </div>

                                <div className="resident-directory-form-group">
                                    <label>Occupancy</label>
                                    <select value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: e.target.value })}>
                                        <option value="Occupied">Occupied</option><option value="Vacant">Vacant</option>
                                    </select>
                                </div>

                                <div className="resident-directory-form-group">
                                    <label>Directory Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                        <option value="Active">Active</option><option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="resident-directory-form-group resident-directory-form-full">
                                    <label>HOA Notes</label>
                                    <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional verification or ownership notes" />
                                </div>
                            </div>

                            {formError && <div className="resident-directory-form-error" role="alert">{formError}</div>}

                            <div className="resident-directory-modal-footer">
                                <button type="button" className="resident-directory-secondary-btn" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="resident-directory-primary-btn">
                                    <Icon name={modalMode === "edit" ? "edit" : "shield"} size={14} />
                                    <span>{modalMode === "edit" ? "Save Changes" : "Confirm HOA Approval"}</span>
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default ResidentDirectory;