# ============================================================
# FinGuard AI
# Fraud Alerts API
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Transaction


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("")
def get_alerts(
    db: Session = Depends(get_db)
):
    alerts = (
        db.query(Transaction)
        .filter(
            Transaction.risk_level.in_(
                ["HIGH", "CRITICAL"]
            )
        )
        .order_by(
            Transaction.risk_score.desc()
        )
        .all()
    )

    return [
        {
            "transaction_id": txn.transaction_id,
            "amount": txn.amount,
            "prediction": txn.prediction,
            "fraud_probability": txn.fraud_probability,
            "risk_score": txn.risk_score,
            "risk_level": txn.risk_level,
            "created_at": txn.created_at
        }
        for txn in alerts
    ]