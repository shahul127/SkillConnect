from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database.mongo import db
from app.utils.jwt import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

notifications = db["Notifications"]


def notification_view(item):
    item = dict(item)
    item["notification_id"] = str(item.pop("_id"))

    if isinstance(item.get("created_at"), datetime):
        item["created_at"] = item["created_at"].isoformat()

    return item


@router.get("/")
def list_notifications(
    current_user: dict = Depends(get_current_user),
):
    items = (
        notifications.find(
            {"recipient_email": current_user["email"]}
        )
        .sort("created_at", -1)
        .limit(100)
    )

    return {
        "notifications": [
            notification_view(item) for item in items
        ]
    }


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID",
        )

    result = notifications.update_one(
        {
            "_id": ObjectId(notification_id),
            "recipient_email": current_user["email"],
        },
        {"$set": {"read": True}},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return {"message": "Notification marked as read"}
