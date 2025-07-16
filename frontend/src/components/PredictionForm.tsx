import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePredictionForm } from '../hooks/usePredictionForm';
import { DemographicsStep } from './form-steps/DemographicsStep';
import { MedicalHistoryStep } from './form-steps/MedicalHistoryStep';
import { CurrentAdmissionStep } from './form-steps/CurrentAdmissionStep';
import { ClinicalMeasuresStep } from './form-steps/ClinicalMeasuresStep';
import { cn } from '../utils/helpers';

const FORM_STEPS = [
  {
    id: 'demographics',
    title: 'Patient Demographics',
    description: 'Basic patient information and demographics',
    component: DemographicsStep,
    icon: '👤',
  },
  {
    id: 'medicalHistory',
    title: 'Medical History',
    description: 'Past medical history and chronic conditions',
    component: MedicalHistoryStep,
    icon: '📋',
  },
  {
    id: 'currentAdmission',
    title: 'Current Admission',
    description: 'Current hospital admission details',
    component: CurrentAdmissionStep,
    icon: '🏥',
  },
  {
    id: 'clinicalMeasures',
    title: 'Clinical Measures',
    description: 'Vital signs, lab values, and functional assessments',
    component: ClinicalMeasuresStep,
    icon: '📊',
  },
];

interface PredictionFormProps {
  onPredictionComplete?: (result: any) => void;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onPredictionComplete }) => {
  const {
    form,
    uiState,
    predictionResult,
    validationErrors,
    completionPercentage,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    resetForm,
    importPatientData,
    isStepValid,
    getStepErrors,
  } = usePredictionForm();

  const currentStepData = FORM_STEPS[currentStep];
  const CurrentStepComponent = currentStepData.component;

  const handleSubmit = async () => {
    await submitForm();
    if (predictionResult && onPredictionComplete) {
      onPredictionComplete(predictionResult);
    }
  };

  const handleImportPatient = async () => {
    const patientId = prompt('Enter Patient ID:');
    if (patientId) {
      await importPatientData(patientId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hospital Readmission Prediction
          </h1>
          <p className="text-gray-300">
            Complete the form to generate ML-powered readmission risk assessment
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {completionPercentage}% Complete
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-2 mb-6">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between">
            {FORM_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg transition-all",
                  "hover:bg-white/10 border border-transparent",
                  index === currentStep && "bg-white/10 border-blue-500/50",
                  index < currentStep && "text-green-400",
                  index === currentStep && "text-blue-400",
                  index > currentStep && "text-gray-500"
                )}
              >
                <div className={cn(
                  "text-2xl mb-2 p-2 rounded-full",
                  index === currentStep && "bg-blue-500/20",
                  index < currentStep && "bg-green-500/20"
                )}>
                  {index < currentStep ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Auto-save Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {uiState.autoSaveStatus === 'saving' && (
                <div className="flex items-center text-yellow-400">
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              {uiState.autoSaveStatus === 'saved' && (
                <div className="flex items-center text-green-400">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
              {uiState.autoSaveStatus === 'error' && (
                <div className="flex items-center text-red-400">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Save failed</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleImportPatient}
              className="flex items-center px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 
                       text-purple-400 rounded-lg transition-colors border border-purple-500/30"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Patient
            </button>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-gray-300">
                  {currentStepData.description}
                </p>
              </div>

              {/* Step Errors */}
              {getStepErrors(currentStep).length > 0 && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-red-400 font-medium">Please fix the following errors:</span>
                  </div>
                  <ul className="text-red-300 text-sm space-y-1">
                    {getStepErrors(currentStep).map((error, index) => (
                      <li key={index}>• {error.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Form Step Component */}
              <CurrentStepComponent form={form} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center px-6 py-3 rounded-lg font-medium transition-all",
                "border border-gray-600 hover:border-gray-500",
                currentStep === 0 
                  ? "text-gray-500 cursor-not-allowed" 
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              )}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            <div className="flex space-x-4">
              <button
                onClick={resetForm}
                className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 
                         hover:border-gray-500 rounded-lg font-medium transition-all"
              >
                Reset
              </button>

              {currentStep === totalSteps - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={uiState.isSubmitting || !isStepValid(currentStep)}
                  className={cn(
                    "flex items-center px-6 py-3 rounded-lg font-medium transition-all",
                    "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
                    "text-white shadow-lg",
                    (uiState.isSubmitting || !isStepValid(currentStep)) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {uiState.isSubmitting ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Generate Prediction
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                           hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium 
                           transition-all shadow-lg"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {uiState.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 font-medium">Error:</span>
            </div>
            <p className="text-red-300 mt-1">{uiState.error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};