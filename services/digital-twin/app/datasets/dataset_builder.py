import time
import hashlib
from typing import List, Dict, Any, Tuple
from app.scenarios.scenario_factory import ScenarioFactory
from app.scenarios.noise_models import NoiseModel
from app.datasets.dataset_manifest import DatasetManifest
from app.datasets.dataset_validator import DatasetValidator, DatasetQualityReport
from app.datasets.dataset_splitter import DatasetSplitter
from app.storage.parquet_store import ParquetStore

class DatasetBuilder:
    def __init__(self, base_dir: str = "services/digital-twin/data"):
        self.factory = ScenarioFactory()
        self.parquet_store = ParquetStore(base_dir=base_dir)

    def build_dataset(self, dataset_id: str, num_episodes: int = 10, seed: int = 42, dataset_types: List[str] = None) -> Tuple[DatasetManifest, DatasetQualityReport, Dict[str, Any]]:
        types = dataset_types or ["SUPERVISED", "TIMESERIES", "RL", "ANOMALY"]
        templates = ["NOMINAL_MISSION", "DUST_STORM_EMERGENCY", "BATTERY_DEGRADATION", "COMM_BLACKOUT", "COMPOUND_FAILURE"]

        all_records: List[Dict[str, Any]] = []
        episode_ids: List[str] = []
        scenarios_meta: List[Dict[str, Any]] = []

        noise_model = NoiseModel(seed=seed)

        for i in range(num_episodes):
            ep_seed = seed + i
            template = templates[i % len(templates)]
            ep_id = f"EP-{dataset_id}-{ep_seed}"
            scen_id = f"SCEN-{dataset_id}-{ep_seed}"

            scen = self.factory.create_scenario(scen_id, ep_seed, template_name=template)
            episode_ids.append(ep_id)

            scenarios_meta.append({
                "scenarioId": scen_id,
                "missionType": scen.missionType,
                "initialBattery": scen.initialState.get("battery", 0.94),
                "weather": scen.weatherConfiguration.get("state", "CLEAR"),
                "communication": scen.communicationConfiguration.get("communicationState", "AVAILABLE"),
                "faults": [f.model_dump() for f in scen.faultConfiguration]
            })

            # Generate 10 timesteps per episode
            init_bat = scen.initialState.get("battery", 0.94)
            has_fault = len(scen.faultConfiguration) > 0

            for t in range(10):
                sim_time = float(t * 1.0)
                clean_bat = max(0.0, init_bat - (t * 0.02))

                clean_state = {
                    "timestamp": 1724074300000.0 + (t * 1000),
                    "mission_id": "MISSION-CRATER-07",
                    "episode_id": ep_id,
                    "simulation_time": sim_time,
                    "rover": {"position": {"x": 100 + (t * 2), "y": 100}, "batteryLevel": clean_bat, "health": "NOMINAL"},
                    "environment": {"weather": {"state": scen.weatherConfiguration.get("state", "CLEAR")}},
                    "communication": {"communicationState": scen.communicationConfiguration.get("communicationState", "AVAILABLE")}
                }

                noisy_obs = noise_model.apply_noise(clean_state)

                record = {
                    "timestamp": clean_state["timestamp"],
                    "mission_id": "MISSION-CRATER-07",
                    "episode_id": ep_id,
                    "simulation_time": sim_time,
                    "ground_truth_battery": clean_bat,
                    "battery": noisy_obs["rover"]["batteryLevel"],
                    "rover_position_x": noisy_obs["rover"]["position"]["x"],
                    "rover_position_y": noisy_obs["rover"]["position"]["y"],
                    "rover_health": clean_state["rover"]["health"],
                    "weather": clean_state["environment"]["weather"]["state"],
                    "communication_state": clean_state["communication"]["communicationState"],
                    "has_fault": has_fault,
                    # Supervised Label
                    "next_action": "MOVE_ROVER" if clean_bat > 0.15 else "WAIT",
                    # RL Tuple Fields
                    "reward": 1.0 if clean_bat > 0.15 else -10.0,
                    "terminated": t == 9 or clean_bat <= 0.0,
                    "truncated": False
                }
                all_records.append(record)

        # Write dataset to Parquet
        self.parquet_store.write_telemetry(dataset_id, all_records)

        # Dataset quality report
        quality_report = DatasetValidator.validate_records(dataset_id, all_records, episode_count=num_episodes)

        # Episode-safe splitting
        splits = DatasetSplitter.split_episodes(episode_ids, seed=seed)

        # Compute dataset checksum
        raw_bytes = f"{dataset_id}_{len(all_records)}_{seed}".encode("utf-8")
        checksum = hashlib.sha256(raw_bytes).hexdigest()

        manifest = DatasetManifest(
            datasetId=dataset_id,
            version="1.0.0",
            generationTimestamp=time.time(),
            seed=seed,
            episodes=num_episodes,
            records=len(all_records),
            splits={"train": round(len(splits["train"])/num_episodes, 2), "validation": round(len(splits["validation"])/num_episodes, 2), "test": round(len(splits["test"])/num_episodes, 2)},
            datasetTypes=types,
            checksum=checksum,
            metrics={"qualityScore": quality_report.qualityScore, "splitCounts": {k: len(v) for k, v in splits.items()}}
        )

        return manifest, quality_report, {"scenarios": scenarios_meta, "records": all_records, "splits": splits}
