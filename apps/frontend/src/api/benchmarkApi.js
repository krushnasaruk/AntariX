import { request } from './client.js';

export async function fetchBenchmarkResults() {
  return request('/benchmarks/results');
}

export async function executeBenchmarkScenario(scenario = 'SCENARIO_2') {
  return request('/benchmarks/run', {
    method: 'POST',
    body: JSON.stringify({ scenario })
  });
}
