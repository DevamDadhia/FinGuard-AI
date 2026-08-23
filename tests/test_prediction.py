# ============================================================
# FinGuard AI — Prediction + Explainability Test
# ============================================================

from ml.inference.predictor import (
    predict_transaction,
    prepare_features
)

from ml.inference.explainer import (
    explain_transaction
)


test_transaction = {
    "TransactionDT": 86400,
    "TransactionAmt": 25000,
    "ProductCD": "W",
    "card1": 10000,
    "card2": 123,
    "card3": 150,
    "card4": "visa",
    "card5": 226,
    "card6": "debit",
    "addr1": 299,
    "addr2": 87,
    "dist1": 10,
    "dist2": 20,
    "P_emaildomain": "gmail.com",
    "R_emaildomain": "gmail.com"
}


result = predict_transaction(
    test_transaction
)

features = prepare_features(
    test_transaction
)

explanation = explain_transaction(
    features,
    top_n=5
)

print("=" * 60)
print("FIN GUARD AI — PREDICTION + EXPLANATION")
print("=" * 60)

print("Prediction        :", result["prediction"])
print("Fraud Probability :", result["fraud_probability"])
print("Anomaly Score     :", result["anomaly_score"])
print("Risk Score        :", result["risk_score"])
print("Risk Level        :", result["risk_level"])

print("\nTop Risk Factors:")

for item in explanation:
    print(
        f"- {item['feature']} "
        f"({item['direction']}, "
        f"impact={item['impact']})"
    )