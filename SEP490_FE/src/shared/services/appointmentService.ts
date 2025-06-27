import { api } from "./apiClient";

// Đơn giản hóa Appointment Service
export const appointmentService = {
  // Lấy danh sách lịch hẹn
  getAppointments: async (params?: any) => {
    try {
      return await api.get("/appointments", params);
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin lịch hẹn theo ID
  getAppointmentById: async (id: string) => {
    try {
      return await api.get(`/appointments/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Tạo lịch hẹn mới
  createAppointment: async (appointmentData: any) => {
    try {
      return await api.post("/appointments", appointmentData);
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật lịch hẹn
  updateAppointment: async (id: string, appointmentData: any) => {
    try {
      return await api.put(`/appointments/${id}`, appointmentData);
    } catch (error) {
      throw error;
    }
  },

  // Xóa lịch hẹn
  deleteAppointment: async (id: string) => {
    try {
      return await api.delete(`/appointments/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Xác nhận lịch hẹn
  confirmAppointment: async (id: string) => {
    try {
      return await api.patch(`/appointments/${id}/confirm`);
    } catch (error) {
      throw error;
    }
  },

  // Hủy lịch hẹn
  cancelAppointment: async (id: string, reason?: string) => {
    try {
      return await api.patch(`/appointments/${id}/cancel`, { reason });
    } catch (error) {
      throw error;
    }
  },

  // Bắt đầu khám bệnh
  startAppointment: async (id: string) => {
    try {
      return await api.patch(`/appointments/${id}/start`);
    } catch (error) {
      throw error;
    }
  },

  // Hoàn thành lịch hẹn
  completeAppointment: async (id: string, notes?: string) => {
    try {
      return await api.patch(`/appointments/${id}/complete`, { notes });
    } catch (error) {
      throw error;
    }
  },

  // Lấy lịch hẹn theo ngày
  getAppointmentsByDate: async (date: string, doctorId?: string) => {
    try {
      const params: any = { date };
      if (doctorId) params.doctorId = doctorId;
      return await api.get("/appointments/by-date", params);
    } catch (error) {
      throw error;
    }
  },

  // Lấy lịch hẹn theo bác sĩ
  getAppointmentsByDoctor: async (doctorId: string, params?: any) => {
    try {
      return await api.get(`/appointments/doctor/${doctorId}`, params);
    } catch (error) {
      throw error;
    }
  },

  // Lấy lịch hẹn theo bệnh nhân
  getAppointmentsByPatient: async (patientId: string, params?: any) => {
    try {
      return await api.get(`/appointments/patient/${patientId}`, params);
    } catch (error) {
      throw error;
    }
  },

  // Kiểm tra slot thời gian có sẵn
  checkAvailableSlots: async (doctorId: string, date: string) => {
    try {
      return await api.get("/appointments/available-slots", { doctorId, date });
    } catch (error) {
      throw error;
    }
  },

  // Lấy thống kê lịch hẹn
  getAppointmentStats: async (params?: any) => {
    try {
      return await api.get("/appointments/stats", params);
    } catch (error) {
      throw error;
    }
  },

  // Reschedule lịch hẹn
  rescheduleAppointment: async (
    id: string,
    newDate: string,
    newTime: string
  ) => {
    try {
      return await api.patch(`/appointments/${id}/reschedule`, {
        newDate,
        newTime,
      });
    } catch (error) {
      throw error;
    }
  },
};

export default appointmentService;
