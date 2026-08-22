from fastapi import FastAPI
from app.api.routes import router
from app.config import config

app = FastAPI(
    title="Earth-Mars AI Mission Intelligence Engine",
    description="Python AI Service providing real-time anomaly detection, risk assessment, state prediction, and advisory mission intelligence.",
    version=config.VERSION
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
