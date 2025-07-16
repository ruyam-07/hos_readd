'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  showPasswordToggle?: boolean;
  loading?: boolean;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ 
    label, 
    error, 
    icon, 
    isPassword = false,
    showPasswordToggle = false,
    loading = false,
    className = '', 
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <div 
            className={`
              relative overflow-hidden rounded-xl border transition-all duration-300
              ${error 
                ? 'border-red-500/50 bg-red-500/5' 
                : isFocused 
                  ? 'border-primary-400/50 bg-glass-light' 
                  : 'border-white/20 bg-glass-light hover:border-white/30'
              }
              ${loading ? 'opacity-50' : ''}
            `}
          >
            {/* Glass effect backdrop */}
            <div className="absolute inset-0 backdrop-blur-md bg-gradient-to-r from-glass-light via-glass-medium to-glass-light" />
            
            {/* Input container */}
            <div className="relative flex items-center">
              {/* Icon */}
              {icon && (
                <div className="absolute left-4 z-10">
                  <div className={`transition-colors duration-200 ${
                    error ? 'text-red-400' : isFocused ? 'text-primary-400' : 'text-white/60'
                  }`}>
                    {icon}
                  </div>
                </div>
              )}
              
              {/* Input field */}
              <input
                ref={ref}
                type={inputType}
                disabled={loading}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`
                  w-full h-12 px-4 bg-transparent text-white placeholder-white/40 
                  focus:outline-none focus:ring-0 relative z-10
                  ${icon ? 'pl-12' : ''}
                  ${(isPassword && showPasswordToggle) || error ? 'pr-12' : ''}
                  ${className}
                `}
                {...props}
              />
              
              {/* Password toggle */}
              {isPassword && showPasswordToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 z-10 p-1 rounded-md hover:bg-white/10 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-white/60" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/60" />
                  )}
                </button>
              )}
              
              {/* Error icon */}
              {error && !isPassword && (
                <div className="absolute right-4 z-10">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>
            
            {/* Focus glow effect */}
            {isFocused && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400/20 to-secondary-500/20 blur-sm"
              />
            )}
          </div>
        </div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export default GlassInput;