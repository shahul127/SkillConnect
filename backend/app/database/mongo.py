import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
Mongo_uri=os.getenv("MONGO_URL")
client=MongoClient(Mongo_uri)
db=client["SkillConnect"]
users=db["Users"]

