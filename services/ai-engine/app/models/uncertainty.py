from pydantic import BaseModel, Field
from typing import Optional

class UncertainValueModel(BaseModel):
    mean: float
    standardDeviation: float = 0.0
    variance: float = 0.0
    confidence: float = 1.0
    unit: str = ""

    @classmethod
    def create(cls, mean: float, std: float = 0.0, confidence: float = 1.0, unit: str = ""):
        return cls(
            mean=float(mean),
            standardDeviation=float(std),
            variance=float(std * std),
            confidence=float(confidence),
            unit=unit
        )
