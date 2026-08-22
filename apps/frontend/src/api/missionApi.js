import { request } from './client.js';

export async function fetchMissionStatus() {
  return request('/mission/status');
}

export async function fetchMissionPlan() {
  return request('/mission/plan');
}

export async function fetchMissionEvents() {
  return request('/mission/events');
}

export async function startMissionTask(taskId) {
  return request('/mission/task/start', {
    method: 'POST',
    body: JSON.stringify({ taskId })
  });
}

export async function completeMissionTask(taskId, result = {}) {
  return request('/mission/task/complete', {
    method: 'POST',
    body: JSON.stringify({ taskId, result })
  });
}
