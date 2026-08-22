import os

class Config:
    SERVICE_NAME: str = "ai-engine"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1")
    DEFAULT_HORIZON_SECONDS: int = 600

config = Config()
