from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PositionModel(BaseModel):
    x: float = 100.0
    y: float = 100.0

class VelocityModel(BaseModel):
    vx: float = 0.0
    vy: float = 0.0
    speedMps: float = 0.0

class TemperatureModel(BaseModel):
    internalTempCelsius: float = 15.0
    externalTempCelsius: float = -60.0

class RoverObservationModel(BaseModel):
    id: str = "ROVER_PERSEVERANCE_2"
    position: PositionModel = Field(default_factory=PositionModel)
    velocity: Optional[VelocityModel] = Field(default_factory=VelocityModel)
    heading: float = 0.0
    batteryLevel: float = 0.94
    batteryCapacity: float = 1600.0
    temperature: Optional[TemperatureModel] = Field(default_factory=TemperatureModel)
    health: str = "NOMINAL"
    storageUsed: float = 0.0
    storageCapacity: float = 100.0
    samplesCollected: List[Any] = Field(default_factory=list)

class WeatherModel(BaseModel):
    state: str = "CLEAR"
    visibility: float = 100.0
    solarIntensity: float = 590.0

class EnvironmentObservationModel(BaseModel):
    simulationTime: float = 0.0
    terrainAtRover: str = "FLAT"
    nearbyObstacles: List[Dict[str, Any]] = Field(default_factory=list)
    obstacles: List[Dict[str, Any]] = Field(default_factory=list)
    nearbyHazards: List[Dict[str, Any]] = Field(default_factory=list)
    weather: WeatherModel = Field(default_factory=WeatherModel)
    missionLocations: Dict[str, Any] = Field(default_factory=dict)

class CommunicationObservationModel(BaseModel):
    communicationState: str = "AVAILABLE"
    distanceKm: float = 225000000.0
    estimatedOneWayDelay: float = 750.5
    estimatedRoundTripDelay: float = 1501.0
    queuedPackets: List[Any] = Field(default_factory=list)
    inTransitPackets: List[Any] = Field(default_factory=list)
    lastEarthContact: Optional[float] = None
    pendingCommands: int = 0
    pendingAcknowledgements: int = 0

class ConstraintsModel(BaseModel):
    minimumBatteryReserve: float = 0.15

class AutonomyObservationModel(BaseModel):
    timestamp: float
    mission: Dict[str, Any] = Field(default_factory=dict)
    currentTask: Optional[Dict[str, Any]] = None
    readyTasks: List[Dict[str, Any]] = Field(default_factory=list)
    completedTasksCount: int = 0
    totalTasksCount: int = 0
    missionProgress: float = 0.0
    resources: Dict[str, Any] = Field(default_factory=dict)
    constraints: ConstraintsModel = Field(default_factory=ConstraintsModel)
    rover: RoverObservationModel = Field(default_factory=RoverObservationModel)
    environment: EnvironmentObservationModel = Field(default_factory=EnvironmentObservationModel)
    communication: CommunicationObservationModel = Field(default_factory=CommunicationObservationModel)
    currentPlan: Optional[Dict[str, Any]] = None
    recentEvents: List[Any] = Field(default_factory=list)
