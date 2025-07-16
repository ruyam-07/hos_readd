'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = `
    relative overflow-hidden rounded-xl font-medium transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-primary-400 to-secondary-500 text-white
      hover:from-primary-500 hover:to-secondary-600
      focus:ring-primary-400/50
      shadow-lg hover:shadow-xl hover:shadow-primary-400/25
    `,
    secondary: `
      bg-gradient-to-r from-glass-light to-glass-medium border border-white/20
      text-white hover:border-white/30
      focus:ring-white/20
      backdrop-blur-md
    `,
    outline: `
      border border-primary-400/50 bg-transparent text-primary-400
      hover:bg-primary-400/10 hover:border-primary-400
      focus:ring-primary-400/50
    `,
    ghost: `
      bg-transparent text-white/80 hover:bg-white/10
      focus:ring-white/20
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {/* Glass effect overlay */}
      {variant === 'secondary' && (
        <div className="absolute inset-0 backdrop-blur-md bg-gradient-to-r from-glass-light via-glass-medium to-glass-light" />
      )}
      
      {/* Glow effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-secondary-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Button content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
      </div>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-xl"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
};

export default GlassButton;