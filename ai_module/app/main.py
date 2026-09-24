from fastapi import FastAPI
from app.routes import assessment
app = FastAPI(title="Skill Connect AI Module")
@app.get("/")
def home():
    return {
        "message": "AI Module is running"
    }

app.include_router(assessment.router)