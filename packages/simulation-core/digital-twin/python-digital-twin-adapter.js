/**
 * PYTHON DIGITAL TWIN SERVICE ADAPTER
 * Connects Node.js Simulation Core to Python FastAPI Digital Twin Service over HTTP REST (port 8010), with seamless fallback if service is offline.
 */

export class PythonDigitalTwinAdapter {
  constructor(options = {}) {
    this.serviceUrl = options.serviceUrl || process.env.DIGITAL_TWIN_URL || 'http://localhost:8010';
    this.timeoutMs = options.timeoutMs || 3000;
  }

  /**
   * Starts a digital twin episode.
   */
  async startEpisodeAsync(episodeId, scenarioId, seed = 42, initialObservation = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/twin/episode/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId, scenarioId, seed, initialObservation }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return { episode_id: episodeId, scenario_id: scenarioId, seed, start_time: Date.now(), success: true, offlineFallback: true };
  }

  /**
   * Steps an active digital twin episode.
   */
  async stepEpisodeAsync(episodeId, dt, observation, decision = null, intelligence = null, learning = null, safety = null) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/twin/episode/${episodeId}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dt, observation, decision, intelligence, learning, safety }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return { episodeId, simulationTime: dt, rover: observation.rover || {}, environment: observation.environment || {}, offlineFallback: true };
  }

  /**
   * Checkpoints an active episode.
   */
  async checkpointEpisodeAsync(episodeId, checkpointId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/twin/episode/${episodeId}/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpointId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return { checkpoint_id: checkpointId, offlineFallback: true };
  }

  /**
   * Restores an episode from checkpoint.
   */
  async restoreEpisodeAsync(episodeId, checkpointId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/twin/episode/${episodeId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpointId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return { episodeId, checkpointId, simulationTime: 1.0, offlineFallback: true };
  }

  /**
   * Terminates an episode.
   */
  async terminateEpisodeAsync(episodeId, reason = 'COMPLETED', success = true) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/twin/episode/${episodeId}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, success }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (err) {}

    return { episode_id: episodeId, termination_reason: reason, success, offlineFallback: true };
  }

  /**
   * Runs a batch simulation.
   */
  async runBatchAsync(scenarioPrefix = 'CRATER-07', episodes = 10, seedStart = 0, stepsPerEpisode = 10) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs * 5);

      const response = await fetch(`${this.serviceUrl}/twin/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioPrefix, episodes, seedStart, stepsPerEpisode }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          totalEpisodes: data.total_episodes !== undefined ? data.total_episodes : data.totalEpisodes,
          totalTelemetryRows: data.total_telemetry_rows !== undefined ? data.total_telemetry_rows : data.totalTelemetryRows
        };
      }
    } catch (err) {}

    return { scenarioPrefix, totalEpisodes: episodes, totalTelemetryRows: episodes * stepsPerEpisode, seedStart, completedEpisodes: 0, offlineFallback: true };
  }
}
