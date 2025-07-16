import axios from "axios";


// Tạo axios instance riêng cho doctor profile API
const doctorApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://be.khanhanclinic.io.vn/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
doctorApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("clinic_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
doctorApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || "Có lỗi xảy ra";
    return Promise.reject(new Error(message));
  }
);

export const doctorProfileService = {
  // GET doctor profile by ID
  getDoctorProfile: async (doctorId: string) => {
    const response = await doctorApiClient.get(`/Doctor/Profiles/${doctorId}`);
    return response;
  },

  // CREATE doctor profile
  createDoctorProfile: async (data: any) => {
    const response = await doctorApiClient.post(`/Doctor/Profiles`, data);
    return response;
  },

  // UPDATE doctor profile
  updateDoctorProfile: async (doctorId: string, data: any) => {
    const response = await doctorApiClient.put(`/Doctor/Profiles/${doctorId}`, data);
    return response;
  },

  // DELETE doctor profile
  deleteDoctorProfile: async (doctorId: string) => {
    const response = await doctorApiClient.delete(`/Doctor/Profiles/${doctorId}`);
    return response;
  },
}; 