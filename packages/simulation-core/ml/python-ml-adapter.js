/**
 * PYTHON ML SERVICE ADAPTER
 * Connects Node.js Simulation Core to Python FastAPI ML Engine over HTTP REST (port 8011), with seamless fallback if service is offline.
 */

export class PythonMLAdapter {
  constructor(options = {}) {
    this.serviceUrl = options.serviceUrl || process.env.ML_ENGINE_URL || 'http://127.0.0.1:8011';
    this.timeoutMs = options.timeoutMs || 8000;
  }

  /**
   * Requests model inference.
   */
  async predictAsync(modelId, observation) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/models/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, observation }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return {
      modelId,
      modelVersion: '1.0.0-fallback',
      prediction: 'MOVE_ROVER',
      confidence: 0.50,
      timestamp: Date.now(),
      offlineFallback: true
    };
  }

  /**
   * Triggers a model training job.
   */
  async trainModelAsync(experimentName, modelId, algorithm = 'RANDOM_FOREST', datasetId = 'mars-comm-v1', seed = 42) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs * 5);

      const response = await fetch(`${this.serviceUrl}/models/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentName, modelId, algorithm, datasetId, seed }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
      const errText = await response.text();
      console.error('trainModelAsync non-200:', response.status, errText);
    } catch (err) {
      console.error('trainModelAsync error:', err.message);
    }

    return { modelId, status: 'FAILED', offlineFallback: true };
  }

  /**
   * Retrieves model registry metadata.
   */
  async getRegistryAsync() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/models/registry`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return [];
  }
}
