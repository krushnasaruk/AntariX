from typing import List, Optional, Dict, Any
from app.memory.memory_models import MissionExperience, ExperienceQuery
from app.memory.experience_store import BaseExperienceStore

class InMemoryExperienceRepository(BaseExperienceStore):
    def __init__(self):
        self._experiences: List[MissionExperience] = []

    def record_experience(self, exp: MissionExperience) -> MissionExperience:
        self._experiences.append(exp)
        return exp

    def get_experience(self, exp_id: str) -> Optional[MissionExperience]:
        for exp in self._experiences:
            if exp.experienceId == exp_id:
                return exp
        return None

    def query_experiences(self, query: ExperienceQuery) -> List[MissionExperience]:
        results = list(self._experiences)

        if query.missionId:
            results = [e for e in results if e.missionId == query.missionId]
        if query.strategy:
            results = [e for e in results if e.planStrategy == query.strategy]
        if query.successfulOnly:
            results = [e for e in results if e.actionSuccess is True]
        if query.failedOnly:
            results = [e for e in results if e.actionSuccess is False]

        return results[:query.limit]

    def get_recent_experiences(self, limit: int = 50) -> List[MissionExperience]:
        return list(reversed(self._experiences))[:limit]

    def get_failed_experiences(self) -> List[MissionExperience]:
        return [e for e in self._experiences if e.actionSuccess is False or e.finalOutcome == "FAILURE"]

    def get_successful_experiences(self) -> List[MissionExperience]:
        return [e for e in self._experiences if e.actionSuccess is True and e.finalOutcome == "SUCCESS"]

    def get_strategy_history(self, strategy_name: str) -> List[MissionExperience]:
        return [e for e in self._experiences if e.planStrategy == strategy_name]

    def get_statistics(self) -> Dict[str, Any]:
        total = len(self._experiences)
        successes = len(self.get_successful_experiences())
        failures = len(self.get_failed_experiences())
        rate = round(successes / total, 3) if total > 0 else 0.0

        return {
            "totalExperiences": total,
            "successfulCount": successes,
            "failedCount": failures,
            "overallSuccessRate": rate,
            "uniqueStrategies": list(set(e.planStrategy for e in self._experiences))
        }

    def clear_store(self):
        self._experiences = []
