
🛡️ FinGuard AI

Explainable AI-Powered Financial Fraud Detection & Investigation Platform

<p align="center">

<strong>{=html}Detect • Score • Explain • Alert • Investigate •
Protect</strong>{=html}

</p>

<p align="center">

FinGuard AI combines machine learning, anomaly detection, explainable
AI, risk scoring, fraud alerts, and a Gemini-powered investigation
assistant into one intelligent fraud-intelligence platform.

</p>

🖥️ Product Preview



Design goal: a professional fintech/security-operations experience
focused on decision-making rather than a crowded or gamified
dashboard.

🚨 The Problem

Financial fraud is becoming increasingly difficult to detect as
transaction volumes grow and fraudulent behavior becomes more
sophisticated.

Traditional fraud systems can struggle with:

High-volume transaction screening

Previously unseen or unusual fraud patterns

Black-box model predictions

Slow manual investigation

Difficulty understanding why a transaction was flagged

Prioritizing which transactions require immediate attention

FinGuard AI addresses these challenges through a unified workflow that
combines predictive ML, anomaly detection, explainability, risk
prioritization, and Generative AI.

💡 Our Solution

FinGuard AI follows a simple investigation pipeline:

                 TRANSACTION
                      │
                      ▼
              ┌───────────────┐
              │  ML Detection │
              └───────┬───────┘
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
       Fraud Model        Anomaly Detection
            │                   │
            └─────────┬─────────┘
                      ▼
               Risk Assessment
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Fraud %    Anomaly Score  Risk Score
          │           │           │
          └───────────┼───────────┘
                      ▼
                SHAP Explanation
                      │
                      ▼
                Fraud Alerts
                      │
                      ▼
                Investigation
                      │
                      ▼
               Gemini AI Analyst

The core idea

Instead of simply telling an analyst "Fraud" or "Legitimate",
FinGuard AI answers:

What happened? How risky is it? Why did the model decide this? What
should the analyst investigate next?

✨ Core Features

1. 🔍 AI Fraud Detection

Transactions are evaluated using a machine-learning fraud classifier.

The system returns:

Prediction

Fraud probability

Risk score

Risk level

Model version

2. 📊 Multi-Layer Risk Assessment

FinGuard combines multiple signals into an interpretable risk profile.

Fraud Probability

Estimated probability that a transaction is fraudulent.

Anomaly Score

Measures how unusual the transaction is relative to learned transaction
behavior.

Composite Risk Score

A normalized score from:

0 ─────────────────────────────── 100
LOW                         CRITICAL

Risk levels:

LOW → MEDIUM → HIGH → CRITICAL

3. 🧠 Explainable AI

FinGuard does not stop at a prediction.

The system exposes the strongest contributing factors and their
direction of impact.

Example:

Recipient Email Domain
Impact: +0.8642
Direction: Increased fraud risk

versus:

Distance Indicator
Impact: -0.1656
Direction: Reduced fraud risk

This helps investigators understand the model instead of treating it as
a black box.

4. 🚨 Smart Fraud Alerts

High-risk transactions can be surfaced through a dedicated alert
workflow.

Analysts can review:

Transaction ID

Amount

Prediction

Fraud probability

Risk score

Risk level

Timestamp

Explanation factors

5. 🔎 Transaction Investigation

Each transaction can be opened as an investigation.

The investigation view provides:

Risk classification

Fraud probability

Anomaly score

Composite risk score

Model version

Explainability factors

Investigation context

AI assistant access

🤖 FinGuard AI Analyst

A dedicated Gemini-powered AI investigation assistant helps analysts
understand fraud decisions using natural language.

Instead of manually interpreting ML outputs, an investigator can ask:

Why was this transaction classified as low risk?

or:

What factors increased the fraud risk?

or:

What should I investigate about this transaction?

The assistant receives transaction context from the backend and
generates an explanation based on the available risk information.

Why this matters

The AI assistant bridges the gap between:

Machine Learning Output
          ↓
     Human Analyst

by turning technical model signals into understandable investigation
guidance.

🖥️ Application Modules

Dashboard

A focused operational overview containing:

Total Transactions

Flagged Transactions

Fraud Detected

Total Amount Analyzed

Fraud Risk overview

Recent Alerts

Dedicated AI Analyst workspace

The dashboard intentionally avoids unnecessary information overload.

Transaction Analysis

Submit transaction attributes and receive a complete risk assessment.

Transaction History

Search and review previously processed transactions.

Fraud Alerts

Review high-priority transactions requiring attention.

Transaction Investigation

Open a transaction and inspect its complete risk profile and
explanations.

FinGuard AI Analyst

