
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://127.0.0.1:27017"
)

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000
)

db = client["SkillConnect"]
users = db["Users"]
