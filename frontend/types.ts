export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Prediction = 'Legitimate' | 'Fraud';

export interface Explanation {
  title: string;
  detail: string;
  impact: 'low' | 'medium' | 'high';
}

export interface Transaction {
  id: string;
  amount: number;
  prediction: Prediction;
  fraudProbability: number;
  anomalyScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  timestamp: string;
  modelVersion: string;
  factors: Explanation[];
  customer?: string;
  location?: string;
  paymentMethod?: string;
  device?: string;
}

export interface Alert extends Transaction {
  status: 'Open' | 'Reviewing' | 'Resolved';
  triggerReason?: string;
  assignedTo?: string;
}

export interface Analytics {
  totalTransactions: number;
  fraudTransactions: number;
  highCriticalAlerts: number;
  fraudRate: number;
  averageRiskScore: number;
  totalAmountAnalyzed?: number;
  fraudSplit: { name: string; value: number }[];
  riskDistribution: { name: string; value: number; color?: string }[];
  activity: { time: string; transactions: number; flagged: number }[];
}

export interface PredictionInput {
  amount: number;
  transactionType: string;
  location: string;
  deviceChange: boolean;
  transactions24h: number;
  cardType: string;
  emailDomain: string;
  distance: number;
}

export type PredictionResult = Transaction;

export interface AssistantResponse {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RecentAlert {
  id: string;
  transactionId: string;
  title: string;
  amount: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  timestamp: string;
  type: 'transaction' | 'velocity' | 'location' | 'device';
}

export interface RiskFactor {
  name: string;
  percentage: number;
  color: string;
  count: number;
}

export interface RiskTrendItem {
  date: string;
  score: number;
  riskLevel: string;
  color: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  riskScore: number;
  riskLevel: RiskLevel;
  totalTransactions: number;
  flaggedCount: number;
  lastActive: string;
  device: string;
  location: string;
}

export interface FraudRule {
  id: string;
  name: string;
  type: string;
  condition: string;
  threshold: string;
  action: 'Flag' | 'Block' | 'Review' | 'Notify';
  enabled: boolean;
  lastTriggered: string;
}

export interface FraudReport {
  id: string;
  title: string;
  dateRange: string;
  generatedAt: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  size: string;
  riskSummary: string;
}
