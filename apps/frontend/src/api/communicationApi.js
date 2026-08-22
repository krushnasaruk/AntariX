import { request } from './client.js';

export async function fetchCommStatus() {
  return request('/communication/status');
}

export async function fetchDTNQueue() {
  return request('/communication/queue');
}

export async function sendDTNCommand(commandType, params = {}, priority = 'NORMAL') {
  return request('/communication/send', {
    method: 'POST',
    body: JSON.stringify({ commandType, params, priority })
  });
}

export async function toggleBlackout(active) {
  return request('/communication/blackout', {
    method: 'POST',
    body: JSON.stringify({ active })
  });
}

export async function updateDistance(distanceKm) {
  return request('/communication/distance', {
    method: 'POST',
    body: JSON.stringify({ distanceKm })
  });
}
