from typing import List
from app.memory.memory_models import MissionExperience, FailurePattern
from app.memory.learning_model import DeterministicLearningModel

class FailurePatternAnalyzer:
    def __init__(self, model=None):
        self.model = model or DeterministicLearningModel()

    def analyze_failures(self, experiences: List[MissionExperience]) -> List[FailurePattern]:
        return self.model.detect_failure_pattern(experiences)
