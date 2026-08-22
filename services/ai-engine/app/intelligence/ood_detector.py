from typing import Dict, Any, Tuple
from app.models.observations import AutonomyObservationModel

class OODDetector:
    """
    Out-Of-Distribution (OOD) Detector for Mars Rover Autonomy.
    Detects observations outside nominal physical training distributions,
    attenuates model confidence, and triggers safe fallbacks.
    """

    DISTRIBUTION_BOUNDS = {
        "battery": {"min": 0.0, "max": 1.0},
        "temperature": {"min": -130.0, "max": 30.0},
        "solarIntensity": {"min": 0.0, "max": 750.0},
        "positionX": {"min": -100.0, "max": 1200.0},
        "positionY": {"min": -100.0, "max": 1200.0},
        "validTerrains": ["FLAT", "ROUGH", "SOFT_SAND", "REGOLITH_ROCK", "STEEP_SLOPE"],
        "validWeathers": ["CLEAR", "DUSTY", "CLOUDY", "DUST_STORM"]
    }

    @classmethod
    def check_observation(cls, obs: Any) -> Tuple[bool, float, str]:
        """
        Evaluates an observation object or dict for Out-Of-Distribution conditions.
        Returns (is_ood: bool, confidence_multiplier: float, reason: str).
        """
        # Support dict or AutonomyObservationModel
        obs_dict = obs.dict() if hasattr(obs, "dict") else (obs if isinstance(obs, dict) else {})

        rover = obs_dict.get("rover", {})
        env = obs_dict.get("environment", {})

        bat = rover.get("batteryLevel", 0.94)
        pos = rover.get("position", {"x": 100, "y": 100})
        temp_dict = rover.get("temperature", {})
        ext_temp = temp_dict.get("externalTempCelsius", -60.0) if isinstance(temp_dict, dict) else -60.0

        weather_dict = env.get("weather", {})
        weather_state = weather_dict.get("state", "CLEAR") if isinstance(weather_dict, dict) else "CLEAR"
        solar = weather_dict.get("solarIntensity", 590.0) if isinstance(weather_dict, dict) else 590.0
        terrain = rover.get("terrain", "FLAT")

        # 1. Check physical bounds
        if bat < cls.DISTRIBUTION_BOUNDS["battery"]["min"] or bat > cls.DISTRIBUTION_BOUNDS["battery"]["max"]:
            return True, 0.20, f"BATTERY_OUT_OF_BOUNDS: {bat}"

        if ext_temp < cls.DISTRIBUTION_BOUNDS["temperature"]["min"] or ext_temp > cls.DISTRIBUTION_BOUNDS["temperature"]["max"]:
            return True, 0.30, f"TEMPERATURE_EXCURSION_OOD: {ext_temp}C"

        if solar < cls.DISTRIBUTION_BOUNDS["solarIntensity"]["min"] or solar > cls.DISTRIBUTION_BOUNDS["solarIntensity"]["max"]:
            return True, 0.35, f"SOLAR_IRRADIANCE_OOD: {solar}W/m2"

        if pos.get("x", 100) < cls.DISTRIBUTION_BOUNDS["positionX"]["min"] or pos.get("x", 100) > cls.DISTRIBUTION_BOUNDS["positionX"]["max"]:
            return True, 0.40, f"POSITION_X_OUT_OF_BOUNDS: {pos.get('x')}"

        if terrain not in cls.DISTRIBUTION_BOUNDS["validTerrains"]:
            return True, 0.25, f"UNSEEN_TERRAIN_OOD: {terrain}"

        if weather_state not in cls.DISTRIBUTION_BOUNDS["validWeathers"]:
            return True, 0.30, f"UNSEEN_WEATHER_OOD: {weather_state}"

        return False, 1.0, "IN_DISTRIBUTION"
