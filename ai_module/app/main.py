from fastapi import FastAPI
from app.routes import assessment
from app.routes.recommendation import router as recommendation_router
app = FastAPI(title="Skill Connect AI Module")
@app.get("/")
def home():
    return {
        "message": "AI Module is running"
    }

app.include_router(assessment.router)
app.include_router(recommendation_router)