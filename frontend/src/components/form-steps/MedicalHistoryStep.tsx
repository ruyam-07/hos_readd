import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FileText, Plus, X, Search, Pill, History, AlertTriangle } from 'lucide-react';
import { PredictionFormData } from '../../types';
import { cn } from '../../utils/helpers';

interface MedicalHistoryStepProps {
  form: UseFormReturn<PredictionFormData>;
}

export const MedicalHistoryStep: React.FC<MedicalHistoryStepProps> = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const medicalHistory = watch('medicalHistory');
  
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [medicationSearch, setMedicationSearch] = useState('');
  const [allergySearch, setAllergySearch] = useState('');
  const [comorbiditySearch, setComorbiditySearch] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Add item to array
  const addToArray = (arrayName: string, item: string) => {
    if (!item.trim()) return;
    
    const currentArray = medicalHistory?.[arrayName as keyof typeof medicalHistory] as string[] || [];
    if (!currentArray.includes(item)) {
      setValue(`medicalHistory.${arrayName}` as any, [...currentArray, item]);
    }
  };

  // Remove item from array
  const removeFromArray = (arrayName: string, index: number) => {
    const currentArray = medicalHistory?.[arrayName as keyof typeof medicalHistory] as string[] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    setValue(`medicalHistory.${arrayName}` as any, newArray);
  };

  // Common diagnoses suggestions
  const commonDiagnoses = [
    'Diabetes mellitus',
    'Hypertension',
    'Coronary artery disease',
    'Chronic kidney disease',
    'COPD',
    'Heart failure',
    'Atrial fibrillation',
    'Stroke',
    'Depression',
    'Anxiety disorder',
  ];

  // Common medications
  const commonMedications = [
    'Metformin',
    'Lisinopril',
    'Atorvastatin',
    'Amlodipine',
    'Omeprazole',
    'Aspirin',
    'Warfarin',
    'Furosemide',
    'Insulin',
    'Levothyroxine',
  ];

  // Common allergies
  const commonAllergies = [
    'Penicillin',
    'Sulfa drugs',
    'Aspirin',
    'Iodine',
    'Latex',
    'Shellfish',
    'Nuts',
    'Eggs',
    'Milk',
    'Wheat',
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Primary Diagnosis */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-400" />
          Primary Diagnosis
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Primary Diagnosis *
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('medicalHistory.primaryDiagnosis', {
                required: 'Primary diagnosis is required',
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all pr-10",
                errors.medicalHistory?.primaryDiagnosis && "border-red-500/50 focus:ring-red-500/50"
              )}
              placeholder="Enter primary diagnosis (e.g., I50.9 - Heart failure)"
              value={diagnosisSearch}
              onChange={(e) => setDiagnosisSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          {errors.medicalHistory?.primaryDiagnosis && (
            <p className="mt-1 text-sm text-red-400">
              {errors.medicalHistory.primaryDiagnosis.message}
            </p>
          )}
          
          {/* Diagnosis Suggestions */}
          {diagnosisSearch && (
            <div className="mt-2 max-h-40 overflow-y-auto bg-white/10 border border-white/20 rounded-lg">
              {commonDiagnoses
                .filter(diag => diag.toLowerCase().includes(diagnosisSearch.toLowerCase()))
                .map((diagnosis, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setValue('medicalHistory.primaryDiagnosis', diagnosis);
                      setDiagnosisSearch(diagnosis);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                  >
                    {diagnosis}
                  </button>
                ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Secondary Diagnoses */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FileText className="w-5 h-5 mr-2 text-green-400" />
          Secondary Diagnoses
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Diagnoses
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={comorbiditySearch}
              onChange={(e) => setComorbiditySearch(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="Enter secondary diagnosis"
            />
            <button
              type="button"
              onClick={() => {
                addToArray('secondaryDiagnoses', comorbiditySearch);
                setComorbiditySearch('');
              }}
              className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 
                       rounded-lg transition-colors border border-blue-500/30"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Secondary Diagnoses List */}
          {medicalHistory?.secondaryDiagnoses?.length > 0 && (
            <div className="mt-3 space-y-2">
              {medicalHistory.secondaryDiagnoses.map((diagnosis, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-white">{diagnosis}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('secondaryDiagnoses', index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Medical History Details */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <History className="w-5 h-5 mr-2 text-purple-400" />
          Medical History Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Previous Admissions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Previous Admissions (Last 12 months)
            </label>
            <input
              type="number"
              {...register('medicalHistory.previousAdmissions', {
                min: { value: 0, message: 'Cannot be negative' },
                max: { value: 50, message: 'Must be less than 50' },
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all",
                errors.medicalHistory?.previousAdmissions && "border-red-500/50 focus:ring-red-500/50"
              )}
              placeholder="0"
            />
            {errors.medicalHistory?.previousAdmissions && (
              <p className="mt-1 text-sm text-red-400">
                {errors.medicalHistory.previousAdmissions.message}
              </p>
            )}
          </div>

          {/* Social History */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Social History
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('medicalHistory.socialHistory.smoking')}
                  className="mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-white">Smoking</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('medicalHistory.socialHistory.alcohol')}
                  className="mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-white">Alcohol use</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('medicalHistory.socialHistory.drugs')}
                  className="mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-white">Recreational drug use</span>
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Medications */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Pill className="w-5 h-5 mr-2 text-green-400" />
          Current Medications
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Medications
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={medicationSearch}
              onChange={(e) => setMedicationSearch(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="Enter medication name"
            />
            <button
              type="button"
              onClick={() => {
                addToArray('medications', medicationSearch);
                setMedicationSearch('');
              }}
              className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 
                       rounded-lg transition-colors border border-green-500/30"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Medication Suggestions */}
          {medicationSearch && (
            <div className="mt-2 max-h-32 overflow-y-auto bg-white/10 border border-white/20 rounded-lg">
              {commonMedications
                .filter(med => med.toLowerCase().includes(medicationSearch.toLowerCase()))
                .map((medication, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      addToArray('medications', medication);
                      setMedicationSearch('');
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                  >
                    {medication}
                  </button>
                ))}
            </div>
          )}
          
          {/* Medications List */}
          {medicalHistory?.medications?.length > 0 && (
            <div className="mt-3 space-y-2">
              {medicalHistory.medications.map((medication, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-white">{medication}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('medications', index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Allergies */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
          Allergies
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Known Allergies
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={allergySearch}
              onChange={(e) => setAllergySearch(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="Enter allergy"
            />
            <button
              type="button"
              onClick={() => {
                addToArray('allergies', allergySearch);
                setAllergySearch('');
              }}
              className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 
                       rounded-lg transition-colors border border-red-500/30"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Allergy Suggestions */}
          {allergySearch && (
            <div className="mt-2 max-h-32 overflow-y-auto bg-white/10 border border-white/20 rounded-lg">
              {commonAllergies
                .filter(allergy => allergy.toLowerCase().includes(allergySearch.toLowerCase()))
                .map((allergy, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      addToArray('allergies', allergy);
                      setAllergySearch('');
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                  >
                    {allergy}
                  </button>
                ))}
            </div>
          )}
          
          {/* Allergies List */}
          {medicalHistory?.allergies?.length > 0 && (
            <div className="mt-3 space-y-2">
              {medicalHistory.allergies.map((allergy, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <span className="text-white">{allergy}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('allergies', index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        variants={itemVariants}
        className="mt-8 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                 rounded-lg border border-blue-500/30"
      >
        <h4 className="text-lg font-semibold text-white mb-2">Medical History Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Primary Diagnosis:</span>
            <span className="text-white ml-2">{medicalHistory?.primaryDiagnosis || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-400">Previous Admissions:</span>
            <span className="text-white ml-2">{medicalHistory?.previousAdmissions || 0}</span>
          </div>
          <div>
            <span className="text-gray-400">Medications:</span>
            <span className="text-white ml-2">{medicalHistory?.medications?.length || 0} listed</span>
          </div>
          <div>
            <span className="text-gray-400">Allergies:</span>
            <span className="text-white ml-2">{medicalHistory?.allergies?.length || 0} listed</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};