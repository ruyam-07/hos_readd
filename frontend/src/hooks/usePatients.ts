import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Patient, 
  PatientListResponse, 
  PatientSearchFilters, 
  PatientSortOptions, 
  PatientListParams,
  HIPAADisplayOptions 
} from '../types/patient';
import { defaultHIPAAOptions } from '../utils/hipaa';

// Mock API functions - replace with actual API calls
const mockPatientAPI = {
  getPatients: async (params: PatientListParams): Promise<PatientListResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data generation
    const generateMockPatients = (count: number): Patient[] => {
      const patients: Patient[] = [];
      for (let i = 0; i < count; i++) {
        patients.push({
          id: `patient-${i + 1}`,
          mrn: `MRN${String(i + 1).padStart(6, '0')}`,
          firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa'][i % 6],
          lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][i % 6],
          dateOfBirth: `19${50 + (i % 50)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
          gender: ['male', 'female', 'other'][i % 3] as Patient['gender'],
          ssn: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
          phoneNumber: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: `patient${i + 1}@email.com`,
          address: {
            street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
            city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][i % 4],
            state: ['NY', 'CA', 'IL', 'TX'][i % 4],
            zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
            country: 'USA'
          },
          emergencyContact: {
            name: `Contact ${i + 1}`,
            relationship: ['spouse', 'parent', 'sibling', 'child'][i % 4],
            phoneNumber: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
          },
          insurance: {
            provider: ['Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth'][i % 4],
            policyNumber: `POL${String(i + 1).padStart(8, '0')}`,
            effectiveDate: '2023-01-01',
            copay: [20, 30, 40, 50][i % 4],
            deductible: [500, 1000, 1500, 2000][i % 4]
          },
          admissionHistory: [],
          medicalHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: i % 10 !== 0,
          riskScore: Math.floor(Math.random() * 100),
          lastAdmission: i % 5 === 0 ? new Date().toISOString() : undefined
        });
      }
      return patients;
    };

    const allPatients = generateMockPatients(10000);
    let filteredPatients = allPatients;

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredPatients = filteredPatients.filter(patient =>
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm) ||
        patient.mrn.toLowerCase().includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (params.filters) {
      const { gender, ageRange, insuranceProvider, isActive } = params.filters;
      
      if (gender) {
        filteredPatients = filteredPatients.filter(p => p.gender === gender);
      }
      
      if (ageRange) {
        filteredPatients = filteredPatients.filter(p => {
          const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
          return age >= ageRange.min && age <= ageRange.max;
        });
      }
      
      if (insuranceProvider) {
        filteredPatients = filteredPatients.filter(p => 
          p.insurance.provider.toLowerCase().includes(insuranceProvider.toLowerCase())
        );
      }
      
      if (isActive !== undefined) {
        filteredPatients = filteredPatients.filter(p => p.isActive === isActive);
      }
    }

    // Apply sorting
    if (params.sort) {
      filteredPatients.sort((a, b) => {
        const aValue = a[params.sort!.field] as any;
        const bValue = b[params.sort!.field] as any;
        
        if (params.sort!.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

    return {
      patients: paginatedPatients,
      totalCount: filteredPatients.length,
      page,
      limit,
      totalPages: Math.ceil(filteredPatients.length / limit)
    };
  },

  getPatient: async (id: string): Promise<Patient | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock single patient fetch
    return null;
  },

  searchPatients: async (query: string): Promise<Patient[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Mock search suggestions
    return [];
  }
};

export const usePatients = (initialParams: PatientListParams = {}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialParams.page || 1);
  const [searchTerm, setSearchTerm] = useState(initialParams.search || '');
  const [filters, setFilters] = useState<PatientSearchFilters>(initialParams.filters || {});
  const [sortOptions, setSortOptions] = useState<PatientSortOptions>(
    initialParams.sort || { field: 'lastName', direction: 'asc' }
  );
  const [hipaaOptions, setHipaaOptions] = useState<HIPAADisplayOptions>(
    initialParams.hipaaDisplay || defaultHIPAAOptions
  );

  const limit = initialParams.limit || 50;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: PatientListParams = {
        page: currentPage,
        limit,
        search: searchTerm,
        filters,
        sort: sortOptions,
        hipaaDisplay: hipaaOptions
      };

      const response = await mockPatientAPI.getPatients(params);
      
      setPatients(response.patients);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, filters, sortOptions, hipaaOptions]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleFilter = useCallback((newFilters: PatientSearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: keyof Patient, direction: 'asc' | 'desc') => {
    setSortOptions({ field, direction });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleHIPAAOptionsChange = useCallback((options: HIPAADisplayOptions) => {
    setHipaaOptions(options);
  }, []);

  const refetch = useCallback(() => {
    fetchPatients();
  }, [fetchPatients]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({});
    setCurrentPage(1);
  }, []);

  return {
    patients,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    searchTerm,
    filters,
    sortOptions,
    hipaaOptions,
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
    handleHIPAAOptionsChange,
    refetch,
    resetFilters
  };
};

export const usePatientSearch = (debounceMs: number = 300) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchPatients = async () => {
      setLoading(true);
      try {
        const results = await mockPatientAPI.searchPatients(debouncedQuery);
        setSuggestions(results);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    searchPatients();
  }, [debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    loading,
    clearSearch
  };
};

export const usePatient = (id: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await mockPatientAPI.getPatient(id);
      setPatient(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const refetch = useCallback(() => {
    fetchPatient();
  }, [fetchPatient]);

  return {
    patient,
    loading,
    error,
    refetch
  };
};

export const useBulkOperations = () => {
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const togglePatient = useCallback((patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  }, []);

  const toggleAll = useCallback((patientIds: string[]) => {
    setSelectedPatients(prev => 
      prev.length === patientIds.length ? [] : patientIds
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPatients([]);
  }, []);

  const performBulkOperation = useCallback(async (
    operation: 'activate' | 'deactivate' | 'export' | 'delete'
  ) => {
    if (selectedPatients.length === 0) return;

    setLoading(true);
    try {
      // Mock bulk operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Performing ${operation} on patients:`, selectedPatients);
      setSelectedPatients([]);
    } catch (error) {
      console.error('Bulk operation error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPatients]);

  return {
    selectedPatients,
    loading,
    togglePatient,
    toggleAll,
    clearSelection,
    performBulkOperation
  };
};