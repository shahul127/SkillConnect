# Service categories and services for SkillConnect

SERVICE_CATEGORIES = [
    {
        "category_id": "plumbing",
        "name": "Plumbing",
        "skill": "plumber",
    },
    {
        "category_id": "electrical",
        "name": "Electrical",
        "skill": "electrician",
    },
    {
        "category_id": "carpentry",
        "name": "Carpentry",
        "skill": "carpenter",
    },
    {
        "category_id": "cleaning",
        "name": "Cleaning",
        "skill": "cleaner",
    },
    {
        "category_id": "painting",
        "name": "Painting",
        "skill": "painter",
    },
]


SERVICES = [
    {
        "service_id": "plumbing_basic",
        "category_id": "plumbing",
        "name": "Basic Plumbing",
        "price": 500,
    },
    {
        "service_id": "electrical_basic",
        "category_id": "electrical",
        "name": "Basic Electrical Repair",
        "price": 600,
    },
    {
        "service_id": "carpentry_basic",
        "category_id": "carpentry",
        "name": "Basic Carpentry",
        "price": 700,
    },
    {
        "service_id": "cleaning_basic",
        "category_id": "cleaning",
        "name": "Basic Home Cleaning",
        "price": 800,
    },
    {
        "service_id": "painting_basic",
        "category_id": "painting",
        "name": "Basic Painting",
        "price": 1000,
    },
]


def get_service(service_id: str):
    """Return a service matching its ID, or None if not found."""
    return next(
        (
            service
            for service in SERVICES
            if service["service_id"] == service_id
        ),
        None,
    )
