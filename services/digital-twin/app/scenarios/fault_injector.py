from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.scenarios.scenario_seed import SeedContext

class FaultDefinition(BaseModel):
    faultId: str
    faultType: str
    category: str = "ENVIRONMENT" # SENSOR | ACTUATOR | ENVIRONMENT | COMMUNICATION | SOFTWARE | AI
    affectedComponent: str = ""
    parameters: Dict[str, Any] = Field(default_factory=dict)
    recoverable: bool = True
    episodeId: str = ""
    startTime: float
    duration: float
    severity: str = "HIGH"
    seed: int
    payload: Dict[str, Any] = Field(default_factory=dict)

class FaultInjector:
    FAULT_CATEGORIES = {
        "SENSOR": ["GPS_DRIFT", "IMU_BIAS", "CAMERA_FAILURE", "NOISY_SENSOR", "MISSING_TELEMETRY", "SENSOR_FAILURE"],
        "ACTUATOR": ["WHEEL_DEGRADATION", "WHEEL_STUCK", "MOTOR_EFFICIENCY_DEGRADATION", "STEERING_ERROR", "ACTUATOR_FAILURE"],
        "ENVIRONMENT": ["DUST_STORM", "OBSTACLE_BLOCKAGE", "HAZARD_ENCOUNTER", "TEMPERATURE_EXCURSION", "BATTERY_LOW", "BATTERY_DRAIN"],
        "COMMUNICATION": ["COMMUNICATION_BLACKOUT", "DTN_CONGESTION", "PACKET_LOSS", "PACKET_CORRUPTION", "DELAY_SPIKE", "BANDWIDTH_REDUCTION"],
        "SOFTWARE": ["PLANNER_FAILURE", "AI_SERVICE_UNAVAILABLE", "INFERENCE_TIMEOUT", "STALE_OBSERVATION", "TASK_STALL", "PLAN_INFEASIBILITY"],
        "AI": ["LOW_CONFIDENCE", "INVALID_PREDICTION", "OUT_OF_DISTRIBUTION_OBSERVATION", "MODEL_UNAVAILABLE"]
    }

    FAULT_TYPES = [
        "BATTERY_LOW",
        "BATTERY_DRAIN",
        "COMMUNICATION_BLACKOUT",
        "DTN_CONGESTION",
        "DUST_STORM",
        "OBSTACLE_BLOCKAGE",
        "HAZARD_ENCOUNTER",
        "ROVER_HEALTH_DEGRADATION",
        "SENSOR_FAILURE",
        "ACTUATOR_FAILURE",
        "NAVIGATION_ERROR",
        "TASK_STALL",
        "PLAN_INFEASIBILITY",
        "RETURN_ENERGY_SHORTFALL"
    ]

    def __init__(self, master_seed: int = 42, seed: int = None):
        actual_seed = seed if seed is not None else master_seed
        self.seed_ctx = SeedContext(actual_seed)
        self.rng = self.seed_ctx.spawn_rng("fault_injector")

    def _determine_category(self, fault_type: str) -> str:
        for cat, types in self.FAULT_CATEGORIES.items():
            if fault_type in types:
                return cat
        return "ENVIRONMENT"

    def generate_faults(self, episode_id: str, count: int = 1, max_time: float = 600.0) -> List[FaultDefinition]:
        faults: List[FaultDefinition] = []
        for i in range(count):
            f_type = str(self.rng.choice(self.FAULT_TYPES))
            start_t = float(self.rng.uniform(10.0, max_time * 0.5))
            dur = float(self.rng.uniform(30.0, 180.0))
            sev = str(self.rng.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"]))
            f_id = f"FAULT-{episode_id}-{i+1}"
            cat = self._determine_category(f_type)

            faults.append(FaultDefinition(
                faultId=f_id,
                faultType=f_type,
                category=cat,
                affectedComponent=f_type.split("_")[0],
                parameters={"intensity": 0.8},
                recoverable=(sev != "CRITICAL"),
                episodeId=episode_id,
                startTime=round(start_t, 1),
                duration=round(dur, 1),
                severity=sev,
                seed=self.seed_ctx.master_seed + i
            ))
        return faults

    def generate_fault_combination(self, episode_id: str, combination_types: List[str] = None, start_time: float = 30.0) -> List[FaultDefinition]:
        """
        Generates realistic multi-fault combination (e.g. Dust storm + Comm blackout + Battery degradation).
        """
        types = combination_types or ["DUST_STORM", "COMMUNICATION_BLACKOUT", "BATTERY_DRAIN"]
        faults: List[FaultDefinition] = []
        for i, f_type in enumerate(types):
            f_id = f"FAULT-COMB-{episode_id}-{i+1}"
            cat = self._determine_category(f_type)
            faults.append(FaultDefinition(
                faultId=f_id,
                faultType=f_type,
                category=cat,
                affectedComponent=f_type.split("_")[0],
                parameters={"multiFaultGroup": f"GROUP-{episode_id}"},
                recoverable=True,
                episodeId=episode_id,
                startTime=round(start_time + i * 5.0, 1),
                duration=180.0,
                severity="HIGH",
                seed=self.seed_ctx.master_seed + i
            ))
        return faults
