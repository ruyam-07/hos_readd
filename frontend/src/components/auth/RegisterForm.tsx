'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, Phone, UserCheck, Building, 
  FileText, ArrowRight, ArrowLeft, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterFormData, UserRole } from '@/types/auth';
import { registerSchema, checkPasswordStrength } from '@/utils/validation';
import GlassInput from '@/components/ui/GlassInput';
import GlassButton from '@/components/ui/GlassButton';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''));
  const { register: registerUser, loading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'patient',
      department: '',
      licenseNumber: '',
      agreeToTerms: false,
    },
  });

  const watchedPassword = watch('password');
  const watchedRole = watch('role');

  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(checkPasswordStrength(watchedPassword));
    }
  }, [watchedPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof RegisterFormData)[] => {
    switch (step) {
      case 1:
        return ['email', 'password', 'confirmPassword'];
      case 2:
        return ['firstName', 'lastName', 'phone', 'role'];
      case 3:
        return ['department', 'licenseNumber', 'agreeToTerms'];
      default:
        return [];
    }
  };

  const roleOptions = [
    { value: 'patient', label: 'Patient', icon: User, description: 'Access to personal health records' },
    { value: 'nurse', label: 'Nurse', icon: UserCheck, description: 'Patient care and monitoring' },
    { value: 'doctor', label: 'Doctor', icon: FileText, description: 'Full medical practice access' },
    { value: 'admin', label: 'Administrator', icon: Building, description: 'System administration' },
  ];

  const departments = [
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Family Medicine',
    'Internal Medicine',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Other',
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Account Details</h3>
              <p className="text-white/60 text-sm">Create your secure account</p>
            </div>

            <GlassInput
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              loading={isSubmitting}
            />

            <GlassInput
              {...register('password')}
              type="password"
              placeholder="Create a password"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              loading={isSubmitting}
              isPassword
              showPasswordToggle
            />

            {watchedPassword && (
              <PasswordStrengthIndicator
                password={watchedPassword}
                strength={passwordStrength}
              />
            )}

            <GlassInput
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm your password"
              icon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              loading={isSubmitting}
              isPassword
              showPasswordToggle
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Personal Information</h3>
              <p className="text-white/60 text-sm">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                {...register('firstName')}
                type="text"
                placeholder="First name"
                icon={<User className="w-5 h-5" />}
                error={errors.firstName?.message}
                loading={isSubmitting}
              />

              <GlassInput
                {...register('lastName')}
                type="text"
                placeholder="Last name"
                icon={<User className="w-5 h-5" />}
                error={errors.lastName?.message}
                loading={isSubmitting}
              />
            </div>

            <GlassInput
              {...register('phone')}
              type="tel"
              placeholder="Phone number"
              icon={<Phone className="w-5 h-5" />}
              error={errors.phone?.message}
              loading={isSubmitting}
            />

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Select your role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <label
                      key={role.value}
                      className={`
                        relative p-4 rounded-xl border cursor-pointer transition-all duration-200
                        ${watchedRole === role.value
                          ? 'border-primary-400 bg-primary-400/10'
                          : 'border-white/20 bg-glass-light hover:border-white/30'
                        }
                      `}
                    >
                      <input
                        {...register('role')}
                        type="radio"
                        value={role.value}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center">
                        <Icon className={`w-6 h-6 mb-2 ${
                          watchedRole === role.value ? 'text-primary-400' : 'text-white/60'
                        }`} />
                        <span className="font-medium text-white text-sm">{role.label}</span>
                        <span className="text-xs text-white/60 mt-1">{role.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Professional Details</h3>
              <p className="text-white/60 text-sm">Complete your profile</p>
            </div>

            {(watchedRole === 'doctor' || watchedRole === 'nurse') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">
                    Department
                  </label>
                  <select
                    {...register('department')}
                    className="w-full h-12 px-4 bg-glass-light border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent backdrop-blur-md"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="bg-dark-800">
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-400 text-sm mt-1">{errors.department.message}</p>
                  )}
                </div>

                <GlassInput
                  {...register('licenseNumber')}
                  type="text"
                  placeholder="License number"
                  icon={<FileText className="w-5 h-5" />}
                  error={errors.licenseNumber?.message}
                  loading={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...register('agreeToTerms')}
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 rounded border-white/20 bg-glass-light text-primary-400 focus:ring-primary-400 focus:ring-2"
                />
                <span className="text-sm text-white/80 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-400 hover:text-primary-300 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-400 hover:text-primary-300 underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-400 text-sm">{errors.agreeToTerms.message}</p>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/20 bg-glass-light backdrop-blur-xl shadow-glass"
      >
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-glass-light via-glass-medium to-glass-light" />
        
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-400 to-secondary-500 flex items-center justify-center"
            >
              <UserCheck className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-white/60">Join our healthcare platform</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                    step <= currentStep
                      ? 'bg-gradient-to-r from-primary-400 to-secondary-500 text-white'
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
              ))}
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary-400 to-secondary-500 h-2 rounded-full"
                initial={{ width: '33%' }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  icon={<ArrowLeft className="w-5 h-5" />}
                  className="flex-1"
                >
                  Previous
                </GlassButton>
              )}

              {currentStep < 3 ? (
                <GlassButton
                  type="button"
                  onClick={nextStep}
                  icon={<ArrowRight className="w-5 h-5" />}
                  className="flex-1"
                >
                  Next
                </GlassButton>
              ) : (
                <GlassButton
                  type="submit"
                  loading={isSubmitting}
                  icon={<CheckCircle className="w-5 h-5" />}
                  className="flex-1"
                >
                  Create Account
                </GlassButton>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-secondary-500/20 rounded-full"
              animate={{
                x: [0, 80, 0],
                y: [0, -80, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.7,
              }}
              style={{
                left: `${30 + i * 20}%`,
                top: `${40 + i * 15}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterForm;