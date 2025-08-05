import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "@/shared/components/common/LoadingSpinner";
import ScheduleManagement from "@/pages/admin/ScheduleManagement";
import MaterialTypeManagement from "@/pages/admin/MaterialTypeManagement";
import SupplierManagement from "@/pages/admin/SupplierManagement";

// Lazy load admin pages
const Dashboard = React.lazy(() => import("@/pages/admin/Dashboard"));
const AccountManagement = React.lazy(
  () => import("@/pages/admin/AccountManagement")
);
const ClinicManagement = React.lazy(
  () => import("@/pages/admin/ClinicManagement")
);
const DoctorFeedbackList = React.lazy(
  () => import("@/pages/admin/DoctorFeedbackList")
);
const Logs = React.lazy(() => import("@/pages/admin/Logs"));
const PatientListAdmin = React.lazy(
  () => import("@/pages/admin/PatientListAdmin")
);


const AdminRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="accounts" element={<AccountManagement />} />
        <Route path="clinic" element={<ClinicManagement />} />
        <Route path="doctor-feedback" element={<DoctorFeedbackList />} />
        <Route path="schedule-manage" element={<ScheduleManagement/>}/>
        {/* <Route path="materials" element={<MaterialManagement/>}/> */}
        <Route path="material-types" element={<MaterialTypeManagement/>}/>
        <Route path="suppliers" element={<SupplierManagement/>}/>
        <Route path="logs" element={<Logs />} />
        <Route path="patients" element={<PatientListAdmin />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
