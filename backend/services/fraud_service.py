# ============================================================
# FinGuard AI
# Fraud Service
# ============================================================

from ml.inference.predictor import (
    predict_transaction,
    prepare_features
)

from ml.inference.explainer import (
    explain_transaction
)


def analyze_transaction(
    transaction: dict
) -> dict:
    """
    Complete FinGuard transaction analysis.
    """

    try:
        prediction_result = predict_transaction(
            transaction
        )

        features = prepare_features(
            transaction
        )

        explanations = explain_transaction(
            features,
            top_n=5
        )

        return {
            "prediction": prediction_result["prediction"],
            "fraud_probability": prediction_result[
                "fraud_probability"
            ],
            "anomaly_score": prediction_result[
                "anomaly_score"
            ],
            "risk_score": prediction_result[
                "risk_score"
            ],
            "risk_level": prediction_result[
                "risk_level"
            ],
            "model_version": prediction_result[
                "model_version"
            ],
            "explanation": explanations
        }

    except Exception as exc:
        raise RuntimeError(
            f"Fraud analysis failed: {exc}"
        ) from exc