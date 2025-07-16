import React, { useState } from 'react';
import { PredictionForm } from './components/PredictionForm';
import { RiskGauge } from './components/RiskGauge';
import { FeatureImportance } from './components/FeatureImportance';
import { RecommendationCards } from './components/RecommendationCards';
import { ConfidenceInterval } from './components/ConfidenceInterval';
import { PredictionResult, FeatureImportance as FeatureImportanceType, ClinicalRecommendation } from './types';

// Mock data for demonstration
const mockPredictionResult: PredictionResult = {
  id: 'pred-123',
  patientId: 'pat-456',
  riskScore: 0.75,
  riskLevel: 'high',
  confidenceInterval: {
    lower: 0.65,
    upper: 0.85,
    confidence: 0.95,
  },
  featureImportance: [
    {
      feature: 'demographics_age',
      importance: 25.5,
      value: 78,
      contribution: 0.15,
      description: 'Patient age is a strong predictor of readmission risk. Advanced age is associated with increased likelihood of complications and readmission.',
    },
    {
      feature: 'history_previous_admissions',
      importance: 22.3,
      value: 3,
      contribution: 0.18,
      description: 'Multiple previous admissions indicate recurring health issues and higher risk of future readmissions.',
    },
    {
      feature: 'labs_creatinine',
      importance: 18.7,
      value: 2.4,
      contribution: 0.12,
      description: 'Elevated creatinine levels indicate kidney dysfunction, which is associated with increased readmission risk.',
    },
    {
      feature: 'vitals_heart_rate',
      importance: 15.2,
      value: 95,
      contribution: 0.08,
      description: 'Heart rate above normal range may indicate cardiovascular stress or medication side effects.',
    },
    {
      feature: 'admission_length_of_stay',
      importance: 12.8,
      value: 8,
      contribution: 0.07,
      description: 'Longer hospital stays are associated with more complex medical conditions and higher readmission rates.',
    },
    {
      feature: 'labs_hemoglobin',
      importance: 11.4,
      value: 9.2,
      contribution: -0.05,
      description: 'Low hemoglobin levels may indicate anemia, which can contribute to readmission risk.',
    },
    {
      feature: 'functional_mobility_score',
      importance: 9.8,
      value: 45,
      contribution: 0.04,
      description: 'Lower mobility scores indicate reduced functional capacity, increasing readmission risk.',
    },
    {
      feature: 'demographics_insurance',
      importance: 8.9,
      value: 'Medicare',
      contribution: 0.03,
      description: 'Insurance type may influence access to follow-up care and medication adherence.',
    },
    {
      feature: 'vitals_blood_pressure_systolic',
      importance: 7.6,
      value: 165,
      contribution: 0.06,
      description: 'Elevated blood pressure indicates cardiovascular risk and potential medication non-adherence.',
    },
    {
      feature: 'labs_glucose',
      importance: 6.2,
      value: 180,
      contribution: 0.02,
      description: 'Elevated glucose levels may indicate diabetes management issues requiring follow-up.',
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      category: 'monitoring',
      priority: 'high',
      title: 'Nephrology Follow-up',
      description: 'Schedule nephrology consultation within 1 week due to elevated creatinine levels.',
      rationale: 'Elevated creatinine (2.4 mg/dL) indicates significant kidney dysfunction requiring specialist evaluation.',
      evidence: 'Studies show early nephrology consultation reduces readmission rates by 23% in patients with CKD.',
      timeframe: 'Within 1 week',
      responsible: 'Primary Care Physician',
    },
    {
      id: 'rec-2',
      category: 'medication',
      priority: 'high',
      title: 'Medication Reconciliation',
      description: 'Comprehensive medication review with pharmacist to address polypharmacy and drug interactions.',
      rationale: 'Multiple medications increase risk of adverse events and readmissions.',
      evidence: 'Medication reconciliation reduces readmission rates by 15-20% in elderly patients.',
      timeframe: 'Within 3 days',
      responsible: 'Clinical Pharmacist',
    },
    {
      id: 'rec-3',
      category: 'intervention',
      priority: 'medium',
      title: 'Physical Therapy Assessment',
      description: 'Evaluate mobility and functional capacity to develop rehabilitation plan.',
      rationale: 'Low mobility score (45/100) indicates increased fall risk and functional decline.',
      evidence: 'Early mobility interventions reduce readmission risk by 18% in hospitalized patients.',
      timeframe: 'Within 2 weeks',
      responsible: 'Physical Therapist',
    },
    {
      id: 'rec-4',
      category: 'monitoring',
      priority: 'medium',
      title: 'Cardiology Consultation',
      description: 'Evaluate cardiovascular status given elevated heart rate and blood pressure.',
      rationale: 'Cardiovascular abnormalities require assessment for optimization of medical therapy.',
      evidence: 'Cardiology consultation reduces cardiovascular-related readmissions by 25%.',
      timeframe: 'Within 2 weeks',
      responsible: 'Cardiologist',
    },
    {
      id: 'rec-5',
      category: 'discharge',
      priority: 'high',
      title: 'Enhanced Discharge Planning',
      description: 'Coordinate comprehensive discharge planning with social worker and case manager.',
      rationale: 'Complex medical conditions require careful transition planning to prevent readmission.',
      evidence: 'Enhanced discharge planning reduces 30-day readmission rates by 13%.',
      timeframe: 'Before discharge',
      responsible: 'Case Manager',
    },
    {
      id: 'rec-6',
      category: 'monitoring',
      priority: 'low',
      title: 'Diabetes Management',
      description: 'Monitor blood glucose levels and adjust diabetes medications as needed.',
      rationale: 'Elevated glucose levels may indicate suboptimal diabetes control.',
      evidence: 'Improved diabetes control reduces readmission risk by 12% in diabetic patients.',
      timeframe: 'Ongoing',
      responsible: 'Endocrinologist',
    },
  ],
  timestamp: new Date().toISOString(),
  modelUsed: 'XGBoost',
  modelVersion: '2.1.0',
};

