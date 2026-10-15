from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.database.mongo import db, users
from app.utils.jwt import get_current_user
from app.utils.notifications import notify
from app.utils.service_catalog import get_service, SERVICE_CATEGORIES

router = APIRouter(prefix="/bookings", tags=["Bookings"])
bookings = db["Bookings"]


class BookingCreate(BaseModel):
    worker_id: str
    service_id: str
    date: str
    time: str
    address: str = Field(min_length=5, max_length=300)
    problem_type: str = Field(min_length=2, max_length=100)
    problem_details: str | None = Field(default=None, max_length=1000)


class BookingResponse(BaseModel):
    accepted: bool


def as_booking(booking):
    booking = dict(booking)
    booking["booking_id"] = str(booking.pop("_id"))
    for field in ("created_at", "updated_at"):
        if isinstance(booking.get(field), datetime):
            booking[field] = booking[field].isoformat()
    booking.pop("customer_email", None)
    return booking


def get_booking(booking_id):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def assigned_worker(booking, current_user):
    worker = users.find_one({"email": current_user["email"], "role": "worker"})
    if not worker or str(worker["_id"]) != booking["worker_id"]:
        raise HTTPException(status_code=403, detail="This booking is not assigned to you")
    return worker


def customer_owns(booking, current_user):
    if current_user.get("role") != "customer" or booking["customer_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="This booking does not belong to you")


def booking_view(booking, current_user):
    result = as_booking(booking)
    worker = users.find_one({"_id": ObjectId(booking["worker_id"])}) if ObjectId.is_valid(booking["worker_id"]) else None
    if current_user.get("role") == "customer":
        result["worker_name"] = worker.get("name") if worker else None
        if booking.get("status") in ("accepted", "completed"):
            result["worker_phone"] = worker.get("phone") if worker else None
    else:
        customer = users.find_one({"email": booking["customer_email"]})
        result["customer_name"] = customer.get("name") if customer else None
        if booking.get("status") in ("accepted", "completed"):
            result["customer_phone"] = customer.get("phone") if customer else None
    return result


@router.post("/")
def create_booking(data: BookingCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create bookings")
    service = get_service(data.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if not ObjectId.is_valid(data.worker_id):
        raise HTTPException(status_code=400, detail="Invalid worker ID")
    worker = users.find_one({"_id": ObjectId(data.worker_id), "role": "worker"})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    expected_skill = next(
        c["skill"]
        for c in SERVICE_CATEGORIES
        if c["category_id"] == service["category_id"]
    )

    assessment = db["Assessments"].find_one(
        {
            "user_id": str(worker["_id"]),
            "skill": expected_skill,
            "status": "completed"
        },
        sort=[("_id", -1)]
    )

    if not assessment:
        raise HTTPException(
            status_code=400,
            detail="This worker has not completed the assessment for the selected service"
        )

    now = datetime.now(timezone.utc)
    booking = {
        "customer_email": current_user["email"],
        "worker_id": data.worker_id,
        "service_id": service["service_id"],
        "service_name": service["name"],
        "category_id": service["category_id"],
        "skill": expected_skill,
        "date": data.date,
        "time": data.time,
        "address": data.address,
        "problem_type": data.problem_type,
        "problem_details": data.problem_details,
        "price": service["price"],
        "status": "pending",
        "payment_status": "unpaid",
        "created_at": now,
        "updated_at": now,
    }
    inserted = bookings.insert_one(booking)
    notify(worker["email"], "New booking request", f"New request for {service['name']} on {data.date} at{data.time}.", "booking_request", str(inserted.inserted_id))
    return {"message": "Booking request sent. Waiting for worker confirmation.", "booking_id": str(inserted.inserted_id), "status": "pending", "price": service["price"]}


@router.get("/customer")
def customer_bookings(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Customer account required")
    return {"bookings": [booking_view(b, current_user) for b in bookings.find({"customer_email": current_user["email"]}).sort("created_at", -1)]}


@router.get("/worker")
def worker_bookings(current_user: dict = Depends(get_current_user)):
    worker = users.find_one({"email": current_user["email"], "role": "worker"})
    if not worker:
        raise HTTPException(status_code=403, detail="Worker account required")
    return {"bookings": [booking_view(b, current_user) for b in bookings.find({"worker_id": str(worker["_id"])}).sort("created_at", -1)]}


@router.get("/{booking_id}")
def booking_details(booking_id: str, current_user: dict = Depends(get_current_user)):
    booking = get_booking(booking_id)
    if current_user.get("role") == "customer":
        customer_owns(booking, current_user)
    elif current_user.get("role") == "worker":
        assigned_worker(booking, current_user)
    else:
        raise HTTPException(status_code=403, detail="Not allowed")
    return {"booking": booking_view(booking, current_user)}


@router.post("/{booking_id}/respond")
def respond_to_booking(booking_id: str, data: BookingResponse, current_user: dict = Depends(get_current_user)):
    booking = get_booking(booking_id)
    worker = assigned_worker(booking, current_user)
    if booking["status"] != "pending":
        raise HTTPException(status_code=400, detail="This booking has already been answered")
    status = "accepted" if data.accepted else "rejected"
    bookings.update_one({"_id": booking["_id"], "status": "pending"}, {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}})
    notify(booking["customer_email"], f"Booking {status}", f"The worker has {status} your {booking['service_name']} request.", f"booking_{status}", booking_id)
    return {"message": f"Booking {status}", "status": status}


@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    booking = get_booking(booking_id)
    customer_owns(booking, current_user)
    if booking["status"] not in ("pending", "accepted"):
        raise HTTPException(status_code=400, detail="This booking cannot be cancelled")
    bookings.update_one({"_id": booking["_id"]}, {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc)}})
    worker = users.find_one({"_id": ObjectId(booking["worker_id"])})
    if worker:
        notify(worker["email"], "Booking cancelled", f"The customer cancelled the {booking['service_name']} booking.", "booking_cancelled", booking_id)
    return {"message": "Booking cancelled", "status": "cancelled"}


@router.post("/{booking_id}/complete")
def complete_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    booking = get_booking(booking_id)
    worker = assigned_worker(booking, current_user)
    if booking["status"] != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted bookings can be completed")
    bookings.update_one({"_id": booking["_id"], "status": "accepted"}, {"$set": {"status": "completed", "updated_at": datetime.now(timezone.utc)}})
    notify(booking["customer_email"], "Work completed", f"The worker marked {booking['service_name']} as completed. You can now record payment.", "work_completed", booking_id)
    return {"message": "Work marked as completed", "status": "completed"}