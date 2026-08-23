# ============================================================
# FinGuard AI
# Analytics API
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.database import get_db
from database.models import Transaction


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("")
def get_analytics(
    db: Session = Depends(get_db)
):
    total_transactions = (
        db.query(Transaction)
        .count()
    )

    fraud_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.prediction == "Fraud"
        )
        .count()
    )

    high_risk_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.risk_level.in_(
                ["HIGH", "CRITICAL"]
            )
        )
        .count()
    )

    average_risk_score = (
        db.query(
            func.avg(Transaction.risk_score)
        )
        .scalar()
    )

    fraud_rate = (
        (fraud_transactions / total_transactions) * 100
        if total_transactions > 0
        else 0
    )

    return {
        "total_transactions": total_transactions,
        "fraud_transactions": fraud_transactions,
        "high_risk_transactions": high_risk_transactions,
        "fraud_rate": round(fraud_rate, 2),
        "average_risk_score": round(
            float(average_risk_score or 0),
            2
        )
    }