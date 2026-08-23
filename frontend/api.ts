import type {
  Alert,
  Analytics,
  AssistantResponse,
  ChatMessage,
  Explanation,
  PredictionInput,
  PredictionResult,
  RiskLevel,
  Transaction,
} from "./types";

// ============================================================
// Configuration
// ============================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

// ============================================================
// Generic API Helper
// ============================================================

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    }
  );

  if (!response.ok) {
    let message = `API request failed (${response.status})`;

    try {
      const errorBody = await response.json();

      if (errorBody?.error) {
        message = errorBody.error;
      } else if (errorBody?.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}


// ============================================================
// Backend Response Types
// ============================================================

interface BackendExplanation {
  feature: string;
  value: string;
  impact: number;
  direction: string;
}

interface BackendTransaction {
  transaction_id: string;
  amount: number;
  prediction: "Legitimate" | "Fraud";
  fraud_probability: number;
  anomaly_score: number;
  risk_score: number;
  risk_level: RiskLevel;
  explanation: BackendExplanation[];
  model_version: string;
  created_at: string;
}

interface BackendAnalytics {
  total_transactions: number;
  fraud_transactions: number;
  high_risk_transactions: number;
  fraud_rate: number;
  average_risk_score: number;
}

interface BackendAssistantResponse {
  answer: string;
  transaction_id: string | null;
  model: string;
  success: boolean;
}


// ============================================================
// Helpers
// ============================================================

function formatPercentage(
  value: number
): number {
  // Backend gives probability as 0–1.
  // Frontend transaction model expects percentage.
  return Number(
    (value * 100).toFixed(2)
  );
}


function mapExplanation(
  explanation: BackendExplanation[]
): Explanation[] {
  return explanation.map((item) => {

    const normalizedImpact = Math.abs(
      item.impact
    );

    let impact: "low" | "medium" | "high" = "low";

    if (normalizedImpact >= 1) {
      impact = "high";
    } else if (normalizedImpact >= 0.3) {
      impact = "medium";
    }

    return {
      title: item.feature,
      detail: `${item.value} — ${item.direction}`,
      impact,
    };
  });
}


function mapTransaction(
  transaction: BackendTransaction
): Transaction {

  return {
    id: transaction.transaction_id,
    amount: transaction.amount,
    prediction: transaction.prediction,
    fraudProbability: formatPercentage(
      transaction.fraud_probability
    ),
    anomalyScore: transaction.anomaly_score,
    riskScore: transaction.risk_score,
    riskLevel: transaction.risk_level,
    timestamp: transaction.created_at,
    modelVersion: transaction.model_version,
    factors: mapExplanation(
      transaction.explanation || []
    ),
  };
}


// ============================================================
// Health
// ============================================================

export async function getHealth(): Promise<{
  status: string;
  service: string;
}> {
  return apiRequest("/health");
}


// ============================================================
// Analytics
// ============================================================

export async function getAnalytics(): Promise<Analytics> {

  const data =
    await apiRequest<BackendAnalytics>(
      "/analytics"
    );

  // Basic dashboard values directly from backend.
  // Some chart datasets are derived from transaction
  // history because the current analytics endpoint returns
  // aggregate values only.

  let transactions: Transaction[] = [];

  try {
    transactions =
      await getTransactions();
  } catch {
    transactions = [];
  }

  const fraudTransactions =
    transactions.filter(
      (t) => t.prediction === "Fraud"
    );

  const fraudSplit = [
    {
      name: "Legitimate",
      value:
        data.total_transactions -
        data.fraud_transactions,
    },
    {
      name: "Fraud",
      value: data.fraud_transactions,
    },
  ];

  const riskCounts: Record<RiskLevel, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  transactions.forEach((transaction) => {
    riskCounts[transaction.riskLevel] += 1;
  });

  const riskDistribution = [
    {
      name: "Low",
      value: riskCounts.LOW,
    },
    {
      name: "Medium",
      value: riskCounts.MEDIUM,
    },
    {
      name: "High",
      value: riskCounts.HIGH,
    },
    {
      name: "Critical",
      value: riskCounts.CRITICAL,
    },
  ];

  const activity = transactions
    .slice(0, 7)
    .map((transaction) => ({
      time: new Date(
        transaction.timestamp
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      transactions: 1,
      flagged:
        transaction.prediction === "Fraud"
          ? 1
          : 0,
    }));

  return {
    totalTransactions:
      data.total_transactions,

    fraudTransactions:
      data.fraud_transactions,

    highCriticalAlerts:
      data.high_risk_transactions,

    fraudRate:
      data.fraud_rate,

    averageRiskScore:
      data.average_risk_score,

    fraudSplit,

    riskDistribution,

    activity,
  };
}


// ============================================================
// Transactions
// ============================================================

export async function getTransactions(): Promise<
  Transaction[]
> {

  const data =
    await apiRequest<BackendTransaction[]>(
      "/transactions"
    );

  return data.map(mapTransaction);
}


// ============================================================
// Single Transaction
// ============================================================

export async function getTransaction(
  id: string
): Promise<Transaction | null> {

  try {

    const data =
      await apiRequest<BackendTransaction>(
        `/transactions/${encodeURIComponent(id)}`
      );

    return mapTransaction(data);

  } catch {
    return null;
  }
}


// ============================================================
// Alerts
// ============================================================

export async function getAlerts(): Promise<
  Alert[]
> {

  const data =
    await apiRequest<BackendTransaction[]>(
      "/alerts"
    );

  return data.map(
    (transaction, index) => ({
      ...mapTransaction(transaction),
      status:
        index === 0
          ? "Open"
          : "Reviewing",
    })
  );
}


// ============================================================
// Prediction
// ============================================================

export async function predictTransaction(
  data: PredictionInput
): Promise<PredictionResult> {

  const backendPayload = {
    amount: data.amount,

    transaction_type:
      data.transactionType,

    location:
      data.location,

    device_change:
      data.deviceChange ? 1 : 0,

    transactions_last_24h:
      data.transactions24h,

    card_type:
      data.cardType,

    email_domain:
      data.emailDomain,

    distance_from_previous:
      data.distance,
  };

  const result =
    await apiRequest<BackendTransaction>(
      "/predict",
      {
        method: "POST",
        body: JSON.stringify(
          backendPayload
        ),
      }
    );

  return mapTransaction(result);
}


// ============================================================
// Gemini Assistant
// ============================================================

export async function sendAssistantMessage(
  data: {
    message: string;
    transactionId?: string;
  }
): Promise<ChatMessage> {

  const response =
    await apiRequest<BackendAssistantResponse>(
      "/assistant/chat",
      {
        method: "POST",
        body: JSON.stringify({
          question: data.message,
          transaction_id:
            data.transactionId || null,
        }),
      }
    );

  const message: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: response.answer,
    timestamp:
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
  };

  return message;
}