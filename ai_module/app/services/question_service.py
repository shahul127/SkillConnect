from app.database.mongo import questions


def get_question(skill, domain, level):
    question = questions.find_one({
        "skill": skill,
        "domain": domain,
        "level": level
    })

    return question