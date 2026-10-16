import math
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field, field_validator
from passlib.context import CryptContext
from pymongo import MongoClient
from bson import ObjectId
from app.database.mongo import db, users
from app.utils.jwt import get_current_user
from app.utils.service_catalog import SERVICES, SERVICE_CATEGORIES, get_service, get_category

router = APIRouter(tags=["Profiles and Recommendations"])
pwd = CryptContext(schemes=["bcrypt"])

class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, pattern=r"^[6-9]\d{9}$")
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=32)
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, password):
        if not any(c.isupper() for c in password):
            raise ValueError("Password must contain an uppercase letter")
        if not any(c.islower() for c in password):
            raise ValueError("Password must contain a lowercase letter")
        if not any(c.isdigit() for c in password):
            raise ValueError("Password must contain a number")
        if not any(not c.isalnum() for c in password):
            raise ValueError("Password must contain a special character")
        return password

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, value, info):
        if info.data.get("new_password") and value != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return value


def safe_user(user):
    user = dict(user)
    user["user_id"] = str(user.pop("_id"))
    user.pop("password", None)
    return user


def haversine(lat1, lon1, lat2, lon2):
    radius = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlon / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(min(1, a)))


def assessment_workers():
    uri = os.getenv("AI_MONGO_URL") or os.getenv("MONGO_URL")
    if not uri:
        return []
    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    try:
        return list(client["skill_connect"]["workers"].find({}, {"_id": 0}))
    except Exception:
        return []
    finally:
        client.close()


@router.get("/users/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    user = users.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": safe_user(user)}


@router.patch("/users/me")
def update_my_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    changes = data.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=400, detail="Enter at least one field to update")
    existing = users.find_one({"email": current_user["email"]})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    if "email" in changes:
        changes["email"] = str(changes["email"])
        duplicate = users.find_one({"email": changes["email"], "_id": {"$ne": existing["_id"]}})
        if duplicate:
            raise HTTPException(status_code=409, detail="Email already registered")
    users.update_one({"_id": existing["_id"]}, {"$set": changes})
    updated = users.find_one({"_id": existing["_id"]})
    return {"message": "Profile updated", "user": safe_user(updated)}


@router.patch("/users/me/password")
def update_password(data: PasswordUpdate, current_user: dict = Depends(get_current_user)):
    user = users.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not pwd.verify(data.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    users.update_one({"_id": user["_id"]}, {"$set": {"password": pwd.hash(data.new_password)}})
    return {"message": "Password updated successfully"}


@router.get("/recommendations")
def recommend_workers(service_id: str, latitude: float | None = None, longitude: float | None = None, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Only customers can search for workers")
    service = get_service(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    customer = users.find_one({"email": current_user["email"]})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    customer_lat = latitude if latitude is not None else customer.get("latitude")
    customer_lon = longitude if longitude is not None else customer.get("longitude")
    if customer_lat is None or customer_lon is None:
        raise HTTPException(status_code=400, detail="Customer location is required")

    ai_records = assessment_workers()
    ai_by_id = {str(item.get("worker_id")): item for item in ai_records if item.get("worker_id") is not None}
    review_collection = db["Reviews"]
    candidates = []
    for worker in users.find({"role": "worker"}):
        worker_id = str(worker["_id"])
        result = ai_by_id.get(worker_id)
        if not result:
            continue
        worker_skill = str(result.get("skill", ""))
        category = next(c for c in SERVICE_CATEGORIES if c["category_id"] == service["category_id"])
        if worker_skill.casefold() != category["skill"].casefold():
            continue
        if worker.get("latitude") is None or worker.get("longitude") is None:
            continue
        distance = haversine(customer_lat, customer_lon, worker["latitude"], worker["longitude"])
        score = float(result.get("skill_score", 0) or 0)
        rating_data = list(review_collection.aggregate([
            {"$match": {"worker_id": worker_id}},
            {"$group": {"_id": None, "average": {"$avg": "$rating"}, "count": {"$sum": 1}}}
        ]))
        rating = round(rating_data[0]["average"], 1) if rating_data and rating_data[0].get("average") is not None else 0
        count = rating_data[0]["count"] if rating_data else 0
        candidates.append({
            "worker_id": worker_id,
            "name": worker.get("name", "Worker"),
            "skill": worker_skill,
            "skill_score": score,
            "verification_status": result.get("status", "Pending"),
            "distance_km": round(distance, 2),
            "rating": rating,
            "review_count": count,
        })
    candidates.sort(key=lambda w: (w["skill_score"], w["rating"], -w["distance_km"]), reverse=True)
    return {"service": service, "workers": candidates}


@router.get("/worker/dashboard")
def worker_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "worker":
        raise HTTPException(status_code=403, detail="Worker account required")
    user = users.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")
    worker_id = str(user["_id"])
    records = assessment_workers()
    result = next((r for r in records if str(r.get("worker_id")) == worker_id), None)
    bookings = db["Bookings"]
    completed = bookings.count_documents({"worker_id": worker_id, "status": "completed"})
    earnings = list(db["Payments"].aggregate([
        {"$match": {"worker_id": worker_id, "status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]))
    return {
        "worker": {"user_id": worker_id, "name": user.get("name"), "email": user.get("email")},
        "assessment_completed": result is not None,
        "skill": result.get("skill") if result else None,
        "skill_score": result.get("skill_score") if result else None,
        "strongest_domain": result.get("strongest_domain") if result else None,
        "verification_status": result.get("status") if result else "Pending",
        "completed_orders": completed,
        "total_earnings": round(earnings[0]["total"], 2) if earnings else 0,
    }
