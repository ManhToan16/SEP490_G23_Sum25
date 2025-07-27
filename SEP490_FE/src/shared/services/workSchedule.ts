// services/adminService.ts
import { api } from "./apiClient";

export const workScheduleService = {
  getStaffSchedule: async (userId: string) => {
    try {
      return await api.get(`/Schedules/user/${userId}`);
    } catch (error) {
      throw error;
    }
  },
    getSchedulesByRole: async (role: string, fromDate: string, toDate: string) => {
    try {
      // Validate inputs
      if (!role || !fromDate || !toDate) {
        throw new Error("Role, fromDate và toDate là bắt buộc");
      }

      // Validate date format
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
        throw new Error("Định dạng ngày không hợp lệ");
      }

      if (fromDateObj > toDateObj) {
        throw new Error("Ngày bắt đầu không thể sau ngày kết thúc");
      }

      const url = `/Schedules/role/${role}?fromDate=${fromDate}&toDate=${toDate}`;
      console.log('📅 API Call:', url);

      const response = await api.get(url);
      console.log('📅 API Response:', response.data?.length || 0, 'schedules');

      return response.data || [];
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tải lịch làm việc";
      console.error("Error fetching schedules:", message);
      console.error("Full error:", error);
      throw new Error(message);
    }
  },
};