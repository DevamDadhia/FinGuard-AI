# ============================================================
# FinGuard AI
# Transaction API Schemas
# ============================================================

from pydantic import BaseModel, Field


# ============================================================
# Transaction Request
# ============================================================

class TransactionRequest(BaseModel):
    """
    Frontend-friendly transaction input.

    These are the fields the Streamlit/Antigravity frontend
    will send to the FastAPI backend.
    """

    amount: float = Field(
        ...,
        ge=0,
        description="Transaction amount"
    )

    transaction_type: str | None = Field(
        default=None,
        description="Transaction/product type"
    )

    location: str | None = Field(
        default=None,
        description="Transaction location"
    )

    device_change: int = Field(
        default=0,
        ge=0,
        le=1,
        description="Whether a new device was detected"
    )

    transactions_last_24h: int = Field(
        default=0,
        ge=0,
        description="Number of transactions in the last 24 hours"
    )

    card_type: str | None = Field(
        default=None,
        description="Card type"
    )

    email_domain: str | None = Field(
        default=None,
        description="Customer email domain"
    )

    distance_from_previous: float | None = Field(
        default=None,
        ge=0,
        description="Distance from previous transaction"
    )


# ============================================================
# SHAP Explanation
# ============================================================

class ExplanationItem(BaseModel):
    """
    Single feature contribution returned by SHAP.
    """

    feature: str
    value: str
    impact: float
    direction: str


# ============================================================
# Transaction Response
# ============================================================

class TransactionResponse(BaseModel):
    """
    Complete FinGuard prediction response.
    """

    transaction_id: str

    prediction: str

    fraud_probability: float = Field(
        ...,
        ge=0,
        le=1
    )

    anomaly_score: float = Field(
        ...,
        ge=0,
        le=1
    )

    risk_score: float = Field(
        ...,
        ge=0,
        le=100
    )

    risk_level: str

    model_version: str

    explanation: list[ExplanationItem]