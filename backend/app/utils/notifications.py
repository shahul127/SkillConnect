from datetime import datetime, timezone
from app.database.mongo import db

notifications = db["Notifications"]


def notify(email, title, message, notification_type, booking_id=None):
    notifications.insert_one({
        "recipient_email": email,
        "title": title,
        "message": message,
        "type": notification_type,
        "booking_id": booking_id,
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })
