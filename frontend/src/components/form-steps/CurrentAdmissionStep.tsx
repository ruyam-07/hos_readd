import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Building, Clock, User, Calendar, Plus, X, FileText } from 'lucide-react';
import { PredictionFormData } from '../../types';
import { cn } from '../../utils/helpers';

interface CurrentAdmissionStepProps {
  form: UseFormReturn<PredictionFormData>;
}

export const CurrentAdmissionStep: React.FC<CurrentAdmissionStepProps> = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const currentAdmission = watch('currentAdmission');
  
  const [procedureSearch, setProcedureSearch] = useState('');
  const [complicationSearch, setComplicationSearch] = useState('');
  const [medicationSearch, setMedicationSearch] = useState('');

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
    
    const currentArray = currentAdmission?.[arrayName as keyof typeof currentAdmission] as string[] || [];
    if (!currentArray.includes(item)) {
      setValue(`currentAdmission.${arrayName}` as any, [...currentArray, item]);
    }
  };

  // Remove item from array
  const removeFromArray = (arrayName: string, index: number) => {
    const currentArray = currentAdmission?.[arrayName as keyof typeof currentAdmission] as string[] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    setValue(`currentAdmission.${arrayName}` as any, newArray);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Admission Details */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Building className="w-5 h-5 mr-2 text-blue-400" />
          Admission Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Admission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admission Type *
            </label>
            <select
              {...register('currentAdmission.admissionType', {
                required: 'Admission type is required',
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all",
                errors.currentAdmission?.admissionType && "border-red-500/50 focus:ring-red-500/50"
              )}
            >
              <option value="">Select admission type</option>
              <option value="emergency">Emergency</option>
              <option value="urgent">Urgent</option>
              <option value="elective">Elective</option>
            </select>
            {errors.currentAdmission?.admissionType && (
              <p className="mt-1 text-sm text-red-400">
                {errors.currentAdmission.admissionType.message}
              </p>
            )}
          </div>

          {/* Admission Source */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admission Source
            </label>
            <select
              {...register('currentAdmission.admissionSource')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
            >
              <option value="">Select admission source</option>
              <option value="emergency_room">Emergency Room</option>
              <option value="physician_referral">Physician Referral</option>
              <option value="clinic_referral">Clinic Referral</option>
              <option value="transfer">Transfer from Another Hospital</option>
              <option value="home">Home</option>
              <option value="nursing_home">Nursing Home</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Admission Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admission Date
            </label>
            <input
              type="date"
              {...register('currentAdmission.admissionDate')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
            />
          </div>

          {/* Length of Stay */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Length of Stay (days)
            </label>
            <input
              type="number"
              {...register('currentAdmission.lengthOfStay', {
                min: { value: 0, message: 'Cannot be negative' },
                max: { value: 365, message: 'Must be less than 365 days' },
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all",
                errors.currentAdmission?.lengthOfStay && "border-red-500/50 focus:ring-red-500/50"
              )}
              placeholder="0"
            />
            {errors.currentAdmission?.lengthOfStay && (
              <p className="mt-1 text-sm text-red-400">
                {errors.currentAdmission.lengthOfStay.message}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hospital Details */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <User className="w-5 h-5 mr-2 text-green-400" />
          Hospital Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Department
            </label>
            <select
              {...register('currentAdmission.department')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
            >
              <option value="">Select department</option>
              <option value="cardiology">Cardiology</option>
              <option value="pulmonology">Pulmonology</option>
              <option value="nephrology">Nephrology</option>
              <option value="gastroenterology">Gastroenterology</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="oncology">Oncology</option>
              <option value="general_medicine">General Medicine</option>
              <option value="surgery">Surgery</option>
              <option value="icu">ICU</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Attending Physician */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attending Physician
            </label>
            <input
              type="text"
              {...register('currentAdmission.attendingPhysician')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="Dr. Smith"
            />
          </div>

          {/* Discharge Disposition */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Discharge Disposition
            </label>
            <select
              {...register('currentAdmission.dischargeDisposition')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
            >
              <option value="">Select discharge disposition</option>
              <option value="home">Home</option>
              <option value="home_health">Home with Health Services</option>
              <option value="skilled_nursing">Skilled Nursing Facility</option>
              <option value="rehabilitation">Rehabilitation Facility</option>
              <option value="long_term_care">Long Term Care</option>
              <option value="transfer">Transfer to Another Hospital</option>
              <option value="hospice">Hospice</option>
              <option value="expired">Expired</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Procedures */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FileText className="w-5 h-5 mr-2 text-purple-400" />
          Procedures
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Procedures Performed
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={procedureSearch}
              onChange={(e) => setProcedureSearch(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="Enter procedure name"
            />
            <button
              type="button"
              onClick={() => {
                addToArray('procedures', procedureSearch);
                setProcedureSearch('');
              }}
              className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 
                       rounded-lg transition-colors border border-purple-500/30"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Procedures List */}
          {currentAdmission?.procedures?.length > 0 && (
            <div className="mt-3 space-y-2">
              {currentAdmission.procedures.map((procedure, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-white">{procedure}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('procedures', index)}
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

      {/* Complications */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-orange-400" />
          Complications
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Complications During Stay
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={complicationSearch}
              onChange={(e) => setComplicationSearch(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="Enter complication"
            />
            <button
              type="button"
              onClick={() => {
                addToArray('complications', complicationSearch);
                setComplicationSearch('');
              }}
              className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 
                       rounded-lg transition-colors border border-orange-500/30"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Complications List */}
          {currentAdmission?.complications?.length > 0 && (
            <div className="mt-3 space-y-2">
              {currentAdmission.complications.map((complication, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg border border-orange-500/20"
                >
                  <span className="text-white">{complication}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('complications', index)}
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

      {/* Current Medications */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-400" />
          Current Medications
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Medications During This Admission
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
                addToArray('currentMedications', medicationSearch);
                setMedicationSearch('');
              }}
              className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 
                       rounded-lg transition-colors border border-green-500/30"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Current Medications List */}
          {currentAdmission?.currentMedications?.length > 0 && (
            <div className="mt-3 space-y-2">
              {currentAdmission.currentMedications.map((medication, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-white">{medication}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('currentMedications', index)}
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
        <h4 className="text-lg font-semibold text-white mb-2">Admission Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Admission Type:</span>
            <span className="text-white ml-2 capitalize">{currentAdmission?.admissionType || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-400">Length of Stay:</span>
            <span className="text-white ml-2">{currentAdmission?.lengthOfStay || 0} days</span>
          </div>
          <div>
            <span className="text-gray-400">Department:</span>
            <span className="text-white ml-2 capitalize">{currentAdmission?.department || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-400">Procedures:</span>
            <span className="text-white ml-2">{currentAdmission?.procedures?.length || 0} listed</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};