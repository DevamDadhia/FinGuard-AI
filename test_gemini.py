# ============================================================
# FinGuard AI — Gemini API Connectivity Test
# ============================================================

import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai


# ------------------------------------------------------------
# Load .env
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(
    dotenv_path=ENV_PATH
)


# ------------------------------------------------------------
# API Key
# ------------------------------------------------------------

api_key = os.getenv(
    "GEMINI_API_KEY"
)

print("Project root :", BASE_DIR)
print(".env exists  :", ENV_PATH.exists())
print("Key loaded   :", bool(api_key))


if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY not found in .env"
    )


# ------------------------------------------------------------
# Gemini Client
# ------------------------------------------------------------

client = genai.Client(
    api_key=api_key
)


# ------------------------------------------------------------
# Test
# ------------------------------------------------------------

response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=(
        "Reply with exactly: "
        "FinGuard Gemini Connected"
    )
)


print("=" * 50)
print("Gemini API Test")
print("=" * 50)

print(response.text)