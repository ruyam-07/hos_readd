import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Calendar, Globe, Heart, Briefcase } from 'lucide-react';
import { PredictionFormData } from '../../types';
import { cn } from '../../utils/helpers';

interface DemographicsStepProps {
  form: UseFormReturn<PredictionFormData>;
}

export const DemographicsStep: React.FC<DemographicsStepProps> = ({ form }) => {
  const { register, formState: { errors }, watch } = form;
  const demographics = watch('demographics');

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Basic Information */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-400" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Age *
            </label>
            <input
              type="number"
              {...register('demographics.age', {
                required: 'Age is required',
                min: { value: 0, message: 'Age must be at least 0' },
                max: { value: 120, message: 'Age must be less than 120' },
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all",
                errors.demographics?.age && "border-red-500/50 focus:ring-red-500/50"
              )}
              placeholder="Enter age"
            />
            {errors.demographics?.age && (
              <p className="mt-1 text-sm text-red-400">
                {errors.demographics.age.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gender *
            </label>
            <select
              {...register('demographics.gender', {
                required: 'Gender is required',
              })}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                "text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                "backdrop-blur-sm transition-all",
                errors.demographics?.gender && "border-red-500/50 focus:ring-red-500/50"
              )}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.demographics?.gender && (
              <p className="mt-1 text-sm text-red-400">
                {errors.demographics.gender.message}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Demographics */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Globe className="w-5 h-5 mr-2 text-green-400" />
          Demographics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Race */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Race
            </label>
            <select
              {...register('demographics.race')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
            >
              <option value="">Select race</option>
              <option value="white">White</option>
              <option value="black">Black or African American</option>
              <option value="asian">Asian</option>
              <option value="hispanic">Hispanic or Latino</option>
              <option value="native_american">Native American</option>
              <option value="pacific_islander">Pacific Islander</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Ethnicity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ethnicity
            </label>
            <select
              {...register('demographics.ethnicity')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
            >
              <option value="">Select ethnicity</option>
              <option value="hispanic">Hispanic or Latino</option>
              <option value="non_hispanic">Not Hispanic or Latino</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primary Language
            </label>
            <input
              type="text"
              {...register('demographics.language')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="e.g., English, Spanish, Mandarin"
            />
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Marital Status
            </label>
            <select
              {...register('demographics.maritalStatus')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
            >
              <option value="">Select marital status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="separated">Separated</option>
              <option value="domestic_partner">Domestic Partner</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Social Information */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Heart className="w-5 h-5 mr-2 text-purple-400" />
          Social Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Religion */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Religion
            </label>
            <input
              type="text"
              {...register('demographics.religion')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
              placeholder="e.g., Christianity, Islam, Judaism"
            />
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Employment Status
            </label>
            <select
              {...register('demographics.employmentStatus')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-sm transition-all"
            >
              <option value="">Select employment status</option>
              <option value="employed">Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="retired">Retired</option>
              <option value="student">Student</option>
              <option value="disabled">Disabled</option>
              <option value="homemaker">Homemaker</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Insurance Information */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-orange-400" />
          Insurance Information
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Insurance Type
          </label>
          <select
            {...register('demographics.insurance')}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                     text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     backdrop-blur-sm transition-all"
          >
            <option value="">Select insurance type</option>
            <option value="medicare">Medicare</option>
            <option value="medicaid">Medicaid</option>
            <option value="private">Private Insurance</option>
            <option value="self_pay">Self Pay</option>
            <option value="other">Other</option>
            <option value="uninsured">Uninsured</option>
          </select>
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        variants={itemVariants}
        className="mt-8 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                 rounded-lg border border-blue-500/30"
      >
        <h4 className="text-lg font-semibold text-white mb-2">Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Age:</span>
            <span className="text-white ml-2">{demographics?.age || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-400">Gender:</span>
            <span className="text-white ml-2 capitalize">{demographics?.gender || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-400">Race:</span>
            <span className="text-white ml-2 capitalize">{demographics?.race || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-400">Insurance:</span>
            <span className="text-white ml-2 capitalize">{demographics?.insurance || 'Not specified'}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};