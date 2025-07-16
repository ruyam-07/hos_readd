'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { PasswordStrength } from '@/types/auth';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: PasswordStrength;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  className = '',
}) => {
  const getStrengthLabel = (score: number) => {
    if (score < 0.2) return 'Very Weak';
    if (score < 0.4) return 'Weak';
    if (score < 0.6) return 'Fair';
    if (score < 0.8) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (score: number) => {
    if (score < 0.2) return 'bg-red-500';
    if (score < 0.4) return 'bg-orange-500';
    if (score < 0.6) return 'bg-yellow-500';
    if (score < 0.8) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const requirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd: string) => /\d/.test(pwd) },
    { label: 'One special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/60">Password strength</span>
          <span className={`text-sm font-medium ${strength.color}`}>
            {getStrengthLabel(strength.score)}
          </span>
        </div>
        
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getStrengthColor(strength.score)} transition-all duration-300`}
            initial={{ width: 0 }}
            animate={{ width: `${strength.score * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80">Requirements:</h4>
        <div className="space-y-1">
          {requirements.map((req, index) => {
            const isValid = req.test(password);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 text-sm"
              >
                {isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className={isValid ? 'text-green-400' : 'text-white/60'}>
                  {req.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Additional feedback */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-white/80">Suggestions:</h4>
          <ul className="space-y-1">
            {strength.feedback.map((feedback, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-sm text-white/60 flex items-center gap-2"
              >
                <div className="w-1 h-1 bg-white/60 rounded-full" />
                {feedback}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;