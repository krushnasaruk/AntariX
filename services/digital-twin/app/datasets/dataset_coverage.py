from pydantic import BaseModel, Field
from typing import Dict, Any, List

class ScenarioCoverageReport(BaseModel):
    totalEpisodes: int
    nominalCount: int = 0
    lowBatteryCount: int = 0
    blackoutCount: int = 0
    dustStormCount: int = 0
    obstacleCount: int = 0
    compoundFailureCount: int = 0
    coveragePercentages: Dict[str, float] = Field(default_factory=dict)

class CoverageAnalyzer:
    @staticmethod
    def analyze_scenarios(scenarios: List[Dict[str, Any]]) -> ScenarioCoverageReport:
        total = len(scenarios)
        nominal = sum(1 for s in scenarios if s.get("missionType") == "NOMINAL")
        low_bat = sum(1 for s in scenarios if s.get("initialBattery", 1.0) < 0.50)
        blackout = sum(1 for s in scenarios if s.get("communication") == "BLACKOUT")
        dust = sum(1 for s in scenarios if s.get("weather") == "DUST_STORM")
        obstacle = sum(1 for s in scenarios if s.get("missionType") == "HIGH_HAZARD")
        compound = sum(1 for s in scenarios if len(s.get("faults", [])) > 1 or s.get("missionType") == "CRITICAL_COMPOUND")

        percentages = {}
        if total > 0:
            percentages = {
                "nominal": round((nominal / total) * 100, 1),
                "lowBattery": round((low_bat / total) * 100, 1),
                "blackout": round((blackout / total) * 100, 1),
                "dustStorm": round((dust / total) * 100, 1),
                "obstacle": round((obstacle / total) * 100, 1),
                "compoundFailure": round((compound / total) * 100, 1)
            }

        return ScenarioCoverageReport(
            totalEpisodes=total,
            nominalCount=nominal,
            lowBatteryCount=low_bat,
            blackoutCount=blackout,
            dustStormCount=dust,
            obstacleCount=obstacle,
            compoundFailureCount=compound,
            coveragePercentages=percentages
        )
