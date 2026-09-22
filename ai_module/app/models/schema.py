from pydantic import BaseModel
class AssessmentRequest(BaseModel):
    user_id: str
    skill: str
    experience: int