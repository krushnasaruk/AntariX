import { request } from './client.js';

export async function fetchAutonomyDecision() {
  return request('/autonomy/decision');
}

export async function fetchAutonomyHistory() {
  return request('/autonomy/history');
}

export async function fetchSafetyInvariants() {
  return request('/autonomy/invariants');
}

export async function validateCandidateAction(action) {
  return request('/autonomy/validate', {
    method: 'POST',
    body: JSON.stringify({ action })
  });
}
