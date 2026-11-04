import "./StageSummary.css";

/*
=========================================================
STAGE SUMMARY

One card for "how many records sit in each stage": a
headline, a single bar split by stage, and a tile per stage
(colour dot + name + count + short note, so colour is never
the only cue). Used by the three Properties tabs.

tone: "waiting" (needs you), "progress", "done", "changes",
      "rejected" or "neutral".
=========================================================
*/

export default function StageSummary({ eyebrow, title, subtitle, stages }) {
    const total = stages.reduce((sum, stage) => sum + stage.count, 0);
    const shown = stages.filter((stage) => stage.count > 0);

    return (
        <section className="stage-summary" aria-label={eyebrow}>
            <div className="stage-summary-head">
                <div>
                    <p className="stage-summary-eyebrow">{eyebrow}</p>
                    <h2>{title}</h2>
                    {subtitle && <p className="stage-summary-subtitle">{subtitle}</p>}
                </div>
                <div className="stage-summary-total">
                    <strong>{total}</strong>
                    <span>in total</span>
                </div>
            </div>

            <div
                className="stage-summary-bar"
                role="img"
                aria-label={stages.map((stage) => `${stage.label}: ${stage.count}`).join(", ")}
            >
                {shown.map((stage) => (
                    <span
                        key={stage.key}
                        className={`stage-summary-segment tone-${stage.tone}`}
                        style={{ flexGrow: stage.count }}
                        title={`${stage.label}: ${stage.count}`}
                    />
                ))}
            </div>

            <ul className="stage-summary-stages" style={{ "--stage-count": stages.length }}>
                {stages.map((stage) => (
                    <li key={stage.key} className={stage.count > 0 ? "has-items" : undefined}>
                        <span className="stage-summary-label">
                            <span className={`stage-summary-dot tone-${stage.tone}`} aria-hidden="true" />
                            {stage.label}
                        </span>
                        <strong>{stage.count}</strong>
                        {stage.hint && <small>{stage.hint}</small>}
                    </li>
                ))}
            </ul>
        </section>
    );
}
