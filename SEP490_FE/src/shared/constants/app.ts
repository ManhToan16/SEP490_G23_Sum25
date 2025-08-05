// App Constants
export const APP_CONFIG = {
  NAME: 'Hệ thống quản lý phòng khám nội thần kinh',
  VERSION: '1.0.0',
  DESCRIPTION: 'Clinic Management System for Neurology',
  AUTHOR: 'SEP490_G23_Sum25',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://be.khanhanclinic.io.vn/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'clinic_auth_token',
  REFRESH_TOKEN: 'clinic_refresh_token',
  USER_DATA: 'clinic_user_data',
  THEME: 'clinic_theme',
  LANGUAGE: 'clinic_language',
  REDUX_PERSIST: 'persist:clinic-root',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
} as const;

// Theme Colors for role-based layouts
export const THEME_COLORS = {
  PATIENT: {
    primary: '#A9C6E8',
    secondary: '#E8F4FD',
    accent: '#7AA3CC',
  },
  DOCTOR: {
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#5D6D7E',
  },
  RECEPTIONIST: {
    primary: '#B2C4B1',
    secondary: '#D5E8D4',
    accent: '#8FA68E',
  },
  ADMIN: {
    primary: '#374151',
    secondary: '#4B5563',
    accent: '#6B7280',
  },
} as const;



// Status Constants
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

// Appointment Types
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency',
  ROUTINE_CHECK: 'routine_check',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Medical Record Status
export const MEDICAL_RECORD_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// Time Slots
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
] as const;

// Days of Week
export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const;

// Vietnamese Days
export const VIETNAMESE_DAYS = {
  monday: 'Thứ Hai',
  tuesday: 'Thứ Ba', 
  wednesday: 'Thứ Tư',
  thursday: 'Thứ Năm',
  friday: 'Thứ Sáu',
  saturday: 'Thứ Bảy',
  sunday: 'Chủ Nhật',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100,
} as const;

// Common UI Constants
export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
} as const; 