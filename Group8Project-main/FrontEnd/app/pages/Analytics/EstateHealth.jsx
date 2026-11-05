import React, { useEffect, useState, useCallback } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import { getEstateHealth } from "../../services/analyticsApi.js";
import "./EstateHealth.css";

// ─── constants ────────────────────────────────────────────────────────────────

/** Published model parameters — the backend sends these inside each component,
 *  but we also show them before the first score exists. */
const PILLARS_META = [
  { key: "resolution",      label: "Resolution speed",         weight: 0.30, signal: "How quickly complaints are resolved" },
  { key: "frequency",       label: "Complaint frequency",      weight: 0.25, signal: "Issues logged per property unit" },
  { key: "security",        label: "Security",                 weight: 0.20, signal: "Security complaints in the last 90 days" },
  { key: "satisfaction",    label: "Resident satisfaction",    weight: 0.15, signal: "Ratings on completed work orders" },
  { key: "infrastructure",  label: "Maintenance completion",   weight: 0.10, signal: "Work orders completed, and how service providers are rated" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function scoreBand(score) {
  if (score === null || score === undefined) return { label: "Not scored", tone: "neutral", color: "#9ca3af" };
  if (score >= 75) return { label: "Healthy",    tone: "positive", color: "#16a34a" };
  if (score >= 50) return { label: "Fair",       tone: "warn",     color: "#d97706" };
  return               { label: "Needs work",   tone: "alert",    color: "#dc2626" };
}

function fmt(val, decimals = 1) {
  if (val === null || val === undefined) return "—";
  return Number(val).toFixed(decimals);
}

function shortDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ScoreDial({ score, size = 160 }) {
  const band  = scoreBand(score);
  const r     = size / 2 - 12;
  const circ  = Math.PI * r * 1.5;              // 270° arc
  const filled = score !== null ? (Math.max(0, Math.min(100, score)) / 100) * circ : 0;

  return (
    <div className="eh-dial" style={{ width: size, height: size * 0.82 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb"
            strokeWidth="10" strokeDasharray={`${circ} 999`} strokeLinecap="butt" />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={band.color} strokeWidth="10"
            strokeDasharray={`${filled} 999`} strokeLinecap="butt" />
        </g>
      </svg>
      <div className="eh-dial-label">
        {score !== null
          ? <><span className="eh-score-num" style={{ color: band.color }}>{fmt(score, 0)}</span><span className="eh-score-denom">/ 100</span></>
          : <span className="eh-score-empty">Not scored</span>
        }
      </div>
    </div>
  );
}

function PillarBar({ component }) {
  const [open, setOpen] = useState(false);
  const pct   = Math.max(0, Math.min(100, component.score ?? 0));
  const band  = scoreBand(component.score);
  const hasDetail = component.explanation || component.recommendation;

  return (
    <div className="eh-pillar">
      <button
        className={`eh-pillar-header${hasDetail ? " eh-pillar-expandable" : ""}`}
        onClick={() => hasDetail && setOpen(o => !o)}
        aria-expanded={hasDetail ? open : undefined}
        disabled={!hasDetail}
        type="button"
      >
        <div className="eh-pillar-info">
          <div className="eh-pillar-top-row">
            <span className="eh-pillar-name">{component.label}</span>
            <span className={`eh-pillar-chip eh-chip-${band.tone}`}>{component.measured ? band.label : "No evidence yet"}</span>
            <span className="eh-pillar-weight">{Math.round(component.weight * 100)}% of score</span>
          </div>
          <div className="eh-pillar-track">
            <div
              className="eh-pillar-fill"
              style={{ width: `${component.measured ? pct : 0}%`, background: component.measured ? band.color : "#d1d5db" }}
            />
          </div>
        </div>
        <div className="eh-pillar-score-col">
          <span className="eh-pillar-score-num">
            {component.measured ? fmt(component.score, 0) : "—"}
          </span>
          {hasDetail && (
            <span className={`eh-pillar-chevron${open ? " open" : ""}`}>▾</span>
          )}
        </div>
      </button>

      {open && hasDetail && (
        <div className="eh-pillar-detail">
          {component.explanation && <p className="eh-pillar-expl">{component.explanation}</p>}
          {component.recommendation && (
            <p className="eh-pillar-rec">
              <span className="eh-rec-icon">⚡</span> {component.recommendation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FactorsList() {
  return (
    <ul className="eh-factors-list">
      {PILLARS_META.map(f => (
        <li key={f.key} className="eh-factor-item">
          <span className="eh-factor-weight">{Math.round(f.weight * 100)}%</span>
          <span className="eh-factor-body">
            <span className="eh-factor-label">{f.label}</span>
            <span className="eh-factor-signal">{f.signal}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function StatusChip({ status, score }) {
  const band = scoreBand(score);
  if (status === "insufficient_data") {
    return <span className="eh-status-chip eh-chip-warn">Not enough data yet</span>;
  }
  return <span className={`eh-status-chip eh-chip-${band.tone}`}>{band.label}</span>;
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function EstateHealth() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getEstateHealth());
    } catch (e) {
      setError(e?.message ?? "Could not load estate health data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const scored = data?.status === "scored" && data?.overallScore !== null;

  return (
    <div className="eh-layout">
    <DashboardSidebar />
    <main>
    <div className="eh-page">
      {/* ── header ── */}
      <div className="eh-page-header">
        <div>
          <p className="eh-eyebrow">Analytics</p>
          <h1 className="eh-title">Estate Health</h1>
          <p className="eh-desc">
            How well all VALORA properties are being looked after, based on the last 90 days.
          </p>
        </div>
        <button className="eh-refresh-btn" onClick={load} disabled={loading} type="button">
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* ── loading / error ── */}
      {loading && <p className="eh-state-msg">Calculating Living Score…</p>}
      {!loading && error && (
        <div className="eh-error-box">
          <p>{error}</p>
          <button onClick={load} className="eh-retry-btn" type="button">Try again</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* ── score + pillars ── */}
          <div className="eh-grid-top">
            {/* Score card */}
            <div className="eh-card eh-score-card">
              <div className="eh-card-header">
                <div>
                  <p className="eh-card-eyebrow">Overall Living Score</p>
                  <StatusChip status={data.status} score={data.overallScore} />
                </div>
              </div>
              <div className="eh-score-body">
                <ScoreDial score={data.overallScore} />
                <dl className="eh-score-meta">
                  <div>
                    <dt>Period</dt>
                    <dd>{shortDate(data.windowStart)} – {shortDate(data.windowEnd)}</dd>
                  </div>
                  <div>
                    <dt>Score version</dt>
                    <dd>v{data.engineVersion}</dd>
                  </div>
                  <div>
                    <dt>Properties</dt>
                    <dd>{data.unitCount}</dd>
                  </div>
                  <div>
                    <dt>Measured so far</dt>
                    <dd>{Math.round(data.measuredWeight * 100)}%</dd>
                  </div>
                </dl>
              </div>
              {!scored && (
                <div className="eh-insufficient-box">
                  <span className="eh-warn-icon">⚡</span>
                  <p>
                    {data.measuredWeight < 0.5
                      ? `Only ${Math.round(data.measuredWeight * 100)}% of the score can be measured so far, so no overall score is shown until there is more activity.`
                      : "No score yet. It will appear once there is more activity to measure."}
                  </p>
                </div>
              )}
            </div>

            {/* Five pillars */}
            <div className="eh-card">
              <p className="eh-card-eyebrow">The five areas</p>
              <p className="eh-card-hint">What makes up the score, and how each area is doing</p>
              <div className="eh-pillars">
                {data.components.map(c => <PillarBar key={c.key} component={c} />)}
              </div>
            </div>
          </div>

          {/* ── drivers + factors ── */}
          <div className="eh-grid-bottom">
            {/* Drivers */}
            <div className="eh-card">
              <p className="eh-card-eyebrow">Where to focus</p>
              <p className="eh-card-hint">The areas holding the score back most are listed first</p>
              {data.drivers.length > 0 ? (
                <ul className="eh-drivers-list">
                  {data.drivers.map(d => (
                    <li key={d.key} className="eh-driver-item">
                      <span className="eh-driver-label">{d.label}</span>
                      <span className="eh-driver-score" style={{ color: scoreBand(d.score).color }}>
                        {fmt(d.score, 0)}
                      </span>
                      {d.recommendation && (
                        <p className="eh-driver-rec">{d.recommendation}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="eh-empty-note">
                  This fills in as complaints are logged and work orders are completed.
                </p>
              )}
            </div>

            {/* Published weights */}
            <div className="eh-card">
              <p className="eh-card-eyebrow">What the score weighs</p>
              <p className="eh-card-hint">How much each area counts towards the overall score</p>
              <FactorsList />
            </div>
          </div>

          {/* ── footnote ── */}
          <p className="eh-footnote">
            Calculated on {shortDate(data.asOf)}. Select Refresh for the latest figures.
          </p>
        </>
      )}
    </div>
    </main>
    </div>
  );
}
