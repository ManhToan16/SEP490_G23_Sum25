import { useAppSelector, useAppDispatch } from "../../store";
import {
  fetchPatients,
  fetchDoctors,
  fetchAppointments,
  createPatient,
  updatePatient,
  deletePatient,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  addPatientLocal,
  updatePatientLocal,
  removePatientLocal,
  addAppointmentLocal,
  updateAppointmentLocal,
  removeAppointmentLocal,
  clearError,
} from "../../store/slices/dataSlice";

export const useData = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.data);

  // Fetch actions
  const loadPatients = async (params?: any) => {
    try {
      const result = await dispatch(fetchPatients(params)).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const loadDoctors = async (params?: any) => {
    try {
      const result = await dispatch(fetchDoctors(params)).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const loadAppointments = async (params?: any) => {
    try {
      const result = await dispatch(fetchAppointments(params)).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Patient actions
  const addPatient = async (patientData: any) => {
    try {
      const result = await dispatch(createPatient(patientData)).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const editPatient = async (id: string, patientData: any) => {
    try {
      const result = await dispatch(
        updatePatient({ id, data: patientData })
      ).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const removePatient = async (id: string) => {
    try {
      await dispatch(deletePatient(id)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Appointment actions
  const addAppointment = async (appointmentData: any) => {
    try {
      const result = await dispatch(
        createAppointment(appointmentData)
      ).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const editAppointment = async (id: string, appointmentData: any) => {
    try {
      const result = await dispatch(
        updateAppointment({ id, data: appointmentData })
      ).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      await dispatch(deleteAppointment(id)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Local state updates (for optimistic updates)
  const addPatientOptimistic = (patient: any) => {
    dispatch(addPatientLocal(patient));
  };

  const updatePatientOptimistic = (patient: any) => {
    dispatch(updatePatientLocal(patient));
  };

  const removePatientOptimistic = (id: string) => {
    dispatch(removePatientLocal(id));
  };

  const addAppointmentOptimistic = (appointment: any) => {
    dispatch(addAppointmentLocal(appointment));
  };

  const updateAppointmentOptimistic = (appointment: any) => {
    dispatch(updateAppointmentLocal(appointment));
  };

  const removeAppointmentOptimistic = (id: string) => {
    dispatch(removeAppointmentLocal(id));
  };

  // Clear error
  const clearDataError = () => {
    dispatch(clearError());
  };

  return {
    // Data
    patients: data.patients,
    doctors: data.doctors,
    appointments: data.appointments,
    loading: data.loading,
    error: data.error,

    // Fetch actions
    loadPatients,
    loadDoctors,
    loadAppointments,

    // Patient actions
    addPatient,
    editPatient,
    removePatient,

    // Appointment actions
    addAppointment,
    editAppointment,
    removeAppointment,

    // Optimistic updates
    addPatientOptimistic,
    updatePatientOptimistic,
    removePatientOptimistic,
    addAppointmentOptimistic,
    updateAppointmentOptimistic,
    removeAppointmentOptimistic,

    // Utils
    clearError: clearDataError,
  };
};
