import { api } from "./apiClient";

// Đơn giản hóa Patient Service
export const patientService = {
  getAllServices: async (pageNumber = 1, pageSize = 6) => {
    try {
      const response = await api.get("/Services", {
        pageNumber,
        pageSize
      });
      const data = response?.data[0] || {};
      return {
        items: data.items || [],
        totalItems: data.totalItems || 0,
      };
    } catch (error) {
      console.error("Error fetching services:", error.message);
      throw error;
    }
  },

  // Lấy thông tin bệnh nhân theo ID
  getPatientById: async (id: string) => {
    try {
      return await api.get(`/patients/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Tạo bệnh nhân mới
  createPatient: async (patientData: any) => {
    try {
      return await api.post("/patients", patientData);
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin bệnh nhân
  updatePatient: async (id: string, patientData: any) => {
    try {
      return await api.put(`/patients/${id}`, patientData);
    } catch (error) {
      throw error;
    }
  },

  // Xóa bệnh nhân
  deletePatient: async (id: string) => {
    try {
      return await api.delete(`/patients/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Lấy hồ sơ bệnh án của bệnh nhân
  getPatientMedicalRecords: async (patientId: string) => {
    try {
      return await api.get(`/patients/${patientId}/medical-records`);
    } catch (error) {
      throw error;
    }
  },

  // Lấy lịch hẹn của bệnh nhân
  getPatientAppointments: async (patientId: string) => {
    try {
      return await api.get(`/patients/${patientId}/appointments`);
    } catch (error) {
      throw error;
    }
  },

  // Tìm kiếm bệnh nhân
  searchPatients: async (query: string) => {
    try {
      return await api.get("/patients/search", { q: query });
    } catch (error) {
      throw error;
    }
  },

  // Lấy thống kê bệnh nhân
  getPatientStats: async () => {
    try {
      return await api.get("/patients/stats");
    } catch (error) {
      throw error;
    }
  },
};

export default patientService;