function App() {
  const [showResults, setShowResults] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  const handlePredictionComplete = (result: PredictionResult) => {
    setPredictionResult(result);
    setShowResults(true);
  };

  const handleDemoResults = () => {
    setPredictionResult(mockPredictionResult);
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setPredictionResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {!showResults ? (
        <div>
          <PredictionForm onPredictionComplete={handlePredictionComplete} />
          
          {/* Demo Button */}
          <div className="fixed bottom-6 right-6">
            <button
              onClick={handleDemoResults}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                       text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Show Demo Results
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    ML Prediction Results
                  </h1>
                  <p className="text-gray-300">
                    Comprehensive readmission risk assessment and clinical recommendations
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm
                           text-white font-medium rounded-lg border border-white/20 hover:border-white/30
                           transition-all duration-200"
                >
                  New Prediction
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Risk Gauge */}
              <RiskGauge
                riskScore={predictionResult?.riskScore || 0}
                riskLevel={predictionResult?.riskLevel || 'low'}
                confidence={predictionResult?.confidenceInterval.confidence || 0}
                isLoading={false}
              />

              {/* Confidence Interval */}
              <ConfidenceInterval
                lower={predictionResult?.confidenceInterval.lower || 0}
                upper={predictionResult?.confidenceInterval.upper || 0}
                confidence={predictionResult?.confidenceInterval.confidence || 0}
                prediction={predictionResult?.riskScore || 0}
                isLoading={false}
              />
            </div>

            {/* Feature Importance */}
            <div className="mb-8">
              <FeatureImportance
                features={predictionResult?.featureImportance || []}
                isLoading={false}
                showTop={10}
              />
            </div>

            {/* Recommendations */}
            <div className="mb-8">
              <RecommendationCards
                recommendations={predictionResult?.recommendations || []}
                isLoading={false}
              />
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Model Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Model:</span>
                    <span className="text-white">{predictionResult?.modelUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Version:</span>
                    <span className="text-white">{predictionResult?.modelVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Patient ID:</span>
                    <span className="text-white">{predictionResult?.patientId}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Prediction Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Risk Score:</span>
                    <span className="text-white">{Math.round((predictionResult?.riskScore || 0) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Risk Level:</span>
                    <span className="text-white capitalize">{predictionResult?.riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Confidence:</span>
                    <span className="text-white">{Math.round((predictionResult?.confidenceInterval.confidence || 0) * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Analysis Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Features:</span>
                    <span className="text-white">{predictionResult?.featureImportance.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Recommendations:</span>
                    <span className="text-white">{predictionResult?.recommendations.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Generated:</span>
                    <span className="text-white">
                      {predictionResult?.timestamp ? new Date(predictionResult.timestamp).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;