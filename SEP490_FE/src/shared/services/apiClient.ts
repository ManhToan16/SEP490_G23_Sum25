import axios from "axios";

// Đơn giản hóa API client
const apiClient = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || "https://be.khanhanclinic.io.vn/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("clinic_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Định nghĩa custom error để gắn thêm response
interface CustomError extends Error {
  response?: any;
  status?: number;
  statusText?: string;
}

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data luôn để đơn giản
  },
  (error) => {
    console.error("Response error:", error);

    // Handle specific HTTP status codes
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem("clinic_auth_token");
      localStorage.removeItem("clinic_user_data");
      // Optional: redirect to login page
      // window.location.href = '/login';
    }

    // Extract the most detailed error message
    let message = "Có lỗi xảy ra";
    
    if (error.response?.data) {
      // Try different possible message fields from backend
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.Message) {
        message = error.response.data.Message;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data.error) {
        message = error.response.data.error;
      } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        message = error.response.data.errors.join(', ');
      }
    } else if (error.message) {
      message = error.message;
    }

    // Create custom error with response attached
    const customError: CustomError = new Error(message);
    customError.response = error.response;
    customError.status = error.response?.status;
    customError.statusText = error.response?.statusText;
    
    return Promise.reject(customError);
  }
);

// Đơn giản hóa API methods
export const api = {
  // GET request
  get: async (url: string, params?: any) => {
    try {
      return await apiClient.get(url, { params });
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url: string, data?: any) => {
    try {
      return await apiClient.post(url, data);
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url: string, data?: any) => {
    try {
      return await apiClient.put(url, data);
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url: string) => {
    try {
      return await apiClient.delete(url);
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url: string, data?: any) => {
    try {
      return await apiClient.patch(url, data);
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
