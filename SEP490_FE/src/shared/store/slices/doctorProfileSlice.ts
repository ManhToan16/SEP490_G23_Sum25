import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doctorService } from "../../services/doctorService";

// Async actions using doctorService
export const fetchDoctorProfile = createAsyncThunk(
  "doctorProfile/fetch",
  async (doctorId: string) => {
    const response = await doctorService.getDoctorProfile(doctorId);
    return response;
  }
);

export const createDoctorProfile = createAsyncThunk(
  "doctorProfile/create",
  async (profileData: any) => {
    const response = await doctorService.createDoctorProfile(profileData);
    return response;
  }
);

export const updateDoctorProfile = createAsyncThunk(
  "doctorProfile/update",
  async ({ doctorId, data }: { doctorId: string; data: any }) => {
    const response = await doctorService.updateDoctorProfile(doctorId, data);
    return response;
  }
);

// export const deleteDoctorProfile = createAsyncThunk(
//   "doctorProfile/delete",
//   async (doctorId: string) => {
//     await doctorService.deleteDoctorProfile(doctorId);
//     return doctorId;
//   }
// );

const initialState = {
  profile: null,
  profiles: [],
  loading: false,
  error: null,
  success: false,
};

const doctorProfileSlice = createSlice({
  name: "doctorProfile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Doctor Profile
      .addCase(fetchDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response structure: { statusCode, success, message, data: [...] }
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.profile = action.payload.data[0] || null;
        } else {
          state.profile = action.payload || null;
        }
        // Don't set success = true for fetch operations
      })
      .addCase(fetchDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi tải thông tin bác sĩ";
      })
      
      // Create Doctor Profile
      .addCase(createDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response structure: { statusCode, success, message, data: [...] }
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.profile = action.payload.data[0] || null;
        } else {
          state.profile = action.payload || null;
        }
        state.success = true;
      })
      .addCase(createDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi tạo hồ sơ bác sĩ";
      })
      
      // Update Doctor Profile
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response structure: { statusCode, success, message, data: [...] }
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.profile = action.payload.data[0] || null;
        } else {
          state.profile = action.payload || null;
        }
        state.success = true;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi cập nhật hồ sơ bác sĩ";
      })
      
      // // Delete Doctor Profile
      // .addCase(deleteDoctorProfile.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(deleteDoctorProfile.fulfilled, (state) => {
      //   state.loading = false;
      //   state.profile = null;
      //   state.success = true;
      // })
      // .addCase(deleteDoctorProfile.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.error.message || "Lỗi khi xóa hồ sơ bác sĩ";
      // });
  },
});

export const { clearError, clearSuccess, setProfile } = doctorProfileSlice.actions;
export default doctorProfileSlice.reducer; 