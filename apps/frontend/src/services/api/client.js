import { API_BASE_URL } from '../../utils/constants.js';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function sendRoverCommand(commandType, params = {}) {
  const res = await fetch(`${API_BASE_URL}/command/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commandType, params })
  });
  return res.json();
}

export async function fetchQueue() {
  const res = await fetch(`${API_BASE_URL}/command/queue`);
  return res.json();
}

export async function fetchMission() {
  const res = await fetch(`${API_BASE_URL}/mission/status`);
  return res.json();
}
