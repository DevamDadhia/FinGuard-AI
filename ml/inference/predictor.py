# ============================================================
# FinGuard AI
# Production Prediction Engine
# ============================================================

from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb


# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_DIR = BASE_DIR / "ml" / "models"
ARTIFACT_DIR = BASE_DIR / "ml" / "artifacts"


# ============================================================
# Load Models
# ============================================================

fraud_model = xgb.XGBClassifier()

fraud_model.load_model(
    str(MODEL_DIR / "fraud_model.json")
)

anomaly_model = joblib.load(
    MODEL_DIR / "anomaly_model.pkl"
)


# ============================================================
# Load Configuration
# ============================================================

with open(
    ARTIFACT_DIR / "feature_config.json",
    "r",
    encoding="utf-8"
) as f:
    FEATURE_CONFIG = json.load(f)

with open(
    ARTIFACT_DIR / "anomaly_config.json",
    "r",
    encoding="utf-8"
) as f:
    ANOMALY_CONFIG = json.load(f)

with open(
    ARTIFACT_DIR / "risk_config.json",
    "r",
    encoding="utf-8"
) as f:
    RISK_CONFIG = json.load(f)


# ============================================================
# Feature Configuration
# ============================================================

ALL_FEATURES = FEATURE_CONFIG["all_features"]

NUMERIC_FEATURES = FEATURE_CONFIG["numeric_features"]

CATEGORICAL_FEATURES = FEATURE_CONFIG["categorical_features"]

ANOMALY_FEATURES = ANOMALY_CONFIG["features"]

ANOMALY_MEDIANS = ANOMALY_CONFIG["medians"]

SCORE_MIN = ANOMALY_CONFIG["score_min"]
SCORE_MAX = ANOMALY_CONFIG["score_max"]

FRAUD_THRESHOLD = RISK_CONFIG.get(
    "fraud_threshold",
    0.80
)

FRAUD_WEIGHT = RISK_CONFIG.get(
    "fraud_probability_weight",
    0.75
)

ANOMALY_WEIGHT = RISK_CONFIG.get(
    "anomaly_score_weight",
    0.25
)

RISK_THRESHOLDS = RISK_CONFIG.get(
    "thresholds",
    {
        "critical": 80,
        "high": 60,
        "medium": 30
    }
)


# ============================================================
# Frontend → IEEE-CIS Feature Mapping
# ============================================================

def map_frontend_fields(transaction: dict) -> dict:
    """
    Convert the simplified FinGuard frontend schema
    into fields understood by the trained IEEE-CIS model.

    Important:
    Only fields with a meaningful correspondence to the
    training dataset are mapped here.
    """

    mapped = {}

    # --------------------------------------------------------
    # Transaction amount
    # --------------------------------------------------------

    if "amount" in transaction:
        mapped["TransactionAmt"] = transaction["amount"]

    # --------------------------------------------------------
    # Transaction type → ProductCD
    # --------------------------------------------------------

    if transaction.get("transaction_type"):
        mapped["ProductCD"] = transaction[
            "transaction_type"
        ]

    # --------------------------------------------------------
    # Card type → card4
    # --------------------------------------------------------

    if transaction.get("card_type"):
        mapped["card4"] = transaction[
            "card_type"
        ]

    # --------------------------------------------------------
    # Email domain
    # --------------------------------------------------------

    if transaction.get("email_domain"):
        mapped["P_emaildomain"] = transaction[
            "email_domain"
        ]

        mapped["R_emaildomain"] = transaction[
            "email_domain"
        ]

    # --------------------------------------------------------
    # Distance from previous transaction → dist1
    # --------------------------------------------------------

    if transaction.get(
        "distance_from_previous"
    ) is not None:

        mapped["dist1"] = transaction[
            "distance_from_previous"
        ]

    # --------------------------------------------------------
    # Optional raw IEEE-CIS fields
    #
    # These allow future frontend/API expansion without
    # changing the prediction engine.
    # --------------------------------------------------------

    passthrough_fields = [
        "TransactionDT",
        "card1",
        "card2",
        "card3",
        "card5",
        "card6",
        "addr1",
        "addr2",
        "dist2",
        "P_emaildomain",
        "R_emaildomain",
        "C1",
        "C2",
        "C3",
        "C4",
        "C5",
        "C6",
        "C7",
        "C8",
        "C9",
        "C10",
        "C11",
        "C12",
        "C13",
        "C14",
        "D1",
        "D2",
        "D3",
        "D4",
        "D5",
        "D6",
        "D7",
        "D8",
        "D9",
        "D10",
        "D11",
        "D12",
        "D13",
        "D14",
        "D15",
        "M1",
        "M2",
        "M3",
        "M4",
        "M5",
        "M6",
        "M7",
        "M8",
        "M9",
        "DeviceType",
        "DeviceInfo"
    ]

    for field in passthrough_fields:

        if field in transaction:
            mapped[field] = transaction[field]

    return mapped


# ============================================================
# Prepare Model Features
# ============================================================

