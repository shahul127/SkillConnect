from fastapi import FastAPI
from app.database.mongo import users
from app.routes.auth import router as auth_router


app=FastAPI(title="Skill Connect backend")

@app.get("/")
def home():
    return {"message": "Skill Connect backend is running!"}

app.include_router(auth_router)