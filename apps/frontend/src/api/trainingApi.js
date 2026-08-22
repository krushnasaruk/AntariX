import { request } from './client.js';

export async function fetchTrainingJobs() {
  return request('/training/jobs');
}

export async function createTrainingJob(jobConfig) {
  return request('/training/jobs', {
    method: 'POST',
    body: JSON.stringify(jobConfig)
  });
}
