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
  getScheduleRole: async (role: string) => {
    try {
      return await api.get(`/Schedules/role/${role}`);
    } catch (error) {
      throw error;
    }
  },
};