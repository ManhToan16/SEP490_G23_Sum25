import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "@/shared/components/common/LoadingSpinner";

// Lazy load doctor pages
const Dashboard = React.lazy(() => import("@/pages/doctor/Dashboard"));
const MyInfo = React.lazy(() => import("@/pages/doctor/MyInfo"));
const MySchedule = React.lazy(() => import("@/pages/doctor/MySchedule"));
const AppointmentQueue = React.lazy(
  () => import("@/pages/doctor/AppointmentQueue")
);
const CreateMedicalRecord = React.lazy(
  () => import("@/pages/doctor/CreateMedicalRecord")
);

const DoctorRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-info" element={<MyInfo />} />
        <Route path="schedule" element={<MySchedule />} />
        <Route path="queue" element={<AppointmentQueue />} />
        <Route path="create-record" element={<CreateMedicalRecord />} />
      </Routes>
    </Suspense>
  );
};

export default DoctorRoutes;
