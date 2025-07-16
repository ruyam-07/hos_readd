'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { AuthContextType, AuthState, AuthUser, LoginFormData, RegisterFormData, UserRole } from '@/types/auth';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    session: null,
  });

  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }

        setAuthState(prev => ({
          ...prev,
          user: session?.user as AuthUser || null,
          session,
          loading: false,
        }));
      } catch (error) {
        console.error('Error getting session:', error);
        setAuthState(prev => ({ ...prev, error: 'Failed to get session', loading: false }));
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({
          ...prev,
          user: session?.user as AuthUser || null,
          session,
          loading: false,
        }));

        if (event === 'SIGNED_IN') {
          // Set session cookie for server-side rendering
          if (session) {
            Cookies.set('supabase-auth-token', session.access_token, { expires: 7 });
          }
          toast.success('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          Cookies.remove('supabase-auth-token');
          toast.success('Successfully signed out!');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (data: LoginFormData): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        toast.error(error.message);
        return;
      }

      // Set remember me cookie
      if (data.rememberMe) {
        Cookies.set('remember-me', 'true', { expires: 30 });
      }

      // Get user profile and redirect based on role
      const { data: { user } } = await supabaseClient.auth.getUser();
      const userRole = user?.user_metadata?.role as UserRole;

      // Role-based redirect
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            role: data.role,
            department: data.department,
            license_number: data.licenseNumber,
          },
        },
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        toast.error(error.message);
        return;
      }

      toast.success('Registration successful! Please check your email for verification.');
      router.push('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }

      Cookies.remove('remember-me');
      Cookies.remove('supabase-auth-token');
      router.push('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during logout';
      toast.error(errorMessage);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        toast.error(error.message);
        return;
      }

      toast.success('Password reset email sent!');
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during password reset';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const updateProfile = async (data: Partial<RegisterFormData>): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabaseClient.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          department: data.department,
          license_number: data.licenseNumber,
        },
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        toast.error(error.message);
        return;
      }

      toast.success('Profile updated successfully!');
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during profile update';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      const { error } = await supabaseClient.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Email verified successfully!');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during email verification';
      toast.error(errorMessage);
    }
  };

  const resendVerification = async (): Promise<void> => {
    try {
      if (!authState.user?.email) {
        toast.error('No email found');
        return;
      }

      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: authState.user.email,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Verification email sent!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while resending verification';
      toast.error(errorMessage);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    verifyEmail,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};