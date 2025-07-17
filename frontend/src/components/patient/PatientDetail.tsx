import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Patient, Admission, MedicalHistory } from '../../types/patient';
import { 
  formatPatientName, 
  formatPatientDisplay, 
  calculateAge, 
  formatDate, 
  formatDateTime,
  getRiskScoreColor, 
  getRiskScoreLabel,
  auditPatientAccess,
  defaultHIPAAOptions
} from '../../utils/hipaa';

interface PatientDetailProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onClose?: () => void;
  className?: string;
}

const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  onEdit,
  onClose,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'admissions' | 'insurance'>('overview');
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayPatient = formatPatientDisplay(patient, {
    ...defaultHIPAAOptions,
    maskSSN: !showSensitiveInfo,
    maskPhoneNumber: !showSensitiveInfo,
    maskEmail: !showSensitiveInfo,
    maskAddress: !showSensitiveInfo
  });

  useEffect(() => {
    // Audit patient access
    auditPatientAccess(patient.id, 'current-user', 'view-detail');
  }, [patient.id]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'medical', label: 'Medical History', icon: '🏥' },
    { id: 'admissions', label: 'Admissions', icon: '📋' },
    { id: 'insurance', label: 'Insurance', icon: '💳' }
  ];

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {formatPatientName(patient)}
          </h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span>MRN: {patient.mrn}</span>
            <span>Age: {calculateAge(patient.dateOfBirth)}</span>
            <span className="capitalize">{patient.gender}</span>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              patient.isActive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {patient.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            showSensitiveInfo 
              ? 'bg-yellow-500/20 text-yellow-400' 
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
          }`}
          title="Toggle sensitive information visibility"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSensitiveInfo ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.536 8.464M14.122 14.122a3 3 0 01-4.243-.007m4.243.007l1.414 1.414M14.122 14.122L12.709 12.709"} />
          </svg>
          PHI
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(patient)}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="flex border-b border-gray-700/50 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === tab.id
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Risk Score */}
      {patient.riskScore && (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Risk Assessment</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getRiskScoreColor(patient.riskScore).replace('text-', 'bg-')}`}></div>
              <span className={`font-medium ${getRiskScoreColor(patient.riskScore)}`}>
                {patient.riskScore}% - {getRiskScoreLabel(patient.riskScore)}
              </span>
            </div>
          </div>
          <div className="mt-3 bg-gray-700/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                patient.riskScore >= 80 ? 'bg-red-500' :
                patient.riskScore >= 60 ? 'bg-yellow-500' :
                patient.riskScore >= 40 ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ width: `${patient.riskScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Date of Birth:</span>
              <span className="text-white">{formatDate(patient.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gender:</span>
              <span className="text-white capitalize">{patient.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">SSN:</span>
              <span className="text-white">{displayPatient.ssn || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phone:</span>
              <span className="text-white">{displayPatient.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{displayPatient.email || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Address</h3>
          <div className="space-y-2 text-white">
            <div>{displayPatient.address?.street}</div>
            <div>{displayPatient.address?.city}, {displayPatient.address?.state} {displayPatient.address?.zipCode}</div>
            <div>{displayPatient.address?.country}</div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-white">{patient.emergencyContact.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Relationship:</span>
              <span className="text-white capitalize">{patient.emergencyContact.relationship}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Phone:</span>
              <span className="text-white">{patient.emergencyContact.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{patient.emergencyContact.email || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span className="text-white">{formatDateTime(patient.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Updated:</span>
              <span className="text-white">{formatDateTime(patient.updatedAt)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Last Admission:</span>
              <span className="text-white">
                {patient.lastAdmission ? formatDateTime(patient.lastAdmission) : 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={patient.isActive ? 'text-green-400' : 'text-red-400'}>
                {patient.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Medical History</h3>
        <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
          Add Condition
        </button>
      </div>
      
      {patient.medicalHistory.length === 0 ? (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 text-center">
          <div className="text-gray-400 mb-2">No medical history recorded</div>
          <div className="text-gray-500 text-sm">Add conditions to track patient's medical history</div>
        </div>
      ) : (
        <div className="space-y-3">
          {patient.medicalHistory.map((condition) => (
            <motion.div
              key={condition.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{condition.condition}</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    condition.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    condition.status === 'resolved' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {condition.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    condition.severity === 'severe' ? 'bg-red-500/20 text-red-400' :
                    condition.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {condition.severity}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400 mb-2">
                Diagnosed: {formatDate(condition.diagnosisDate)}
              </div>
              {condition.notes && (
                <div className="text-sm text-gray-300 bg-gray-700/50 rounded p-2">
                  {condition.notes}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAdmissions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Admission History</h3>
        <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
          Add Admission
        </button>
      </div>
      
      {patient.admissionHistory.length === 0 ? (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 text-center">
          <div className="text-gray-400 mb-2">No admissions recorded</div>
          <div className="text-gray-500 text-sm">Patient admission history will appear here</div>
        </div>
      ) : (
        <div className="space-y-3">
          {patient.admissionHistory.map((admission) => (
            <motion.div
              key={admission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{admission.reason}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  admission.outcome === 'discharged' ? 'bg-green-500/20 text-green-400' :
                  admission.outcome === 'transferred' ? 'bg-blue-500/20 text-blue-400' :
                  admission.outcome === 'deceased' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {admission.outcome}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Department:</span>
                    <span className="text-white">{admission.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Physician:</span>
                    <span className="text-white">{admission.physician}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Length:</span>
                    <span className="text-white">{admission.length} days</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Admitted:</span>
                    <span className="text-white">{formatDate(admission.admissionDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Discharged:</span>
                    <span className="text-white">
                      {admission.dischargeDate ? formatDate(admission.dischargeDate) : 'Ongoing'}
                    </span>
                  </div>
                  {admission.cost && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-white">${admission.cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {admission.diagnosisCodes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-2">Diagnosis Codes:</div>
                  <div className="flex flex-wrap gap-1">
                    {admission.diagnosisCodes.map((code, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInsurance = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Insurance Information</h3>
          <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
            Update Insurance
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Provider:</span>
              <span className="text-white">{patient.insurance.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Policy Number:</span>
              <span className="text-white">{patient.insurance.policyNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Group Number:</span>
              <span className="text-white">{patient.insurance.groupNumber || 'Not provided'}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Effective Date:</span>
              <span className="text-white">{formatDate(patient.insurance.effectiveDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expiration Date:</span>
              <span className="text-white">
                {patient.insurance.expirationDate ? formatDate(patient.insurance.expirationDate) : 'Not specified'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Copay:</span>
              <span className="text-white">${patient.insurance.copay || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Deductible:</span>
              <span className="text-white">${patient.insurance.deductible || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'medical':
        return renderMedicalHistory();
      case 'admissions':
        return renderAdmissions();
      case 'insurance':
        return renderInsurance();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`${className}`}>
      <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
        {renderHeader()}
        {renderTabs()}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientDetail;