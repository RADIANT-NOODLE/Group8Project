import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { roleLabel } from "../../services/userApi";
import "./RegistrationRequests.css";
import { getSessionToken, getStoredUser } from "../../services/session";

/* =========================================================
   ROLE HELPERS
========================================================= */

function normalizeRole(value) {
    const role = String(value || "").trim().toLowerCase();

    if (["head admin", "head administrator", "headadministrator", "head_admin"].includes(role)) {
        return "head_admin";
    }

    if (["hoa", "hoa admin", "hoa administrator", "administrator", "hoa_admin"].includes(role)) {
        return "hoa_admin";
    }

    return value || "";
}

/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {
    try {
        const storedUser = getStoredUser();
        if (!storedUser) return null;
        const user = storedUser;
        if (!user || typeof user !== "object") return null;

        const firstName = user.firstName || user.firstname || user.first_name || "";
        const lastName = user.lastName || user.lastname || user.last_name || "";
        const fullName = user.fullName || user.name || `${firstName} ${lastName}`.trim() || "VALORA Administrator";

        return {
            ...user,
            role: normalizeRole(user.role),
            firstName,
            lastName,
            fullName,
            initials: user.initials || fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase(),
        };
    } catch (error) {
        console.error("Unable to load current VALORA user:", error);
        return null;
    }
}

function isApproved(user) {
    if (!user) return false;
    if (user.hoa_approved === true) return true;
    const status = String(user?.status || "").trim().toLowerCase();
    return status === "approved" || status === "active";
}

/* =========================================================
   API FETCHING
========================================================= */

