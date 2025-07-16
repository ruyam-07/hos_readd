import { 
  DashboardStats, 
  RiskDistribution, 
  Prediction, 
  TrendData, 
  ModelPerformance 
} from '../types/dashboard';

export const mockDashboardStats: DashboardStats = {
  totalPredictions: 1247,
  averageRiskScore: 23.4,
  highRiskPatients: 89,
  modelAccuracy: 94.2,
  changeFromYesterday: {
    predictions: 12.5,
    riskScore: -3.2,
    highRisk: 8.1,
    accuracy: 0.8,
  },
};

export const mockRiskDistribution: RiskDistribution[] = [
  { level: 'Low Risk', count: 856, percentage: 68.7, color: '#00FF88' },
  { level: 'Medium Risk', count: 302, percentage: 24.2, color: '#FFA500' },
  { level: 'High Risk', count: 89, percentage: 7.1, color: '#FF4444' },
];

export const mockPredictions: Prediction[] = [
  {
    id: '1',
    patientId: 'P001',
    patientName: 'John Smith',
    riskScore: 78,
    riskLevel: 'high',
    predictedDate: new Date().toISOString(),
    factors: ['Previous readmission', 'Chronic condition', 'Age > 65'],
    confidence: 89,
  },
  {
    id: '2',
    patientId: 'P002',
    patientName: 'Sarah Johnson',
    riskScore: 45,
    riskLevel: 'medium',
    predictedDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    factors: ['Medication adherence', 'Comorbidities'],
    confidence: 72,
  },
  {
    id: '3',
    patientId: 'P003',
    patientName: 'Michael Davis',
    riskScore: 23,
    riskLevel: 'low',
    predictedDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    factors: ['Stable condition'],
    confidence: 94,
  },
  {
    id: '4',
    patientId: 'P004',
    patientName: 'Emily Wilson',
    riskScore: 67,
    riskLevel: 'high',
    predictedDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    factors: ['Complex surgery', 'Extended stay', 'Age > 75'],
    confidence: 81,
  },
  {
    id: '5',
    patientId: 'P005',
    patientName: 'Robert Brown',
    riskScore: 34,
    riskLevel: 'medium',
    predictedDate: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    factors: ['History of complications', 'Multiple medications'],
    confidence: 76,
  },
];

export const mockTrendData: TrendData[] = [
  { date: '2024-01-01', predictions: 45, riskScore: 24.5, accuracy: 92.1 },
  { date: '2024-01-02', predictions: 52, riskScore: 26.2, accuracy: 91.8 },
  { date: '2024-01-03', predictions: 48, riskScore: 23.8, accuracy: 93.2 },
  { date: '2024-01-04', predictions: 61, riskScore: 28.1, accuracy: 90.5 },
  { date: '2024-01-05', predictions: 54, riskScore: 25.7, accuracy: 92.8 },
  { date: '2024-01-06', predictions: 43, riskScore: 22.9, accuracy: 94.1 },
  { date: '2024-01-07', predictions: 49, riskScore: 24.3, accuracy: 93.5 },
  { date: '2024-01-08', predictions: 58, riskScore: 27.6, accuracy: 91.2 },
  { date: '2024-01-09', predictions: 47, riskScore: 23.4, accuracy: 93.8 },
  { date: '2024-01-10', predictions: 55, riskScore: 26.8, accuracy: 92.3 },
  { date: '2024-01-11', predictions: 62, riskScore: 29.1, accuracy: 90.9 },
  { date: '2024-01-12', predictions: 44, riskScore: 22.1, accuracy: 94.5 },
  { date: '2024-01-13', predictions: 51, riskScore: 25.4, accuracy: 92.7 },
  { date: '2024-01-14', predictions: 59, riskScore: 28.3, accuracy: 91.4 },
  { date: '2024-01-15', predictions: 46, riskScore: 23.7, accuracy: 93.9 },
  { date: '2024-01-16', predictions: 53, riskScore: 26.5, accuracy: 92.1 },
  { date: '2024-01-17', predictions: 60, riskScore: 28.9, accuracy: 90.8 },
  { date: '2024-01-18', predictions: 42, riskScore: 21.6, accuracy: 94.8 },
  { date: '2024-01-19', predictions: 50, riskScore: 25.1, accuracy: 93.2 },
  { date: '2024-01-20', predictions: 57, riskScore: 27.4, accuracy: 91.7 },
  { date: '2024-01-21', predictions: 45, riskScore: 23.2, accuracy: 93.6 },
  { date: '2024-01-22', predictions: 52, riskScore: 26.1, accuracy: 92.4 },
  { date: '2024-01-23', predictions: 63, riskScore: 29.7, accuracy: 90.3 },
  { date: '2024-01-24', predictions: 48, riskScore: 24.8, accuracy: 93.1 },
  { date: '2024-01-25', predictions: 54, riskScore: 26.9, accuracy: 92.0 },
  { date: '2024-01-26', predictions: 61, riskScore: 28.6, accuracy: 91.1 },
  { date: '2024-01-27', predictions: 43, riskScore: 22.4, accuracy: 94.3 },
  { date: '2024-01-28', predictions: 49, riskScore: 24.7, accuracy: 93.4 },
  { date: '2024-01-29', predictions: 56, riskScore: 27.2, accuracy: 91.8 },
  { date: '2024-01-30', predictions: 47, riskScore: 23.4, accuracy: 94.2 },
];

export const mockModelPerformance: ModelPerformance[] = [
  {
    model: 'Random Forest',
    accuracy: 94.2,
    precision: 91.8,
    recall: 93.5,
    f1Score: 92.6,
    lastUpdated: '2024-01-30T10:30:00Z',
  },
  {
    model: 'XGBoost',
    accuracy: 92.8,
    precision: 89.4,
    recall: 91.2,
    f1Score: 90.3,
    lastUpdated: '2024-01-30T10:25:00Z',
  },
  {
    model: 'Neural Network',
    accuracy: 91.5,
    precision: 88.9,
    recall: 90.1,
    f1Score: 89.5,
    lastUpdated: '2024-01-30T10:20:00Z',
  },
  {
    model: 'Logistic Regression',
    accuracy: 87.3,
    precision: 84.2,
    recall: 86.8,
    f1Score: 85.5,
    lastUpdated: '2024-01-30T10:15:00Z',
  },
  {
    model: 'Support Vector Machine',
    accuracy: 89.7,
    precision: 87.1,
    recall: 88.9,
    f1Score: 88.0,
    lastUpdated: '2024-01-30T10:10:00Z',
  },
];

// Utility function to generate real-time data
export const generateLivePrediction = (): Prediction => {
  const names = ['Alice Cooper', 'Bob Martin', 'Carol White', 'David Lee', 'Eva Green'];
  const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  const factors = [
    'Previous readmission',
    'Chronic condition',
    'Age > 65',
    'Medication adherence',
    'Comorbidities',
    'Complex surgery',
    'Extended stay',
    'History of complications',
    'Multiple medications',
  ];

  const riskScore = Math.floor(Math.random() * 100);
  const riskLevel = riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low';

  return {
    id: Math.random().toString(36).substr(2, 9),
    patientId: `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    patientName: names[Math.floor(Math.random() * names.length)],
    riskScore,
    riskLevel,
    predictedDate: new Date().toISOString(),
    factors: factors.slice(0, Math.floor(Math.random() * 3) + 1),
    confidence: Math.floor(Math.random() * 40) + 60,
  };
};