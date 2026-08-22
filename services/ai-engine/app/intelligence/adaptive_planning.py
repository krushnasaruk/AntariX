import time
from typing import List
from app.models.observations import AutonomyObservationModel
from app.memory.memory_models import (
    MissionExperience,
    LearningAnalysisResponse,
    AdaptivePlanningRecommendation
)
from app.memory.experience_repository import InMemoryExperienceRepository
from app.memory.learning_model import DeterministicLearningModel

class AdaptivePlanningEngine:
    def __init__(self, repository=None, model=None):
        self.repository = repository or InMemoryExperienceRepository()
        self.model = model or DeterministicLearningModel()

    def record_experience(self, exp: MissionExperience) -> MissionExperience:
        return self.repository.record_experience(exp)

    def analyze_and_recommend(
        self,
        obs: AutonomyObservationModel,
        candidate_strategies: List[str] = None
    ) -> LearningAnalysisResponse:
        now = time.time() * 1000
        experiences = self.repository.get_recent_experiences(100)

        candidates = candidate_strategies or [
            "SAFE_SAMPLE_ACQUISITION_AND_RETURN",
            "DIRECT_SAMPLE_COLLECTION",
            "ENERGY_CONSERVING_PATROL",
            "DUST_STORM_HOLDING"
        ]

        recommendation = self.model.recommend_strategy(obs, candidates, experiences)
        performances = self.model.analyze_experience(experiences)
        patterns = self.model.detect_failure_pattern(experiences)
        stats = self.repository.get_statistics()

        return LearningAnalysisResponse(
            timestamp=now,
            recommendation=recommendation,
            strategyPerformances=performances,
            failurePatterns=patterns,
            statistics=stats
        )
