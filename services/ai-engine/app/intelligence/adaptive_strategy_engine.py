from typing import List
from app.memory.memory_models import MissionExperience
from app.memory.learning_model import DeterministicLearningModel

class AdaptiveStrategyEngine:
    def __init__(self, model=None):
        self.model = model or DeterministicLearningModel()

    def predict_success(self, strategy_name: str, experiences: List[MissionExperience]) -> float:
        return self.model.predict_strategy_success(strategy_name, experiences)
