'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuardProps, UserRole } from '@/types/auth';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  fallback,
  redirectTo = '/login'
}) => {
  const { user, loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If no user is authenticated, redirect to login
      if (!user || !session) {
        router.push(redirectTo);
        return;
      }

      // Check role-based access
      if (requiredRole) {
        const userRole = user.user_metadata?.role as UserRole;
        const hasRequiredRole = Array.isArray(requiredRole)
          ? requiredRole.includes(userRole)
          : requiredRole === userRole;

        if (!hasRequiredRole) {
          // Redirect to appropriate dashboard based on user role
          switch (userRole) {
            case 'doctor':
              router.push('/dashboard/doctor');
              break;
            case 'nurse':
              router.push('/dashboard/nurse');
              break;
            case 'admin':
              router.push('/dashboard/admin');
              break;
            default:
              router.push('/dashboard');
          }
          return;
        }
      }
    }
  }, [user, loading, session, requiredRole, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-400 to-secondary-500 animate-pulse" />
            <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <p className="text-white/60 text-sm">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // If not authenticated, show fallback or redirect
  if (!user || !session) {
    return fallback || null;
  }

  // Check role access
  if (requiredRole) {
    const userRole = user.user_metadata?.role as UserRole;
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : requiredRole === userRole;

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-13a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-white/60 mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Go Back
            </button>
          </motion.div>
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
};

export default AuthGuard;