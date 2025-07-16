export interface DashboardStats {
  totalPredictions: number;
  averageRiskScore: number;
  highRiskPatients: number;
  modelAccuracy: number;
  changeFromYesterday: {
    predictions: number;
    riskScore: number;
    highRisk: number;
    accuracy: number;
  };
}

export interface RiskDistribution {
  level: string;
  count: number;
  percentage: number;
  color: string;
}

export interface Prediction {
  id: string;
  patientId: string;
  patientName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  predictedDate: string;
  factors: string[];
  confidence: number;
}

export interface TrendData {
  date: string;
  predictions: number;
  riskScore: number;
  accuracy: number;
}

export interface ModelPerformance {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastUpdated: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}