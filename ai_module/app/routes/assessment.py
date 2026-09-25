from fastapi import APIRouter, UploadFile, File
from app.models.schema import AssessmentRequest
from app.services.gem_service import generate_questions
from app.database.mongo import assessments, users
from app.services.speech_service import speech_to_text
from app.services.question_service import get_question
router = APIRouter(
    prefix="/assessment",
    tags=["AI Assessment"]
)
@router.post("/generate")
def generate(data: AssessmentRequest):

    questions = generate_questions(data.skill, data.experience)

    assessment = {
        "user_id": data.user_id,
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

@router.post("/speech/transcribe")
async def transcribe_speech(file: UploadFile = File(...)):
    audio= await file.read()
    text = speech_to_text(audio)

    return {
        "text": text
    }    

@router.get("/question")
def get_assessment_question(
    skill: str,
    domain: str,
    level: str
):
    question = get_question(skill, domain, level)

    if not question:
        return {
            "message": "Question not found"
        }

    question["_id"] = str(question["_id"])

    return question    