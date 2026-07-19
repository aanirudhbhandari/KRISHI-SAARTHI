# pyrefly: ignore [missing-import]
from google import genai
import os
import time
from dotenv import load_dotenv
load_dotenv()

import time

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

def generate_response(system_prompt: str, user_message: str) -> str:

    full_prompt = f"""
{system_prompt}

User:
{user_message}
"""

    print("Sending request to Gemini...")
    start = time.time()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt
    )

    end = time.time()
    print(f"Gemini took {end - start:.2f} seconds")

    return response.text