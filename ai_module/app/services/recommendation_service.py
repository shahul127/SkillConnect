import math
from bson import ObjectId
from app.database.mongo import users, assessments

SERVICE_INFO = {

    "AC Repair": {
        "skill": "AC Technician",
        "domain": "Troubleshooting & Diagnostics"
    },
    "AC Electrical Problem": {
        "skill": "AC Technician",
        "domain": "Electrical & Controls"
    },
    "Gas Charging": {
        "skill": "AC Technician",
        "domain": "Refrigeration & Gas Service"
    },
    "AC Maintenance": {
        "skill": "AC Technician",
        "domain": "Maintenance & Servicing"
    },
    "AC Installation": {
        "skill": "AC Technician",
        "domain": "Installation & Uninstallation"
    },
    "AC Safety Inspection": {
        "skill": "AC Technician",
        "domain": "Safety Practices"
    },

    "House Wiring": {
        "skill": "Electrician",
        "domain": "Wiring & Conduiting"
    },
    "Electrical Fault Repair": {
        "skill": "Electrician",
        "domain": "Fault Diagnosis & Repair"
    },
    "Electrical Distribution Work": {
        "skill": "Electrician",
        "domain": "Distribution & Protection"
    },
    "Appliance Installation": {
        "skill": "Electrician",
        "domain": "Appliance & Fixture Mounting"
    },
    "Three Phase Electrical Work": {
        "skill": "Electrician",
        "domain": "Three-Phase Systems"
    },
    "Electrical Safety Inspection": {
        "skill": "Electrician",
        "domain": "Electrical Safety"
    },

    "Pipe Installation": {
        "skill": "Plumber",
        "domain": "Piping & Materials"
    },
    "Pipe Leakage Repair": {
        "skill": "Plumber",
        "domain": "Leakage & Diagnostics"
    },
    "Bathroom Fitting": {
        "skill": "Plumber",
        "domain": "Sanitary & Fixture Fitting"
    },
    "Water Supply & Drainage": {
        "skill": "Plumber",
        "domain": "Water Supply & Drainage"
    },
    "Water Pump Repair": {
        "skill": "Plumber",
        "domain": "Pumping Systems"
    },
    "Plumbing Safety & Hygiene": {
        "skill": "Plumber",
        "domain": "Safety & Hygiene"
    },

    "Furniture Measurement & Layout": {
        "skill": "Carpenter",
        "domain": "Measurement & Layout"
    },
    "Wood Cutting & Preparation": {
        "skill": "Carpenter",
        "domain": "Cutting & Surface Preparation"
    },
    "Door & Hardware Fitting": {
        "skill": "Carpenter",
        "domain": "Hardware & Door Fittings"
    },
    "Modular Furniture Work": {
        "skill": "Carpenter",
        "domain": "Modular & Custom Joinery"
    },
    "Furniture Repair": {
        "skill": "Carpenter",
        "domain": "Furniture Repair & Refit"
    },
    "Carpentry Tool & Safety Work": {
        "skill": "Carpenter",
        "domain": "Tool & Site Safety"
    }
}


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a),math.sqrt(1 - a))
    return round(R * c, 2)


def get_recommendations(service, latitude, longitude):
    service_info = SERVICE_INFO.get(service)
    if not service_info:
        return {
            "message": "Service not supported",
            "recommendations": []
        }
    skill = service_info["skill"]
    required_domain = service_info["domain"]
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
                    "_id": ObjectId(user_id),
                    "role": "worker"
                })
            except Exception:
                continue

            if not worker:
                continue

            if ("latitude" not in worker or "longitude" not in worker):
                continue

            distance = calculate_distance(
                latitude,
                longitude,
                worker["latitude"],
                worker["longitude"])

            if distance > radius:
                continue

            domain_averages = assessment.get(
                "domain_averages",
                {})
            overall_score = assessment.get("overall_score",0)
            strongest_domain = assessment.get("strongest_domain")

            domain_score = domain_averages.get(required_domain,0)
            if domain_score == 0:
                continue

            distance_score = max(0, 100 - (distance / radius) * 100)
            recommendation_score = (
            domain_score * 0.3
            + overall_score * 0.3
            + distance_score * 0.4
            )
            recommendations.append({
                "worker_id": str(worker["_id"]),
                "name": worker.get("name"),
                "skill": skill,
                "service": service,
                "required_domain": required_domain,
                "domain_score": domain_score,
                "overall_score": overall_score,
                "strongest_domain": strongest_domain,
                "distance_km": distance,
                "recommendation_score":recommendation_score
            })

        if recommendations:

            recommendations.sort(key=lambda worker: worker["recommendation_score"],reverse=True)

            return {
                "service": service,
                "skill": skill,
                "required_domain": required_domain,
                "search_radius_km": radius,
                "count": len(recommendations),
                "recommendations": recommendations
            }

    return {
        "service": service,
        "skill": skill,
        "required_domain": required_domain,
        "message": "No suitable workers found",
        "recommendations": []
    }