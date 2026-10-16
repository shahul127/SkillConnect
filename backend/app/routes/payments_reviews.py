from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.database.mongo import db, users
from app.utils.jwt import get_current_user
from app.utils.notifications import notify

router = APIRouter(tags=["Payments and Reviews"])
bookings = db["Bookings"]
payments = db["Payments"]
reviews = db["Reviews"]

class PaymentCreate(BaseModel):
    booking_id: str
    payment_method: str = Field(min_length=2, max_length=40)
    transaction_reference: str | None = Field(default=None, max_length=120)

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    review: str = Field(min_length=2, max_length=1000)


def find_customer_booking(booking_id, current_user):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.get("role") != "customer" or booking["customer_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="This booking does not belong to you")
    return booking


@router.post("/payments")
def record_payment(data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    booking = find_customer_booking(data.booking_id, current_user)
    if booking["status"] != "completed":
        raise HTTPException(status_code=400, detail="Payment can be recorded after work is completed")
    if booking.get("payment_status") == "paid":
        raise HTTPException(status_code=409, detail="Payment is already recorded")
    now = datetime.now(timezone.utc)
    payment = {
        "booking_id": data.booking_id,
        "customer_email": current_user["email"],
        "worker_id": booking["worker_id"],
        "amount": float(booking["price"]),
        "payment_method": data.payment_method,
        "transaction_reference": data.transaction_reference,
        "status": "paid",
        "created_at": now,
    }
    payments.insert_one(payment)
    bookings.update_one({"_id": booking["_id"], "payment_status": {"$ne": "paid"}}, {"$set": {"payment_status": "paid", "paid_at": now, "updated_at": now}})
    worker = users.find_one({"_id": ObjectId(booking["worker_id"])})
    if worker:
        notify(worker["email"], "Payment recorded", f"Payment of {booking['price']} was recorded for {booking['service_name']}.", "payment_received", data.booking_id)
    return {"message": "Payment details recorded", "amount": booking["price"], "status": "paid"}


@router.post("/reviews")
def add_review(data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    booking = find_customer_booking(data.booking_id, current_user)
    if booking["status"] != "completed" or booking.get("payment_status") != "paid":
        raise HTTPException(status_code=400, detail="Review is available after completion and payment")
    if reviews.find_one({"booking_id": data.booking_id}):
        raise HTTPException(status_code=409, detail="A review already exists for this booking")
    now = datetime.now(timezone.utc)
    reviews.insert_one({
        "booking_id": data.booking_id,
        "customer_email": current_user["email"],
        "worker_id": booking["worker_id"],
        "rating": data.rating,
        "review": data.review,
        "created_at": now,
    })
    worker = users.find_one({"_id": ObjectId(booking["worker_id"])})
    if worker:
        notify(worker["email"], "New customer review", f"You received a {data.rating}-star review.", "review_received", data.booking_id)
    return {"message": "Review submitted successfully"}


@router.get("/reviews/worker/{worker_id}")
def worker_reviews(worker_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(worker_id):
        raise HTTPException(status_code=400, detail="Invalid worker ID")
    result = []
    for item in reviews.find({"worker_id": worker_id}).sort("created_at", -1):
        item["review_id"] = str(item.pop("_id"))
        item.pop("customer_email", None)
        if isinstance(item.get("created_at"), datetime):
            item["created_at"] = item["created_at"].isoformat()
        result.append(item)
    return {"reviews": result}
