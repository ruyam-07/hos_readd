export interface PatientDemographics {
  age: number;
  gender: 'male' | 'female' | 'other';
  race: string;
  ethnicity: string;
  language: string;
  insurance: string;
  maritalStatus: string;
  religion: string;
  employmentStatus: string;
}

export interface MedicalHistory {
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  comorbidities: string[];
  previousAdmissions: number;
  chronicConditions: string[];
  allergies: string[];
  medications: string[];
  surgicalHistory: string[];
  familyHistory: string[];
  socialHistory: {
    smoking: boolean;
    alcohol: boolean;
    drugs: boolean;
  };
}

export interface CurrentAdmission {
  admissionType: 'emergency' | 'urgent' | 'elective';
  admissionSource: string;
  admissionDate: string;
  lengthOfStay: number;
  dischargeDisposition: string;
  department: string;
  attendingPhysician: string;
  procedures: string[];
  complications: string[];
  currentMedications: string[];
}

export interface ClinicalMeasures {
  vitals: {
    temperature: number;
    heartRate: number;
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    respiratoryRate: number;
    oxygenSaturation: number;
  };
  labValues: {
    hemoglobin: number;
    hematocrit: number;
    whiteBloodCells: number;
    platelets: number;
    sodium: number;
    potassium: number;
    chloride: number;
    glucose: number;
    bun: number;
    creatinine: number;
    albumin: number;
    bilirubin: number;
  };
  functionalStatus: {
    mobilityScore: number;
    cognitiveScore: number;
    adlScore: number;
  };
}

export interface PredictionFormData {
  demographics: PatientDemographics;
  medicalHistory: MedicalHistory;
  currentAdmission: CurrentAdmission;
  clinicalMeasures: ClinicalMeasures;
}

export interface PredictionResult {
  id: string;
  patientId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidenceInterval: {
    lower: number;
    upper: number;
    confidence: number;
  };
  featureImportance: FeatureImportance[];
  recommendations: ClinicalRecommendation[];
  timestamp: string;
  modelUsed: string;
  modelVersion: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  value: number;
  contribution: number;
  description: string;
}

export interface ClinicalRecommendation {
  id: string;
  category: 'medication' | 'monitoring' | 'intervention' | 'discharge';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  evidence: string;
  timeframe: string;
  responsible: string;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isComplete: boolean;
  isValid: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'range' | 'dependency';
}

export interface UIState {
  currentStep: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  showResults: boolean;
}

export interface MedicalCode {
  code: string;
  description: string;
  category: string;
  system: 'ICD-10' | 'CPT' | 'SNOMED' | 'LOINC';
}

export interface AutoSaveData {
  timestamp: string;
  formData: Partial<PredictionFormData>;
  step: number;
}