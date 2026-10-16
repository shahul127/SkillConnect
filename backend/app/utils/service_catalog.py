SERVICE_CATEGORIES = [
    {"category_id": "plumber", "name": "Plumber", "skill": "Plumber"},
    {"category_id": "electrician", "name": "Electrician", "skill": "Electrician"},
    {"category_id": "ac-mechanic", "name": "AC Mechanic", "skill": "AC Technician"},
    {"category_id": "carpenter", "name": "Carpenter", "skill": "Carpenter"},
]

SERVICES = [
    {"service_id": "pipe-leak", "category_id": "plumber", "name": "Pipe Leakage Repair", "description": "Repair a leaking water pipe.", "price": 400, "problem_options": ["Small leak", "Major leak", "Leak near a joint", "Other"]},
    {"service_id": "tap-repair", "category_id": "plumber", "name": "Tap Repair or Replacement", "description": "Repair or replace a faulty tap.", "price": 300, "problem_options": ["Tap dripping", "Tap is loose", "Tap replacement needed", "Other"]},
    {"service_id": "pipe-install", "category_id": "plumber", "name": "Pipe Installation", "description": "Install or replace a water pipe.", "price": 700, "problem_options": ["New pipe installation", "Replace damaged pipe", "Extend existing pipe", "Other"]},
    {"service_id": "drain-block", "category_id": "plumber", "name": "Drain Blockage", "description": "Inspect and clear a blocked drain.", "price": 500, "problem_options": ["Slow drainage", "Completely blocked", "Bad smell", "Other"]},
    {"service_id": "wiring", "category_id": "electrician", "name": "Electrical Wiring", "description": "Small household wiring work.", "price": 800, "problem_options": ["New wiring", "Damaged wire", "Loose connection", "Other"]},
    {"service_id": "power-fault", "category_id": "electrician", "name": "Power Fault Repair", "description": "Inspect a household power fault.", "price": 500, "problem_options": ["No power", "Frequent tripping", "Sparking", "Other"]},
    {"service_id": "fan-install", "category_id": "electrician", "name": "Fan Installation", "description": "Install a ceiling or wall fan.", "price": 400, "problem_options": ["New fan installation", "Replace existing fan", "Fan wobbling", "Other"]},
    {"service_id": "switch-repair", "category_id": "electrician", "name": "Switch or Socket Repair", "description": "Repair or replace a switch or socket.", "price": 250, "problem_options": ["Switch not working", "Socket not working", "Loose switch or socket", "Other"]},
    {"service_id": "ac-service", "category_id": "ac-mechanic", "name": "AC General Service", "description": "Routine cleaning and maintenance.", "price": 600, "problem_options": ["Routine cleaning", "Low airflow", "Unusual noise", "Other"]},
    {"service_id": "ac-not-cooling", "category_id": "ac-mechanic", "name": "AC Not Cooling", "description": "Inspect an AC that is not cooling properly.", "price": 500, "problem_options": ["Not cooling", "Weak cooling", "Indoor unit problem", "Other"]},
    {"service_id": "ac-install", "category_id": "ac-mechanic", "name": "AC Installation", "description": "Install an air conditioner.", "price": 1500, "problem_options": ["New installation", "Relocation", "Split AC", "Other"]},
    {"service_id": "ac-water-leak", "category_id": "ac-mechanic", "name": "AC Water Leakage", "description": "Inspect and repair AC water leakage.", "price": 500, "problem_options": ["Water dripping indoors", "Drain pipe blockage", "Water near outdoor unit", "Other"]},
    {"service_id": "furniture-repair", "category_id": "carpenter", "name": "Furniture Repair", "description": "Repair common wooden furniture damage.", "price": 500, "problem_options": ["Broken furniture", "Loose joint", "Drawer problem", "Other"]},
    {"service_id": "door-repair", "category_id": "carpenter", "name": "Door Repair", "description": "Repair a door or its hinges.", "price": 400, "problem_options": ["Door not closing", "Hinge problem", "Door alignment", "Other"]},
    {"service_id": "shelf-install", "category_id": "carpenter", "name": "Shelf Installation", "description": "Install a wall shelf.", "price": 400, "problem_options": ["Install new shelf", "Shelf is loose", "Remove and refit", "Other"]},
    {"service_id": "bed-assembly", "category_id": "carpenter", "name": "Furniture Assembly", "description": "Assemble a bed, table, or similar item.", "price": 600, "problem_options": ["Bed assembly", "Table assembly", "Wardrobe assembly", "Other"]},
]


def get_service(service_id):
    return next((s for s in SERVICES if s["service_id"] == service_id), None)


def get_category(category_id):
    return next((c for c in SERVICE_CATEGORIES if c["category_id"] == category_id), None)
