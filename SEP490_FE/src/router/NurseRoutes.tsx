import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "@/shared/components/common/LoadingSpinner";

// Lazy load nurse pages
const Dashboard = React.lazy(() => import("@/pages/nurse/Dashboard"));
const PatientQueue = React.lazy(() => import("@/pages/nurse/PatientQueue"));
const LabPatientQueue = React.lazy(() => import("@/pages/nurse/LabPatientQueue"));
const SupplyManagement = React.lazy(() => import("@/pages/nurse/SupplyManagement"));

const NurseRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patient-queue" element={<PatientQueue />} />
        <Route path="lab-patient-queue" element={<LabPatientQueue />} />
        <Route path="supply-management" element={<SupplyManagement />} />
      </Routes>
    </Suspense>
  );
};

export default NurseRoutes; 