from fastapi import APIRouter
from app.models.schema import AssessmentRequest
from app.services.gem_service import generate_questions
from app.database.mongo import assessments, users
router = APIRouter(
    prefix="/assessment",
    tags=["AI Assessment"]
)
@router.post("/generate")
def generate(data: AssessmentRequest):

    questions = generate_questions(data.skill, data.experience)

    assessment = {
        "worker_id": data.worker_id,
        "skill": data.skill,
        "experience": data.experience,
        "questions": questions
    }

    result = assessments.insert_one(assessment)

    return {
        "assessment_id": str(result.inserted_id),
        "questions": questions,
        "status": "success"
    }