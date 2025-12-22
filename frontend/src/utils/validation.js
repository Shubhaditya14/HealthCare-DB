import { z } from 'zod';

// Common validation patterns
const namePattern = /^[a-zA-Z\s'-]+$/;
const phonePattern = /^\+?[\d\s-]+$/;
const passwordPattern = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

// Blood group options
export const bloodGroupOptions = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
];
// Helper to calculate age
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Patient Registration Schema
export const patientRegistrationSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters')
    .regex(namePattern, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters')
    .regex(namePattern, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z
    .string()
    .email('Invalid email address')
    .max(100, 'Email must be at most 100 characters'),

  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(14, 'Phone number must be at most 14 characters')
    .regex(phonePattern, 'Invalid phone number format'),

  date_of_birth: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Invalid date')
    .refine((val) => {
      const date = new Date(val);
      return date <= new Date();
    }, 'Date of birth cannot be in the future')
    .refine((val) => {
      const age = calculateAge(val);
      return age >= 0 && age <= 120;
    }, 'Invalid date of birth'),

  blood_group: z
    .string()
    .optional()
    .refine((val) => !val || bloodGroupOptions.includes(val), 'Invalid blood group'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => passwordPattern.uppercase.test(val), 'Password must contain at least one uppercase letter')
    .refine((val) => passwordPattern.lowercase.test(val), 'Password must contain at least one lowercase letter')
    .refine((val) => passwordPattern.number.test(val), 'Password must contain at least one number')
    .refine((val) => passwordPattern.special.test(val), 'Password must contain at least one special character'),

  confirm_password: z.string(),

  agree_to_terms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

// Doctor Registration Schema
export const doctorRegistrationSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters')
    .regex(namePattern, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters')
    .regex(namePattern, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z
    .string()
    .email('Invalid email address')
    .max(100, 'Email must be at most 100 characters'),

  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(12, 'Phone number must be at most 12 characters')
    .regex(phonePattern, 'Invalid phone number format'),

  specialization: z
    .string()
    .min(3, 'Specialization must be at least 3 characters')
    .max(100, 'Specialization must be at most 100 characters'),

  license_number: z
    .string()
    .min(5, 'License number must be at least 5 characters')
    .max(20, 'License number must be at most 20 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'License number must be alphanumeric'),

  years_experience: z
    .number()
    .min(0, 'Years of experience cannot be negative')
    .max(70, 'Years of experience cannot exceed 70'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => passwordPattern.uppercase.test(val), 'Password must contain at least one uppercase letter')
    .refine((val) => passwordPattern.lowercase.test(val), 'Password must contain at least one lowercase letter')
    .refine((val) => passwordPattern.number.test(val), 'Password must contain at least one number')
    .refine((val) => passwordPattern.special.test(val), 'Password must contain at least one special character'),

  confirm_password: z.string(),

  agree_to_terms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Appointment Booking Schema
export const appointmentSchema = z.object({
  doctor_id: z
    .coerce.number()
    .min(1, 'Please select a doctor'),

  appointment_date: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Appointment date cannot be in the past'),

  appointment_time: z
    .string()
    .refine((val) => {
      const [hours] = val.split(':').map(Number);
      return hours >= 8 && hours < 18;
    }, 'Appointment time must be between 8:00 AM and 6:00 PM'),

  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be at most 500 characters'),
});
