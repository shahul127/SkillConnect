
from fastapi import APIRouter, HTTPException, status
from pymongo.errors import PyMongoError
from passlib.context import CryptContext

from app.models.user import UserCreate, UserLogin
from app.database.mongo import users
from app.utils.jwt import create_access_token

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    email = user.email.strip().lower()

    try:
        # Check whether email already exists
        existing_user = users.find_one({"email": email})

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Hash password before saving
        hashed_pwd = pwd.hash(user.password)

        new_user = {
            "name": user.name.strip(),
            "email": email,
            "phone": user.phone,
            "password": hashed_pwd,
            "role": user.role,
            "latitude": user.latitude,
            "longitude": user.longitude
        }

        result = users.insert_one(new_user)

        return {
            "message": "Registration successful",
            "user_id": str(result.inserted_id)
        }

    except HTTPException:
        raise

    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database operation failed. Check MongoDB connection."
        )

    except Exception:
        # Full error is available in the backend terminal.
        import logging
        logging.exception("Registration failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Check the backend terminal."
        )


@router.post("/login")
def login(user: UserLogin):
    email = user.email.strip().lower()

    try:
        existing_user = users.find_one({"email": email})

        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not pwd.verify(
            user.password,
            existing_user["password"]
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = create_access_token({
            "sub": str(existing_user["_id"]),
            "email": existing_user["email"],
            "role": existing_user["role"]
        })

        return {
            "message": "Login successful",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(existing_user["_id"]),
                "name": existing_user["name"],
                "email": existing_user["email"],
                "role": existing_user["role"]
            }
        }

    except HTTPException:
        raise

    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database operation failed. Check MongoDB connection."
        )

    except Exception:
        import logging
        logging.exception("Login failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Check the backend terminal."
        )
