import math
from bson import ObjectId
from app.database.mongo import users, assessments


SERVICE_INFO = {
    "ac-repair": ("AC Technician", "Troubleshooting & Diagnostics"),
    "ac-electrical-problem": ("AC Technician", "Electrical & Controls"),
    "gas-charging": ("AC Technician", "Refrigeration & Gas Service"),
    "ac-maintenance": ("AC Technician", "Maintenance & Servicing"),
    "ac-installation": ("AC Technician", "Installation & Uninstallation"),
    "ac-safety-inspection": ("AC Technician", "Safety Practices"),

    "house-wiring": ("Electrician", "Wiring & Conduiting"),
    "electrical-fault-repair": ("Electrician", "Fault Diagnosis & Repair"),
    "electrical-distribution-work": ("Electrician", "Distribution & Protection"),
    "appliance-installation": ("Electrician", "Appliance & Fixture Mounting"),
    "three-phase-electrical-work": ("Electrician", "Three-Phase Systems"),
    "electrical-safety-inspection": ("Electrician", "Electrical Safety"),

    "pipe-installation": ("Plumber", "Piping & Materials"),
    "pipe-leak": ("Plumber", "Leakage & Diagnostics"),
    "pipe-leakage-repair": ("Plumber", "Leakage & Diagnostics"),
    "bathroom-fitting": ("Plumber", "Sanitary & Fixture Fitting"),
    "water-supply-drainage": ("Plumber", "Water Supply & Drainage"),
    "water-pump-repair": ("Plumber", "Pumping Systems"),
    "plumbing-safety-hygiene": ("Plumber", "Safety & Hygiene"),

    "furniture-measurement-layout": ("Carpenter", "Measurement & Layout"),
    "wood-cutting-preparation": ("Carpenter", "Cutting & Surface Preparation"),
    "door-hardware-fitting": ("Carpenter", "Hardware & Door Fittings"),
    "modular-furniture-work": ("Carpenter", "Modular & Custom Joinery"),
    "furniture-repair": ("Carpenter", "Furniture Repair & Refit"),
    "carpentry-tool-safety-work": ("Carpenter", "Tool & Site Safety"),
}


def calculate_distance(lat1, lon1, lat2, lon2):
    radius = 6371

    lat1, lon1, lat2, lon2 = map(
        math.radians, [lat1, lon1, lat2, lon2]
    )

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    a = min(1.0, max(0.0, a))
    return round(
        radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)),
        2
    )


def get_recommendations(service, latitude, longitude):
    service_id = service.strip().lower().replace("_", "-")

    service_info = SERVICE_INFO.get(service_id)

    if not service_info:
        return {
            "service": service,
            "message": "Service not supported",
            "recommendations": []
        }

    skill, required_domain = service_info

    search_radii = [5, 10, 20, 30]

    for radius in search_radii:
        recommendations = []
        completed_assessments = assessments.find({
            "skill": skill,
            "status": "completed"
        })

        for assessment in completed_assessments:
            user_id = assessment.get("user_id")

            if not user_id:
                continue

            try:
                worker = users.find_one({
                    "_id": ObjectId(str(user_id)),
                    "role": "worker"
                })
            except Exception:
                continue

            if not worker:
                continue

            worker_lat = worker.get("latitude")
            worker_lon = worker.get("longitude")

            if worker_lat is None or worker_lon is None:
                continue

            try:
                distance = calculate_distance(
                    float(latitude),
                    float(longitude),
                    float(worker_lat),
                    float(worker_lon)
                )
            except (TypeError, ValueError):
                continue

            if distance > radius:
                continue

            domain_averages = assessment.get("domain_averages", {})
            domain_score = float(
                domain_averages.get(required_domain, 0) or 0
            )
            overall_score = float(
                assessment.get("overall_score", 0) or 0
            )

            distance_score = max(
                0, 100 - (distance / radius) * 100
            )

            recommendation_score = (
                domain_score * 0.3
                + overall_score * 0.3
                + distance_score * 0.4
            )

            recommendations.append({
                "worker_id": str(worker["_id"]),
                "name": worker.get("name"),
                "skill": skill,
                "service": service_id,
                "required_domain": required_domain,
                "domain_score": round(domain_score, 2),
                "overall_score": round(overall_score, 2),
                "strongest_domain": assessment.get("strongest_domain"),
                "distance_km": distance,
                "recommendation_score": round(
                    recommendation_score, 2
                )
            })

        if recommendations:
            recommendations.sort(
                key=lambda worker: worker["recommendation_score"],
                reverse=True
            )

            return {
                "service": service_id,
                "skill": skill,
                "required_domain": required_domain,
                "search_radius_km": radius,
                "count": len(recommendations),
                "recommendations": recommendations
            }

    return {
        "service": service_id,
        "skill": skill,
        "required_domain": required_domain,
        "search_radius_km": 30,
        "count": 0,
        "message": "No suitable workers found within 30 km",
        "recommendations": []
    }
