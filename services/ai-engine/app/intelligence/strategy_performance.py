from typing import List
from app.memory.memory_models import MissionExperience, StrategyPerformance
from app.memory.learning_model import DeterministicLearningModel

class StrategyPerformanceEngine:
    def __init__(self, model=None):
        self.model = model or DeterministicLearningModel()

    def evaluate_strategies(self, experiences: List[MissionExperience]) -> List[StrategyPerformance]:
        return self.model.analyze_experience(experiences)
