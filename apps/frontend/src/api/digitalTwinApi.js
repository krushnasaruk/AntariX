import { request } from './client.js';

export async function fetchTwinHealth() {
  return request('/digital-twin/health');
}

export async function fetchTwinState() {
  return request('/digital-twin/state');
}

export async function generateSyntheticDataset(datasetId = 'mars-comm-v1', numberOfEpisodes = 10, seed = 42) {
  return request('/digital-twin/dataset/generate', {
    method: 'POST',
    body: JSON.stringify({ datasetId, numberOfEpisodes, seed })
  });
}
