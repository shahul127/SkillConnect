from bson import ObjectId
from app.database.mongo import questions

def get_question(skill, domain, level):
    question = questions.find_one({ "skill": skill, "domain": domain, "level": level})
    return question


def get_question_by_id(question_id):
    question = questions.find_one({ "_id": ObjectId(question_id) })
    return question

def get_questions_by_domain(skill,domain,level):
    question_list = list(
        questions.find({
            "skill": skill,
            "domain": domain,
            "level": level
        }) )
    return question_list

def get_screening_questions(skill, domains):
   
    selected_questions = []
    for domain in domains:
        question = questions.find_one({"skill": skill,"domain": domain, "level": "Basic"})
        if question:
            selected_questions.append(question)

    return selected_questions