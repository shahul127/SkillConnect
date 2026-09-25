import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

mongo_uri = os.getenv("MONGO_URL")
client = MongoClient(mongo_uri)
db = client["SkillConnect"]

users = db["Users"]
assessments = db["Assessments"]
questions=db["questions"]