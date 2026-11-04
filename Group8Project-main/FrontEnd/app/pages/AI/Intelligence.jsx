import { useEffect, useState } from 'react';
import DashboardSidebar from '../Dashboards/shared/DashboardSidebar';
import {
  askIntelligence,
  getIntelligence,
  listAccessibleEstates,
} from '../../services/intelligenceApi.js';
import './Intelligence.css';

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function Metric({ label, value, note }) {
  return (
    <article className="intelligence-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export default function Intelligence() {
  const [summary, setSummary] = useState(null);
  const [estates, setEstates] = useState([]);
  const [selectedEstateId, setSelectedEstateId] = useState('');
  const [estatesLoading, setEstatesLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [askError, setAskError] = useState('');
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setEstatesLoading(true);
    listAccessibleEstates({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setEstates(result);
        setSelectedEstateId((current) => (
          result.some((estate) => String(estate.estate_id) === current)
            ? current
            : result.length === 1
              ? String(result[0].estate_id)
              : ''
        ));
        setLoadError(result.length ? '' : 'No estate access is linked to this account yet.');
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setEstatesLoading(false);
      });

    return () => controller.abort();
  }, [refreshKey]);

  const selectedEstate = estates.find(
    (estate) => String(estate.estate_id) === selectedEstateId,
  );

  useEffect(() => {
    if (estatesLoading) return undefined;
    if (!selectedEstate) {
      setSummary(null);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    getIntelligence({ signal: controller.signal, estate: selectedEstate })
      .then((result) => {
        if (!controller.signal.aborted) setSummary(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [estatesLoading, refreshKey, selectedEstate]);

  async function handleAsk(event) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3 || asking) return;

    setAsking(true);
    setAskError('');
    setAnswer(null);
    try {
      setAnswer(await askIntelligence(trimmedQuestion, selectedEstateId));
    } catch (error) {
      setAskError(error.message);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="intelligence-page">
      <DashboardSidebar />
      <main className="intelligence-main">
        <header className="intelligence-header">
          <div>
            <p className="intelligence-eyebrow">VALORA / PROPERTY OPERATIONS</p>
            <h1>VALORA Intelligence</h1>
            <p className="intelligence-subtitle">
              Current complaints and maintenance activity for {summary?.scope ?? 'your access scope'}.
            </p>
          </div>
          <div className="intelligence-header-actions">
            {estates.length > 1 ? (
              <label className="intelligence-estate-picker">
                <span>Estate</span>
                <select
                  aria-label="Estate"
                  value={selectedEstateId}
                  onChange={(event) => {
                    setSelectedEstateId(event.target.value);
                    setAnswer(null);
                    setAskError('');
                  }}
                  disabled={estatesLoading}
                >
                  <option value="">Choose an estate</option>
                  {estates.map((estate) => (
                    <option key={estate.estate_id} value={estate.estate_id}>
                      {estate.estate_name}{estate.is_demo ? ' ┬╖ Demo' : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button
              type="button"
              className="intelligence-refresh"
              onClick={() => setRefreshKey((key) => key + 1)}
              disabled={loading || estatesLoading}
            >
              {loading || estatesLoading ? 'RefreshingΓÇª' : 'Refresh'}
            </button>
          </div>
        </header>

        {loading || estatesLoading ? <p className="intelligence-state" role="status">Loading authorised recordsΓÇª</p> : null}
        {!estatesLoading && estates.length > 1 && !selectedEstateId ? (
          <p className="intelligence-state" role="status">Choose an estate to view its authorised records.</p>
        ) : null}
        {loadError ? (
          <div className="intelligence-error" role="alert">
            <p><strong>Intelligence data unavailable.</strong> {loadError}</p>
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>Try again</button>
          </div>
        ) : null}

        {summary ? (
          <>
            {summary.units_count === 0 ? (
              <p className="intelligence-state" role="status">
                {summary.role === 'hoa_admin'
                  ? 'No units are registered in this estate yet.'
                  : 'No property is linked to this account yet. Ask an administrator to confirm your access.'}
              </p>
            ) : null}

            <section className="intelligence-metrics" aria-label="Operational totals">
              <Metric label="Open complaints" value={summary.open_complaints} note="Currently active records" />
              <Metric label="Active work orders" value={summary.active_work_orders} note="Assigned or in progress" />
              <Metric label="Past due" value={summary.overdue_work_orders} note="Prioritized overdue work" />
              <Metric label="Units in scope" value={summary.units_count} note="Registered estate properties" />
            </section>

            <div className="intelligence-columns">
              <section className="intelligence-panel" aria-labelledby="intelligence-findings-title">
                <div className="intelligence-panel-heading">
                  <div>
                    <h2 id="intelligence-findings-title">Findings</h2>
                    <p>Generated from current VALORA records.</p>
                  </div>
                  <span>{summary.findings.length} {summary.findings.length === 1 ? 'item' : 'items'}</span>
                </div>
                {summary.findings.length ? (
                  <ul className="intelligence-findings">
                    {summary.findings.map((finding) => (
                      <li key={finding.id} className={`intelligence-finding is-${finding.severity}`}>
                        <strong>{finding.title}</strong>
                        <p>{finding.detail}</p>
                        <small>{finding.evidence}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="intelligence-empty">No urgent or open operational findings in this scope.</p>
                )}
              </section>

              <section className="intelligence-panel" aria-labelledby="intelligence-ask-title">
                <div className="intelligence-panel-heading">
                  <div>
                    <h2 id="intelligence-ask-title">Ask VALORA</h2>
                    <p>Answers use current record counts and include their evidence.</p>
                  </div>
                </div>
                <form className="intelligence-question-form" onSubmit={handleAsk}>
                  <label htmlFor="intelligence-question">Your question</label>
                  <textarea
                    id="intelligence-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="How many complaints are still open?"
                    minLength={3}
                    maxLength={500}
                    required
                    rows={3}
                  />
                  <div className="intelligence-form-footer">
                    <small>{question.trim().length}/500</small>
                    <button type="submit" disabled={asking || !selectedEstateId || question.trim().length < 3}>
                      {asking ? 'Checking recordsΓÇª' : 'Ask'}
                    </button>
                  </div>
                </form>
                {askError ? <p className="intelligence-error-inline" role="alert">{askError}</p> : null}
                {answer ? (
                  <div className="intelligence-answer" aria-live="polite">
                    <strong>{answer.answer}</strong>
                    <h3>Evidence</h3>
                    <ul>{answer.evidence.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
                  </div>
                ) : null}
              </section>
            </div>

            <section className="intelligence-panel intelligence-records" aria-labelledby="intelligence-records-title">
              <div className="intelligence-panel-heading">
                <div>
                  <h2 id="intelligence-records-title">Recent records</h2>
                  <p>Latest complaints and maintenance work orders in your scope.</p>
                </div>
                <span>Updated {formatDate(summary.as_of)}</span>
              </div>
              {summary.recent_records.length ? (
                <div className="intelligence-table-wrap">
                  <table>
                    <thead>
                      <tr><th>Record</th><th>Unit</th><th>Status</th><th>Created</th></tr>
                    </thead>
                    <tbody>
                      {summary.recent_records.map((record) => (
                        <tr key={`${record.kind}-${record.id}`}>
                          <td>{record.title}</td>
                          <td>{record.unit_no}</td>
                          <td><span className="intelligence-status">{record.status.replaceAll('_', ' ')}</span></td>
                          <td>{formatDate(record.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="intelligence-empty">No complaint or work-order records found in this scope.</p>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
