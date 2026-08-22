import pytest
import time
from app.models.observations import AutonomyObservationModel, RoverObservationModel, EnvironmentObservationModel, CommunicationObservationModel
from app.intelligence.prediction_engine import PyPredictionEngine

def test_battery_prediction_600s():
    pred_engine = PyPredictionEngine()
    obs = AutonomyObservationModel(timestamp=time.time() * 1000, rover=RoverObservationModel(batteryLevel=0.90))
    preds = pred_engine.predict(obs, 600.0)
    assert preds.battery.currentBattery == 0.90
    assert preds.battery.predictedBattery < 0.90

def test_reserve_violation_flag():
    pred_engine = PyPredictionEngine()
    obs = AutonomyObservationModel(timestamp=time.time() * 1000, rover=RoverObservationModel(batteryLevel=0.18))
    preds = pred_engine.predict(obs, 600.0)
    assert preds.battery.reserveViolationExpected is True

def test_communication_metrics_accepted_without_recalculation():
    pred_engine = PyPredictionEngine()
    comm_obs = CommunicationObservationModel(
        communicationState="AVAILABLE",
        distanceKm=225000000.0,
        estimatedOneWayDelay=750.5,
        estimatedRoundTripDelay=1501.0
    )
    obs = AutonomyObservationModel(timestamp=time.time() * 1000, communication=comm_obs)
    preds = pred_engine.predict(obs, 600.0)
    assert preds.communication.estimatedOneWayDelay == 750.5
    assert preds.communication.estimatedRoundTripDelay == 1501.0
