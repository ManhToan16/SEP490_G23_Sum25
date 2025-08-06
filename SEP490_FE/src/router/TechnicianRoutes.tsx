import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "@/shared/components/common/LoadingSpinner";

// Lazy load technician pages
const Dashboard = React.lazy(() => import("@/pages/technician/Dashboard"));
const TestSchedule = React.lazy(() => import("@/pages/technician/TestSchedule"));
const TestDetail = React.lazy(() => import("@/pages/technician/TestDetail"));

const TechnicianRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="test-schedule" element={<TestSchedule />} />
        <Route path="test-detail/:testId" element={<TestDetail />} />
      </Routes>
    </Suspense>
  );
};

export default TechnicianRoutes; 