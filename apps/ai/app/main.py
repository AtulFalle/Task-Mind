from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.api.routes.suggestions import router as suggestions_router

app = FastAPI(
    title="TaskMindAI AI Service",
    description="Local, auditable AI suggestions for Document Studio.",
    version="0.1.0",
)

app.include_router(health_router)
app.include_router(suggestions_router)
