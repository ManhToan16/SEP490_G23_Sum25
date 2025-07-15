import axios from "axios";

// Đơn giản hóa API client
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://70.153.24.53:5050/api",
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

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data luôn để đơn giản
  },
  (error) => {
    console.error("Response error:", error);

    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem("clinic_auth_token");
      localStorage.removeItem("clinic_user_data");
    }

    // Trả về error message đơn giản
    const message =
      error.response?.data?.message || error.message || "Có lỗi xảy ra";
    return Promise.reject(new Error(message));
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
