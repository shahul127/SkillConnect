import os
from jose import jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone


load_dotenv()

key = os.getenv("JWT_SECRET_KEY")
algo = "HS256"

def create_access_token(data):
    token_data = data.copy()

    expiration_time = datetime.now(timezone.utc) + timedelta(minutes=30)

    token_data["exp"] = expiration_time

    token = jwt.encode(
        token_data,
        key,
        algorithm=algo
    )

    return token