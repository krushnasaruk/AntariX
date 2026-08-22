import pytest
import time
from app.memory.memory_models import MissionExperience, ExperienceQuery
from app.memory.experience_repository import InMemoryExperienceRepository

def test_record_and_get_experience():
    repo = InMemoryExperienceRepository()
    exp = MissionExperience(
        experienceId="EXP-001",
        missionId="MISSION-CRATER-07",
        actionType="MOVE_ROVER",
        actionSuccess=True,
        batteryConsumed=0.02
    )
    repo.record_experience(exp)

    retrieved = repo.get_experience("EXP-001")
    assert retrieved is not None
    assert retrieved.experienceId == "EXP-001"
    assert retrieved.batteryConsumed == 0.02

def test_query_experiences_by_success_and_failure():
    repo = InMemoryExperienceRepository()
    exp1 = MissionExperience(experienceId="EXP-1", actionSuccess=True, finalOutcome="SUCCESS")
    exp2 = MissionExperience(experienceId="EXP-2", actionSuccess=False, finalOutcome="FAILURE", failureReason="BATTERY_LOW")
    repo.record_experience(exp1)
    repo.record_experience(exp2)

    succ = repo.get_successful_experiences()
    fail = repo.get_failed_experiences()

    assert len(succ) == 1
    assert len(fail) == 1
    assert succ[0].experienceId == "EXP-1"
    assert fail[0].experienceId == "EXP-2"

def test_statistics_calculation():
    repo = InMemoryExperienceRepository()
    repo.record_experience(MissionExperience(experienceId="EXP-1", actionSuccess=True, finalOutcome="SUCCESS", planStrategy="SAFE_SAMPLE"))
    repo.record_experience(MissionExperience(experienceId="EXP-2", actionSuccess=True, finalOutcome="SUCCESS", planStrategy="SAFE_SAMPLE"))
    repo.record_experience(MissionExperience(experienceId="EXP-3", actionSuccess=False, finalOutcome="FAILURE", planStrategy="DIRECT_SAMPLE"))

    stats = repo.get_statistics()
    assert stats["totalExperiences"] == 3
    assert stats["successfulCount"] == 2
    assert stats["failedCount"] == 1
    assert stats["overallSuccessRate"] == 0.667
