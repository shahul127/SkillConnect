from fastapi import APIRouter, UploadFile, File
from bson import ObjectId
from app.database.mongo import assessments
from app.models.schema import (AssessmentRequest,AnswerRequest,AdaptiveQuestionRequest)
from app.services.speech_service import speech_to_text
from app.services.question_service import (get_screening_questions,get_question_by_id,get_questions_by_domain)
from app.services.eval_service import evaluate_answer
from app.services.adaptive_service import (DOMAINS,MIN_QUESTIONS,MAX_QUESTIONS,get_ranked_domains,get_next_level,get_next_domain)

router = APIRouter(
    prefix="/assessment",
    tags=["AI Assessment"]
)
@router.post("/start")
def start_assessment(data: AssessmentRequest):

    if data.skill not in DOMAINS:
        return {
            "status": "error",
            "message": "Invalid skill"
        }
    domain_scores = {}
    for domain in DOMAINS[data.skill]:
        domain_scores[domain] = []

    screening_questions = get_screening_questions(data.skill,DOMAINS[data.skill])
    if len(screening_questions) == 0:
        return {
            "status": "error",
            "message": "No questions available"
        }
    first_question = screening_questions[0]
    assessment = {
        "user_id": data.user_id,
        "skill": data.skill,
        "stage": "screening",
        "status": "in_progress",
        "total_questions": 1,
        "max_questions": MAX_QUESTIONS,
        "screening_count": 0,
        "questions_asked": [
            str(first_question["_id"])
        ],
        "domain_scores": domain_scores
    }

    result = assessments.insert_one(assessment)
    first_question["_id"] = str(first_question["_id"])
    return {
        "status": "success",
        "assessment_id": str(result.inserted_id),
        "stage": "screening",
        "question": first_question
    }

@router.post("/evaluate")
def evaluate(data: AnswerRequest):

    assessment = assessments.find_one({"_id": ObjectId(data.assessment_id)})
    if not assessment:
        return {
            "status": "error",
            "message": "Assessment not found"
        }

    question = get_question_by_id( data.question_id)
    if not question:
        return {
            "status": "error",
            "message": "Question not found"
        }
    score = float(evaluate_answer(
        data.answer,
        question["expected_answer"],
        question.get("key_concepts", [])))
    domain = question["domain"]

    assessments.update_one(
        { "_id": ObjectId(data.assessment_id)},
        {"$push": { f"domain_scores.{domain}": score}})
    return {
        "status": "success",
        "score": score,
        "domain": domain
    }
@router.post("/next-question")
def next_question(request: AdaptiveQuestionRequest):
    assessment = assessments.find_one({"_id": ObjectId(request.assessment_id)})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    total_questions = assessment.get("total_questions", 0)
    if total_questions >= MAX_QUESTIONS:
        assessments.update_one(
            {"_id": assessment["_id"]},
            {"$set": {"status": "completed"}}
        )
        return {"message": "Assessment completed"}

    skill = assessment["skill"]
    screening_count = assessment.get("screening_count", 0)
    questions_asked = assessment.get("questions_asked", [])
    domain_scores = assessment.get("domain_scores", {})
    if screening_count < 6:
        for domain in DOMAINS[skill]:
            scores = domain_scores.get(domain, [])

            if len(scores) == 0:
                questions = get_questions_by_domain(skill, domain, "Basic")

                for question in questions:
                    question_id = str(question["_id"])

                    if question_id not in questions_asked:
                        assessments.update_one(
                            {"_id": assessment["_id"]},
                            {
                                "$push": {"questions_asked": question_id},
                                "$inc": {"total_questions": 1}
                            }
                        )

                        return {
                            "question_id": question_id,
                            "domain": question["domain"],
                            "level": question["level"],
                            "question": question["question"]
                        }

    question = get_next_domain(domain_scores,questions_asked,skill)
    if not question:
        assessments.update_one(
            {"_id": assessment["_id"]},
            {"$set": {"status": "completed"}}
        )
        return {"message": "Assessment completed"}

    question_id = str(question["_id"])

    assessments.update_one(
        {"_id": assessment["_id"]},
        {
            "$push": {"questions_asked": question_id},
            "$inc": {"total_questions": 1}
        }
    )

    return {
        "question_id": question_id,
        "domain": question["domain"],
        "level": question["level"],
        "question": question["question"]
    }

@router.get("/result/{assessment_id}")
def get_assessment_result(assessment_id: str):
    assessment = assessments.find_one({"_id": ObjectId(assessment_id)})
    if not assessment:
        raise HTTPException( status_code=404,detail="Assessment not found")

    domain_scores = assessment["domain_scores"]
    domain_averages = {}
    for domain, scores in domain_scores.items():
        domain_averages[domain] = round(sum(scores) / len(scores),2)

    strongest_domain = max(domain_averages,key=domain_averages.get)
    overall_score = round(sum(domain_averages.values()) / len(domain_averages),2)

    return {
        "status": assessment["status"],
        "overall_score": overall_score,
        "domain_scores": domain_averages,
        "strongest_domain": strongest_domain,
        "total_questions": assessment["total_questions"]
    }

@router.post("/speech/transcribe")
async def transcribe_speech(file: UploadFile = File(...)):
    audio = await file.read()
    text = speech_to_text(audio)
    return {"text": text}