import React from "react";
import { COMPLAINT_STATUS, complaintStatusLabel } from "../services/statusMap";
import "./ComplaintPipeline.css";

const STAGES = [
    { status: COMPLAINT_STATUS.submitted, label: "Submitted", hint: "Waiting to be picked up" },
    { status: COMPLAINT_STATUS.under_review, label: "Under review", hint: "Being assessed" },
    { status: COMPLAINT_STATUS.in_progress, label: "In progress", hint: "Being worked on" },
    { status: COMPLAINT_STATUS.resolved, label: "Resolved", hint: "Completed" },
];

const LAST_STAGE = STAGES.length - 1;

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}

function CrossIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}

/** Where one complaint sits on its way to being resolved. */
export default function ComplaintPipeline({ status }) {
    const isDenied = status === COMPLAINT_STATUS.denied;
    const current = isDenied ? LAST_STAGE : STAGES.findIndex((stage) => stage.status === status);
    const isFinished = current === LAST_STAGE;
    // a denied complaint may have skipped stages, so only the first one is shown as reached
    const progress = !isDenied && current > 0 ? (current / LAST_STAGE) * 100 : 0;

    return (
        <section className="complaint-pipeline" aria-labelledby="complaint-pipeline-title">
            <h4 id="complaint-pipeline-title">Request pipeline</h4>
            <p>Your complaint is currently: <strong>{complaintStatusLabel(status)}</strong></p>

            <ol className="complaint-pipeline-stages" style={{ "--complaint-pipeline-progress": `${progress}%` }}>
                {STAGES.map((stage, index) => {
                    const isDeniedStage = isDenied && index === LAST_STAGE;
                    const isDone = isDenied ? index === 0 : index < current || (index === current && isFinished);
                    const stateClass = isDeniedStage
                        ? " is-denied"
                        : isDone
                            ? " is-done"
                            : index === current
                                ? " is-current"
                                : "";

                    return (
                        <li
                            key={stage.status}
                            className={`complaint-pipeline-stage${stateClass}`}
                            aria-current={index === current ? "step" : undefined}
                        >
                            <span className="complaint-pipeline-node">
                                {isDeniedStage ? <CrossIcon /> : isDone ? <CheckIcon /> : index + 1}
                            </span>
                            <span className="complaint-pipeline-label">
                                {isDeniedStage ? "Denied" : stage.label}
                            </span>
                            <small>{isDeniedStage ? "Not accepted by the HOA" : stage.hint}</small>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
