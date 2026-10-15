import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)
SKILL_DATA = {

    "AC Technician": {

        "source": "NSDC Field Technician - AC",
        "source_code": "ELE/Q3102",

        "domains": {

            "Troubleshooting & Diagnostics":
                "Diagnose AC problems, identify symptoms and find possible causes.",

            "Electrical & Controls":
                "Check electrical supply, wiring, MCB, controls, sensors and PCB related issues.",

            "Refrigeration & Gas Service":
                "Understand refrigeration cycle, gas charging, pressure and cooling related problems.",

            "Maintenance & Servicing":
                "Perform cleaning, filter maintenance, servicing and routine maintenance.",

            "Installation & Uninstallation":
                "Install, remove and handle AC units safely and correctly.",

            "Safety Practices":
                "Follow electrical, refrigerant, tool and workplace safety procedures."
        }
    },


    "Electrician": {

        "source": "NSDC Electrician Domestic Solutions",
        "source_code": "PSS/Q6001",

        "domains": {

            "Wiring & Conduiting":
                "Perform domestic wiring, cable routing, conduiting and connections.",

            "Fault Diagnosis & Repair":
                "Identify electrical faults and repair domestic wiring problems.",

            "Distribution & Protection":
                "Understand distribution boards, MCBs, protection devices and circuits.",

            "Appliance & Fixture Mounting":
                "Install and connect domestic electrical appliances and fixtures.",

            "Three-Phase Systems":
                "Understand basic three-phase supply, connections and related safety.",

            "Electrical Safety":
                "Follow electrical safety, isolation, testing and safe working practices."
        }
    },


    "Plumber": {

        "source": "NSDC Plumber General / Indian Plumbing Skill Council",
        "source_code": "PSC/Q0104",

        "domains": {

            "Piping & Materials":
                "Work with different pipes, fittings, joints and plumbing materials.",

            "Leakage & Diagnostics":
                "Identify leaks, blockages and basic plumbing faults.",

            "Sanitary & Fixture Fitting":
                "Install and service taps, valves, bathroom and sanitary fixtures.",

            "Water Supply & Drainage":
                "Understand water supply lines, drainage and waste water systems.",

            "Pumping Systems":
                "Work with pumps and basic water pumping systems.",

            "Safety & Hygiene":
                "Follow plumbing workplace safety, hygiene and safe tool practices."
        }
    },


    "Carpenter": {

        "source": "NSDC Carpenter - Wooden Furniture",
        "source_code": "FFS/Q0102",

        "domains": {

            "Measurement & Layout":
                "Measure, mark and plan wood pieces before cutting or assembly.",

            "Cutting & Surface Preparation":
                "Cut, trim, smooth and prepare wooden parts.",

            "Hardware & Door Fittings":
                "Install hinges, handles, locks and other furniture hardware.",

            "Modular & Custom Joinery":
                "Assemble modular and custom wooden furniture using suitable joints.",

            "Furniture Repair & Refit":
                "Repair, adjust and refit damaged or loose furniture components.",

            "Tool & Site Safety":
                "Use carpentry tools and machines safely and maintain a safe workplace."
        }
    }
}


def generate_question_bank(skill):

    if skill not in SKILL_DATA:
        raise ValueError("Invalid skill")

    skill_data = SKILL_DATA[skill]
    domain_text = ""
    for domain, competency in skill_data["domains"].items():

        domain_text += f"""
Domain: {domain}
Competency: {competency}
"""
    prompt = f"""
You are creating a practical skill assessment question bank
for blue-collar workers in India.
Skill:
{skill}
Source competency:
{skill_data["source"]}
Source code:
{skill_data["source_code"]}
The following domains and competencies must be followed:
{domain_text}

Generate exactly 36 questions.

There must be:

6 domains
3 difficulty levels
2 questions for each level
Difficulty levels:
Basic
Intermediate
Advanced

Therefore:
6 domains × 3 levels × 2 questions = 36 questions.

IMPORTANT:

Questions must be practical and related to real work situations.

Questions must be in conversational Tamil/Tanglish.
Do NOT use formal literary Tamil.
Use common English technical words where natural.
The expected answer must also be conversational Tamil/Tanglish.
Do not make questions theoretical like a university exam.
The worker should be able to answer by speaking naturally.
Difficulty meaning:
Basic:
Simple practical knowledge and first-level checks.
Intermediate:
Requires troubleshooting steps, reasoning or multiple checks.
Advanced:
Requires deeper diagnosis, multiple possible causes,
technical reasoning or complex practical situations.
For every question return:
skill
domain
level
question
expected_answer
key_concepts
source
source_code
The questions must be original.
Do not copy text directly from the source material.
Return ONLY valid JSON.
Format:
[
    {{
        "skill": "...",
        "domain": "...",
        "level": "Basic",
        "question": "...",
        "expected_answer": "...",
        "key_concepts": ["...", "..."],
        "source": "...",
        "source_code": "..."
    }}
]
"""
    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )
    text = response.text.strip()
    return json.loads(text)