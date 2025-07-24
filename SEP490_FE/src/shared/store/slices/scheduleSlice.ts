import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "../../services/adminService";

// Types
export interface Schedule {
  id: string;
  userId: string;
  userName: string;
  role: string;
  roomId: string;
  roomName: string;
  roomType: string;
  date: string;
  timeSlotId: string;
  status: string;
}

export interface ScheduleState {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  schedules: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSchedulesByRole = createAsyncThunk(
  "schedule/fetchByRole",
  async ({ role, fromDate, toDate }: { role: string; fromDate: string; toDate: string }, { rejectWithValue }) => {
    try {
      const response = await adminService.getSchedulesByRole(role, fromDate, toDate);
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tải lịch làm việc";
      return rejectWithValue(message);
    }
  }
);

export const createSchedule = createAsyncThunk(
  "schedule/create",
  async (scheduleData: any, { rejectWithValue }) => {
    try {
      const response = await adminService.createSchedule(scheduleData);
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tạo lịch làm việc";
      return rejectWithValue(message);
    }
  }
);

export const updateSchedule = createAsyncThunk(
  "schedule/update",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSchedule(id, data);
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể cập nhật lịch làm việc";
      return rejectWithValue(message);
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  "schedule/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminService.deleteSchedule(id);
      return id;
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể xóa lịch làm việc";
      return rejectWithValue(message);
    }
  }
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    clearSchedules: (state) => {
      state.schedules = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch schedules
    builder
      .addCase(fetchSchedulesByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedulesByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedulesByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch schedules";
      });

    // Create schedule
    builder
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules.push(action.payload);
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to create schedule";
      });

    // Update schedule
    builder
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schedules.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to update schedule";
      });

    // Delete schedule
    builder
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = state.schedules.filter(s => s.id !== action.payload);
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to delete schedule";
      });
  },
});

export const { clearSchedules, clearError } = scheduleSlice.actions;
export default scheduleSlice.reducer; 