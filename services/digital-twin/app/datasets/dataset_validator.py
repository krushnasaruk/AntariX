from pydantic import BaseModel, Field
from typing import List, Dict, Any, Set

class DatasetQualityReport(BaseModel):
    datasetId: str
    rowCount: int
    episodeCount: int
    missingnessCount: int = 0
    invalidBatteryCount: int = 0
    duplicateCount: int = 0
    coordinateJumps: int = 0
    leakageWarnings: List[str] = Field(default_factory=list)
    qualityScore: float = 100.0
    passed: bool = True

class DatasetValidator:
    @staticmethod
    def validate_records(dataset_id: str, records: List[Dict[str, Any]], episode_count: int = 1) -> DatasetQualityReport:
        missing = 0
        invalid_bat = 0
        duplicates = 0
        jumps = 0
        seen_keys = set()

        prev_pos = None

        for r in records:
            key = f"{r.get('episode_id')}_{r.get('simulation_time')}"
            if key in seen_keys:
                duplicates += 1
            seen_keys.add(key)

            bat = r.get("battery", 1.0)
            if bat < 0.0 or bat > 1.0:
                invalid_bat += 1

            for val in r.values():
                if val is None:
                    missing += 1

            pos_x = r.get("rover_position_x", 0.0)
            pos_y = r.get("rover_position_y", 0.0)
            if prev_pos is not None:
                dist = ((pos_x - prev_pos[0])**2 + (pos_y - prev_pos[1])**2)**0.5
                if dist > 50.0: # Impossible 50m jump in 1s
                    jumps += 1
            prev_pos = (pos_x, pos_y)

        total_issues = missing + invalid_bat + duplicates + jumps
        q_score = max(0.0, 100.0 - (total_issues * 2.0))
        passed = total_issues == 0

        return DatasetQualityReport(
            datasetId=dataset_id,
            rowCount=len(records),
            episodeCount=episode_count,
            missingnessCount=missing,
            invalidBatteryCount=invalid_bat,
            duplicateCount=duplicates,
            coordinateJumps=jumps,
            qualityScore=round(q_score, 1),
            passed=passed
        )

    @staticmethod
    def validate_split_leakage(train_episodes: List[str], test_episodes: List[str]) -> Dict[str, Any]:
        """
        Hard check verifying zero episode leakage between training and testing sets.
        """
        train_set: Set[str] = set(train_episodes)
        test_set: Set[str] = set(test_episodes)
        overlap = train_set.intersection(test_set)

        return {
            "hasLeakage": len(overlap) > 0,
            "overlappingEpisodes": list(overlap),
            "trainEpisodeCount": len(train_set),
            "testEpisodeCount": len(test_set),
            "passed": len(overlap) == 0
        }
