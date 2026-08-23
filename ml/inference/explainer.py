# ============================================================
# FinGuard AI
# Explainable AI Engine
# ============================================================

from pathlib import Path

import numpy as np
import pandas as pd
import shap
import xgboost as xgb


# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_DIR = BASE_DIR / "ml" / "models"


# ============================================================
# Load Model
# ============================================================

fraud_model = xgb.XGBClassifier()

fraud_model.load_model(
    str(MODEL_DIR / "fraud_model.json")
)


# ============================================================
# SHAP Explainer
# ============================================================

explainer = shap.TreeExplainer(
    fraud_model
)


# ============================================================
# User-Friendly Feature Names
# ============================================================

FEATURE_LABELS = {
    "TransactionAmt": "Transaction Amount",
    "TransactionDT": "Transaction Time",
    "ProductCD": "Transaction Type",

    "card1": "Card Identifier",
    "card2": "Card Attribute",
    "card3": "Card Attribute",
    "card4": "Card Type",
    "card5": "Card Attribute",
    "card6": "Card Category",

    "addr1": "Billing Address",
    "addr2": "Billing Region",

    "dist1": "Distance from Previous Transaction",
    "dist2": "Secondary Distance Indicator",

    "P_emaildomain": "Customer Email Domain",
    "R_emaildomain": "Recipient Email Domain",

    "transaction_day": "Transaction Day",
    "transaction_hour": "Transaction Hour",

    "amount_log": "Transaction Amount Pattern",
    "amount_zscore": "Transaction Amount Deviation",

    "DeviceType": "Device Type",
    "DeviceInfo": "Device Information",

    # C-series behavioral features
    "C1": "Transaction Frequency",
    "C2": "Transaction Frequency Pattern",
    "C3": "Card Activity Pattern",
    "C4": "Transaction Activity",
    "C5": "Transaction Activity",
    "C6": "Transaction Activity",
    "C7": "Transaction Activity",
    "C8": "Transaction Activity",
    "C9": "Transaction Activity",
    "C10": "Transaction Activity",
    "C11": "Transaction Activity",
    "C12": "Transaction Activity",
    "C13": "Transaction Activity",
    "C14": "Transaction Activity",

    # D-series behavioral features
    "D1": "Time Since Previous Activity",
    "D2": "Transaction Timing Pattern",
    "D3": "Transaction Timing Pattern",
    "D4": "Transaction Timing Pattern",
    "D5": "Transaction Timing Pattern",
    "D6": "Transaction Timing Pattern",
    "D7": "Transaction Timing Pattern",
    "D8": "Transaction Timing Pattern",
    "D9": "Transaction Timing Pattern",
    "D10": "Transaction Timing Pattern",
    "D11": "Transaction Timing Pattern",
    "D12": "Transaction Timing Pattern",
    "D13": "Transaction Timing Pattern",
    "D14": "Transaction Timing Pattern",
    "D15": "Transaction Timing Pattern",
}


# ============================================================
# Internal / Unavailable Features
# ============================================================

HIDDEN_FEATURE_PREFIXES = (
    "id_",
)


# ============================================================
# Explanation Function
# ============================================================

def explain_transaction(
    transaction: pd.DataFrame,
    top_n: int = 5
) -> list:
    """
    Generate clean, business-friendly SHAP explanations.
    """

    shap_values = explainer.shap_values(
        transaction
    )

    if isinstance(shap_values, list):
        shap_values = shap_values[-1]

    shap_values = np.asarray(
        shap_values
    )

    if shap_values.ndim == 2:
        shap_values = shap_values[0]

    explanation = pd.DataFrame({
        "feature": transaction.columns,
        "value": transaction.iloc[0].values,
        "shap_value": shap_values
    })

    # --------------------------------------------------------
    # Remove unavailable values
    # --------------------------------------------------------

    explanation = explanation[
        explanation["value"].notna()
    ].copy()

    # --------------------------------------------------------
    # Remove internal IEEE-CIS identity fields
    # --------------------------------------------------------

    explanation = explanation[
        ~explanation["feature"].str.startswith(
            HIDDEN_FEATURE_PREFIXES
        )
    ]

    # --------------------------------------------------------
    # Calculate impact
    # --------------------------------------------------------

    explanation["impact"] = (
        explanation["shap_value"].abs()
    )

    explanation = (
        explanation
        .sort_values(
            "impact",
            ascending=False
        )
        .head(top_n)
    )

    # --------------------------------------------------------
    # Build API response
    # --------------------------------------------------------

    results = []

    for _, row in explanation.iterrows():

        feature = row["feature"]

        label = FEATURE_LABELS.get(
            feature,
            feature
        )

        direction = (
            "increased fraud risk"
            if row["shap_value"] > 0
            else "reduced fraud risk"
        )

        results.append({
            "feature": label,
            "value": str(row["value"]),
            "impact": round(
                float(row["shap_value"]),
                4
            ),
            "direction": direction
        })

    return results