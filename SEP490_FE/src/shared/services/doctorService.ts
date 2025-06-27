import { api } from "./apiClient";

// Đơn giản hóa Doctor Service
export const doctorService = {
  // Lấy danh sách bác sĩ
  getDoctors: async (params?: any) => {
    try {
      return await api.get("/doctors", params);
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin bác sĩ theo ID
  getDoctorById: async (id: string) => {
    try {
      return await api.get(`/doctors/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Tạo bác sĩ mới
  createDoctor: async (doctorData: any) => {
    try {
      return await api.post("/doctors", doctorData);
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin bác sĩ
  updateDoctor: async (id: string, doctorData: any) => {
    try {
      return await api.put(`/doctors/${id}`, doctorData);
    } catch (error) {
      throw error;
    }
  },

  // Xóa bác sĩ
  deleteDoctor: async (id: string) => {
    try {
      return await api.delete(`/doctors/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Lấy lịch làm việc của bác sĩ
  getDoctorSchedule: async (doctorId: string, params?: any) => {
    try {
      return await api.get(`/doctors/${doctorId}/schedule`, params);
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật lịch làm việc
  updateDoctorSchedule: async (doctorId: string, scheduleData: any) => {
    try {
      return await api.put(`/doctors/${doctorId}/schedule`, scheduleData);
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách bệnh nhân của bác sĩ
  getDoctorPatients: async (doctorId: string) => {
    try {
      return await api.get(`/doctors/${doctorId}/patients`);
    } catch (error) {
      throw error;
    }
  },

  // Lấy lịch hẹn của bác sĩ
  getDoctorAppointments: async (doctorId: string, params?: any) => {
    try {
      return await api.get(`/doctors/${doctorId}/appointments`, params);
    } catch (error) {
      throw error;
    }
  },

  // Lấy hàng chờ khám bệnh
  getDoctorQueue: async (doctorId: string) => {
    try {
      return await api.get(`/doctors/${doctorId}/queue`);
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật trạng thái hàng chờ
  updateQueueStatus: async (
    doctorId: string,
    queueId: string,
    status: string
  ) => {
    try {
      return await api.patch(`/doctors/${doctorId}/queue/${queueId}`, {
        status,
      });
    } catch (error) {
      throw error;
    }
  },

  // Tìm kiếm bác sĩ
  searchDoctors: async (query: string) => {
    try {
      return await api.get("/doctors/search", { q: query });
    } catch (error) {
      throw error;
    }
  },

  // Lấy thống kê bác sĩ
  getDoctorStats: async (doctorId: string) => {
    try {
      return await api.get(`/doctors/${doctorId}/stats`);
    } catch (error) {
      throw error;
    }
  },
};

export default doctorService;
