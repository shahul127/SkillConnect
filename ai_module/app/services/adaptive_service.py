from app.services.question_service import (get_questions_by_domain)

DOMAINS = {
    "AC Technician": [
        "Troubleshooting & Diagnostics",
        "Electrical & Controls",
        "Refrigeration & Gas Service",
        "Maintenance & Servicing",
        "Installation & Uninstallation",
        "Safety Practices"
    ],
    "Electrician": [
        "Wiring & Conduiting",
        "Fault Diagnosis & Repair",
        "Distribution & Protection",
        "Appliance & Fixture Mounting",
        "Three-Phase Systems",
        "Electrical Safety"
    ],
    "Plumber": [
        "Piping & Materials",
        "Leakage & Diagnostics",
        "Sanitary & Fixture Fitting",
        "Water Supply & Drainage",
        "Pumping Systems",
        "Safety & Hygiene"
    ],
    "Carpenter": [
        "Measurement & Layout",
        "Cutting & Surface Preparation",
        "Hardware & Door Fittings",
        "Modular & Custom Joinery",
        "Furniture Repair & Refit",
        "Tool & Site Safety"
    ]
}
MIN_QUESTIONS = 10
MAX_QUESTIONS = 12
def get_next_level(current_level, score):

    if score >= 75:
        if current_level == "Basic":
            return "Intermediate"

        if current_level == "Intermediate":
            return "Advanced"

        return "Advanced"
    if score >= 50:
        return current_level

    return "Basic"


def get_ranked_domains(domain_scores):

    ranked_domains = []
    for domain, scores in domain_scores.items():
        if scores:
            average_score = sum(scores) / len(scores)
            ranked_domains.append({
                "domain": domain,
                "score": round(average_score, 2)
            })
    ranked_domains.sort(
        key=lambda item: item["score"]
    )
    return ranked_domains


def get_next_domain(domain_scores,questions_asked,skill):

    ranked_domains = get_ranked_domains(domain_scores)
    for item in ranked_domains:
        domain = item["domain"]
        last_score = domain_scores[domain][-1]
        current_level = "Basic"
        if last_score >= 75:
            current_level = "Intermediate"

        questions = get_questions_by_domain(skill,domain, current_level)
        for question in questions:
            question_id = str(question["_id"])
            if question_id not in questions_asked:
                return question

    return None