Use Gemini as an investigation copilot with transaction-aware context.

🏗️ System Architecture

┌──────────────────────────────────────┐
│            React Frontend            │
│     Dashboard • Analysis • Alerts    │
│      History • Investigation • AI    │
└──────────────────┬───────────────────┘
                   │ REST API
                   ▼
┌──────────────────────────────────────┐
│             FastAPI Backend           │
│        API + Business Logic           │
└───────────┬───────────────┬──────────┘
            │               │
            ▼               ▼
     ┌────────────┐   ┌──────────────┐
     │ ML Pipeline│   │   Database   │
     │ XGBoost    │   │ Transactions │
     │ Anomaly    │   │   & Results  │
     └─────┬──────┘   └──────────────┘
           │
           ▼
     ┌────────────┐
     │    SHAP    │
     │ Explainable│
     │     AI     │
     └─────┬──────┘
           │
           ▼
     ┌────────────┐
     │   Gemini   │
     │ AI Analyst │
     └────────────┘

🔌 Backend API

Method   Endpoint               Purpose

GET    /health              Backend health check
POST   /predict             Analyze a transaction
GET    /transactions        Retrieve transactions
GET    /transactions/{id}   Retrieve a specific transaction
GET    /alerts              Retrieve fraud alerts
GET    /analytics           Retrieve dashboard analytics
POST   /assistant/chat      Gemini-powered investigation assistant

🧪 Example

Example transaction:

{
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

Example backend result:

Prediction:          Legitimate
Fraud Probability:   7.71%
Anomaly Score:       0.0704
Risk Score:          7.54 / 100
Risk Level:          LOW
Model Version:       finguard-xgb-v1

The response also includes feature-level explanation factors.

🛠️ Technology Stack

Layer               Technologies

Frontend            React, TypeScript, Vite
Styling             Tailwind CSS
Visualization       Recharts
Icons               Lucide React
Backend             Python, FastAPI, Uvicorn
ML                  XGBoost, Scikit-learn
Anomaly Detection   Isolation Forest / anomaly detection
Explainability      SHAP
GenAI               Google Gemini API
Data                Pandas, NumPy
Storage             SQLite / database layer
Development         Git, GitHub, VS Code

📁 Project Structure

Prasuathon_Project/
│
├── backend/
│   ├── main.py
│   ├── schemas/
│   ├── services/
│   └── ...
│
├── frontend/
│   ├── App.tsx
│   ├── api.ts
│   ├── main.tsx
│   ├── index.css
│   ├── package.json
│   └── ...
│
├── ml/
│   ├── models/
│   ├── preprocessing/
│   └── ...
│
├── database/
│   └── ...
│
├── tests/
│   └── ...
│
├── requirements.txt
├── .gitignore
└── README.md

⚙️ Local Setup

1. Clone

git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY

2. Backend

python -m venv venv

Windows:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

3. Environment Variables

Create .env in the project root:

GEMINI_API_KEY=your_gemini_api_key_here

Never commit .env or expose the Gemini API key in frontend code.

4. Start FastAPI

uvicorn backend.main:app --reload

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs

5. Start Frontend

cd frontend
npm install
npm run dev

Open the Vite URL shown in the terminal, normally:

http://localhost:5173

🔐 Security

Never commit:

.env
venv/
.venv/
__pycache__/
node_modules/
dist/

The Gemini API key must remain server-side.

📌 Design Philosophy

FinGuard AI is intentionally designed around progressive disclosure.

The analyst first sees the most important information:

What is happening?
        ↓
How risky is it?
        ↓
Why is it risky?
        ↓
Should I investigate?
        ↓
Ask the AI assistant

This keeps the interface professional and useful without turning it into
an overloaded analytics dashboard.

🚀 Future Scope

Potential future improvements include:

Real-time transaction streaming

Advanced behavioral profiling

Graph-based fraud detection

Device fingerprint intelligence

Continuous model retraining

Model drift monitoring

Analyst feedback loops

Fraud-network visualization

Role-based access control

Production monitoring

Advanced investigation workflows

🎯 Project Vision

FinGuard AI aims to make financial fraud detection:

Faster --- automated transaction screening

Smarter --- predictive + anomaly-based detection

Explainable --- understandable model decisions

Actionable --- risk-based investigation prioritization

Interactive --- natural-language AI investigation

Scalable --- API-first architecture for integration

👥 Team

FinGuard AI --- Prasuathon Project

Built as an AI-powered financial fraud detection and investigation
platform.

<p align="center">

<strong>{=html}Detect smarter. Explain clearly. Investigate faster.
Protect better.</strong>{=html}

</p>
