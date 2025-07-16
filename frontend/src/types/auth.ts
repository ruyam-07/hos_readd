import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  user_metadata: {
    role?: UserRole;
    first_name?: string;
    last_name?: string;
    phone?: string;
    department?: string;
    license_number?: string;
  };
}

export type UserRole = 'doctor' | 'nurse' | 'admin' | 'patient';

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  session: any;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  department?: string;
  licenseNumber?: string;
  agreeToTerms: boolean;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<RegisterFormData>) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface FormFieldError {
  message: string;
  type: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, FormFieldError>;
}

export interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export interface SocialLoginProvider {
  name: string;
  icon: React.ReactNode;
  provider: 'google' | 'github' | 'azure';
}