/**
 * PYTHON TRAINING SERVICE ADAPTER (Objective 12)
 * Connects Node.js Simulation Core to Python FastAPI Training Engine over HTTP REST (port 8012), with seamless fallback if service is offline.
 */

export class PythonTrainingAdapter {
  constructor(options = {}) {
    this.serviceUrl = options.serviceUrl || process.env.TRAINING_ENGINE_URL || 'http://127.0.0.1:8012';
    this.timeoutMs = options.timeoutMs || 8000;
  }

  /**
   * Creates a training job.
   */
  async createJobAsync(jobConfig) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/training/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobConfig),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return {
      jobId: jobConfig.jobId || 'JOB-FALLBACK',
      status: 'QUEUED',
      offlineFallback: true
    };
  }

  /**
   * Triggers training execution for a job.
   */
  async startJobAsync(jobId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs * 3);

      const response = await fetch(`${this.serviceUrl}/training/jobs/${jobId}/start`, {
        method: 'POST',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return {
      job: { jobId, status: 'FAILED' },
      offlineFallback: true
    };
  }

  /**
   * Registers a worker node.
   */
  async registerWorkerAsync(workerId, hostname = 'worker-1') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/workers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, hostname }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return { workerId, status: 'OFFLINE', offlineFallback: true };
  }

  /**
   * Inspects GPU capabilities.
   */
  async getCapabilitiesAsync() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/workers/capabilities`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return { device: 'cpu', cudaAvailable: false, offlineFallback: true };
  }
}
