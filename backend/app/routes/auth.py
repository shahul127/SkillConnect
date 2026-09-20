from fastapi import APIRouter
from app.models.user import UserCreate 
from passlib.context import CryptContext
from app.database.mongo import users


pwd = CryptContext(schemes=["bcrypt"])
router=APIRouter(prefix="/auth")

@router.post("/register")
def register(user: UserCreate):
    existing_user = users.find_one({"email": user.email})
    if existing_user:
        return {
            "message": "Email already registered"
        }

    hashed_pwd = pwd.hash(user.password)

# If new user inserting in the db
    new_user = {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "password": hashed_pwd,
        "role": user.role,
        "latitude": user.latitude,
        "longitude": user.longitude
    }
    users.insert_one(new_user)
    return {
        "message": "Registration is successful"
    }

@router.post("/login")
def login(user: UserLogin):
    existing_user = users.find_one({"email": user.email})
    if not existing_user:
        return {
            "message": "User does not exist ,Please Register "
        }

    if not pwd.verify(user.password, existing_user["password"]):
        return {
            "message": "Invalid email or password"
        }

    return {
        "message": "Login successful"
    }    