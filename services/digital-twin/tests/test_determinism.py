import pytest
from app.orchestration.batch_runner import BatchRunner
from app.scenarios.scenario_generator import ScenarioGenerator

def test_identical_seed_produces_identical_scenario():
    scen1 = ScenarioGenerator.generate_scenario("SCEN-1", seed=42)
    scen2 = ScenarioGenerator.generate_scenario("SCEN-1", seed=42)
    scen3 = ScenarioGenerator.generate_scenario("SCEN-1", seed=43)

    assert scen1.terrainVariation == scen2.terrainVariation
    assert scen1.sensorNoise == scen2.sensorNoise
    # Different seed gives different values
    assert scen1.sensorNoise != scen3.sensorNoise

def test_identical_batch_execution_produces_identical_metrics():
    runner1 = BatchRunner()
    runner2 = BatchRunner()

    res1 = runner1.run_batch("DET-TEST", episodes=3, seed_start=100, steps_per_episode=4)
    res2 = runner2.run_batch("DET-TEST", episodes=3, seed_start=100, steps_per_episode=4)

    assert res1["totalTelemetryRows"] == res2["totalTelemetryRows"]
    for i in range(3):
        assert res1["episodes"][i]["seed"] == res2["episodes"][i]["seed"]
