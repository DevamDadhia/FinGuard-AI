# ============================================================
# FinGuard AI
# Gemini Fraud Analyst Assistant
# ============================================================

import json
import os

from dotenv import load_dotenv
from google import genai

from database.database import SessionLocal
from database.models import Transaction


# ============================================================
# Environment
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured."
    )


# ============================================================
# Gemini Client
# ============================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)

GEMINI_MODEL = "gemini-3.6-flash"


# ============================================================
# Retrieve FinGuard Context
# ============================================================

def get_financial_context(
    transaction_id: str | None = None
) -> dict:

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Specific transaction
        # ----------------------------------------------------

        if transaction_id:

            transaction = (
                db.query(Transaction)
                .filter(
                    Transaction.transaction_id
                    == transaction_id
                )
                .first()
            )

            if transaction is None:
                return {
                    "transaction": None
                }

            return {
                "transaction": {
                    "transaction_id":
                        transaction.transaction_id,

                    "amount":
                        transaction.amount,

                    "prediction":
                        transaction.prediction,

                    "fraud_probability":
                        transaction.fraud_probability,

                    "anomaly_score":
                        transaction.anomaly_score,

                    "risk_score":
                        transaction.risk_score,

                    "risk_level":
                        transaction.risk_level,

                    "explanation":
                        json.loads(
                            transaction.explanation
                        )
                        if transaction.explanation
                        else [],

                    "model_version":
                        transaction.model_version,

                    "created_at":
                        str(transaction.created_at)
                }
            }

        # ----------------------------------------------------
        # Recent transactions
        # ----------------------------------------------------

        transactions = (
            db.query(Transaction)
            .order_by(
                Transaction.created_at.desc()
            )
            .limit(20)
            .all()
        )

        recent_transactions = []

        for txn in transactions:

            recent_transactions.append({
                "transaction_id":
                    txn.transaction_id,

                "amount":
                    txn.amount,

                "prediction":
                    txn.prediction,

                "fraud_probability":
                    txn.fraud_probability,

                "anomaly_score":
                    txn.anomaly_score,

                "risk_score":
                    txn.risk_score,

                "risk_level":
                    txn.risk_level,

                "created_at":
                    str(txn.created_at)
            })

        return {
            "recent_transactions":
                recent_transactions
        }

    finally:
        db.close()


# ============================================================
# System Prompt
# ============================================================

SYSTEM_PROMPT = """
You are FinGuard AI, an AI-powered financial fraud analyst
assistant.

Your job is to explain and summarize information produced
by the FinGuard fraud detection system.

RULES:

1. Use ONLY the FinGuard context provided to you.
2. Never invent transactions, statistics, risk scores,
   probabilities, or explanations.
3. Never replace or override the ML model's prediction.
4. Treat XGBoost prediction, anomaly score, risk score,
   risk level, and SHAP explanations as the source of truth.
5. Explain technical information in simple language.
6. Give practical investigation guidance when useful.
7. If the supplied context is insufficient, explicitly say
   that the available FinGuard data is insufficient.
8. Never claim that a transaction is definitely fraudulent
   unless the backend prediction itself says Fraud.
9. Keep answers concise and professional.
"""


# ============================================================
# Assistant
# ============================================================

def ask_assistant(
    question: str,
    transaction_id: str | None = None
) -> dict:

    context = get_financial_context(
        transaction_id
    )

    context_json = json.dumps(
        context,
        indent=2,
        default=str
    )

    prompt = f"""
{SYSTEM_PROMPT}

FIN GUARD DATA:

{context_json}

USER QUESTION:

{question}

Answer as a fraud analyst assistant.
Use only the supplied FinGuard data.
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    answer = (
        response.text.strip()
        if response.text
        else "Unable to generate a response."
    )

    return {
        "answer": answer,
        "transaction_id": transaction_id,
        "model": GEMINI_MODEL,
        "success": True
    }