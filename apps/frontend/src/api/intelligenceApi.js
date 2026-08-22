import { request } from './client.js';

export async function fetchIntelligenceReport() {
  return request('/intelligence/analyze');
}

export async function fetchLearningData() {
  return request('/intelligence/learning');
}
