import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatientSearch } from '../../hooks/usePatients';
import { Patient, PatientSearchFilters } from '../../types/patient';
import { formatPatientName, calculateAge } from '../../utils/hipaa';

interface PatientSearchProps {
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: PatientSearchFilters) => void;
  onPatientSelect?: (patient: Patient) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
  onSearchChange,
  onFilterChange,
  onPatientSelect,
  placeholder = "Search patients by name, MRN, or email...",
  showFilters = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<PatientSearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { query, setQuery, suggestions, loading } = usePatientSearch();

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearchChange(value);
    setIsOpen(value.length > 0);
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSuggestionClick = (patient: Patient) => {
    setQuery(formatPatientName(patient));
    setIsOpen(false);
    onPatientSelect?.(patient);
  };

  const handleFilterChange = (key: keyof PatientSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: PatientSearchFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                onSearchChange('');
                setIsOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        <AnimatePresence>
          {isOpen && suggestions.length > 0 && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl max-h-60 overflow-y-auto"
            >
              {suggestions.map((patient) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  onClick={() => handleSuggestionClick(patient)}
                  className="px-4 py-3 cursor-pointer border-b border-gray-700/30 last:border-b-0 hover:bg-blue-500/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {formatPatientName(patient)}
                      </div>
                      <div className="text-sm text-gray-400">
                        MRN: {patient.mrn} • Age: {calculateAge(patient.dateOfBirth)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {patient.gender}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Toggle Button */}
      {showFilters && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={filters.gender || ''}
                  onChange={(e) => handleFilterChange('gender', e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              {/* Age Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.ageRange?.min || ''}
                    onChange={(e) => handleFilterChange('ageRange', {
                      ...filters.ageRange,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.ageRange?.max || ''}
                    onChange={(e) => handleFilterChange('ageRange', {
                      ...filters.ageRange,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
              </div>

              {/* Insurance Provider Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  placeholder="Provider name"
                  value={filters.insuranceProvider || ''}
                  onChange={(e) => handleFilterChange('insuranceProvider', e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleFilterChange('isActive', 
                    e.target.value === '' ? undefined : e.target.value === 'active'
                  )}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admission Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.admissionDateRange?.start || ''}
                    onChange={(e) => handleFilterChange('admissionDateRange', {
                      ...filters.admissionDateRange,
                      start: e.target.value || undefined
                    })}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                  <input
                    type="date"
                    value={filters.admissionDateRange?.end || ''}
                    onChange={(e) => handleFilterChange('admissionDateRange', {
                      ...filters.admissionDateRange,
                      end: e.target.value || undefined
                    })}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
              </div>

              {/* Risk Score Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Risk Score Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={filters.riskScoreRange?.min || ''}
                    onChange={(e) => handleFilterChange('riskScoreRange', {
                      ...filters.riskScoreRange,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={filters.riskScoreRange?.max || ''}
                    onChange={(e) => handleFilterChange('riskScoreRange', {
                      ...filters.riskScoreRange,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientSearch;