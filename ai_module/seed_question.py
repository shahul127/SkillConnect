from app.database.mongo import questions
sample_questions = [
    {
        "skill": "AC Technician",
        "domain": "Troubleshooting & Diagnostics",
        "level": "Basic",
        "question": "AC cooling kammi ah irundha first enna check pannuvinga?",
        "expected_answer": "Filter, airflow and basic cooling condition check pannanum.",
        "key_concepts": ["filter", "airflow", "cooling"]
    },
    {
        "skill": "AC Technician",
        "domain": "Troubleshooting & Diagnostics",
        "level": "Basic",
        "question": "AC water leak aagudhu na first enna check pannuvinga?",
        "expected_answer": "Drain pipe and drain blockage check pannanum.",
        "key_concepts": ["drain", "pipe", "blockage"]
    },

    {
        "skill": "AC Technician",
        "domain": "Electrical & Controls",
        "level": "Basic",
        "question": "AC start aagala na electrical side la first enna check pannuvinga?",
        "expected_answer": "Power supply, MCB and wiring check pannanum.",
        "key_concepts": ["power supply", "MCB", "wiring"]
    },
    {
        "skill": "AC Technician",
        "domain": "Electrical & Controls",
        "level": "Basic",
        "question": "AC service pannumbothu voltage check panna enna use pannuvinga?",
        "expected_answer": "Multimeter use panni voltage check pannuven.",
        "key_concepts": ["multimeter", "voltage"]
    },

    {
        "skill": "AC Technician",
        "domain": "Refrigeration & Gas Service",
        "level": "Basic",
        "question": "AC gas kammi irukku nu eppadi identify pannuvinga?",
        "expected_answer": "Cooling performance and pressure readings check panni identify pannuven.",
        "key_concepts": ["cooling", "pressure"]
    },
    {
        "skill": "AC Technician",
        "domain": "Refrigeration & Gas Service",
        "level": "Basic",
        "question": "Gas charging panna munnaadi enna check pannanum?",
        "expected_answer": "Leak irukka nu check panni system condition verify pannanum.",
        "key_concepts": ["leak", "gas charging"]
    },

    {
        "skill": "AC Technician",
        "domain": "Maintenance & Servicing",
        "level": "Basic",
        "question": "AC filter dirty ah irundha enna problem varum?",
        "expected_answer": "Airflow and cooling reduce aagalam.",
        "key_concepts": ["filter", "airflow", "cooling"]
    },
    {
        "skill": "AC Technician",
        "domain": "Maintenance & Servicing",
        "level": "Basic",
        "question": "AC service pannumbothu filter ah enna pannuvinga?",
        "expected_answer": "Filter remove panni clean panni dry pannitu fit pannuven.",
        "key_concepts": ["filter", "clean", "dry"]
    },

    {
        "skill": "AC Technician",
        "domain": "Installation & Uninstallation",
        "level": "Basic",
        "question": "New AC install pannumbothu indoor unit enga position panna choose pannuvinga?",
        "expected_answer": "Proper airflow and suitable wall position consider pannanum.",
        "key_concepts": ["airflow", "wall", "position"]
    },
    {
        "skill": "AC Technician",
        "domain": "Installation & Uninstallation",
        "level": "Basic",
        "question": "AC installation la copper pipe edhuku use pannuvanga?",
        "expected_answer": "Indoor and outdoor unit refrigerant connection ku copper pipe use pannuvanga.",
        "key_concepts": ["copper pipe", "refrigerant", "connection"]
    },

    {
        "skill": "AC Technician",
        "domain": "Safety Practices",
        "level": "Basic",
        "question": "AC service start panna munnaadi first enna safety step edukkanum?",
        "expected_answer": "Power supply off panni electrical safety ensure pannanum.",
        "key_concepts": ["power", "off", "electrical safety"]
    },
    {
        "skill": "AC Technician",
        "domain": "Safety Practices",
        "level": "Basic",
        "question": "Outdoor unit service pannumbothu enna safety precautions follow pannanum?",
        "expected_answer": "Proper ladder and safety equipment use pannanum.",
        "key_concepts": ["ladder", "safety equipment"]
    }
]


if __name__ == "__main__":
    result = questions.insert_many(sample_questions)

    print("Inserted questions:", len(result.inserted_ids))