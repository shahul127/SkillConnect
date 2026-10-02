from fastapi import APIRouter
from app.models.schema import RecommendationRequest
from app.services.recommendation_service import get_recommendations

router = APIRouter(
    prefix="/recommendation",
    tags=["Recommendation"]
)

@router.post("/")
def recommend_workers(data: RecommendationRequest):

    return get_recommendations( data.service,data.latitude,data.longitude)