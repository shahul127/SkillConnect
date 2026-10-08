from pydantic import BaseModel

class BookingCreate(BaseModel):
    worker_id: str
    service: str
    date: str
    time: str
    address: str


class BookingStatusUpdate(BaseModel):
    status: str