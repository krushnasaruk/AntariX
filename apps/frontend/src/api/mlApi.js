import { request } from './client.js';

export async function fetchModelRegistry() {
  return request('/ml/registry');
}

export async function promoteModel(modelId, status) {
  return request(`/ml/models/${modelId}/promote`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
}
