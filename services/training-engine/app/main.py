from fastapi import FastAPI
from app.api.routes import router
from app.config import config

app = FastAPI(
    title="Mars ML/RL Training Engine & Experiment Orchestration Service",
    description="Production ML/RL Training Pipeline, Experiment Orchestration & GPU Training Infrastructure for AntriX",
    version=config.VERSION
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8012, reload=False)
