import { z } from 'zod';
import { PasswordStrength } from '@/types/auth';

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Phone validation schema
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits');

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Registration form validation schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  role: z.enum(['doctor', 'nurse', 'admin', 'patient']),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Password reset validation schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Password strength checker
export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');
  
  // Uppercase check
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('One uppercase letter');
  
  // Lowercase check
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('One lowercase letter');
  
  // Number check
  if (/\d/.test(password)) score += 1;
  else feedback.push('One number');
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('One special character');
  
  // Additional strength checks
  if (password.length >= 12) score += 1;
  if (/[A-Z].*[A-Z]/.test(password)) score += 0.5;
  if (/\d.*\d/.test(password)) score += 0.5;
  
  let color = 'text-red-500';
  if (score >= 6) color = 'text-green-500';
  else if (score >= 4) color = 'text-yellow-500';
  else if (score >= 2) color = 'text-orange-500';
  
  return {
    score: Math.min(score / 6, 1),
    feedback,
    color,
  };
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

// Role validation
export const isValidRole = (role: string): boolean => {
  return ['doctor', 'nurse', 'admin', 'patient'].includes(role);
};

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Validate file upload
export const validateFileUpload = (file: File, maxSize: number = 5 * 1024 * 1024): { isValid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed' };
  }
  
  return { isValid: true };
};