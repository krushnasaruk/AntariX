from pydantic import BaseModel, Field
from typing import List, Dict, Any
from app.scenarios.scenario_seed import SeedContext
from app.scenarios.scenario_distribution import ScenarioDistribution
from app.scenarios.scenario_templates import ScenarioTemplates
from app.scenarios.fault_injector import FaultInjector, FaultDefinition

class ScenarioDefinition(BaseModel):
    scenarioId: str
    seed: int
    missionType: str
    difficulty: str = "MEDIUM"
    initialState: Dict[str, Any] = Field(default_factory=dict)
    environmentConfiguration: Dict[str, Any] = Field(default_factory=dict)
    weatherConfiguration: Dict[str, Any] = Field(default_factory=dict)
    communicationConfiguration: Dict[str, Any] = Field(default_factory=dict)
    roverConfiguration: Dict[str, Any] = Field(default_factory=dict)
    faultConfiguration: List[FaultDefinition] = Field(default_factory=list)
    sensorConfiguration: Dict[str, Any] = Field(default_factory=dict)
    expectedObjectives: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ScenarioFactory:
    def __init__(self, distribution: ScenarioDistribution = None):
        self.distribution = distribution or ScenarioDistribution()

    def create_scenario(self, scenario_id: str, seed: int, template_name: str = "NOMINAL_MISSION") -> ScenarioDefinition:
        seed_ctx = SeedContext(seed)
        rng = seed_ctx.spawn_rng("scenario_factory")

        template = ScenarioTemplates.get_template(template_name)
        injector = FaultInjector(seed)

        initial_bat = template.get("initialBattery", float(rng.uniform(self.distribution.battery_min, self.distribution.battery_max)))
        weather = template.get("weather", "CLEAR")
        comm = template.get("communication", "AVAILABLE")

        fault_count = template.get("faultsCount", 1 if rng.uniform(0, 1) < self.distribution.fault_probability else 0)
        faults = injector.generate_faults(scenario_id, count=fault_count) if fault_count > 0 else []

        one_way = float(rng.uniform(self.distribution.one_way_delay_min, self.distribution.one_way_delay_max))

        return ScenarioDefinition(
            scenarioId=scenario_id,
            seed=seed,
            missionType=template.get("missionType", "NOMINAL"),
            difficulty="HIGH" if len(faults) > 1 else "NOMINAL",
            initialState={"battery": round(initial_bat, 4), "position": {"x": 100, "y": 100}},
            environmentConfiguration={"terrainVariation": round(float(rng.uniform(0.0, 0.1)), 3)},
            weatherConfiguration={"state": weather, "visibility": 100.0 if weather == "CLEAR" else 20.0},
            communicationConfiguration={"communicationState": comm, "estimatedOneWayDelay": round(one_way, 1)},
            roverConfiguration={"health": "NOMINAL", "wheelFriction": 1.0},
            faultConfiguration=faults,
            sensorConfiguration={"noiseSigma": self.distribution.sensor_noise_sigma},
            expectedObjectives=["COLLECT_SAMPLE", "RETURN_TO_BASE"],
            metadata={"templateName": template_name, "generatorVersion": "10.0.0"}
        )
