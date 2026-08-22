import pytest
from app.scenarios.scenario_factory import ScenarioFactory
from app.scenarios.scenario_distribution import ScenarioDistribution

def test_create_scenario_nominal():
    factory = ScenarioFactory()
    scen = factory.create_scenario("SCEN-TEST-001", seed=42, template_name="NOMINAL_MISSION")

    assert scen.scenarioId == "SCEN-TEST-001"
    assert scen.seed == 42
    assert scen.missionType == "NOMINAL"
    assert scen.initialState["battery"] == 0.94
    assert len(scen.faultConfiguration) == 0

def test_create_scenario_reproducibility():
    factory = ScenarioFactory()
    scen1 = factory.create_scenario("SCEN-TEST-002", seed=100, template_name="DUST_STORM_EMERGENCY")
    scen2 = factory.create_scenario("SCEN-TEST-002", seed=100, template_name="DUST_STORM_EMERGENCY")
    scen3 = factory.create_scenario("SCEN-TEST-002", seed=101, template_name="DUST_STORM_EMERGENCY")

    assert scen1.environmentConfiguration["terrainVariation"] == scen2.environmentConfiguration["terrainVariation"]
    assert scen1.communicationConfiguration["estimatedOneWayDelay"] == scen2.communicationConfiguration["estimatedOneWayDelay"]
    assert scen1.environmentConfiguration["terrainVariation"] != scen3.environmentConfiguration["terrainVariation"]
