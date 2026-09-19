from fastapi import APIRouter
from app.models.user import UserCreate 

router=APIRouter(prefix="/auth")

@router.post("/register")
def register(user: UserCreate):
    return {
        "message": "Registration API is working ",
         "user" :user
    }