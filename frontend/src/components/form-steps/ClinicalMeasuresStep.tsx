import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Activity, Droplets, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { PredictionFormData } from '../../types';
import { cn, isInNormalRange, getNormalRangeStatus } from '../../utils/helpers';

interface ClinicalMeasuresStepProps {
  form: UseFormReturn<PredictionFormData>;
}

// Normal ranges for various clinical measures
const normalRanges = {
  temperature: { min: 97.0, max: 99.5 },
  heartRate: { min: 60, max: 100 },
  systolicBP: { min: 90, max: 140 },
  diastolicBP: { min: 60, max: 90 },
  respiratoryRate: { min: 12, max: 20 },
  oxygenSaturation: { min: 95, max: 100 },
  hemoglobin: { min: 12.0, max: 16.0 },
  hematocrit: { min: 36, max: 46 },
  glucose: { min: 70, max: 140 },
  creatinine: { min: 0.6, max: 1.2 },
  sodium: { min: 136, max: 146 },
  potassium: { min: 3.5, max: 5.0 },
};

export const ClinicalMeasuresStep: React.FC<ClinicalMeasuresStepProps> = ({ form }) => {
  const { register, formState: { errors }, watch } = form;
  const clinicalMeasures = watch('clinicalMeasures');

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

  // Component for input field with normal range indicator
  const RangeInput = ({ 
    label, 
    name, 
    unit, 
    normalRange, 
    placeholder, 
    value, 
    error 
  }: {
    label: string;
    name: string;
    unit: string;
    normalRange: { min: number; max: number };
    placeholder: string;
    value: number;
    error?: any;
  }) => {
    const status = value ? getNormalRangeStatus(value, normalRange) : 'normal';
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} ({unit})
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            {...register(name, {
              required: `${label} is required`,
              min: { value: 0, message: 'Must be positive' },
            })}
            className={cn(
              "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg pr-10",
              "text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
              "backdrop-blur-sm transition-all",
              error && "border-red-500/50 focus:ring-red-500/50",
              status === 'high' && "border-red-400/50",
              status === 'low' && "border-yellow-400/50",
              status === 'normal' && "border-green-400/50"
            )}
            placeholder={placeholder}
          />
          {value && (
            <div className="absolute right-3 top-3">
              {status === 'normal' && <CheckCircle className="w-5 h-5 text-green-400" />}
              {status === 'high' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {status === 'low' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
            </div>
          )}
        </div>
        <div className="mt-1 text-xs text-gray-400">
          Normal range: {normalRange.min} - {normalRange.max} {unit}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400">
            {error.message}
          </p>
        )}
        {value && status !== 'normal' && (
          <p className={cn(
            "mt-1 text-sm",
            status === 'high' && "text-red-400",
            status === 'low' && "text-yellow-400"
          )}>
            {status === 'high' && '⚠️ Above normal range'}
            {status === 'low' && '⚠️ Below normal range'}
          </p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Vital Signs */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-red-400" />
          Vital Signs
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RangeInput
            label="Temperature"
            name="clinicalMeasures.vitals.temperature"
            unit="°F"
            normalRange={normalRanges.temperature}
            placeholder="98.6"
            value={clinicalMeasures?.vitals?.temperature}
            error={errors.clinicalMeasures?.vitals?.temperature}
          />
          
          <RangeInput
            label="Heart Rate"
            name="clinicalMeasures.vitals.heartRate"
            unit="bpm"
            normalRange={normalRanges.heartRate}
            placeholder="72"
            value={clinicalMeasures?.vitals?.heartRate}
            error={errors.clinicalMeasures?.vitals?.heartRate}
          />
          
          <RangeInput
            label="Respiratory Rate"
            name="clinicalMeasures.vitals.respiratoryRate"
            unit="breaths/min"
            normalRange={normalRanges.respiratoryRate}
            placeholder="16"
            value={clinicalMeasures?.vitals?.respiratoryRate}
            error={errors.clinicalMeasures?.vitals?.respiratoryRate}
          />
          
          <RangeInput
            label="Oxygen Saturation"
            name="clinicalMeasures.vitals.oxygenSaturation"
            unit="%"
            normalRange={normalRanges.oxygenSaturation}
            placeholder="98"
            value={clinicalMeasures?.vitals?.oxygenSaturation}
            error={errors.clinicalMeasures?.vitals?.oxygenSaturation}
          />
        </div>

        {/* Blood Pressure */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Blood Pressure
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RangeInput
              label="Systolic"
              name="clinicalMeasures.vitals.bloodPressure.systolic"
              unit="mmHg"
              normalRange={normalRanges.systolicBP}
              placeholder="120"
              value={clinicalMeasures?.vitals?.bloodPressure?.systolic}
              error={errors.clinicalMeasures?.vitals?.bloodPressure?.systolic}
            />
            
            <RangeInput
              label="Diastolic"
              name="clinicalMeasures.vitals.bloodPressure.diastolic"
              unit="mmHg"
              normalRange={normalRanges.diastolicBP}
              placeholder="80"
              value={clinicalMeasures?.vitals?.bloodPressure?.diastolic}
              error={errors.clinicalMeasures?.vitals?.bloodPressure?.diastolic}
            />
          </div>
        </div>
      </motion.div>

      {/* Laboratory Values */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Droplets className="w-5 h-5 mr-2 text-blue-400" />
          Laboratory Values
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RangeInput
            label="Hemoglobin"
            name="clinicalMeasures.labValues.hemoglobin"
            unit="g/dL"
            normalRange={normalRanges.hemoglobin}
            placeholder="14.0"
            value={clinicalMeasures?.labValues?.hemoglobin}
            error={errors.clinicalMeasures?.labValues?.hemoglobin}
          />
          
          <RangeInput
            label="Hematocrit"
            name="clinicalMeasures.labValues.hematocrit"
            unit="%"
            normalRange={normalRanges.hematocrit}
            placeholder="42"
            value={clinicalMeasures?.labValues?.hematocrit}
            error={errors.clinicalMeasures?.labValues?.hematocrit}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              White Blood Cells (K/μL)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('clinicalMeasures.labValues.whiteBloodCells', {
                min: { value: 0, message: 'Must be positive' },
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="7.5"
            />
            <div className="mt-1 text-xs text-gray-400">
              Normal range: 4.5 - 11.0 K/μL
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platelets (K/μL)
            </label>
            <input
              type="number"
              {...register('clinicalMeasures.labValues.platelets', {
                min: { value: 0, message: 'Must be positive' },
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="250"
            />
            <div className="mt-1 text-xs text-gray-400">
              Normal range: 150 - 450 K/μL
            </div>
          </div>
          
          <RangeInput
            label="Sodium"
            name="clinicalMeasures.labValues.sodium"
            unit="mEq/L"
            normalRange={normalRanges.sodium}
            placeholder="140"
            value={clinicalMeasures?.labValues?.sodium}
            error={errors.clinicalMeasures?.labValues?.sodium}
          />
          
          <RangeInput
            label="Potassium"
            name="clinicalMeasures.labValues.potassium"
            unit="mEq/L"
            normalRange={normalRanges.potassium}
            placeholder="4.0"
            value={clinicalMeasures?.labValues?.potassium}
            error={errors.clinicalMeasures?.labValues?.potassium}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chloride (mEq/L)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('clinicalMeasures.labValues.chloride', {
                min: { value: 0, message: 'Must be positive' },
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="102"
            />
            <div className="mt-1 text-xs text-gray-400">
              Normal range: 98 - 107 mEq/L
            </div>
          </div>
          
          <RangeInput
            label="Glucose"
            name="clinicalMeasures.labValues.glucose"
            unit="mg/dL"
            normalRange={normalRanges.glucose}
            placeholder="100"
            value={clinicalMeasures?.labValues?.glucose}
            error={errors.clinicalMeasures?.labValues?.glucose}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              BUN (mg/dL)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('clinicalMeasures.labValues.bun', {
                min: { value: 0, message: 'Must be positive' },
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="15"
            />
            <div className="mt-1 text-xs text-gray-400">
              Normal range: 7 - 20 mg/dL
            </div>
          </div>
          
          <RangeInput
            label="Creatinine"
            name="clinicalMeasures.labValues.creatinine"
            unit="mg/dL"
            normalRange={normalRanges.creatinine}
            placeholder="1.0"
            value={clinicalMeasures?.labValues?.creatinine}
            error={errors.clinicalMeasures?.labValues?.creatinine}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Albumin (g/dL)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('clinicalMeasures.labValues.albumin', {
                min: { value: 0, message: 'Must be positive' },
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="4.0"
            />
            <div className="mt-1 text-xs text-gray-400">
              Normal range: 3.5 - 5.0 g/dL
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bilirubin (mg/dL)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('clinicalMeasures.labValues.bilirubin', {
                min: { value: 0, message: 'Must be positive' },
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="1.0"
            />
            <div className="mt-1 text-xs text-gray-400">
              Normal range: 0.3 - 1.2 mg/dL
            </div>
          </div>
        </div>
      </motion.div>

      {/* Functional Status */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          Functional Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mobility Score (0-100)
            </label>
            <input
              type="number"
              {...register('clinicalMeasures.functionalStatus.mobilityScore', {
                min: { value: 0, message: 'Must be at least 0' },
                max: { value: 100, message: 'Must be at most 100' },
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all",
                errors.clinicalMeasures?.functionalStatus?.mobilityScore && "border-red-500/50 focus:ring-red-500/50"
              )}
              placeholder="80"
            />
            <div className="mt-1 text-xs text-gray-400">
              100 = Fully independent
            </div>
            {errors.clinicalMeasures?.functionalStatus?.mobilityScore && (
              <p className="mt-1 text-sm text-red-400">
                {errors.clinicalMeasures.functionalStatus.mobilityScore.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cognitive Score (0-30)
            </label>
            <input
              type="number"
              {...register('clinicalMeasures.functionalStatus.cognitiveScore', {
                min: { value: 0, message: 'Must be at least 0' },
                max: { value: 30, message: 'Must be at most 30' },
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all",
                errors.clinicalMeasures?.functionalStatus?.cognitiveScore && "border-red-500/50 focus:ring-red-500/50"
              )}
              placeholder="25"
            />
            <div className="mt-1 text-xs text-gray-400">
              30 = Normal cognitive function
            </div>
            {errors.clinicalMeasures?.functionalStatus?.cognitiveScore && (
              <p className="mt-1 text-sm text-red-400">
                {errors.clinicalMeasures.functionalStatus.cognitiveScore.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ADL Score (0-100)
            </label>
            <input
              type="number"
              {...register('clinicalMeasures.functionalStatus.adlScore', {
                min: { value: 0, message: 'Must be at least 0' },
                max: { value: 100, message: 'Must be at most 100' },
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all",
                errors.clinicalMeasures?.functionalStatus?.adlScore && "border-red-500/50 focus:ring-red-500/50"
              )}
              placeholder="90"
            />
            <div className="mt-1 text-xs text-gray-400">
              100 = Fully independent in ADLs
            </div>
            {errors.clinicalMeasures?.functionalStatus?.adlScore && (
              <p className="mt-1 text-sm text-red-400">
                {errors.clinicalMeasures.functionalStatus.adlScore.message}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        variants={itemVariants}
        className="mt-8 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                 rounded-lg border border-blue-500/30"
      >
        <h4 className="text-lg font-semibold text-white mb-2">Clinical Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Vital Signs:</span>
            <span className="text-white ml-2">
              {clinicalMeasures?.vitals?.temperature ? 'Complete' : 'Incomplete'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Lab Values:</span>
            <span className="text-white ml-2">
              {clinicalMeasures?.labValues?.hemoglobin ? 'Complete' : 'Incomplete'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Functional Status:</span>
            <span className="text-white ml-2">
              {clinicalMeasures?.functionalStatus?.mobilityScore ? 'Complete' : 'Incomplete'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Overall Status:</span>
            <span className="text-white ml-2">
              {clinicalMeasures?.vitals?.temperature && 
               clinicalMeasures?.labValues?.hemoglobin && 
               clinicalMeasures?.functionalStatus?.mobilityScore ? 'Ready for analysis' : 'Needs completion'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};