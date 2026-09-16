from fastapi import FastAPI
from app.database.mongo import users
app=FastAPI(title="Skill Connect backend")

@app.get("/")
def home():
    users.insert_one({"name":"test user","email":"just@ex.com"})
    return {"message": "Skill Connect backend is running!"}