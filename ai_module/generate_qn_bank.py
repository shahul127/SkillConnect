from app.services.gem_service import generate_question_bank
from app.database.mongo import questions
skills = [
    "AC Technician",
    "Electrician",
    "Plumber",
    "Carpenter"
]
for skill in skills:

    print()
    print("Generating question bank for:", skill)
    generated_questions = generate_question_bank(
        skill
    )
    if len(generated_questions) != 36:
        print(
            f"ERROR: Expected 36 questions "
            f"but received {len(generated_questions)}"
        )
        continue
    result = questions.insert_many(
        generated_questions
    )
    print(
        f"Stored {len(result.inserted_ids)} "
        f"questions for {skill}"
    )
print("Question bank generation completed.")