import pytest
import time
from app.models.observations import AutonomyObservationModel, RoverObservationModel, EnvironmentObservationModel, WeatherModel
from app.intelligence.anomaly_detector import PyAnomalyDetector
from app.intelligence.risk_engine import PyRiskEngine

def test_deterministic_low_risk():
    risk_engine = PyRiskEngine()
    obs = AutonomyObservationModel(timestamp=time.time() * 1000)
    risk = risk_engine.assess(obs, [])
    assert risk.overallRisk == "LOW"
    assert risk.score <= 30.0
    assert risk.recommendedAction == "CONTINUE_PLAN"

def test_critical_battery_risk():
    risk_engine = PyRiskEngine()
    obs = AutonomyObservationModel(timestamp=time.time() * 1000, rover=RoverObservationModel(batteryLevel=0.03))
    anomalies = PyAnomalyDetector().detect(obs)
    risk = risk_engine.assess(obs, anomalies)
    assert risk.overallRisk == "CRITICAL"
    assert risk.score >= 90.0
    assert risk.recommendedAction == "WAIT"

def test_rover_health_critical_earth_guidance():
    risk_engine = PyRiskEngine()
    obs = AutonomyObservationModel(timestamp=time.time() * 1000, rover=RoverObservationModel(health="CRITICAL"))
    anomalies = PyAnomalyDetector().detect(obs)
    risk = risk_engine.assess(obs, anomalies)
    assert risk.overallRisk == "CRITICAL"
    assert risk.recommendedAction == "REQUEST_EARTH_GUIDANCE"
