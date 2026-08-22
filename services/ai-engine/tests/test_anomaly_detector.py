import pytest
import time
from app.models.observations import AutonomyObservationModel, RoverObservationModel, EnvironmentObservationModel, WeatherModel, CommunicationObservationModel
from app.intelligence.anomaly_detector import PyAnomalyDetector

def make_sample_obs(battery: float = 0.94, health: str = "NOMINAL", weather: str = "CLEAR", comm_state: str = "AVAILABLE") -> AutonomyObservationModel:
    return AutonomyObservationModel(
        timestamp=time.time() * 1000,
        rover=RoverObservationModel(batteryLevel=battery, health=health),
        environment=EnvironmentObservationModel(weather=WeatherModel(state=weather)),
        communication=CommunicationObservationModel(communicationState=comm_state)
    )

def test_no_critical_anomaly_on_normal():
    detector = PyAnomalyDetector()
    obs = make_sample_obs()
    anomalies = detector.detect(obs)
    assert not any(a.severity == "CRITICAL" for a in anomalies)

def test_battery_low_anomaly():
    detector = PyAnomalyDetector()
    obs = make_sample_obs(battery=0.12)
    anomalies = detector.detect(obs)
    bat_ano = next((a for a in anomalies if a.type == "BATTERY_LOW"), None)
    assert bat_ano is not None
    assert bat_ano.severity == "HIGH"

def test_battery_critical_anomaly():
    detector = PyAnomalyDetector()
    obs = make_sample_obs(battery=0.03)
    anomalies = detector.detect(obs)
    bat_ano = next((a for a in anomalies if a.type == "BATTERY_LOW"), None)
    assert bat_ano is not None
    assert bat_ano.severity == "CRITICAL"

def test_rover_health_degradation():
    detector = PyAnomalyDetector()
    obs = make_sample_obs(health="WARNING")
    anomalies = detector.detect(obs)
    hlt_ano = next((a for a in anomalies if a.type == "ROVER_HEALTH_DEGRADATION"), None)
    assert hlt_ano is not None
    assert hlt_ano.severity == "HIGH"

def test_dust_storm_weather_anomaly():
    detector = PyAnomalyDetector()
    obs = make_sample_obs(weather="DUST_STORM")
    anomalies = detector.detect(obs)
    wth_ano = next((a for a in anomalies if a.type == "WEATHER_DEGRADATION"), None)
    assert wth_ano is not None
    assert wth_ano.severity == "HIGH"

def test_communication_blackout_anomaly():
    detector = PyAnomalyDetector()
    obs = make_sample_obs(comm_state="BLACKOUT")
    anomalies = detector.detect(obs)
    blk_ano = next((a for a in anomalies if a.type == "COMMUNICATION_BLACKOUT"), None)
    assert blk_ano is not None
    assert blk_ano.severity == "LOW"
