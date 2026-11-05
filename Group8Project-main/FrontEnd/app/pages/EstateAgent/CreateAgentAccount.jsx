import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { showAlert, showConfirm } from "../../components/AppDialog";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import PasswordRequirements from "../Auth/PasswordRequirements.jsx";
import { createEstateAgent, deleteEstateAgent, listUsers } from "../../services/userApi";
import { cleanTenDigitPhone, validateEmail, validateRequired, validateTenDigitPhone, checkPasswordRules, validateNewPassword } from "../../services/validation.js";
import "../Maintenance/Maintenance.css";
import "./CreateAgentAccount.css";

const EMPTY_FORM = { fullName: "", email: "", phone: "", password: "" };

/**
 * HOA administrators create estate agent accounts here; agents cannot
 * register themselves. The account is approved straight away and the agent
 * signs in with the temporary password, then changes it from their profile.
 */
function initialsOf(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

function AgentCreatedPopup({ agent, onClose }) {
    const closeRef = useRef(null);
    const signInAddress = `${window.location.origin}/login`;

    useEffect(() => {
        const openedFrom = document.activeElement;
        closeRef.current?.focus();

        function closeOnEscape(event) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", closeOnEscape);
        return () => {
            window.removeEventListener("keydown", closeOnEscape);
            openedFrom?.focus?.();
        };
    }, [onClose]);

    return createPortal(
        <div
            className="agent-created-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="agent-created" role="dialog" aria-modal="true" aria-labelledby="agent-created-title">
                <header className="agent-created-header">
                    <span className="agent-created-tick" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                    </span>
                    <h2 id="agent-created-title">Agent account created</h2>
                    <p>They can sign in straight away.</p>
                </header>

                <div className="agent-created-body">
                    <div className="agent-created-person">
                        <span className="agent-created-avatar" aria-hidden="true">{initialsOf(agent.fullName)}</span>
                        <div>
                            <strong>{agent.fullName}</strong>
                            <span>{agent.email}</span>
                        </div>
                    </div>

                    <h3>What to do next</h3>
                    <ol className="agent-created-steps">
                        <li>Share the temporary password with them privately.</li>
                        <li>They sign in at <span className="agent-created-address">{signInAddress}</span></li>
                        <li>They change the password from My Profile.</li>
                    </ol>
                </div>

                <footer className="agent-created-footer">
                    <button type="button" ref={closeRef} onClick={onClose}>Done</button>
                </footer>
            </div>
        </div>,
        document.body
    );
}

function CreateAgentAccount() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [createdAgent, setCreatedAgent] = useState(null);
    const closeCreatedPopup = useCallback(() => setCreatedAgent(null), []);

    const loadAgents = useCallback(async () => {
        try {
            const users = await listUsers();
            setAgents(users.filter((user) => user.role === "estate_agent"));
        } catch (loadError) {
            console.error("Unable to load estate agents:", loadError);
            setError(loadError?.message || "Unable to load estate agents.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAgents();
    }, [loadAgents]);

    async function handleDelete(agent) {
        const confirmed = await showConfirm(
            `Delete the estate agent account for ${agent.full_name} (${agent.email})? They will no longer be able to log in. This cannot be undone.`,
            { title: "Delete estate agent?", confirmLabel: "Delete", tone: "danger" }
        );
        if (!confirmed) return;

        setDeletingId(agent.id);
        try {
            await deleteEstateAgent(agent.id);
            await loadAgents();
            showAlert(`${agent.full_name} has been deleted.`, { title: "Agent deleted" });
        } catch (deleteError) {
            // the table is far from the page's message area, so this needs to be seen here
            showAlert(deleteError?.message || "Unable to delete this estate agent.", { title: "Agent not deleted" });
        } finally {
            setDeletingId(null);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: name === "phone" ? cleanTenDigitPhone(value) : value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const problem =
            validateRequired(form.fullName, "Full name") ||
            validateEmail(form.email) ||
            (form.phone ? validateTenDigitPhone(form.phone) : "") ||
            validateNewPassword(form.password);

        if (problem) {
            setError(problem);
            return;
        }

        if (!(await showConfirm(`Create an estate agent account for ${form.email.trim()}?`, { title: "Create agent account?", confirmLabel: "Create account" }))) return;

        setSubmitting(true);

        try {
            await createEstateAgent(form);
            setForm(EMPTY_FORM);
            await loadAgents();
            setCreatedAgent({ fullName: form.fullName.trim(), email: form.email.trim() });
        } catch (submitError) {
            setError(submitError?.message || "Unable to create the account. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="maintenance-page">
            <DashboardSidebar />

            <main className="maintenance-main">
                <header className="maintenance-header">
                    <div>
                        <p className="maintenance-eyebrow">HOA ADMINISTRATION</p>
                        <h1>Create Agent Account</h1>
                        <p>Estate agents cannot register themselves. Create their account here.</p>
                    </div>
                </header>

                {error && (
                    <div className="maintenance-panel maintenance-access-message" role="alert">
                        {error}
                    </div>
                )}

                <section className="maintenance-panel maintenance-large-panel">
                    <div className="maintenance-panel-heading">
                        <div>
                            <h2>New estate agent</h2>
                            <p>The account is approved immediately.</p>
                        </div>
                    </div>

                    <form className="maintenance-form" onSubmit={handleSubmit} noValidate>
                        <div className="maintenance-form-row">
                            <div className="maintenance-form-group">
                                <label htmlFor="agent-name">Full name *</label>
                                <input
                                    id="agent-name"
                                    name="fullName"
                                    type="text"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    maxLength={100}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="maintenance-form-group">
                                <label htmlFor="agent-email">Email *</label>
                                <input
                                    id="agent-email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="maintenance-form-row">
                            <div className="maintenance-form-group">
                                <label htmlFor="agent-phone">Phone</label>
                                <input
                                    id="agent-phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="0821234567"
                                    value={form.phone}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="maintenance-form-group">
                                <label htmlFor="agent-password">Temporary password *</label>
                                <input
                                    id="agent-password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    aria-describedby="agent-password-rules"
                                />
                            </div>
                        </div>

                        <PasswordRequirements
                            id="agent-password-rules"
                            rules={checkPasswordRules(form.password)}
                            touched={form.password.length > 0}
                        />

                        <div className="maintenance-form-actions">
                            <button type="submit" className="maintenance-primary-btn" disabled={submitting}>
                                {submitting ? "Creating..." : "Create account"}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="maintenance-panel maintenance-large-panel">
                    <div className="maintenance-panel-heading">
                        <div>
                            <h2>Estate agents</h2>
                            <p>Accounts that currently exist.</p>
                        </div>
                    </div>

                    <div className="maintenance-table-wrapper">
                        <table className="maintenance-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Approved</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="maintenance-empty">Loading...</td>
                                    </tr>
                                ) : agents.length > 0 ? (
                                    agents.map((agent) => (
                                        <tr key={agent.id ?? agent.user_id}>
                                            <td>{agent.full_name}</td>
                                            <td>{agent.email}</td>
                                            <td>{agent.hoa_approved ? "Yes" : "Pending"}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="maintenance-delete-btn"
                                                    aria-label={`Delete ${agent.full_name}`}
                                                    disabled={deletingId === agent.id}
                                                    onClick={() => handleDelete(agent)}
                                                >
                                                    {deletingId === agent.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="maintenance-empty">
                                            No estate agent accounts yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {createdAgent && <AgentCreatedPopup agent={createdAgent} onClose={closeCreatedPopup} />}
        </div>
    );
}

export default CreateAgentAccount;
