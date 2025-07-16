'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData } from '@/types/auth';
import { loginSchema } from '@/utils/validation';
import GlassInput from '@/components/ui/GlassInput';
import GlassButton from '@/components/ui/GlassButton';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const LoginForm: React.FC = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { login, resetPassword, loading } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    // Check if user previously checked "Remember Me"
    const rememberMe = Cookies.get('remember-me');
    if (rememberMe) {
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await resetPassword(resetEmail);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      // This would be implemented with Supabase social auth
      toast.info(`${provider} login coming soon!`);
    } catch (error) {
      console.error('Social login error:', error);
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
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/60">Sign in to your healthcare dashboard</p>
          </div>

          {showForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Reset Password</h3>
                <p className="text-white/60 text-sm">Enter your email to receive a reset link</p>
              </div>
              
              <GlassInput
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                required
              />
              
              <div className="flex gap-3">
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  Send Reset Link
                </GlassButton>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <GlassInput
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                loading={isSubmitting}
              />

              {/* Password Input */}
              <GlassInput
                {...register('password')}
                type="password"
                placeholder="Enter your password"
                icon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                loading={isSubmitting}
                isPassword
                showPasswordToggle
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('rememberMe')}
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-glass-light text-primary-400 focus:ring-primary-400 focus:ring-2"
                  />
                  <span className="text-sm text-white/80">Remember me</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <GlassButton
                type="submit"
                loading={isSubmitting}
                fullWidth
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Sign In
              </GlassButton>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-glass-light text-white/60">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => handleSocialLogin('google')}
                  icon={<Chrome className="w-5 h-5" />}
                >
                  Google
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => handleSocialLogin('github')}
                  icon={<Github className="w-5 h-5" />}
                >
                  GitHub
                </GlassButton>
              </div>
            </form>
          )}

          {/* Sign Up Link */}
          {!showForgotPassword && (
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400/20 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;