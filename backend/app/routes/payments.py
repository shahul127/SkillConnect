from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.database.mongo import db

router = APIRouter(prefix="/payments", tags=["Payments"])
payments = db["Payments"]


class PaymentCreate(BaseModel):
    worker_name: str = Field(min_length=2, max_length=200)
    booking_id: str = Field(min_length=1, max_length=50)
    amount: float = Field(gt=0)
    method: str = Field(min_length=2, max_length=50)
    notes: str | None = Field(default=None, max_length=1000)


def payment_view(item):
    item = dict(item)
    item["payment_id"] = str(item.pop("_id"))
    if isinstance(item.get("created_at"), datetime):
        item["created_at"] = item["created_at"].isoformat()
    return item


@router.get("/")
def list_payments():
    results = []
    for item in payments.find().sort("created_at", -1):
        results.append(payment_view(item))
    return {"payments": results}


@router.post("/")
def create_payment(data: PaymentCreate):
    if not data.booking_id or not ObjectId.is_valid(data.booking_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid booking ID",
        )

    payload = {
        "worker_name": data.worker_name.strip(),
        "booking_id": data.booking_id,
        "amount": float(data.amount),
        "method": data.method.strip(),
        "notes": data.notes.strip() if data.notes else "",
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }

    result = payments.insert_one(payload)
    payload["payment_id"] = str(result.inserted_id)
    return {
        "message": "Payment assigned successfully",
        "payment_id": payload["payment_id"],
        "status": "pending",
    }