import time
from typing import List, Dict, Any
from app.runtime.simulation_runtime import DigitalTwinRuntime
from app.scenarios.scenario_generator import ScenarioGenerator
from app.telemetry.telemetry_collector import TelemetryCollector
from app.events.event_recorder import EventRecorder

class BatchRunner:
    def __init__(self):
        self.generator = ScenarioGenerator()

    def run_batch(self, scenario_prefix: str = "CRATER-07", episodes: int = 10, seed_start: int = 0, steps_per_episode: int = 10) -> Dict[str, Any]:
        start_ts = time.time()
        results: List[Dict[str, Any]] = []
        total_telemetry_rows = 0

        for i in range(episodes):
            seed = seed_start + i
            ep_id = f"EP-{scenario_prefix}-{seed}"
            scen_id = f"SCEN-{scenario_prefix}-{seed}"

            scen = self.generator.generate_scenario(scen_id, seed)
            runtime = DigitalTwinRuntime()
            collector = TelemetryCollector()
            recorder = EventRecorder()

            initial_obs = {
                "timestamp": time.time() * 1000,
                "mission": {"id": "MISSION-CRATER-07", "status": "IN_PROGRESS"},
                "rover": {"position": {"x": 100, "y": 100}, "batteryLevel": scen.initialBattery, "health": scen.roverHealth},
                "environment": {"weather": {"state": scen.weather}},
                "communication": {"communicationState": scen.communication}
            }

            runtime.start_episode(ep_id, scen_id, seed, initial_obs)
            recorder.record_event(ep_id, 0.0, "MISSION_STARTED", "SIMULATION")

            for s in range(steps_per_episode):
                step_obs = {
                    "timestamp": time.time() * 1000 + (s * 1000),
                    "mission": {"id": "MISSION-CRATER-07", "status": "IN_PROGRESS", "progressPct": round((s / steps_per_episode) * 100, 1)},
                    "rover": {"position": {"x": 100 + (s * 2), "y": 100}, "batteryLevel": max(0.0, scen.initialBattery - (s * 0.005)), "health": scen.roverHealth},
                    "environment": {"weather": {"state": scen.weather}},
                    "communication": {"communicationState": scen.communication}
                }
                st = runtime.step(step_obs, dt=1.0)
                collector.collect_from_state(st)

            rec = runtime.terminate_episode("COMPLETED", success=True)
            recorder.record_event(ep_id, steps_per_episode, "MISSION_COMPLETED", "SIMULATION")

            telemetry_count = len(collector.get_records())
            total_telemetry_rows += telemetry_count

            results.append({
                "episodeId": ep_id,
                "scenarioId": scen_id,
                "seed": seed,
                "duration": rec.duration,
                "success": rec.success,
                "telemetryRows": telemetry_count,
                "eventCount": len(recorder.get_events())
            })

        duration_sec = round(time.time() - start_ts, 3)
        episodes_per_sec = round(episodes / duration_sec, 2) if duration_sec > 0 else episodes

        return {
            "scenarioPrefix": scenario_prefix,
            "totalEpisodes": episodes,
            "seedStart": seed_start,
            "completedEpisodes": len(results),
            "totalTelemetryRows": total_telemetry_rows,
            "executionTimeSeconds": duration_sec,
            "episodesPerSecond": episodes_per_sec,
            "episodes": results
        }
