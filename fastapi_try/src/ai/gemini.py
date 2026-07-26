# pyrefly: ignore [missing-import]
from google import genai
import os
import time
from typing import List, Optional, Any
from dotenv import load_dotenv
load_dotenv()


API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)


def generate_response(system_prompt: str, user_message: str, history: Optional[List[Any]] = None) -> str:
    prompt_parts = [system_prompt]

    if history:
        prompt_parts.append("\nPrevious Conversation History:")
        for msg in history:
            role_label = "Farmer" if getattr(msg, "role", None) == "user" else "Krishi AI"
            text = getattr(msg, "text", None)
            if text:
                prompt_parts.append(f"{role_label}: {text}")

    prompt_parts.append(f"\nFarmer: {user_message}\nKrishi AI:")
    full_prompt = "\n".join(prompt_parts)

    print("Sending request to Gemini with history context...")
    start = time.time()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt
    )

    end = time.time()
    print(f"Gemini took {end - start:.2f} seconds")

    return response.text