def prepare_features(transaction: dict) -> pd.DataFrame:
    """
    Convert frontend transaction data into the exact
    feature structure expected by the trained model.
    """

    # --------------------------------------------------------
    # Convert frontend fields
    # --------------------------------------------------------

    mapped_transaction = map_frontend_fields(
        transaction
    )

    df = pd.DataFrame(
        [mapped_transaction]
    )

    # --------------------------------------------------------
    # Add all model features
    # --------------------------------------------------------

    for feature in ALL_FEATURES:

        if feature not in df.columns:
            df[feature] = np.nan

    # --------------------------------------------------------
    # Exact training feature order
    # --------------------------------------------------------

    df = df[
        ALL_FEATURES
    ].copy()

    # --------------------------------------------------------
    # Transaction time features
    # --------------------------------------------------------

    if "TransactionDT" in df.columns:

        transaction_dt = pd.to_numeric(
            df["TransactionDT"],
            errors="coerce"
        )

        df["transaction_day"] = (
            transaction_dt /
            (24 * 60 * 60)
        ).astype(float)

        df["transaction_hour"] = (
            (
                transaction_dt %
                (24 * 60 * 60)
            ) / 3600
        ).astype(float)

    # --------------------------------------------------------
    # Transaction amount features
    # --------------------------------------------------------

    if "TransactionAmt" in df.columns:

        amount = pd.to_numeric(
            df["TransactionAmt"],
            errors="coerce"
        )

        df["amount_log"] = np.log1p(
            amount.clip(lower=0)
        )

        # amount_zscore was created during training.
        # The training mean/std weren't exported, so don't
        # fabricate a value here.
        if "amount_zscore" not in transaction:
            df["amount_zscore"] = np.nan

    # --------------------------------------------------------
    # Numeric conversion
    # --------------------------------------------------------

    for feature in NUMERIC_FEATURES:

        if feature in df.columns:

            df[feature] = pd.to_numeric(
                df[feature],
                errors="coerce"
            )

    # --------------------------------------------------------
    # Categorical conversion
    # --------------------------------------------------------

    for feature in CATEGORICAL_FEATURES:

        if feature in df.columns:

            df[feature] = (
                df[feature]
                .fillna("Unknown")
                .astype(str)
                .astype("category")
            )

    return df


# ============================================================
# Anomaly Score
# ============================================================

def calculate_anomaly_score(
    df: pd.DataFrame
) -> float:

    anomaly_input = df[
        ANOMALY_FEATURES
    ].copy()

    for feature in ANOMALY_FEATURES:

        if feature in ANOMALY_MEDIANS:

            anomaly_input[feature] = (
                pd.to_numeric(
                    anomaly_input[feature],
                    errors="coerce"
                )
                .fillna(
                    ANOMALY_MEDIANS[feature]
                )
            )

    raw_score = float(
        anomaly_model.decision_function(
            anomaly_input
        )[0]
    )

    anomaly_score = (
        -raw_score - SCORE_MIN
    ) / (
        SCORE_MAX -
        SCORE_MIN +
        1e-8
    )

    return float(
        np.clip(
            anomaly_score,
            0,
            1
        )
    )


# ============================================================
# Risk Classification
# ============================================================

def classify_risk(
    risk_score: float
) -> str:

    if risk_score >= RISK_THRESHOLDS["critical"]:
        return "CRITICAL"

    if risk_score >= RISK_THRESHOLDS["high"]:
        return "HIGH"

    if risk_score >= RISK_THRESHOLDS["medium"]:
        return "MEDIUM"

    return "LOW"


# ============================================================
# Main Prediction Function
# ============================================================

def predict_transaction(
    transaction: dict
) -> dict:

    # --------------------------------------------------------
    # Prepare features
    # --------------------------------------------------------

    features = prepare_features(
        transaction
    )

    # --------------------------------------------------------
    # Fraud probability
    # --------------------------------------------------------

    fraud_probability = float(
        fraud_model.predict_proba(
            features
        )[0][1]
    )

    # --------------------------------------------------------
    # Fraud classification
    # --------------------------------------------------------

    prediction = (
        fraud_probability >=
        FRAUD_THRESHOLD
    )

    # --------------------------------------------------------
    # Anomaly detection
    # --------------------------------------------------------

    anomaly_score = (
        calculate_anomaly_score(
            features
        )
    )

    # --------------------------------------------------------
    # Combined risk score
    # --------------------------------------------------------

    risk_score = (
        (
            FRAUD_WEIGHT *
            fraud_probability
        )
        +
        (
            ANOMALY_WEIGHT *
            anomaly_score
        )
    ) * 100

    risk_score = float(
        np.clip(
            risk_score,
            0,
            100
        )
    )

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    risk_level = classify_risk(
        risk_score
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "prediction": (
            "Fraud"
            if prediction
            else "Legitimate"
        ),
        "fraud_probability": round(
            fraud_probability,
            4
        ),
        "anomaly_score": round(
            anomaly_score,
            4
        ),
        "risk_score": round(
            risk_score,
            2
        ),
        "risk_level": risk_level,
        "model_version": RISK_CONFIG.get(
            "model_version",
            "finguard-xgb-v1"
        )
    }