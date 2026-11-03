import { useState } from "react";
import { COMPLAINT_STATUS, toComplaintStatus } from "../services/statusMap";
import "./ComplaintStatusRing.css";

/*
=========================================================
COMPLAINT STATUS RING

A ring split by where the resident's complaints stand:
red = just sent, yellow = being worked on, green = resolved.
The total sits in the middle; the legend beside it names
each colour with its count, so colour is never the only cue.
=========================================================
*/

const GROUPS = [
    {
        key: "sent",
        label: "Just sent",
        color: "#d03b3b",
        statuses: [COMPLAINT_STATUS.submitted],
    },
    {
        key: "progress",
        label: "In progress",
        color: "#fab219",
        statuses: [COMPLAINT_STATUS.under_review, COMPLAINT_STATUS.in_progress],
    },
    {
        key: "resolved",
        label: "Resolved",
        color: "#0ca30c",
        statuses: [COMPLAINT_STATUS.resolved, COMPLAINT_STATUS.closed],
    },
];

const SIZE = 132;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3; // surface gap between segments, in px along the ring

export function countComplaintsByStatus(complaints) {
    const counts = Object.fromEntries(GROUPS.map((group) => [group.key, 0]));

    for (const complaint of complaints) {
        const status = toComplaintStatus(complaint.status) || COMPLAINT_STATUS.submitted;
        const group = GROUPS.find((item) => item.statuses.includes(status));
        if (group) counts[group.key] += 1;
    }

    return counts;
}

/* layout: "column" (ring above legend, for side columns) or "row" (side by side, for wide cards). */
export default function ComplaintStatusRing({ complaints, loading, layout = "column" }) {
    const [active, setActive] = useState(null);

    const counts = countComplaintsByStatus(complaints);
    const total = GROUPS.reduce((sum, group) => sum + counts[group.key], 0);
    const shown = GROUPS.filter((group) => counts[group.key] > 0);
    const gap = shown.length > 1 ? GAP : 0;

    let offset = 0;
    const segments = shown.map((group) => {
        const length = (counts[group.key] / total) * CIRCUMFERENCE;
        const segment = {
            ...group,
            dash: Math.max(length - gap, 0.5),
            offset,
        };
        offset += length;
        return segment;
    });

    const activeGroup = GROUPS.find((group) => group.key === active);

    const summary = loading
        ? "Loading complaints"
        : `${total} complaint${total === 1 ? "" : "s"}: ` +
          GROUPS.map((group) => `${counts[group.key]} ${group.label.toLowerCase()}`).join(", ");

    return (
        <div className={`complaint-ring${layout === "row" ? " is-row" : ""}`}>
            <div className="complaint-ring-chart">
                <svg
                    width={SIZE}
                    height={SIZE}
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    role="img"
                    aria-label={summary}
                >
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={RADIUS}
                        fill="none"
                        stroke="#eee8f2"
                        strokeWidth={STROKE}
                    />

                    {!loading &&
                        segments.map((segment) => (
                            <circle
                                key={segment.key}
                                className={
                                    active && active !== segment.key
                                        ? "complaint-ring-segment is-dimmed"
                                        : "complaint-ring-segment"
                                }
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth={STROKE}
                                strokeDasharray={`${segment.dash} ${CIRCUMFERENCE}`}
                                strokeDashoffset={-segment.offset}
                                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                                onMouseEnter={() => setActive(segment.key)}
                                onMouseLeave={() => setActive(null)}
                            >
                                <title>{`${segment.label}: ${counts[segment.key]}`}</title>
                            </circle>
                        ))}
                </svg>

                <div className="complaint-ring-centre" aria-hidden="true">
                    <strong>{loading ? "…" : activeGroup ? counts[activeGroup.key] : total}</strong>
                    <span>{activeGroup ? activeGroup.label : total === 1 ? "Complaint" : "Complaints"}</span>
                </div>
            </div>

            <ul className="complaint-ring-legend">
                {GROUPS.map((group) => (
                    <li
                        key={group.key}
                        className={active === group.key ? "is-active" : undefined}
                        onMouseEnter={() => setActive(group.key)}
                        onMouseLeave={() => setActive(null)}
                    >
                        <span className="complaint-ring-swatch" style={{ background: group.color }} aria-hidden="true" />
                        <span className="complaint-ring-label">{group.label}</span>
                        <strong>{loading ? "…" : counts[group.key]}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}
