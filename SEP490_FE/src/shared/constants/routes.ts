// Route paths organized by user roles
export const ROUTES = {
  // Root paths
  ROOT: '/',
  HOME: '/home',
  
  // Authentication routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Patient routes
  PATIENT: {
    DASHBOARD: '/patient/dashboard',
    HOME: '/patient/home',
    MY_INFO: '/patient/my-info',
    MY_MEDICAL_RECORDS: '/patient/medical-records',
    MY_APPOINTMENTS: '/patient/appointments',
    BOOK_APPOINTMENT: '/patient/book-appointment',
    DOCTOR_REVIEW_LIST: '/patient/review-list',
    SUBMIT_REVIEW: '/patient/submit-review',
  },

  // Doctor routes
  DOCTOR: {
    DASHBOARD: '/doctor/dashboard',
    MY_INFO: '/doctor/my-info',
    PROFILE: '/doctor/profile',
    MY_SCHEDULE: '/doctor/schedule',
    APPOINTMENT_QUEUE: '/doctor/queue',
    CREATE_MEDICAL_RECORD: '/doctor/create-record',
  },

  // Receptionist routes
  RECEPTIONIST: {
    DASHBOARD: '/receptionist/dashboard',
    PATIENT_LIST: '/receptionist/patients',
    APPOINTMENT_LIST: '/receptionist/appointments',
    CREATE_PATIENT: '/receptionist/create-patient',
    CREATE_APPOINTMENT: '/receptionist/create-appointment',
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ACCOUNT_MANAGEMENT: '/admin/accounts',
    CLINIC_MANAGEMENT: '/admin/clinic',
    DOCTOR_FEEDBACK_LIST: '/admin/doctor-feedback',
    SYSTEM_LOGS: '/admin/logs',
  },

  // Error routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
  SERVER_ERROR: '/500',
} as const;

// Navigation menu items for each role
export const NAVIGATION_ITEMS = {
  PATIENT: [
    { path: ROUTES.PATIENT.DASHBOARD, label: 'Trang chủ', icon: 'Home' },
    { path: ROUTES.PATIENT.MY_APPOINTMENTS, label: 'Lịch hẹn', icon: 'Calendar' },
    { path: ROUTES.PATIENT.BOOK_APPOINTMENT, label: 'Đặt lịch', icon: 'Plus' },
    { path: ROUTES.PATIENT.MY_MEDICAL_RECORDS, label: 'Hồ sơ bệnh án', icon: 'FileText' },
    { path: ROUTES.PATIENT.DOCTOR_REVIEW_LIST, label: 'Đánh giá bác sĩ', icon: 'Star' },
    { path: ROUTES.PATIENT.MY_INFO, label: 'Thông tin cá nhân', icon: 'User' },
  ],

  DOCTOR: [
    { path: ROUTES.DOCTOR.DASHBOARD, label: 'Trang chủ', icon: 'Home' },
    { path: ROUTES.DOCTOR.APPOINTMENT_QUEUE, label: 'Hàng chờ khám', icon: 'Clock' },
    { path: ROUTES.DOCTOR.MY_SCHEDULE, label: 'Lịch làm việc', icon: 'Calendar' },
    { path: ROUTES.DOCTOR.CREATE_MEDICAL_RECORD, label: 'Tạo hồ sơ', icon: 'Plus' },
    { path: ROUTES.DOCTOR.MY_INFO, label: 'Thông tin cá nhân', icon: 'User' },
    { path: ROUTES.DOCTOR.PROFILE, label: 'Hồ sơ chuyên môn', icon: 'FileText' },
  ],

  RECEPTIONIST: [
    { path: ROUTES.RECEPTIONIST.DASHBOARD, label: 'Trang chủ', icon: 'Home' },
    { path: ROUTES.RECEPTIONIST.PATIENT_LIST, label: 'Danh sách bệnh nhân', icon: 'Users' },
    { path: ROUTES.RECEPTIONIST.APPOINTMENT_LIST, label: 'Quản lý lịch hẹn', icon: 'Calendar' },
    { path: ROUTES.RECEPTIONIST.CREATE_PATIENT, label: 'Đăng ký bệnh nhân', icon: 'UserPlus' },
    { path: ROUTES.RECEPTIONIST.CREATE_APPOINTMENT, label: 'Tạo lịch hẹn', icon: 'Plus' },
  ],

  ADMIN: [
    { path: ROUTES.ADMIN.DASHBOARD, label: 'Trang chủ', icon: 'Home' },
    { path: ROUTES.ADMIN.ACCOUNT_MANAGEMENT, label: 'Quản lý tài khoản', icon: 'Users' },
    { path: ROUTES.ADMIN.CLINIC_MANAGEMENT, label: 'Quản lý phòng khám', icon: 'Building' },
    { path: ROUTES.ADMIN.DOCTOR_FEEDBACK_LIST, label: 'Phản hồi bác sĩ', icon: 'MessageSquare' },
    { path: ROUTES.ADMIN.SYSTEM_LOGS, label: 'Nhật ký hệ thống', icon: 'FileText' },
  ],
} as const;

// Route patterns for dynamic matching
export const ROUTE_PATTERNS = {
  PATIENT_SUBMIT_REVIEW: '/patient/submit-review/:appointmentId',
  APPOINTMENT_DETAIL: '/appointments/:id',
  PATIENT_DETAIL: '/patients/:id',
  MEDICAL_RECORD_DETAIL: '/medical-records/:id',
} as const;

// Protected route configurations
export const ROUTE_PERMISSIONS = {
  PUBLIC: [ROUTES.HOME, ROUTES.AUTH.LOGIN, ROUTES.AUTH.REGISTER],
  PATIENT: Object.values(ROUTES.PATIENT),
  DOCTOR: Object.values(ROUTES.DOCTOR),
  RECEPTIONIST: Object.values(ROUTES.RECEPTIONIST),
  ADMIN: Object.values(ROUTES.ADMIN),
} as const; 