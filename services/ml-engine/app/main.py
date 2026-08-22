from fastapi import FastAPI
from app.api.routes import router
from app.config.config import ml_config

app = FastAPI(
    title="Mars ML/RL Training & Inference Service",
    description="Python ML/RL Training Architecture, Model Registry & Evaluation Platform for AntriX",
    version=ml_config.VERSION
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8011, reload=False)
