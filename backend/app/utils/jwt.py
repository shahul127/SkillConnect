import os
from jose import jwt, JWTError
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

key = os.getenv("JWT_SECRET_KEY")
algo = "HS256"

security = HTTPBearer()

def create_access_token(data):
    token_data = data.copy()
    expiration_time = datetime.now(timezone.utc) + timedelta(minutes=30)
    token_data["exp"] = expiration_time
    token = jwt.encode(token_data,key,algorithm=algo)

    return token

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token,key,algorithms=[algo])
        return payload

    except JWTError:
        raise HTTPException(status_code=401,detail="Invalid or expired token")