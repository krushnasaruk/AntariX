import { API_BASE_URL } from '../utils/constants.js';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Origin': 'AntriX-MissionControl-v1',
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API ERROR] ${endpoint}:`, err.message);
    throw err;
  }
}
