import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def generate_questions(skill, experience):
    prompt = f"""
You are an AI skill assessment system for blue-collar workers in India.

Skill: {skill}
Experience Level: {experience}

Generate exactly 5 practical questions.

IMPORTANT LANGUAGE REQUIREMENT:
Questions MUST be in conversational spoken Tamil.

Do NOT use formal/literary Tamil.

Use the kind of Tamil people normally speak in daily life.

It is completely okay and preferred to mix Tamil with common English
technical words such as:
pipe, leak, wire, current, voltage, motor, switch, gas, pressure,
AC, cooling, tools, machine, safety, etc.

Example style:
"Pipe-la leak வந்திருச்சுன்னா, அதை எப்படி சரி பண்ணுவீங்க?"

"Current போயிடுச்சுன்னா, முதல்ல என்ன check பண்ணுவீங்க?"

"AC cooling சரியா இல்லன்னா, என்னென்ன check பண்ணுவீங்க?"

Questions should be easy for a practical worker to understand.

The worker should be able to answer naturally by speaking in Tamil.

For every question provide:

1. question
2. expected_answer
3. key_concepts

The expected_answer should also be written in conversational Tamil
with common English technical words.
Return ONLY valid JSON:

[
    {{
        "question": "...",
        "expected_answer": "...",
        "key_concepts": ["...", "...", "..."]
    }}
]
"""
    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    text = response.text.strip()
    return json.loads(text)