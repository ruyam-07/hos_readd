import { PredictionFormData, ValidationError } from '../types';

// Validation rules for different field types
export const ValidationRules = {
  // Age validation
  age: {
    required: true,
    min: 0,
    max: 120,
    message: 'Age must be between 0 and 120 years',
  },
  
  // Vital signs ranges
  temperature: {
    required: true,
    min: 90,
    max: 110,
    message: 'Temperature must be between 90-110°F',
  },
  
  heartRate: {
    required: true,
    min: 30,
    max: 200,
    message: 'Heart rate must be between 30-200 bpm',
  },
  
  bloodPressure: {
    systolic: { min: 60, max: 250, message: 'Systolic BP must be between 60-250 mmHg' },
    diastolic: { min: 30, max: 150, message: 'Diastolic BP must be between 30-150 mmHg' },
  },
  
  respiratoryRate: {
    required: true,
    min: 6,
    max: 60,
    message: 'Respiratory rate must be between 6-60 breaths/min',
  },
  
  oxygenSaturation: {
    required: true,
    min: 70,
    max: 100,
    message: 'Oxygen saturation must be between 70-100%',
  },
  
  // Lab value ranges
  hemoglobin: {
    required: true,
    min: 3,
    max: 20,
    message: 'Hemoglobin must be between 3-20 g/dL',
  },
  
  glucose: {
    required: true,
    min: 40,
    max: 500,
    message: 'Glucose must be between 40-500 mg/dL',
  },
  
  creatinine: {
    required: true,
    min: 0.3,
    max: 15,
    message: 'Creatinine must be between 0.3-15 mg/dL',
  },
  
  // Functional scores
  mobilityScore: {
    required: true,
    min: 0,
    max: 100,
    message: 'Mobility score must be between 0-100',
  },
  
  cognitiveScore: {
    required: true,
    min: 0,
    max: 30,
    message: 'Cognitive score must be between 0-30',
  },
  
  adlScore: {
    required: true,
    min: 0,
    max: 100,
    message: 'ADL score must be between 0-100',
  },
};

// Validate individual field
export function validateField(fieldName: string, value: any): ValidationError | null {
  const rule = ValidationRules[fieldName as keyof typeof ValidationRules];
  
  if (!rule) return null;
  
  // Check if field is required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      type: 'required',
    };
  }
  
  // Skip validation if field is not required and empty
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return null;
  }
  
  // Numeric range validation
  if (typeof rule.min === 'number' && typeof rule.max === 'number') {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < rule.min || numValue > rule.max) {
      return {
        field: fieldName,
        message: rule.message,
        type: 'range',
      };
    }
  }
  
  return null;
}

// Validate blood pressure specifically
export function validateBloodPressure(systolic: number, diastolic: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const systolicRule = ValidationRules.bloodPressure.systolic;
  const diastolicRule = ValidationRules.bloodPressure.diastolic;
  
  if (systolic < systolicRule.min || systolic > systolicRule.max) {
    errors.push({
      field: 'bloodPressure.systolic',
      message: systolicRule.message,
      type: 'range',
    });
  }
  
  if (diastolic < diastolicRule.min || diastolic > diastolicRule.max) {
    errors.push({
      field: 'bloodPressure.diastolic',
      message: diastolicRule.message,
      type: 'range',
    });
  }
  
  // Check if systolic is higher than diastolic
  if (systolic <= diastolic) {
    errors.push({
      field: 'bloodPressure',
      message: 'Systolic pressure must be higher than diastolic pressure',
      type: 'dependency',
    });
  }
  
  return errors;
}

// Validate medical code format
export function validateMedicalCode(code: string, system: string): ValidationError | null {
  if (!code || !system) {
    return {
      field: 'medicalCode',
      message: 'Medical code and system are required',
      type: 'required',
    };
  }
  
  const patterns = {
    'ICD-10': /^[A-Z][0-9]{2}(\.[0-9]{1,4})?$/,
    'CPT': /^[0-9]{5}$/,
    'SNOMED': /^[0-9]{6,18}$/,
    'LOINC': /^[0-9]{4,5}-[0-9]$/,
  };
  
  const pattern = patterns[system as keyof typeof patterns];
  if (pattern && !pattern.test(code)) {
    return {
      field: 'medicalCode',
      message: `Invalid ${system} code format`,
      type: 'format',
    };
  }
  
  return null;
}

// Validate entire form section
export function validateFormSection(sectionName: string, sectionData: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  switch (sectionName) {
    case 'demographics':
      if (!sectionData.age || sectionData.age < 0 || sectionData.age > 120) {
        errors.push({
          field: 'demographics.age',
          message: 'Age must be between 0 and 120 years',
          type: 'range',
        });
      }
      
      if (!sectionData.gender) {
        errors.push({
          field: 'demographics.gender',
          message: 'Gender is required',
          type: 'required',
        });
      }
      break;
      
    case 'clinicalMeasures':
      // Validate vitals
      if (sectionData.vitals) {
        const vitalsErrors = validateVitals(sectionData.vitals);
        errors.push(...vitalsErrors);
      }
      
      // Validate lab values
      if (sectionData.labValues) {
        const labErrors = validateLabValues(sectionData.labValues);
        errors.push(...labErrors);
      }
      break;
      
    case 'medicalHistory':
      if (!sectionData.primaryDiagnosis) {
        errors.push({
          field: 'medicalHistory.primaryDiagnosis',
          message: 'Primary diagnosis is required',
          type: 'required',
        });
      }
      break;
      
    case 'currentAdmission':
      if (!sectionData.admissionType) {
        errors.push({
          field: 'currentAdmission.admissionType',
          message: 'Admission type is required',
          type: 'required',
        });
      }
      
      if (!sectionData.admissionDate) {
        errors.push({
          field: 'currentAdmission.admissionDate',
          message: 'Admission date is required',
          type: 'required',
        });
      }
      break;
  }
  
  return errors;
}

// Validate vitals section
function validateVitals(vitals: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const vitalFields = ['temperature', 'heartRate', 'respiratoryRate', 'oxygenSaturation'];
  
  vitalFields.forEach(field => {
    const error = validateField(field, vitals[field]);
    if (error) errors.push(error);
  });
  
  // Validate blood pressure
  if (vitals.bloodPressure) {
    const bpErrors = validateBloodPressure(
      vitals.bloodPressure.systolic,
      vitals.bloodPressure.diastolic
    );
    errors.push(...bpErrors);
  }
  
  return errors;
}

// Validate lab values section
function validateLabValues(labValues: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const requiredLabFields = ['hemoglobin', 'glucose', 'creatinine'];
  
  requiredLabFields.forEach(field => {
    const error = validateField(field, labValues[field]);
    if (error) errors.push(error);
  });
  
  return errors;
}

// Validate entire form
export function validateForm(formData: PredictionFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate each section
  errors.push(...validateFormSection('demographics', formData.demographics));
  errors.push(...validateFormSection('medicalHistory', formData.medicalHistory));
  errors.push(...validateFormSection('currentAdmission', formData.currentAdmission));
  errors.push(...validateFormSection('clinicalMeasures', formData.clinicalMeasures));
  
  return errors;
}

// Check if form is complete
export function isFormComplete(formData: Partial<PredictionFormData>): boolean {
  return !!(
    formData.demographics?.age &&
    formData.demographics?.gender &&
    formData.medicalHistory?.primaryDiagnosis &&
    formData.currentAdmission?.admissionType &&
    formData.clinicalMeasures?.vitals?.temperature &&
    formData.clinicalMeasures?.vitals?.heartRate &&
    formData.clinicalMeasures?.labValues?.hemoglobin &&
    formData.clinicalMeasures?.labValues?.glucose &&
    formData.clinicalMeasures?.labValues?.creatinine
  );
}

// Get form completion percentage
export function getFormCompletionPercentage(formData: Partial<PredictionFormData>): number {
  const requiredFields = [
    'demographics.age',
    'demographics.gender',
    'medicalHistory.primaryDiagnosis',
    'currentAdmission.admissionType',
    'clinicalMeasures.vitals.temperature',
    'clinicalMeasures.vitals.heartRate',
    'clinicalMeasures.labValues.hemoglobin',
    'clinicalMeasures.labValues.glucose',
    'clinicalMeasures.labValues.creatinine',
  ];
  
  let completedFields = 0;
  
  requiredFields.forEach(fieldPath => {
    const value = getNestedValue(formData, fieldPath);
    if (value !== undefined && value !== null && value !== '') {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / requiredFields.length) * 100);
}

// Helper function to get nested object value
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}