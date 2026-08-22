from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.observations import AutonomyObservationModel
from app.models.intelligence_report import MissionIntelligenceReportModel
from app.intelligence.mission_intelligence import PyMissionIntelligenceEngine
from app.memory.memory_models import (
    MissionExperience,
    LearningAnalysisRequest,
    LearningAnalysisResponse,
    StrategyPerformance,
    FailurePattern
)
from app.intelligence.adaptive_planning import AdaptivePlanningEngine
from app.config import config

router = APIRouter()
intel_engine = PyMissionIntelligenceEngine()
learning_engine = AdaptivePlanningEngine()

@router.post("/analyze", response_model=MissionIntelligenceReportModel)
async def analyze_observation(obs: AutonomyObservationModel):
    try:
        report = intel_engine.generate_report(obs)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": config.SERVICE_NAME}

@router.get("/version")
async def get_version():
    return {"version": config.VERSION}

# Objective 8 Learning Endpoints
@router.post("/learn/experience", response_model=MissionExperience)
async def record_experience(exp: MissionExperience):
    try:
        recorded = learning_engine.record_experience(exp)
        return recorded
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/learn/analyze", response_model=LearningAnalysisResponse)
async def analyze_learning(req: LearningAnalysisRequest):
    try:
        response = learning_engine.analyze_and_recommend(req.observation, req.candidateStrategies)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/learn/strategies", response_model=List[StrategyPerformance])
async def get_strategy_performances():
    experiences = learning_engine.repository.get_recent_experiences(100)
    return learning_engine.model.analyze_experience(experiences)

@router.get("/learn/failures", response_model=List[FailurePattern])
async def get_failure_patterns():
    experiences = learning_engine.repository.get_recent_experiences(100)
    return learning_engine.model.detect_failure_pattern(experiences)

@router.get("/learn/statistics", response_model=Dict[str, Any])
async def get_learning_statistics():
    return learning_engine.repository.get_statistics()

@router.get("/learn/health")
async def get_learning_health():
    stats = learning_engine.repository.get_statistics()
    return {
        "status": "ok",
        "learning_engine": "active",
        "experiences_recorded": stats.get("totalExperiences", 0)
    }
