import { Patient, HIPAADisplayOptions } from '../types/patient';

export const defaultHIPAAOptions: HIPAADisplayOptions = {
  maskSSN: true,
  maskPhoneNumber: true,
  maskEmail: true,
  maskAddress: true,
  showFullName: true,
  auditLevel: 'limited'
};

export const maskSSN = (ssn: string): string => {
  if (!ssn) return '';
  return `***-**-${ssn.slice(-4)}`;
};

export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(***) ***-${cleaned.slice(-4)}`;
  }
  return '***-***-****';
};

export const maskEmail = (email: string): string => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (username.length <= 2) return `**@${domain}`;
  return `${username.slice(0, 2)}***@${domain}`;
};

export const maskAddress = (address: string): string => {
  if (!address) return '';
  return `*** ${address.split(' ').slice(-2).join(' ')}`;
};

export const formatPatientName = (
  patient: Patient, 
  options: HIPAADisplayOptions = defaultHIPAAOptions
): string => {
  if (!options.showFullName) {
    return `${patient.firstName.charAt(0)}. ${patient.lastName}`;
  }
  return `${patient.firstName} ${patient.lastName}`;
};

export const formatPatientDisplay = (
  patient: Patient, 
  options: HIPAADisplayOptions = defaultHIPAAOptions
): Partial<Patient> => {
  const displayPatient: Partial<Patient> = { ...patient };

  if (options.maskSSN && displayPatient.ssn) {
    displayPatient.ssn = maskSSN(displayPatient.ssn);
  }

  if (options.maskPhoneNumber && displayPatient.phoneNumber) {
    displayPatient.phoneNumber = maskPhoneNumber(displayPatient.phoneNumber);
  }

  if (options.maskEmail && displayPatient.email) {
    displayPatient.email = maskEmail(displayPatient.email);
  }

  if (options.maskAddress && displayPatient.address) {
    displayPatient.address = {
      ...displayPatient.address,
      street: maskAddress(displayPatient.address.street)
    };
  }

  return displayPatient;
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRiskScoreColor = (score: number): string => {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-blue-400';
  return 'text-green-400';
};

export const getRiskScoreLabel = (score: number): string => {
  if (score >= 80) return 'High Risk';
  if (score >= 60) return 'Medium Risk';
  if (score >= 40) return 'Low Risk';
  return 'Very Low Risk';
};

export const auditPatientAccess = (
  patientId: string, 
  userId: string, 
  action: string,
  auditLevel: HIPAADisplayOptions['auditLevel'] = 'limited'
): void => {
  // In a real application, this would log to a secure audit system
  const auditEntry = {
    timestamp: new Date().toISOString(),
    patientId,
    userId,
    action,
    auditLevel,
    userAgent: navigator.userAgent,
    ipAddress: 'client-side-placeholder' // Would be handled server-side
  };
  
  console.log('HIPAA Audit Log:', auditEntry);
  // Send to secure audit endpoint
};

export const validateHIPAAAccess = (
  userRole: string,
  requestedData: keyof Patient
): boolean => {
  const sensitiveFields: (keyof Patient)[] = ['ssn', 'phoneNumber', 'email', 'address'];
  
  // Basic role-based access control
  if (userRole === 'admin' || userRole === 'physician') {
    return true;
  }
  
  if (userRole === 'nurse' && !sensitiveFields.includes(requestedData)) {
    return true;
  }
  
  if (userRole === 'staff' && !['ssn', 'phoneNumber', 'email'].includes(requestedData)) {
    return true;
  }
  
  return false;
};