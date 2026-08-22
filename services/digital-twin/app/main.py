from fastapi import FastAPI
from app.api.routes import router
from app.config import config

app = FastAPI(
    title="Mars Digital Twin Service",
    description="Python Digital Twin Runtime, Telemetry Fabric & Simulation Orchestration for AntriX",
    version=config.VERSION
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8010, reload=True)
