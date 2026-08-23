# ============================================================
# FinGuard AI
# Prediction API
# ============================================================

import json
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.schemas.transaction import (
    TransactionRequest,
    TransactionResponse
)

from backend.services.fraud_service import (
    analyze_transaction
)

from database.database import get_db
from database.models import Transaction


router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)


@router.post(
    "",
    response_model=TransactionResponse
)
def predict(
    transaction: TransactionRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze and store a financial transaction.
    """

    transaction_data = transaction.model_dump()

    result = analyze_transaction(
        transaction_data
    )

    transaction_id = (
        f"TXN-{uuid.uuid4().hex[:10].upper()}"
    )

    record = Transaction(
        transaction_id=transaction_id,
        amount=float(
            transaction_data.get(
                "TransactionAmt",
                0
            )
        ),
        prediction=result["prediction"],
        fraud_probability=result["fraud_probability"],
        anomaly_score=result["anomaly_score"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        explanation=json.dumps(
            result["explanation"]
        ),
        model_version=result["model_version"]
    )

    db.add(record)
    db.commit()

    return {
        **result,
        "transaction_id": transaction_id
    }