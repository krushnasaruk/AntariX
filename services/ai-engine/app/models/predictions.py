from pydantic import BaseModel, Field
from typing import Optional
from app.models.uncertainty import UncertainValueModel

class BatteryPredictionModel(BaseModel):
    currentBattery: float
    predictedBattery: float
    horizonSeconds: float
    reserveViolationExpected: bool
    confidence: float = 0.90
    uncertainty: Optional[UncertainValueModel] = None

class WeatherPredictionModel(BaseModel):
    currentState: str
    predictedState: str
    predictedVisibility: float
    horizonSeconds: float
    confidence: float = 0.95
    uncertainty: Optional[UncertainValueModel] = None

class CommunicationPredictionModel(BaseModel):
    communicationState: str
    distanceKm: float
    estimatedOneWayDelay: float
    estimatedRoundTripDelay: float
    blackoutExpected: bool = False
    confidence: float = 0.98
    uncertainty: Optional[UncertainValueModel] = None

class MissionPredictionModel(BaseModel):
    currentTask: str
    currentProgress: float
    predictedProgress: float
    resourceMarginFeasible: bool = True
    confidence: float = 0.88
    uncertainty: Optional[UncertainValueModel] = None

class PredictionsModel(BaseModel):
    battery: BatteryPredictionModel
    weather: WeatherPredictionModel
    communication: CommunicationPredictionModel
    mission: MissionPredictionModel
