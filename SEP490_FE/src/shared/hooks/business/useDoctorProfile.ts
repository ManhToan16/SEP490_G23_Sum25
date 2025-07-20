import { useAppDispatch, useAppSelector } from "@/shared/store";
import {
  fetchDoctorProfile,
  updateDoctorProfile,
  createDoctorProfile,
  clearError,
  clearSuccess,
} from "@/shared/store/slices/doctorProfileSlice";

export const useDoctorProfile = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error, success } = useAppSelector(
    (state) => state.doctorProfile
  );

  const loadProfile = (doctorId: string) => {
    return dispatch(fetchDoctorProfile(doctorId));
  };

  const createProfile = (profileData: {
    doctorId: string;
    qualifications: string;
    yearsOfExperience: number;
    biography: string;
    avatar: string;
  }) => {
    return dispatch(createDoctorProfile(profileData));
  };

  const updateProfile = (doctorId: string, data: {
    doctorId: string;
    qualifications: string;
    yearsOfExperience: number;
    biography: string;
    avatar: string;
  }) => {
    return dispatch(updateDoctorProfile({ doctorId, data }));
  };

  const clearMessages = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    profile,
    loading,
    error,
    success,
    loadProfile,
    createProfile,
    updateProfile,
    clearMessages,
  };
};