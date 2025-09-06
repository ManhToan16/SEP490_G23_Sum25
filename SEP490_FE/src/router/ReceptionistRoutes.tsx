import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "@/shared/components/common/LoadingSpinner";

// Lazy load receptionist pages
const Dashboard = React.lazy(() => import("@/pages/receptionist/Dashboard"));
const PatientList = React.lazy(
  () => import("@/pages/receptionist/PatientList")
);
const AppointmentList = React.lazy(
  () => import("@/pages/receptionist/AppointmentList")
);
const CreatePatient = React.lazy(
  () => import("@/pages/receptionist/CreatePatient")
);
const CreateAppointment = React.lazy(
  () => import("@/pages/receptionist/CreateAppointment")
);
const AppointmentPendingConfirm = React.lazy(
  () => import("@/pages/receptionist/AppointmentPendingConfirm")
);
const AppointmentDetail = React.lazy(
  () => import("@/pages/receptionist/AppointmentDetail")
);
const UserProfile = React.lazy(() => import("@/pages/receptionist/UserProfile"));

// Shared patient pages (also used by admin)
const PatientMedicalRecords = React.lazy(() => import("@/pages/admin/PatientMedicalRecords"));
const PatientVisit = React.lazy(() => import("@/pages/admin/PatientVisit"));

const ReceptionistRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="appointments/:id" element={<AppointmentDetail />} />
        <Route path="create-patient" element={<CreatePatient />} />
        <Route path="create-appointment" element={<CreateAppointment />} />
        <Route path="appointments-pending-confirm" element={<AppointmentPendingConfirm />} />
        <Route path="profile" element={<UserProfile />} />
        
        {/* Shared patient routes - accessible to both ADMIN and RECEPTIONIST */}
        <Route path="patient/:id/medical-records" element={<PatientMedicalRecords />} />
        <Route path="patient/:id/history" element={<PatientVisit />} />
      </Routes>
    </Suspense>
  );
};

export default ReceptionistRoutes;
