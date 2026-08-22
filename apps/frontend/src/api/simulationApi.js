import { request } from './client.js';

export async function fetchWorldState() {
  return request('/simulation/world-state');
}

export async function stepSimulation(dt = 1.0) {
  return request('/simulation/step', {
    method: 'POST',
    body: JSON.stringify({ dt })
  });
}

export async function resetSimulation(seed = 42) {
  return request('/simulation/reset', {
    method: 'POST',
    body: JSON.stringify({ seed })
  });
}

export async function injectSimulationFault(faultType) {
  return request('/simulation/fault/inject', {
    method: 'POST',
    body: JSON.stringify({ faultType })
  });
}

export async function clearSimulationFault(faultType) {
  return request('/simulation/fault/clear', {
    method: 'POST',
    body: JSON.stringify({ faultType })
  });
}
