import os
import base64
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def speech_to_text(audio_bytes):
    audio_data = base64.b64encode(audio_bytes).decode("utf-8")
    response = client.interactions.create(
        model="gemini-3.5-transcribe",
        input=[
            {
                "type": "audio",
                "data": audio_data,
                "mime_type": "audio/webm"
            }
        ]
    )

    return response.output_text.strip()