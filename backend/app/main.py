from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.ai import router as ai_router
from app.routes.bookings import router as bookings_router
from app.routes.notification import router as notification_router
from app.routes.payments import router as payments_router
from app.routes.payments_review import router as payments_review_router

app = FastAPI(title="Skill Connect backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Skill Connect backend is running!"}


app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(bookings_router)
app.include_router(notification_router)
app.include_router(payments_router, prefix="/api")
app.include_router(payments_review_router, prefix="/api")