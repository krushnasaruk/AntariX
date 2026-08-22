from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.memory.memory_models import MissionExperience, ExperienceQuery

class BaseExperienceStore(ABC):
    @abstractmethod
    def record_experience(self, exp: MissionExperience) -> MissionExperience:
        pass

    @abstractmethod
    def get_experience(self, exp_id: str) -> Optional[MissionExperience]:
        pass

    @abstractmethod
    def query_experiences(self, query: ExperienceQuery) -> List[MissionExperience]:
        pass

    @abstractmethod
    def get_recent_experiences(self, limit: int = 50) -> List[MissionExperience]:
        pass

    @abstractmethod
    def get_failed_experiences(self) -> List[MissionExperience]:
        pass

    @abstractmethod
    def get_successful_experiences(self) -> List[MissionExperience]:
        pass

    @abstractmethod
    def get_strategy_history(self, strategy_name: str) -> List[MissionExperience]:
        pass

    @abstractmethod
    def get_statistics(self) -> Dict[str, Any]:
        pass
