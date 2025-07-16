import axios from 'axios';
import { PredictionFormData, PredictionResult, MedicalCode } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const predictionAPI = {
  // Generate ML prediction
  async createPrediction(formData: PredictionFormData): Promise<PredictionResult> {
    const response = await apiClient.post('/api/v1/predictions/', formData);
    return response.data;
  },

  // Get prediction by ID
  async getPrediction(id: string): Promise<PredictionResult> {
    const response = await apiClient.get(`/api/v1/predictions/${id}`);
    return response.data;
  },

  // Get patient prediction history
  async getPatientHistory(patientId: string): Promise<PredictionResult[]> {
    const response = await apiClient.get(`/api/v1/predictions/patient/${patientId}`);
    return response.data;
  },

  // Validate form data
  async validateFormData(formData: Partial<PredictionFormData>): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  }> {
    const response = await apiClient.post('/api/v1/predictions/validate', formData);
    return response.data;
  },

  // Get real-time risk assessment
  async getRealTimeRisk(partialData: Partial<PredictionFormData>): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
  }> {
    const response = await apiClient.post('/api/v1/predictions/risk-preview', partialData);
    return response.data;
  },

  // Get model performance metrics
  async getModelPerformance(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  }> {
    const response = await apiClient.get('/api/v1/predictions/models/performance');
    return response.data;
  },
};

export const medicalDataAPI = {
  // Search medical codes
  async searchMedicalCodes(query: string, system?: string): Promise<MedicalCode[]> {
    const params = new URLSearchParams({ query });
    if (system) params.append('system', system);
    
    const response = await apiClient.get(`/api/v1/medical-codes/search?${params}`);
    return response.data;
  },

  // Get medical code details
  async getMedicalCode(code: string, system: string): Promise<MedicalCode> {
    const response = await apiClient.get(`/api/v1/medical-codes/${system}/${code}`);
    return response.data;
  },

  // Get common diagnoses
  async getCommonDiagnoses(): Promise<MedicalCode[]> {
    const response = await apiClient.get('/api/v1/medical-codes/common-diagnoses');
    return response.data;
  },

  // Get medication list
  async getMedications(query?: string): Promise<Array<{ name: string; code: string }>> {
    const params = query ? `?query=${encodeURIComponent(query)}` : '';
    const response = await apiClient.get(`/api/v1/medications${params}`);
    return response.data;
  },
};

export const patientAPI = {
  // Import patient data
  async importPatientData(patientId: string): Promise<Partial<PredictionFormData>> {
    const response = await apiClient.get(`/api/v1/patients/${patientId}/import`);
    return response.data;
  },

  // Search patients
  async searchPatients(query: string): Promise<Array<{
    id: string;
    name: string;
    mrn: string;
    dateOfBirth: string;
  }>> {
    const response = await apiClient.get(`/api/v1/patients/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export const autoSaveAPI = {
  // Save form data
  async saveFormData(sessionId: string, formData: Partial<PredictionFormData>): Promise<void> {
    await apiClient.put(`/api/v1/autosave/${sessionId}`, {
      formData,
      timestamp: new Date().toISOString(),
    });
  },

  // Load form data
  async loadFormData(sessionId: string): Promise<{
    formData: Partial<PredictionFormData>;
    timestamp: string;
  } | null> {
    try {
      const response = await apiClient.get(`/api/v1/autosave/${sessionId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Clear saved data
  async clearSavedData(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/autosave/${sessionId}`);
  },
};

export const systemAPI = {
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Get system info
  async getSystemInfo(): Promise<{
    version: string;
    environment: string;
    models: string[];
  }> {
    const response = await apiClient.get('/');
    return response.data;
  },
};

export default apiClient;