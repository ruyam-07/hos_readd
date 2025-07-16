import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { PredictionFormData, PredictionResult, UIState, ValidationError } from '../types';
import { predictionAPI, autoSaveAPI } from '../services/api';
import { validateForm, isFormComplete, getFormCompletionPercentage } from '../utils/validation';
import { debounce, throttle, generateSessionId, convertFormDataToAPIFormat } from '../utils/helpers';

interface UsePredictionFormReturn {
  form: UseFormReturn<PredictionFormData>;
  uiState: UIState;
  predictionResult: PredictionResult | null;
  validationErrors: ValidationError[];
  completionPercentage: number;
  currentStep: number;
  totalSteps: number;
  sessionId: string;
  
  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  importPatientData: (patientId: string) => Promise<void>;
  
  // Real-time features
  getRealTimeRisk: () => Promise<void>;
  isStepValid: (step: number) => boolean;
  getStepErrors: (step: number) => ValidationError[];
}

const FORM_STEPS = [
  {
    id: 'demographics',
    title: 'Patient Demographics',
    description: 'Basic patient information and demographics',
    fields: ['age', 'gender', 'race', 'ethnicity', 'language', 'insurance', 'maritalStatus', 'religion', 'employmentStatus'],
  },
  {
    id: 'medicalHistory',
    title: 'Medical History',
    description: 'Past medical history and chronic conditions',
    fields: ['primaryDiagnosis', 'secondaryDiagnoses', 'comorbidities', 'previousAdmissions', 'chronicConditions', 'allergies', 'medications', 'surgicalHistory', 'familyHistory', 'socialHistory'],
  },
  {
    id: 'currentAdmission',
    title: 'Current Admission',
    description: 'Current hospital admission details',
    fields: ['admissionType', 'admissionSource', 'admissionDate', 'lengthOfStay', 'dischargeDisposition', 'department', 'attendingPhysician', 'procedures', 'complications', 'currentMedications'],
  },
  {
    id: 'clinicalMeasures',
    title: 'Clinical Measures',
    description: 'Vital signs, lab values, and functional assessments',
    fields: ['vitals', 'labValues', 'functionalStatus'],
  },
];

export function usePredictionForm(): UsePredictionFormReturn {
  const [uiState, setUiState] = useState<UIState>({
    currentStep: 0,
    isLoading: false,
    isSubmitting: false,
    error: null,
    autoSaveStatus: 'idle',
    showResults: false,
  });
  
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [sessionId] = useState(() => generateSessionId());
  
  // Form management
  const form = useForm<PredictionFormData>({
    mode: 'onChange',
    defaultValues: {
      demographics: {
        age: 0,
        gender: 'male',
        race: '',
        ethnicity: '',
        language: '',
        insurance: '',
        maritalStatus: '',
        religion: '',
        employmentStatus: '',
      },
      medicalHistory: {
        primaryDiagnosis: '',
        secondaryDiagnoses: [],
        comorbidities: [],
        previousAdmissions: 0,
        chronicConditions: [],
        allergies: [],
        medications: [],
        surgicalHistory: [],
        familyHistory: [],
        socialHistory: {
          smoking: false,
          alcohol: false,
          drugs: false,
        },
      },
      currentAdmission: {
        admissionType: 'emergency',
        admissionSource: '',
        admissionDate: '',
        lengthOfStay: 0,
        dischargeDisposition: '',
        department: '',
        attendingPhysician: '',
        procedures: [],
        complications: [],
        currentMedications: [],
      },
      clinicalMeasures: {
        vitals: {
          temperature: 0,
          heartRate: 0,
          bloodPressure: {
            systolic: 0,
            diastolic: 0,
          },
          respiratoryRate: 0,
          oxygenSaturation: 0,
        },
        labValues: {
          hemoglobin: 0,
          hematocrit: 0,
          whiteBloodCells: 0,
          platelets: 0,
          sodium: 0,
          potassium: 0,
          chloride: 0,
          glucose: 0,
          bun: 0,
          creatinine: 0,
          albumin: 0,
          bilirubin: 0,
        },
        functionalStatus: {
          mobilityScore: 0,
          cognitiveScore: 0,
          adlScore: 0,
        },
      },
    },
  });
  
  const formData = form.watch();
  const completionPercentage = getFormCompletionPercentage(formData);
  const isFormCompleteRef = useRef(false);
  
  // Auto-save functionality
  const autoSave = useCallback(
    debounce(async (data: Partial<PredictionFormData>) => {
      try {
        setUiState(prev => ({ ...prev, autoSaveStatus: 'saving' }));
        await autoSaveAPI.saveFormData(sessionId, data);
        setUiState(prev => ({ ...prev, autoSaveStatus: 'saved' }));
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          setUiState(prev => ({ ...prev, autoSaveStatus: 'idle' }));
        }, 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setUiState(prev => ({ ...prev, autoSaveStatus: 'error' }));
      }
    }, 1000),
    [sessionId]
  );
  
  // Real-time risk assessment
  const getRealTimeRisk = useCallback(
    throttle(async () => {
      try {
        if (!isFormComplete(formData)) return;
        
        const riskData = await predictionAPI.getRealTimeRisk(formData);
        // Update UI with real-time risk data
        console.log('Real-time risk:', riskData);
      } catch (error) {
        console.error('Real-time risk assessment failed:', error);
      }
    }, 2000),
    [formData]
  );
  
  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setUiState(prev => ({ ...prev, isLoading: true }));
        const savedData = await autoSaveAPI.loadFormData(sessionId);
        
        if (savedData) {
          form.reset(savedData.formData as PredictionFormData);
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      } finally {
        setUiState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    loadSavedData();
  }, [sessionId, form]);
  
  // Watch for form changes and trigger auto-save
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data && Object.keys(data).length > 0) {
        autoSave(data);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, autoSave]);
  
  // Validate form on data changes
  useEffect(() => {
    const errors = validateForm(formData as PredictionFormData);
    setValidationErrors(errors);
    
    // Check if form is complete for real-time risk assessment
    const isComplete = isFormComplete(formData);
    if (isComplete && !isFormCompleteRef.current) {
      isFormCompleteRef.current = true;
      getRealTimeRisk();
    } else if (!isComplete) {
      isFormCompleteRef.current = false;
    }
  }, [formData, getRealTimeRisk]);
  
  // Navigation functions
  const nextStep = useCallback(() => {
    if (uiState.currentStep < FORM_STEPS.length - 1) {
      setUiState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  }, [uiState.currentStep]);
  
  const prevStep = useCallback(() => {
    if (uiState.currentStep > 0) {
      setUiState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [uiState.currentStep]);
  
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < FORM_STEPS.length) {
      setUiState(prev => ({ ...prev, currentStep: step }));
    }
  }, []);
  
  // Form submission
  const submitForm = useCallback(async () => {
    try {
      setUiState(prev => ({ ...prev, isSubmitting: true, error: null }));
      
      const formErrors = validateForm(formData as PredictionFormData);
      if (formErrors.length > 0) {
        setValidationErrors(formErrors);
        throw new Error('Please fix validation errors before submitting');
      }
      
      const apiData = convertFormDataToAPIFormat(formData as PredictionFormData);
      const result = await predictionAPI.createPrediction(apiData);
      
      setPredictionResult(result);
      setUiState(prev => ({ ...prev, showResults: true }));
      
      // Clear auto-saved data after successful submission
      await autoSaveAPI.clearSavedData(sessionId);
      
    } catch (error) {
      console.error('Form submission failed:', error);
      setUiState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Submission failed' 
      }));
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formData, sessionId]);
  
  // Reset form
  const resetForm = useCallback(() => {
    form.reset();
    setPredictionResult(null);
    setValidationErrors([]);
    setUiState({
      currentStep: 0,
      isLoading: false,
      isSubmitting: false,
      error: null,
      autoSaveStatus: 'idle',
      showResults: false,
    });
    
    // Clear auto-saved data
    autoSaveAPI.clearSavedData(sessionId).catch(console.error);
  }, [form, sessionId]);
  
  // Import patient data
  const importPatientData = useCallback(async (patientId: string) => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      // This would typically call an API to import patient data
      // For now, we'll simulate it
      console.log('Importing patient data for ID:', patientId);
      
      // const importedData = await patientAPI.importPatientData(patientId);
      // form.reset(importedData);
      
    } catch (error) {
      console.error('Failed to import patient data:', error);
      setUiState(prev => ({ 
        ...prev, 
        error: 'Failed to import patient data' 
      }));
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  }, [form]);
  
  // Validation helpers
  const isStepValid = useCallback((step: number) => {
    const stepErrors = getStepErrors(step);
    return stepErrors.length === 0;
  }, [validationErrors]);
  
  const getStepErrors = useCallback((step: number) => {
    const stepId = FORM_STEPS[step]?.id;
    return validationErrors.filter(error => error.field.startsWith(stepId));
  }, [validationErrors]);
  
  return {
    form,
    uiState,
    predictionResult,
    validationErrors,
    completionPercentage,
    currentStep: uiState.currentStep,
    totalSteps: FORM_STEPS.length,
    sessionId,
    
    // Actions
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    resetForm,
    importPatientData,
    
    // Real-time features
    getRealTimeRisk,
    isStepValid,
    getStepErrors,
  };
}