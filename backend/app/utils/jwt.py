
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import jwt, JWTError
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.database.mongo import users

load_dotenv()

key = os.getenv("JWT_SECRET_KEY")
algo = "HS256"

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def create_access_token(data: dict) -> str:
    if not key:
        raise RuntimeError(
            "JWT_SECRET_KEY is missing from the backend .env file"
        )

    token_data = data.copy()
    token_data["exp"] = (
        datetime.now(timezone.utc) + timedelta(minutes=30)
    )

    return jwt.encode(
        token_data,
        key,
        algorithm=algo
    )


def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    if not key:
        raise RuntimeError(
            "JWT_SECRET_KEY is missing from the backend .env file"
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=[algo]
        )

        user_id = payload.get("sub")
        email = payload.get("email")
        user = None

        if user_id:
            try:
                user = users.find_one(
                    {"_id": ObjectId(user_id)},
                    {"_id": 1, "email": 1, "role": 1, "name": 1}
                )
            except Exception:
                user = None

        if user is None and email:
            user = users.find_one(
                {"email": email},
                {"_id": 1, "email": 1, "role": 1, "name": 1}
            )

        if user is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    return {
        "id": str(user["_id"]),
        "email": user.get("email"),
        "role": user.get("role"),
        "name": user.get("name")
    }
