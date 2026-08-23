# ============================================================
# FinGuard AI
# Database Models
# ============================================================

from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text
)

from database.database import Base


class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    transaction_id = Column(
        String,
        unique=True,
        index=True
    )

    amount = Column(
        Float,
        nullable=False
    )

    prediction = Column(
        String,
        nullable=False
    )

    fraud_probability = Column(
        Float,
        nullable=False
    )

    anomaly_score = Column(
        Float,
        nullable=False
    )

    risk_score = Column(
        Float,
        nullable=False
    )

    risk_level = Column(
        String,
        nullable=False
    )

    explanation = Column(
        Text,
        nullable=True
    )

    model_version = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )