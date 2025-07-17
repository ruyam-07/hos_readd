export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  ssn?: string; // PHI - Protected Health Information
  phoneNumber?: string;
  email?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  insurance: Insurance;
  admissionHistory: Admission[];
  medicalHistory: MedicalHistory[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  riskScore?: number;
  lastAdmission?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: string;
  expirationDate?: string;
  copay?: number;
  deductible?: number;
}

export interface Admission {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  reason: string;
  department: string;
  physician: string;
  diagnosisCodes: string[];
  length: number; // in days
  cost?: number;
  outcome: 'discharged' | 'transferred' | 'deceased' | 'ongoing';
}

export interface MedicalHistory {
  id: string;
  condition: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'chronic';
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface PatientListResponse {
  patients: Patient[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientSearchFilters {
  query?: string;
  gender?: Patient['gender'];
  ageRange?: {
    min: number;
    max: number;
  };
  insuranceProvider?: string;
  admissionDateRange?: {
    start: string;
    end: string;
  };
  riskScoreRange?: {
    min: number;
    max: number;
  };
  isActive?: boolean;
}

export interface PatientSortOptions {
  field: keyof Patient;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Patient['gender'];
  ssn?: string;
  phoneNumber?: string;
  email?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  insurance: Insurance;
}

export interface PatientSearchSuggestion {
  id: string;
  text: string;
  type: 'name' | 'mrn' | 'phone' | 'email';
  patient: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'mrn'>;
}

export interface BulkOperation {
  action: 'activate' | 'deactivate' | 'export' | 'delete';
  patientIds: string[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  fields: (keyof Patient)[];
  includeHistory: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// HIPAA-compliant display options
export interface HIPAADisplayOptions {
  maskSSN: boolean;
  maskPhoneNumber: boolean;
  maskEmail: boolean;
  maskAddress: boolean;
  showFullName: boolean;
  auditLevel: 'full' | 'limited' | 'minimal';
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: PatientSearchFilters;
  sort?: PatientSortOptions;
  hipaaDisplay?: HIPAADisplayOptions;
}