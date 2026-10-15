from fastapi import APIRouter, Query
from app.services.recommendation_service import get_recommendations

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendation"]
)


@router.get("/")
def recommend_workers(
    service_id: str = Query(...),
    latitude: float = Query(...),
    longitude: float = Query(...)
):
    print("AI MODULE: Recommendation request received")
    print("Service:", service_id)
    print("Customer location:", latitude, longitude)

    result = get_recommendations(
        service_id,
        latitude,
        longitude
    )

    print("AI MODULE: Recommendation result count:", result.get("count", 0))

    return result