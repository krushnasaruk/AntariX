from app.models.observations import AutonomyObservationModel
from app.models.intelligence_report import MissionHealthModel

class PyMissionHealthScorer:
    def calculate_health(self, obs: AutonomyObservationModel) -> MissionHealthModel:
        battery = obs.rover.batteryLevel
        health_state = obs.rover.health
        comm_state = obs.communication.communicationState
        weather = obs.environment.weather.state
        progress = obs.missionProgress

        bat_health = min(1.0, max(0.0, battery))
        rover_health = 1.0 if health_state == "NOMINAL" else (0.0 if health_state == "CRITICAL" else 0.5)
        comm_health = 1.0 if comm_state == "AVAILABLE" else 0.6
        env_health = 1.0 if weather == "CLEAR" else (0.2 if weather == "DUST_STORM" else 0.6)
        prog_health = min(1.0, progress / 100.0)

        overall = round((bat_health + rover_health + comm_health + env_health + prog_health) / 5.0, 2)

        return MissionHealthModel(
            score=overall,
            batteryHealth=round(bat_health, 2),
            roverHealth=round(rover_health, 2),
            communicationHealth=round(comm_health, 2),
            environmentHealth=round(env_health, 2),
            missionProgressHealth=round(prog_health, 2)
        )
