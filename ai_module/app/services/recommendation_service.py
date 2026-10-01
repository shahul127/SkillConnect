import math
from app.database.mongo import users, assessments

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = (math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def get_assessment_score(domain_scores):
    all_scores = []
    for scores in domain_scores.values():
        all_scores.extend(scores)

    if not all_scores:
        return 0

    return round(sum(all_scores) / len(all_scores),2)


def get_recommendations(skill, latitude, longitude):
    recommendations = []
    completed_assessments = assessments.find({
        "skill": skill,
        "status": "completed"})

    for assessment in completed_assessments:
        user_id = assessment["user_id"]
        try:
            from bson import ObjectId
            worker = users.find_one({
                "_id": ObjectId(user_id),
                "role": "worker"
            })
        except:
            worker = None
        if not worker:
            continue
        if "latitude" not in worker or "longitude" not in worker:
            continue

        assessment_score = get_assessment_score(assessment.get("domain_scores", {}))
        distance = calculate_distance(
            latitude,
            longitude,
            worker["latitude"],
            worker["longitude"]
        )

        recommendations.append({
            "worker_id": str(worker["_id"]),
            "name": worker.get("name"),
            "skill": assessment["skill"],
            "assessment_score": assessment_score,
            "distance_km": distance
        })

    recommendations.sort(
        key=lambda x: (
            -x["assessment_score"],
            x["distance_km"]
        )
    )

    return recommendations