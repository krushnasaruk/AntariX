from app.models.observations import AutonomyObservationModel
from app.models.uncertainty import UncertainValueModel
from app.models.predictions import (
    PredictionsModel,
    BatteryPredictionModel,
    WeatherPredictionModel,
    CommunicationPredictionModel,
    MissionPredictionModel
)

class PyPredictionEngine:
    def predict(self, obs: AutonomyObservationModel, horizon_seconds: float = 600.0) -> PredictionsModel:
        curr_sim_time = obs.environment.simulationTime
        future_sim_time = curr_sim_time + horizon_seconds

        # 1. Battery Trajectory Prediction with Uncertainty
        current_battery = obs.rover.batteryLevel
        reserve = obs.constraints.minimumBatteryReserve
        drain_rate = 0.0001 # per second
        predicted_battery = max(0.0, current_battery - (horizon_seconds * drain_rate))
        battery_std = round(0.02 + (horizon_seconds / 3600.0) * 0.03, 3)
        reserve_violation = predicted_battery < reserve

        battery_pred = BatteryPredictionModel(
            currentBattery=current_battery,
            predictedBattery=round(predicted_battery, 3),
            horizonSeconds=horizon_seconds,
            reserveViolationExpected=reserve_violation,
            confidence=0.90,
            uncertainty=UncertainValueModel.create(mean=round(predicted_battery, 3), std=battery_std, confidence=0.90, unit="fraction")
        )

        # 2. Weather State Prediction with Uncertainty
        if 7200.0 <= future_sim_time < 10800.0:
            pred_weather = "DUST_STORM"
            pred_vis = 10.0
            weather_conf = 0.92
        elif 3600.0 <= future_sim_time < 7200.0:
            pred_weather = "DUSTY"
            pred_vis = 50.0
            weather_conf = 0.90
        else:
            pred_weather = "CLEAR"
            pred_vis = 100.0
            weather_conf = 0.95

        weather_pred = WeatherPredictionModel(
            currentState=obs.environment.weather.state,
            predictedState=pred_weather,
            predictedVisibility=pred_vis,
            horizonSeconds=horizon_seconds,
            confidence=weather_conf,
            uncertainty=UncertainValueModel.create(mean=pred_vis, std=5.0, confidence=weather_conf, unit="meters")
        )

        # 3. Communication Prediction with Uncertainty
        comm_pred = CommunicationPredictionModel(
            communicationState=obs.communication.communicationState,
            distanceKm=obs.communication.distanceKm,
            estimatedOneWayDelay=obs.communication.estimatedOneWayDelay,
            estimatedRoundTripDelay=obs.communication.estimatedRoundTripDelay,
            blackoutExpected=(obs.communication.communicationState == "BLACKOUT"),
            confidence=0.98,
            uncertainty=UncertainValueModel.create(mean=obs.communication.estimatedOneWayDelay, std=0.5, confidence=0.98, unit="seconds")
        )

        # 4. Mission Progress Prediction with Uncertainty
        curr_task = obs.currentTask.get("name", "None") if obs.currentTask else "None"
        curr_progress = obs.missionProgress
        pred_progress = min(100.0, curr_progress + 14.28)

        mission_pred = MissionPredictionModel(
            currentTask=curr_task,
            currentProgress=curr_progress,
            predictedProgress=round(pred_progress, 2),
            resourceMarginFeasible=not reserve_violation,
            confidence=0.88,
            uncertainty=UncertainValueModel.create(mean=round(pred_progress, 2), std=2.5, confidence=0.88, unit="percent")
        )

        return PredictionsModel(
            battery=battery_pred,
            weather=weather_pred,
            communication=comm_pred,
            mission=mission_pred
        )
