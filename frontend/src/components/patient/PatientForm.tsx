import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Patient, PatientFormData } from '../../types/patient';
import { auditPatientAccess } from '../../utils/hipaa';

interface PatientFormProps {
  patient?: Patient | null;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSSN, setShowSSN] = useState(false);
  
  const isEdit = !!patient;
  const title = isEdit ? 'Edit Patient' : 'Add New Patient';

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<PatientFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'unknown',
      ssn: '',
      phoneNumber: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phoneNumber: '',
        email: ''
      },
      insurance: {
        provider: '',
        policyNumber: '',
        groupNumber: '',
        effectiveDate: '',
        expirationDate: '',
        copay: 0,
        deductible: 0
      }
    }
  });

  // Load patient data when editing
  useEffect(() => {
    if (patient) {
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        ssn: patient.ssn || '',
        phoneNumber: patient.phoneNumber || '',
        email: patient.email || '',
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        insurance: patient.insurance
      });
      
      // Audit patient access for editing
      auditPatientAccess(patient.id, 'current-user', 'edit-form');
    }
  }, [patient, reset]);

  const steps = [
    {
      title: 'Personal Information',
      description: 'Basic patient demographics and contact information',
      fields: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'ssn', 'phoneNumber', 'email']
    },
    {
      title: 'Address',
      description: 'Patient residential address information',
      fields: ['address']
    },
    {
      title: 'Emergency Contact',
      description: 'Emergency contact person details',
      fields: ['emergencyContact']
    },
    {
      title: 'Insurance',
      description: 'Patient insurance and coverage information',
      fields: ['insurance']
    }
  ];

  const onSubmitForm = (data: PatientFormData) => {
    if (isEdit && patient) {
      auditPatientAccess(patient.id, 'current-user', 'update');
    }
    onSubmit(data);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-1">
            {steps[currentStep].title}
          </h3>
          <p className="text-sm text-gray-400">
            {steps[currentStep].description}
          </p>
        </div>
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name *
          </label>
          <Controller
            name="firstName"
            control={control}
            rules={{ required: 'First name is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="Enter first name"
              />
            )}
          />
          {errors.firstName && (
            <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Name *
          </label>
          <Controller
            name="lastName"
            control={control}
            rules={{ required: 'Last name is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="Enter last name"
              />
            )}
          />
          {errors.lastName && (
            <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date of Birth *
          </label>
          <Controller
            name="dateOfBirth"
            control={control}
            rules={{ required: 'Date of birth is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              />
            )}
          />
          {errors.dateOfBirth && (
            <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gender *
          </label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: 'Gender is required' }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value="unknown">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            )}
          />
          {errors.gender && (
            <p className="text-red-400 text-sm mt-1">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              SSN (PHI - Protected)
              <button
                type="button"
                onClick={() => setShowSSN(!showSSN)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSSN ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.536 8.464M14.122 14.122a3 3 0 01-4.243-.007m4.243.007l1.414 1.414M14.122 14.122L12.709 12.709"} />
                </svg>
              </button>
            </div>
          </label>
          <Controller
            name="ssn"
            control={control}
            rules={{
              pattern: {
                value: /^\d{3}-\d{2}-\d{4}$/,
                message: 'SSN must be in format XXX-XX-XXXX'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type={showSSN ? "text" : "password"}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="XXX-XX-XXXX"
              />
            )}
          />
          {errors.ssn && (
            <p className="text-red-400 text-sm mt-1">{errors.ssn.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              pattern: {
                value: /^\(\d{3}\) \d{3}-\d{4}$/,
                message: 'Phone must be in format (XXX) XXX-XXXX'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="(XXX) XXX-XXXX"
              />
            )}
          />
          {errors.phoneNumber && (
            <p className="text-red-400 text-sm mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <Controller
          name="email"
          control={control}
          rules={{
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
          render={({ field }) => (
            <input
              {...field}
              type="email"
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              placeholder="patient@example.com"
            />
          )}
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Street Address *
        </label>
        <Controller
          name="address.street"
          control={control}
          rules={{ required: 'Street address is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              placeholder="123 Main Street"
            />
          )}
        />
        {errors.address?.street && (
          <p className="text-red-400 text-sm mt-1">{errors.address.street.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            City *
          </label>
          <Controller
            name="address.city"
            control={control}
            rules={{ required: 'City is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="New York"
              />
            )}
          />
          {errors.address?.city && (
            <p className="text-red-400 text-sm mt-1">{errors.address.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            State *
          </label>
          <Controller
            name="address.state"
            control={control}
            rules={{ required: 'State is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="NY"
              />
            )}
          />
          {errors.address?.state && (
            <p className="text-red-400 text-sm mt-1">{errors.address.state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ZIP Code *
          </label>
          <Controller
            name="address.zipCode"
            control={control}
            rules={{ 
              required: 'ZIP code is required',
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: 'Invalid ZIP code format'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="12345"
              />
            )}
          />
          {errors.address?.zipCode && (
            <p className="text-red-400 text-sm mt-1">{errors.address.zipCode.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country *
          </label>
          <Controller
            name="address.country"
            control={control}
            rules={{ required: 'Country is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="USA"
              />
            )}
          />
          {errors.address?.country && (
            <p className="text-red-400 text-sm mt-1">{errors.address.country.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmergencyContact = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contact Name *
          </label>
          <Controller
            name="emergencyContact.name"
            control={control}
            rules={{ required: 'Emergency contact name is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="John Doe"
              />
            )}
          />
          {errors.emergencyContact?.name && (
            <p className="text-red-400 text-sm mt-1">{errors.emergencyContact.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Relationship *
          </label>
          <Controller
            name="emergencyContact.relationship"
            control={control}
            rules={{ required: 'Relationship is required' }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value="">Select relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            )}
          />
          {errors.emergencyContact?.relationship && (
            <p className="text-red-400 text-sm mt-1">{errors.emergencyContact.relationship.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number *
          </label>
          <Controller
            name="emergencyContact.phoneNumber"
            control={control}
            rules={{ 
              required: 'Emergency contact phone is required',
              pattern: {
                value: /^\(\d{3}\) \d{3}-\d{4}$/,
                message: 'Phone must be in format (XXX) XXX-XXXX'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="(XXX) XXX-XXXX"
              />
            )}
          />
          {errors.emergencyContact?.phoneNumber && (
            <p className="text-red-400 text-sm mt-1">{errors.emergencyContact.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <Controller
            name="emergencyContact.email"
            control={control}
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="contact@example.com"
              />
            )}
          />
          {errors.emergencyContact?.email && (
            <p className="text-red-400 text-sm mt-1">{errors.emergencyContact.email.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderInsurance = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Insurance Provider *
          </label>
          <Controller
            name="insurance.provider"
            control={control}
            rules={{ required: 'Insurance provider is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="Blue Cross Blue Shield"
              />
            )}
          />
          {errors.insurance?.provider && (
            <p className="text-red-400 text-sm mt-1">{errors.insurance.provider.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Policy Number *
          </label>
          <Controller
            name="insurance.policyNumber"
            control={control}
            rules={{ required: 'Policy number is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="POL123456789"
              />
            )}
          />
          {errors.insurance?.policyNumber && (
            <p className="text-red-400 text-sm mt-1">{errors.insurance.policyNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Group Number
          </label>
          <Controller
            name="insurance.groupNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="GRP123456"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Effective Date *
          </label>
          <Controller
            name="insurance.effectiveDate"
            control={control}
            rules={{ required: 'Effective date is required' }}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              />
            )}
          />
          {errors.insurance?.effectiveDate && (
            <p className="text-red-400 text-sm mt-1">{errors.insurance.effectiveDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Expiration Date
          </label>
          <Controller
            name="insurance.expirationDate"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Copay ($)
          </label>
          <Controller
            name="insurance.copay"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="25.00"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Deductible ($)
          </label>
          <Controller
            name="insurance.deductible"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                placeholder="1000.00"
              />
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderAddress();
      case 2:
        return renderEmergencyContact();
      case 3:
        return renderInsurance();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400">
            {isEdit ? 'Update patient information' : 'Add new patient to the system'}
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700/50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isEdit ? 'Update Patient' : 'Add Patient'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;