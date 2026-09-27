from pydantic import BaseModel

class AssessmentRequest(BaseModel):
    user_id: str
    skill: str

class AnswerRequest(BaseModel):
    assessment_id: str
    question_id: str
    answer: str

class AdaptiveQuestionRequest(BaseModel):
    assessment_id: str

class WorkerSaveRequest(BaseModel):
    user_id: str
    name: str
    skill: str
    experience: str
    ai_score: float    