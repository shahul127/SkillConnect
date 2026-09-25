from fastapi import FastAPI
from app.database.mongo import users
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router


app=FastAPI(title="Skill Connect backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "Skill Connect backend is running!"}

app.include_router(auth_router)