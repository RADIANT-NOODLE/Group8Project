import { apiRequest } from './apiClient.js';

const BASE_PATH = '/api/v1/analytics/intelligence';

export async function getIntelligence(options = {}) {
  const result = await apiRequest(BASE_PATH, { signal: options.signal });
  if (!result || typeof result !== 'object' || !Array.isArray(result.findings) || !Array.isArray(result.recent_records)) {
    throw new Error('The VALORA Intelligence response is incomplete.');
  }
  return result;
}

export async function askIntelligence(question) {
  const result = await apiRequest(`${BASE_PATH}/ask`, {
    method: 'POST',
    body: { question: String(question).trim() },
  });
  if (!result || typeof result.answer !== 'string' || !Array.isArray(result.evidence)) {
    throw new Error('The VALORA Intelligence answer is incomplete.');
  }
  return result;
}
