import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "./Dashboards/shared/DashboardSidebar";
import InlineMessage from "../components/InlineMessage";
import { useSession } from "../services/session.js";
import { createComplaint, listComplaints } from "../services/complaintApi.js";
import { findUnitIdByUnitNo } from "../services/propertyApi.js";
import {
    COMPLAINT_CATEGORIES,
    complaintStatusLabel,
    complaintStatusTone,
} from "../services/statusMap.js";
import "./Complaints.css";


/*
=========================================================
DISPLAY HELPERS

The API owns the status vocabulary (services/statusMap.js);
the stylesheet owns the colours. This maps one to the other.
=========================================================
*/

const STATUS_CLASS_BY_TONE = {
    open: "complaints-status-submitted",
    active: "complaints-status-progress",
    done: "complaints-status-resolved",
    closed: "complaints-status-cancelled",
    unknown: "complaints-status-submitted",
};

function statusClassName(status) {
    return STATUS_CLASS_BY_TONE[complaintStatusTone(status)] ?? STATUS_CLASS_BY_TONE.unknown;
}

function formatDate(value) {
    if (!value) return "—";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/* The same five stages the backend stores, in order. */
const STATUS_FLOW = [
    ["submitted", "Your complaint has been received by VALORA."],
    ["under_review", "The HOA administrator is reviewing the complaint."],
    ["in_progress", "Work is under way, usually with a service provider assigned."],
    ["resolved", "The issue has been dealt with."],
    ["closed", "The complaint is closed and no further action is planned."],
];

export default function Complaints() {

    const { user } = useSession();

    const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
    const [description, setDescription] = useState("");

    const [complaints, setComplaints] = useState([]);
    const [unitId, setUnitId] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");


    /*
    =========================================================
    LOAD FROM THE API

    The backend scopes the list: a resident sees their own
    complaints, an HOA administrator sees every complaint.

    "My unit" is resolved by matching the reader's unit_no
    against the property list, because the backend does not
    yet expose a user→unit relation.
    =========================================================
    */

    useEffect(() => {

        let cancelled = false;

        async function load() {

            setIsLoading(true);
            setError("");

            try {

                const resolvedUnitId =
                    await findUnitIdByUnitNo(user?.unit_no);

                if (cancelled) return;

                setUnitId(resolvedUnitId);

                const page =
                    await listComplaints({ pageSize: 50 });

                if (cancelled) return;

                setComplaints(page.items);

            } catch (loadError) {

                if (!cancelled) {
                    setError(
                        loadError.message ||
                        "Your complaints could not be loaded."
                    );
                }

            } finally {

                if (!cancelled) {
                    setIsLoading(false);
                }

            }

        }

        load();

        return () => {
            cancelled = true;
        };

    }, [user?.unit_no]);


    /*
    =========================================================
    SUBMIT
    =========================================================

    A complaint belongs to a unit, so the reader's unit must
    resolve before the form can be used. The API rejects
    anything shorter than five characters.
    =========================================================
    */

    async function submitComplaint(event) {

        event.preventDefault();

        setError("");
        setNotice("");


        if (!unitId) {

            setError(
                "Your account is not linked to a unit yet, so a complaint cannot be filed. Ask your HOA administrator to set the unit on your account."
            );

            return;
        }


        if (description.trim().length < 5) {

            setError(
                "Please describe the complaint before submitting."
            );

            return;
        }


        setIsSubmitting(true);

        try {

            const created =
                await createComplaint({
                    unitId,
                    category,
                    description
                });

            setComplaints((current) => [
                created,
                ...current
            ]);

            setDescription("");
            setCategory(COMPLAINT_CATEGORIES[0]);

            setNotice(
                "Complaint submitted. Your HOA administrator can now review it."
            );

        } catch (submitError) {

            setError(
                submitError.message ||
                "The complaint could not be submitted."
            );

        } finally {

            setIsSubmitting(false);

        }

    }


    /* =========================================================
       COMPLAINT STATISTICS

       Counted from the API's status values, so the summary
       cannot drift from what the table shows.
    ========================================================= */

    const statusCounts = useMemo(() => {

        const counts = {
            submitted: 0,
            under_review: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0
        };

        for (const complaint of complaints) {
            if (counts[complaint.status] !== undefined) {
                counts[complaint.status] += 1;
            }
        }

        return counts;

    }, [complaints]);


    /* =========================================================
       SVG ICONS
    ========================================================= */

    const CameraIcon = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4 7.5 6H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-2.5L15 4H9Zm3 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
    );


    return (

        <div className="complaints-layout">

            {/* =================================================
                SHARED VALORA SIDEBAR
            ================================================= */}

            <DashboardSidebar />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="complaints-main">

                <div className="complaints-top-bar">

                    <div>

                        <span className="complaints-eyebrow">
                            RESIDENT SERVICES
                        </span>

                        <h2>
                            Community Complaint Tracker
                        </h2>

                        <p>
                            Report and monitor issues within your community.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    COMPLAINT FORM + SUMMARY
                ================================================= */}

                <div className="complaints-layout-grid">


                    {/* SUBMIT COMPLAINT */}

                    <section className="complaints-panel">

                        <div className="complaints-panel-heading">

                            <div>

                                <h3>
                                    Submit a Complaint
                                </h3>

                                <p>
                                    Provide details about the issue.
                                </p>

                            </div>

                        </div>


                        <form
                            className="complaints-form"
                            onSubmit={submitComplaint}
                        >

                            <label>
                                Complaint Category
                            </label>

                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                            >

                                {COMPLAINT_CATEGORIES.map(
                                    (option) => (

                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>

                                    )
                                )}

                            </select>


                            <label>
                                Complaint Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Describe the issue clearly..."
                            />


                            {/*
                                PHOTO

                                There is no upload endpoint yet, so nothing
                                here is stored. Sending a file would put a
                                base64 string in the request body and claim
                                something the backend cannot keep.
                            */}

                            <div className="complaints-photo-section">

                                <label>
                                    Attach a Photo
                                </label>

                                <p className="complaints-image-upload-help">
                                    Photo uploads arrive with a later release.
                                    Please describe the issue in writing for now.
                                </p>


                                <span
                                    className="complaints-image-upload-button complaints-image-upload-disabled"
                                    aria-disabled="true"
                                >

                                    <CameraIcon />

                                    <span>
                                        Photos Coming Soon
                                    </span>

                                </span>

                            </div>


                            <button
                                type="submit"
                                className="complaints-submit-btn"
                                disabled={isSubmitting || !unitId}
                            >

                                {isSubmitting
                                    ? "Submitting…"
                                    : "Submit Complaint"}

                            </button>


                            <InlineMessage tone="error">
                                {error}
                            </InlineMessage>


                            <InlineMessage tone="success">
                                {notice}
                            </InlineMessage>

                        </form>

                    </section>


                    {/* SUMMARY */}

                    <section className="complaints-panel">

                        <div className="complaints-panel-heading">

                            <div>

                                <h3>
                                    Complaint Summary
                                </h3>

                                <p>
                                    Your current complaints.
                                </p>

                            </div>

                        </div>


                        <div className="complaints-stats">

                            <div>
                                <span>Total</span>
                                <strong>{complaints.length}</strong>
                            </div>

                            <div>
                                <span>Submitted</span>
                                <strong>{statusCounts.submitted}</strong>
                            </div>

                            <div>
                                <span>Under review</span>
                                <strong>{statusCounts.under_review}</strong>
                            </div>

                            <div>
                                <span>In progress</span>
                                <strong>{statusCounts.in_progress}</strong>
                            </div>

                            <div>
                                <span>Resolved</span>
                                <strong>{statusCounts.resolved}</strong>
                            </div>

                            <div>
                                <span>Closed</span>
                                <strong>{statusCounts.closed}</strong>
                            </div>

                        </div>


                        {!unitId && !isLoading && (

                            <div className="complaints-success-message">

                                Your account is not linked to a unit yet.
                                Ask your HOA administrator to set the unit
                                on your account so complaints can be filed.

                            </div>

                        )}

                    </section>

                </div>


                {/* =================================================
                    COMPLAINT HISTORY
                ================================================= */}

                <section className="complaints-panel complaints-history">

                    <div className="complaints-panel-heading">

                        <div>

                            <h3>
                                Complaint History
                            </h3>

                            <p>
                                Track your submitted community issues.
                            </p>

                        </div>

                    </div>


                    <div className="complaints-table-container">

                        <table className="complaints-data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Complaint ID
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {isLoading && (

                                    <tr>

                                        <td colSpan="4">
                                            Loading your complaints…
                                        </td>

                                    </tr>

                                )}


                                {!isLoading && complaints.length === 0 && (

                                    <tr>

                                        <td colSpan="4">
                                            No complaints yet. Issues you file
                                            will appear here.
                                        </td>

                                    </tr>

                                )}


                                {complaints.map((complaint) => (

                                    <tr key={complaint.id}>

                                        <td>
                                            #{complaint.id}
                                        </td>

                                        <td>
                                            {complaint.category}
                                        </td>

                                        <td>
                                            {formatDate(complaint.createdAt)}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    statusClassName(
                                                        complaint.status
                                                    )
                                                }
                                            >
                                                {complaintStatusLabel(
                                                    complaint.status
                                                )}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* =================================================
                    COMPLAINT STATUS FLOW
                ================================================= */}

                <section className="complaints-panel">

                    <div className="complaints-panel-heading">

                        <div>

                            <h3>
                                Complaint Status
                            </h3>

                            <p>
                                Your complaint progresses through the following stages.
                            </p>

                        </div>

                    </div>


                    <div className="complaints-status-flow">

                        {STATUS_FLOW.map(
                            ([status, meaning], index) => (

                                <div
                                    key={status}
                                    className="complaints-status-step"
                                >

                                    <span>
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <strong>
                                        {complaintStatusLabel(status)}
                                    </strong>

                                    <p>
                                        {meaning}
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}
