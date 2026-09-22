from fastapi import FastAPI
app = FastAPI(title="Skill Connect AI Module")
@app.get("/")
def home():
    return {
        "message": "AI Module is running"
    }