async function fetchAllUsersFromApi() {
    const token = getSessionToken();
    const response = await fetch("http://127.0.0.1:8000/api/v1/users/", { 
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json"}
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
}

/* =========================================================
   REGISTRATION REQUESTS
========================================================= */

function RegistrationRequests() {
    const currentUser = getCurrentUser();

    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);

    // MODAL STATE
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm' or 'alert'
        title: '',
        message: '',
        actionUserId: null,
        actionType: null // 'approve' or 'reject'
    });

    useEffect(() => {
        fetchAllUsersFromApi()
            .then(data => {
                if (data && data.users) {
                    setAllUsers(data.users);
                } else if (Array.isArray(data)) {
                    setAllUsers(data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const pendingUsers = allUsers.filter(u => u.hoa_approved !== true);
    const approvedUsers = allUsers.filter(u => u.hoa_approved === true);

    /* =====================================================
       MODAL HANDLERS
    ===================================================== */

    function openConfirmModal(userId, actionType) {
        const isApprove = actionType === 'approve';
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: isApprove ? 'Approve Registration' : 'Reject Registration',
            message: isApprove 
                ? 'Are you sure you want to approve this user? They will be granted access to the system.'
                : 'Are you sure you want to reject this user? This action cannot be undone.',
            actionUserId: userId,
            actionType: actionType
        });
    }

    async function confirmAction() {
        const { actionUserId, actionType } = modalConfig;
        const isApprove = actionType === 'approve';
        
        // Close modal immediately
        setModalConfig(prev => ({ ...prev, isOpen: false }));

        try {
            const token = getSessionToken();
            
            const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${actionUserId}/${actionType}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error(`Failed to ${actionType} user`);
            
            // Approved users stay in the list (now approved); rejected users are deleted by the API.
            setAllUsers(previous =>
                isApprove
                    ? previous.map(u => (u.id === actionUserId ? { ...u, hoa_approved: true } : u))
                    : previous.filter(u => u.id !== actionUserId)
            );

            // Show success alert
            setModalConfig({
                isOpen: true,
                type: 'alert',
                title: 'Success',
                message: `Registration successfully ${isApprove ? 'approved' : 'rejected'}.`,
                actionUserId: null,
                actionType: null
            });

        } catch (error) {
            setModalConfig({
                isOpen: true,
                type: 'alert',
                title: 'Error',
                message: error.message,
                actionUserId: null,
                actionType: null
            });
        }
    }

    /* =====================================================
       ACCESS CONTROL
    ===================================================== */

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isApproved(currentUser)) {
        return <Navigate to="/registration-pending" replace />;
    }

    if (!["head_admin", "hoa_admin"].includes(currentUser.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    const isHeadAdmin = currentUser.role === "head_admin";

    /* =====================================================
       PAGE CONTENT
    ===================================================== */

    return (
        <div className="registration-requests-page">
            {/* SHARED VALORA SIDEBAR */}
            <DashboardSidebar suppliedUser={currentUser} />

            <main className="registration-requests-main dashboard-main-content">
                <header className="registration-requests-topbar">
                    <div>
                        <p className="registration-requests-eyebrow">
                            {isHeadAdmin ? "HEAD ADMINISTRATION" : "HOA ADMINISTRATION"}
                        </p>

                        <h1>Registration Requests</h1>

                        <p className="registration-requests-subtitle">
                            Review and manage requests from users waiting for VALORA account approval.
                        </p>
                    </div>

                    <div className="registration-requests-profile">
                        <div className="registration-requests-profile-avatar">
                            {currentUser.initials}
                        </div>

                        <div>
                            <strong>{currentUser.fullName}</strong>
                            <span>{roleLabel(currentUser.role)}</span>
                        </div>
                    </div>
                </header>

                {/* STATISTICS */}
                <section className="registration-requests-stats">
                    <div className="registration-requests-stat-card">
                        <span>Pending Requests</span>
                        <strong>{loading ? "..." : pendingUsers.length}</strong>
                        <small>Awaiting review</small>
                    </div>

                    <div className="registration-requests-stat-card">
                        <span>Approved Accounts</span>
                        <strong>{loading ? "..." : approvedUsers.length}</strong>
                        <small>Total approved users</small>
                    </div>

                    <div className="registration-requests-stat-card">
                        <span>Total Pending</span>
                        <strong>{loading ? "..." : pendingUsers.length}</strong>
                        <small>Waiting for approval</small>
                    </div>
                </section>

                {/* PENDING REQUESTS */}
                <section className="registration-requests-panel registration-requests-large-panel">
                    <div className="registration-requests-panel-heading">
                        <div>
                            <h2>Pending Registration Requests</h2>
                            <p>Review the user's details and selected VALORA role before approving access.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="registration-requests-empty">
                            <h3>Loading pending requests...</h3>
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="registration-requests-empty">
                            <div className="registration-requests-empty-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M5 12.5L9.2 16.5L19 6.5" />
                                </svg>
                            </div>
                            <h3>No pending registrations</h3>
                            <p>There are currently no registration requests waiting for approval.</p>
                        </div>
                    ) : (
                        <div className="registration-requests-table-container">
                            <table className="registration-requests-table">
                                <thead>
                                    <tr>
                                        <th>Applicant</th>
                                        <th>Email</th>
                                        <th>Requested Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pendingUsers.map((user, index) => (
                                        <tr key={user.id || user.email || index}>
                                            <td>
                                                <strong>{user.full_name || user.email || "Unnamed applicant"}</strong>
                                            </td>

                                            <td>{user.email || "—"}</td>

                                            <td>
                                                <span className="registration-requests-role">
                                                    {roleLabel(user.role) || "Not specified"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="registration-requests-status pending">
                                                    Pending
                                                </span>
                                            </td>

                                            <td>
                                                <div className="registration-requests-actions">
                                                    <button
                                                        type="button"
                                                        className="registration-requests-primary-btn"
                                                        onClick={() => openConfirmModal(user.id, 'approve')}
                                                    >
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                            <path d="M5 12.5L9.2 16.5L19 6.5" />
                                                        </svg>
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="registration-requests-secondary-btn"
                                                        onClick={() => openConfirmModal(user.id, 'reject')}
                                                    >
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                            <path d="M6 6L18 18" />
                                                            <path d="M18 6L6 18" />
                                                        </svg>
                                                        Reject
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

                {/* APPROVAL PROCESS */}
                <section className="registration-requests-information-grid">
                    <div className="registration-requests-panel">
                        <div className="registration-requests-panel-heading">
                            <div>
                                <h2>Approval Process</h2>
                                <p>How registration approval works.</p>
                            </div>
                        </div>

                        <div className="registration-requests-steps">
                            <div className="registration-requests-step">
                                <div className="registration-requests-step-number">1</div>
                                <div>
                                    <strong>Registration</strong>
                                    <span>User submits their details and selects their requested role.</span>
                                </div>
                            </div>

                            <div className="registration-requests-step">
                                <div className="registration-requests-step-number">2</div>
                                <div>
                                    <strong>Review</strong>
                                    <span>{isHeadAdmin ? "The Head Admin reviews the registration request." : "The HOA Admin reviews the registration request."}</span>
                                </div>
                            </div>

                            <div className="registration-requests-step">
                                <div className="registration-requests-step-number">3</div>
                                <div>
                                    <strong>Decision</strong>
                                    <span>The administrator approves or rejects the request.</span>
                                </div>
                            </div>

                            <div className="registration-requests-step">
                                <div className="registration-requests-step-number">4</div>
                                <div>
                                    <strong>Access</strong>
                                    <span>Approved users can sign in and access their assigned dashboard.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* =====================================================
                CUSTOM MODAL 
            ===================================================== */}
            {modalConfig.isOpen && (
                <div className="valora-modal-overlay">
                    <div className="valora-modal">
                        <h3>{modalConfig.title}</h3>
                        <p>{modalConfig.message}</p>
                        
                        <div className="valora-modal-actions">
                            {modalConfig.type === 'confirm' ? (
                                <>
                                    <button 
                                        className="valora-modal-btn valora-modal-btn-cancel"
                                        onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="valora-modal-btn valora-modal-btn-confirm"
                                        onClick={confirmAction}
                                    >
                                        Confirm
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="valora-modal-btn valora-modal-btn-confirm"
                                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                >
                                    Okay
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RegistrationRequests;