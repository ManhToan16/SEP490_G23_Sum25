import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchSchedulesByRole,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  clearSchedules,
  clearError,
} from "../../store/slices/scheduleSlice";

export const useSchedule = () => {
  const dispatch = useAppDispatch();
  const { schedules, loading, error } = useAppSelector((state) => state.schedule);

  const loadSchedulesByRole = (role: string, fromDate: string, toDate: string) => {
    return dispatch(fetchSchedulesByRole({ role, fromDate, toDate })).unwrap();
  };

  const addSchedule = (scheduleData: {
    userId: string;
    roomId: string;
    timeSlotId: string;
    date: string;
  }) => {
    return dispatch(createSchedule(scheduleData)).unwrap();
  };

  const editSchedule = (scheduleId: string, scheduleData: any) => {
    return dispatch(updateSchedule({ id: scheduleId, data: scheduleData })).unwrap();
  };

  const removeSchedule = (scheduleId: string) => {
    return dispatch(deleteSchedule(scheduleId)).unwrap();
  };

  const clearScheduleData = () => {
    dispatch(clearSchedules());
  };

  const clearScheduleError = () => {
    dispatch(clearError());
  };

  return {
    schedules,
    loading,
    error,
    loadSchedulesByRole,
    addSchedule,
    editSchedule,
    removeSchedule,
    clearScheduleData,
    clearScheduleError,
  };
}; 