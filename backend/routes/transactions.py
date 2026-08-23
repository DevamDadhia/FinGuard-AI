# ============================================================
# FinGuard AI
# Transaction APIs
# ============================================================

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Transaction


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


# ------------------------------------------------------------
# Get All Transactions
# ------------------------------------------------------------

@router.get("")
def get_transactions(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.created_at.desc())
        .all()
    )

    return [
        {
            "transaction_id": txn.transaction_id,
            "amount": txn.amount,
            "prediction": txn.prediction,
            "fraud_probability": txn.fraud_probability,
            "anomaly_score": txn.anomaly_score,
            "risk_score": txn.risk_score,
            "risk_level": txn.risk_level,
            "explanation": (
                json.loads(txn.explanation)
                if txn.explanation
                else []
            ),
            "model_version": txn.model_version,
            "created_at": txn.created_at
        }
        for txn in transactions
    ]


# ------------------------------------------------------------
# Get Single Transaction
# ------------------------------------------------------------

@router.get("/{transaction_id}")
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.transaction_id == transaction_id
        )
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return {
        "transaction_id": transaction.transaction_id,
        "amount": transaction.amount,
        "prediction": transaction.prediction,
        "fraud_probability": transaction.fraud_probability,
        "anomaly_score": transaction.anomaly_score,
        "risk_score": transaction.risk_score,
        "risk_level": transaction.risk_level,
        "explanation": (
            json.loads(transaction.explanation)
            if transaction.explanation
            else []
        ),
        "model_version": transaction.model_version,
        "created_at": transaction.created_at
    }