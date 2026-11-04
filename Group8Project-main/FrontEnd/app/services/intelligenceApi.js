import { apiRequest } from './apiClient.js';

const BASE_PATH = '/api/v1/analytics/intelligence';
const ESTATES_PATH = '/api/v1/auth/estates';
const ACTIVE_COMPLAINT_STATUSES = new Set(['submitted', 'reviewed', 'assigned', 'in_progress']);

function toCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function toRecord(record, kind) {
  return {
    kind,
    id: record?.id,
    title: record?.title ?? `${kind} #${record?.id ?? ''}`,
    unit_no: record?.unit_no ?? 'ΓÇö',
    status: String(record?.status ?? 'unknown'),
    created_at: record?.date ?? record?.logged_date ?? record?.due_date ?? null,
  };
}

function toSummary(intelligence, signals, estate, unitsCount) {
  const role = intelligence?.role ?? '';
  const recommendations = Array.isArray(intelligence?.recommendations)
    ? intelligence.recommendations
    : [];
  const facts = intelligence?.facts ?? {};
  const operationalSignals = intelligence?.operational_signals ?? facts.counts ?? {};
  let recentRecords = [];
  let openComplaints = toCount(operationalSignals.open_complaints);
  let activeWorkOrders = toCount(operationalSignals.work_orders_in_flight);

  if (role === 'hoa_admin') {
    recentRecords = (signals?.signals ?? []).map((record) => toRecord(record, record?.type ?? 'record'));
  } else if (role === 'resident') {
    const issues = intelligence?.resident_view?.unit_issues ?? [];
    openComplaints = issues.filter((issue) => ACTIVE_COMPLAINT_STATUSES.has(issue.status)).length;
    recentRecords = issues.map((issue) => toRecord(issue, issue?.category ?? 'complaint'));
  } else if (role === 'service_provider') {
    const workOrders = intelligence?.provider_view?.assigned_work_orders ?? [];
    activeWorkOrders = workOrders.length;
    recentRecords = workOrders.map((workOrder) => toRecord(workOrder, 'work_order'));
  }

  const priorities = Array.isArray(facts.maintenance_priorities)
    ? facts.maintenance_priorities
    : [];
  const overdueWorkOrders = priorities.filter((item) => item?.kind === 'overdue_work_order').length
    || recommendations.filter((item) => String(item?.id ?? '').startsWith('overdue_work_order-')).length;

  return {
    scope: estate.estate_name,
    as_of: intelligence?.as_of ?? null,
    role,
    units_count: unitsCount,
    open_complaints: openComplaints,
    active_work_orders: activeWorkOrders,
    overdue_work_orders: overdueWorkOrders,
    findings: recommendations.map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.summary,
      severity: /overdue|urgent/i.test(`${item.title} ${item.kind}`) ? 'urgent' : 'attention',
      evidence: (item.evidence ?? [])
        .map((evidence) => [evidence.label, evidence.detail].filter(Boolean).join(': '))
        .join(' '),
    })),
    recent_records: recentRecords,
  };
}

export async function listAccessibleEstates(options = {}) {
  const result = await apiRequest(ESTATES_PATH, { signal: options.signal });
  if (!Array.isArray(result?.estates)) {
    throw new Error('The VALORA API returned an invalid estate access list.');
  }

  return result.estates;
}

export async function getIntelligence({ signal, estate }) {
  const estateId = Number(estate?.estate_id);
  if (!Number.isInteger(estateId) || estateId <= 0) {
    throw new Error('Choose an estate before loading Intelligence.');
  }

  const query = `?estate_id=${encodeURIComponent(estateId)}`;
  const intelligence = await apiRequest(`${BASE_PATH}${query}`, { signal });
  let signals = null;
  if (intelligence?.role === 'hoa_admin') {
    signals = await apiRequest(`${BASE_PATH}/signals${query}`, { signal });
  }

  if (!intelligence || typeof intelligence !== 'object') {
    throw new Error('The VALORA Intelligence response is incomplete.');
  }

  let unitsCount = Array.isArray(estate.property_ids) ? estate.property_ids.length : 0;
  if (intelligence.role === 'hoa_admin' && unitsCount === 0) {
    const properties = await apiRequest(
      `/api/v1/properties?estate_id=${estateId}&page=1&size=1`,
      { signal },
    );
    unitsCount = Number(properties?.total);
    if (!Number.isInteger(unitsCount) || unitsCount < 0) {
      throw new Error('The VALORA API returned an invalid estate property count.');
    }
  }

  return toSummary(intelligence, signals, estate, unitsCount);
}

export async function askIntelligence(question, estateId) {
  const id = Number(estateId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Choose an estate before asking VALORA.');
  }

  const result = await apiRequest(`${BASE_PATH}/ask`, {
    method: 'POST',
    body: { question: String(question).trim(), estate_id: id },
  });
  if (!result || typeof result.summary !== 'string' || !Array.isArray(result.evidence)) {
    throw new Error('The VALORA Intelligence answer is incomplete.');
  }

  return {
    answer: [result.summary, result.recommendation].filter(Boolean).join('\n\n'),
    evidence: result.evidence,
  };
}
