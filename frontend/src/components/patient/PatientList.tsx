import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatients, useBulkOperations } from '../../hooks/usePatients';
import { Patient, PatientSearchFilters } from '../../types/patient';
import { 
  formatPatientName, 
  formatPatientDisplay, 
  calculateAge, 
  formatDate, 
  getRiskScoreColor, 
  getRiskScoreLabel,
  auditPatientAccess
} from '../../utils/hipaa';
import PatientSearch from './PatientSearch';

interface PatientListProps {
  onPatientSelect?: (patient: Patient) => void;
  onPatientEdit?: (patient: Patient) => void;
  className?: string;
}

const PatientList: React.FC<PatientListProps> = ({
  onPatientSelect,
  onPatientEdit,
  className = ""
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSort, setSelectedSort] = useState<{field: keyof Patient, direction: 'asc' | 'desc'}>({
    field: 'lastName',
    direction: 'asc'
  });

  const {
    patients,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
    refetch
  } = usePatients();

  const {
    selectedPatients,
    loading: bulkLoading,
    togglePatient,
    toggleAll,
    clearSelection,
    performBulkOperation
  } = useBulkOperations();

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSortClick = (field: keyof Patient) => {
    const direction = selectedSort.field === field && selectedSort.direction === 'asc' ? 'desc' : 'asc';
    setSelectedSort({ field, direction });
    handleSort(field, direction);
  };

  const handlePatientClick = (patient: Patient) => {
    auditPatientAccess(patient.id, 'current-user', 'view');
    onPatientSelect?.(patient);
  };

  const handleEditClick = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    auditPatientAccess(patient.id, 'current-user', 'edit');
    onPatientEdit?.(patient);
  };

  const renderSortIcon = (field: keyof Patient) => {
    if (selectedSort.field !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return selectedSort.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-lg transition-colors ${
            i === currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-400">
          Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalCount)} of {totalCount} patients
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderMobileCard = (patient: Patient) => {
    const displayPatient = formatPatientDisplay(patient);
    const isSelected = selectedPatients.includes(patient.id);

    return (
      <motion.div
        key={patient.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => handlePatientClick(patient)}
        className={`p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg cursor-pointer transition-all hover:border-blue-500/50 ${
          isSelected ? 'border-blue-500/50 bg-blue-500/10' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                togglePatient(patient.id);
              }}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-white">
                {formatPatientName(patient)}
              </div>
              <div className="text-sm text-gray-400">
                MRN: {patient.mrn}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => handleEditClick(patient, e)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">Age:</span>
            <span className="ml-2 text-white">{calculateAge(patient.dateOfBirth)}</span>
          </div>
          <div>
            <span className="text-gray-400">Gender:</span>
            <span className="ml-2 text-white capitalize">{patient.gender}</span>
          </div>
          <div>
            <span className="text-gray-400">Insurance:</span>
            <span className="ml-2 text-white">{patient.insurance.provider}</span>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <span className={`ml-2 ${patient.isActive ? 'text-green-400' : 'text-red-400'}`}>
              {patient.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        {patient.riskScore && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Risk Score:</span>
              <span className={`text-sm font-medium ${getRiskScoreColor(patient.riskScore)}`}>
                {patient.riskScore}% - {getRiskScoreLabel(patient.riskScore)}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderDesktopTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50">
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedPatients.length === patients.length && patients.length > 0}
                  onChange={() => toggleAll(patients.map(p => p.id))}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSortClick('lastName')}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  Name
                  {renderSortIcon('lastName')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSortClick('mrn')}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  MRN
                  {renderSortIcon('mrn')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSortClick('dateOfBirth')}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  Age
                  {renderSortIcon('dateOfBirth')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSortClick('gender')}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  Gender
                  {renderSortIcon('gender')}
                </button>
              </th>
              <th className="text-left p-4">Insurance</th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSortClick('riskScore')}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  Risk Score
                  {renderSortIcon('riskScore')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSortClick('isActive')}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  Status
                  {renderSortIcon('isActive')}
                </button>
              </th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {patients.map((patient) => {
                const displayPatient = formatPatientDisplay(patient);
                const isSelected = selectedPatients.includes(patient.id);

                return (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    onClick={() => handlePatientClick(patient)}
                    className={`border-b border-gray-700/30 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          togglePatient(patient.id);
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">
                        {formatPatientName(patient)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {displayPatient.email}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{patient.mrn}</td>
                    <td className="p-4 text-gray-300">{calculateAge(patient.dateOfBirth)}</td>
                    <td className="p-4 text-gray-300 capitalize">{patient.gender}</td>
                    <td className="p-4 text-gray-300">{patient.insurance.provider}</td>
                    <td className="p-4">
                      {patient.riskScore && (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getRiskScoreColor(patient.riskScore)}`}>
                            {patient.riskScore}%
                          </span>
                          <span className={`text-xs ${getRiskScoreColor(patient.riskScore)}`}>
                            {getRiskScoreLabel(patient.riskScore)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        patient.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => handleEditClick(patient, e)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-400 text-lg font-medium mb-2">Error Loading Patients</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Patient Management</h1>
        <p className="text-gray-400">Manage patient records with HIPAA-compliant data handling</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <PatientSearch
          onSearchChange={handleSearch}
          onFilterChange={handleFilter}
          onPatientSelect={onPatientSelect}
        />
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedPatients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="text-white">
                {selectedPatients.length} patient{selectedPatients.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => performBulkOperation('activate')}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => performBulkOperation('deactivate')}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => performBulkOperation('export')}
                  disabled={bulkLoading}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient Table/Cards */}
      <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">No patients found</div>
              <div className="text-gray-500">Try adjusting your search or filters</div>
            </div>
          </div>
        ) : isMobile ? (
          <div className="p-4 space-y-4">
            {patients.map(renderMobileCard)}
          </div>
        ) : (
          renderDesktopTable()
        )}
      </div>

      {/* Pagination */}
      {!loading && patients.length > 0 && renderPagination()}
    </div>
  );
};

export default PatientList;