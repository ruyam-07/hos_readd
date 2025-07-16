import { format } from 'date-fns';
import { PredictionFormData, FeatureImportance } from '../types';
import { clsx, type ClassValue } from 'clsx';

// Tailwind CSS class name utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format date for display
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

// Format datetime for display
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy h:mm a');
}

// Format risk score percentage
export function formatRiskScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

// Get risk level color
export function getRiskLevelColor(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'low':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

// Get risk level background color
export function getRiskLevelBgColor(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'low':
      return 'bg-green-500/20';
    case 'medium':
      return 'bg-yellow-500/20';
    case 'high':
      return 'bg-red-500/20';
    default:
      return 'bg-gray-500/20';
  }
}

// Calculate risk level from score
export function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 0.3) return 'low';
  if (score < 0.7) return 'medium';
  return 'high';
}

// Generate gradient colors for risk gauge
export function getRiskGradientColors(riskLevel: 'low' | 'medium' | 'high'): string[] {
  switch (riskLevel) {
    case 'low':
      return ['#10B981', '#34D399', '#6EE7B7'];
    case 'medium':
      return ['#F59E0B', '#FBD038', '#FDE68A'];
    case 'high':
      return ['#EF4444', '#F87171', '#FCA5A5'];
    default:
      return ['#6B7280', '#9CA3AF', '#D1D5DB'];
  }
}

// Format lab value with unit
export function formatLabValue(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`;
}

// Format vital sign with unit
export function formatVitalSign(value: number, unit: string): string {
  return `${Math.round(value)} ${unit}`;
}

// Format blood pressure
export function formatBloodPressure(systolic: number, diastolic: number): string {
  return `${Math.round(systolic)}/${Math.round(diastolic)} mmHg`;
}

// Generate session ID for auto-save
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Debounce function for auto-save
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for real-time updates
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Calculate feature importance percentages
export function calculateFeatureImportancePercentages(
  features: FeatureImportance[]
): FeatureImportance[] {
  const totalImportance = features.reduce((sum, feature) => sum + Math.abs(feature.importance), 0);
  
  return features.map(feature => ({
    ...feature,
    importance: totalImportance > 0 ? (Math.abs(feature.importance) / totalImportance) * 100 : 0,
  }));
}

// Sort features by importance
export function sortFeaturesByImportance(features: FeatureImportance[]): FeatureImportance[] {
  return [...features].sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));
}

// Get top N features
export function getTopFeatures(features: FeatureImportance[], n: number): FeatureImportance[] {
  return sortFeaturesByImportance(features).slice(0, n);
}

// Format feature name for display
export function formatFeatureName(featureName: string): string {
  return featureName
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Get feature category color
export function getFeatureCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    demographics: '#8B5CF6',
    vitals: '#EF4444',
    labs: '#06B6D4',
    history: '#F59E0B',
    admission: '#10B981',
    functional: '#EC4899',
    default: '#6B7280',
  };
  
  return colorMap[category.toLowerCase()] || colorMap.default;
}

// Calculate confidence interval width
export function calculateConfidenceWidth(lower: number, upper: number): number {
  return upper - lower;
}

// Check if confidence interval is narrow (high confidence)
export function isHighConfidence(lower: number, upper: number): boolean {
  const width = calculateConfidenceWidth(lower, upper);
  return width < 0.2; // Less than 20% width indicates high confidence
}

// Format confidence interval
export function formatConfidenceInterval(lower: number, upper: number, confidence: number): string {
  const lowerPercent = Math.round(lower * 100);
  const upperPercent = Math.round(upper * 100);
  const confidencePercent = Math.round(confidence * 100);
  
  return `${lowerPercent}% - ${upperPercent}% (${confidencePercent}% confidence)`;
}

// Generate recommendation priority color
export function getRecommendationPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'low':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

// Get recommendation category icon
export function getRecommendationCategoryIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    medication: '💊',
    monitoring: '📊',
    intervention: '🏥',
    discharge: '🚪',
    default: '📋',
  };
  
  return iconMap[category.toLowerCase()] || iconMap.default;
}

// Calculate form step progress
export function calculateStepProgress(currentStep: number, totalSteps: number): number {
  return Math.round(((currentStep + 1) / totalSteps) * 100);
}

// Check if value is in normal range
export function isInNormalRange(value: number, normalRange: { min: number; max: number }): boolean {
  return value >= normalRange.min && value <= normalRange.max;
}

// Get normal range status
export function getNormalRangeStatus(value: number, normalRange: { min: number; max: number }): 'normal' | 'low' | 'high' {
  if (value < normalRange.min) return 'low';
  if (value > normalRange.max) return 'high';
  return 'normal';
}

// Format number with appropriate decimal places
export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

// Convert form data to API format
export function convertFormDataToAPIFormat(formData: PredictionFormData): any {
  // Transform form data to match API expectations
  return {
    patient_demographics: {
      age: formData.demographics.age,
      gender: formData.demographics.gender,
      race: formData.demographics.race,
      ethnicity: formData.demographics.ethnicity,
      language: formData.demographics.language,
      insurance: formData.demographics.insurance,
      marital_status: formData.demographics.maritalStatus,
      religion: formData.demographics.religion,
      employment_status: formData.demographics.employmentStatus,
    },
    medical_history: {
      primary_diagnosis: formData.medicalHistory.primaryDiagnosis,
      secondary_diagnoses: formData.medicalHistory.secondaryDiagnoses,
      comorbidities: formData.medicalHistory.comorbidities,
      previous_admissions: formData.medicalHistory.previousAdmissions,
      chronic_conditions: formData.medicalHistory.chronicConditions,
      allergies: formData.medicalHistory.allergies,
      medications: formData.medicalHistory.medications,
      surgical_history: formData.medicalHistory.surgicalHistory,
      family_history: formData.medicalHistory.familyHistory,
      social_history: formData.medicalHistory.socialHistory,
    },
    current_admission: {
      admission_type: formData.currentAdmission.admissionType,
      admission_source: formData.currentAdmission.admissionSource,
      admission_date: formData.currentAdmission.admissionDate,
      length_of_stay: formData.currentAdmission.lengthOfStay,
      discharge_disposition: formData.currentAdmission.dischargeDisposition,
      department: formData.currentAdmission.department,
      attending_physician: formData.currentAdmission.attendingPhysician,
      procedures: formData.currentAdmission.procedures,
      complications: formData.currentAdmission.complications,
      current_medications: formData.currentAdmission.currentMedications,
    },
    clinical_measures: {
      vitals: {
        temperature: formData.clinicalMeasures.vitals.temperature,
        heart_rate: formData.clinicalMeasures.vitals.heartRate,
        blood_pressure_systolic: formData.clinicalMeasures.vitals.bloodPressure.systolic,
        blood_pressure_diastolic: formData.clinicalMeasures.vitals.bloodPressure.diastolic,
        respiratory_rate: formData.clinicalMeasures.vitals.respiratoryRate,
        oxygen_saturation: formData.clinicalMeasures.vitals.oxygenSaturation,
      },
      lab_values: {
        hemoglobin: formData.clinicalMeasures.labValues.hemoglobin,
        hematocrit: formData.clinicalMeasures.labValues.hematocrit,
        white_blood_cells: formData.clinicalMeasures.labValues.whiteBloodCells,
        platelets: formData.clinicalMeasures.labValues.platelets,
        sodium: formData.clinicalMeasures.labValues.sodium,
        potassium: formData.clinicalMeasures.labValues.potassium,
        chloride: formData.clinicalMeasures.labValues.chloride,
        glucose: formData.clinicalMeasures.labValues.glucose,
        bun: formData.clinicalMeasures.labValues.bun,
        creatinine: formData.clinicalMeasures.labValues.creatinine,
        albumin: formData.clinicalMeasures.labValues.albumin,
        bilirubin: formData.clinicalMeasures.labValues.bilirubin,
      },
      functional_status: {
        mobility_score: formData.clinicalMeasures.functionalStatus.mobilityScore,
        cognitive_score: formData.clinicalMeasures.functionalStatus.cognitiveScore,
        adl_score: formData.clinicalMeasures.functionalStatus.adlScore,
      },
    },
  };
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}