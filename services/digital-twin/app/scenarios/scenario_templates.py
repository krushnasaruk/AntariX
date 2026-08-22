from typing import Dict, Any, List

class ScenarioTemplates:
    TEMPLATES: Dict[str, Dict[str, Any]] = {
        "NOMINAL_MISSION": {
            "missionType": "NOMINAL",
            "initialBattery": 0.94,
            "weather": "CLEAR",
            "communication": "AVAILABLE",
            "faultsCount": 0
        },
        "DUST_STORM_EMERGENCY": {
            "missionType": "WEATHER_HAZARD",
            "initialBattery": 0.85,
            "weather": "DUST_STORM",
            "communication": "BLACKOUT",
            "faultsCount": 1
        },
        "BATTERY_DEGRADATION": {
            "missionType": "POWER_DEGRADED",
            "initialBattery": 0.40,
            "weather": "CLEAR",
            "communication": "AVAILABLE",
            "faultsCount": 1
        },
        "COMM_BLACKOUT": {
            "missionType": "ISOLATED",
            "initialBattery": 0.90,
            "weather": "CLEAR",
            "communication": "BLACKOUT",
            "faultsCount": 1
        },
        "COMPOUND_FAILURE": {
            "missionType": "CRITICAL_COMPOUND",
            "initialBattery": 0.35,
            "weather": "DUST_STORM",
            "communication": "BLACKOUT",
            "faultsCount": 3
        }
    }

    @classmethod
    def get_template(cls, template_name: str) -> Dict[str, Any]:
        return cls.TEMPLATES.get(template_name, cls.TEMPLATES["NOMINAL_MISSION"])
