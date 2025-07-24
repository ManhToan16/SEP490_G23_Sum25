import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { patientService } from "../../services/patientService";
import { doctorService } from "../../services/doctorService";
import { appointmentService } from "../../services/appointmentService";

// Simple async actions sử dụng services
export const fetchPatients = createAsyncThunk(
  "data/fetchPatients",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      return await patientService.getPatients(params);
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách bệnh nhân";
      return rejectWithValue(message);
    }
  }
);

export const fetchDoctors = createAsyncThunk(
  "data/fetchDoctors",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      return await doctorService.getDoctors(params);
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách bác sĩ";
      return rejectWithValue(message);
    }
  }
);

export const fetchAppointments = createAsyncThunk(
  "data/fetchAppointments",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      return await appointmentService.getAppointments(params);
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách lịch hẹn";
      return rejectWithValue(message);
    }
  }
);

export const createPatient = createAsyncThunk(
  "data/createPatient",
  async (patientData: any, { rejectWithValue }) => {
    try {
      return await patientService.createPatient(patientData);
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tạo bệnh nhân";
      return rejectWithValue(message);
    }
  }
);

export const updatePatient = createAsyncThunk(
  "data/updatePatient",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await patientService.updatePatient(id, data);
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể cập nhật bệnh nhân";
      return rejectWithValue(message);
    }
  }
);

export const deletePatient = createAsyncThunk(
  "data/deletePatient",
  async (id: string, { rejectWithValue }) => {
    try {
      await patientService.deletePatient(id);
      return id;
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể xóa bệnh nhân";
      return rejectWithValue(message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  "data/createAppointment",
  async (appointmentData: any, { rejectWithValue }) => {
    try {
      return await appointmentService.createAppointment(appointmentData);
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tạo lịch hẹn";
      return rejectWithValue(message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  "data/updateAppointment",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await appointmentService.updateAppointment(id, data);
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể cập nhật lịch hẹn";
      return rejectWithValue(message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  "data/deleteAppointment",
  async (id: string, { rejectWithValue }) => {
    try {
      await appointmentService.deleteAppointment(id);
      return id;
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể xóa lịch hẹn";
      return rejectWithValue(message);
    }
  }
);

// Simple initial state
const initialState = {
  patients: [],
  doctors: [],
  appointments: [],
  loading: {
    patients: false,
    doctors: false,
    appointments: false,
  },
  error: null,
};

// Simple data slice
const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Local state updates (optimistic updates)
    addPatientLocal: (state, action) => {
      state.patients.push(action.payload);
    },
    updatePatientLocal: (state, action) => {
      const index = state.patients.findIndex(
        (p: any) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.patients[index] = action.payload;
      }
    },
    removePatientLocal: (state, action) => {
      state.patients = state.patients.filter(
        (p: any) => p.id !== action.payload
      );
    },
    addAppointmentLocal: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointmentLocal: (state, action) => {
      const index = state.appointments.findIndex(
        (a: any) => a.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    removeAppointmentLocal: (state, action) => {
      state.appointments = state.appointments.filter(
        (a: any) => a.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading.patients = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading.patients = false;
        state.patients = action.payload.data || action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading.patients = false;
        state.error = action.payload as string || "Error fetching patients";
      })
      // Fetch Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading.doctors = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading.doctors = false;
        state.doctors = action.payload.data || action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading.doctors = false;
        state.error = action.payload as string || "Error fetching doctors";
      })
      // Fetch Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading.appointments = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading.appointments = false;
        state.appointments = action.payload.data || action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading.appointments = false;
        state.error = action.payload as string || "Error fetching appointments";
      })
      // Create Patient
      .addCase(createPatient.fulfilled, (state, action) => {
        state.patients.push(action.payload);
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.error = action.payload as string || "Error creating patient";
      })
      // Update Patient
      .addCase(updatePatient.fulfilled, (state, action) => {
        const payload: any = action.payload;
        const index = state.patients.findIndex(
          (p: any) => p.id === payload.data?.id || payload.id
        );
        if (index !== -1) {
          state.patients[index] = payload.data || payload;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.error = action.payload as string || "Error updating patient";
      })
      // Delete Patient
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter(
          (p: any) => p.id !== action.payload
        );
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.error = action.payload as string || "Error deleting patient";
      })
      // Create Appointment
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload.data || action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.error = action.payload as string || "Error creating appointment";
      })
      // Update Appointment
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const payload: any = action.payload;
        const index = state.appointments.findIndex(
          (a: any) => a.id === payload.data?.id || payload.id
        );
        if (index !== -1) {
          state.appointments[index] = payload.data || payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.error = action.payload as string || "Error updating appointment";
      })
      // Delete Appointment
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          (a: any) => a.id !== action.payload
        );
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.error = action.payload as string || "Error deleting appointment";
      });
  },
});

export const {
  clearError,
  addPatientLocal,
  updatePatientLocal,
  removePatientLocal,
  addAppointmentLocal,
  updateAppointmentLocal,
  removeAppointmentLocal,
} = dataSlice.actions;

export default dataSlice.reducer;
