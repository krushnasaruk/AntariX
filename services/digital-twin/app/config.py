import os

class Config:
    SERVICE_NAME: str = "digital-twin"
    VERSION: str = "1.0.0"
    SCHEMA_VERSION: str = "1.0.0"
    DEFAULT_DATA_DIR: str = os.getenv("DIGITAL_TWIN_DATA_DIR", "services/digital-twin/data")

config = Config()
