import React, { useState } from "react";
import "./ValoraModal.css";
import "./DenyComplaintDialog.css";

const MAX_REASON = 1000;

/** Asks why a complaint is being denied. `onDeny(reason)` saves it; if it throws, the message shows here. */
export default function DenyComplaintDialog({ complaint, onCancel, onDeny }) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const trimmed = reason.trim();
        if (!trimmed) {
            setError("Enter the reason this complaint is being denied.");
            return;
        }

        setSaving(true);
        setError("");
        try {
            await onDeny(trimmed);
        } catch (denyError) {
            setError(denyError?.message || "The complaint could not be denied. Please try again.");
            setSaving(false);
        }
    }

    return (
        <div
            className="valora-modal-overlay"
            onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onCancel(); }}
        >
            <form className="valora-modal deny-complaint-dialog" role="dialog" aria-modal="true" aria-labelledby="deny-complaint-title" onSubmit={handleSubmit}>
                <h3 id="deny-complaint-title">Deny complaint #{complaint.id}</h3>
                <p>The resident will see this reason. Any active work orders on this complaint will be cancelled.</p>

                <label htmlFor="deny-complaint-reason">Reason for denial</label>
                <textarea
                    id="deny-complaint-reason"
                    rows={4}
                    maxLength={MAX_REASON}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    autoFocus
                />

                {error && <p className="deny-complaint-error" role="alert">{error}</p>}

                <div className="valora-modal-actions">
                    <button type="button" className="valora-modal-btn valora-modal-btn-cancel" onClick={onCancel} disabled={saving}>
                        Cancel
                    </button>
                    <button type="submit" className="valora-modal-btn valora-modal-btn-confirm" disabled={saving}>
                        {saving ? "Saving..." : "Deny complaint"}
                    </button>
                </div>
            </form>
        </div>
    );
}
