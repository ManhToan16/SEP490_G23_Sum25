import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loading from "@/shared/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary";
import { ROUTES } from "@/shared/constants/routes";

// Lazy imports for code splitting
const AuthRoutes = React.lazy(() => import("./AuthRoutes"));
const PatientRoutes = React.lazy(() => import("./PatientRoutes"));
const DoctorRoutes = React.lazy(() => import("./DoctorRoutes"));
const ReceptionistRoutes = React.lazy(() => import("./ReceptionistRoutes"));
const AdminRoutes = React.lazy(() => import("./AdminRoutes"));

// Common pages
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const HomePage = React.lazy(() => import("@/pages/patient/Home"));

interface AppRouterProps {
  className?: string;
}

const AppRouter: React.FC<AppRouterProps> = ({ className }) => {
  return (
    <div className={className}>
      <ErrorBoundary>
        <Suspense fallback={<Loading fullScreen text="Đang tải ứng dụng..." />}>
          <Routes>
            {/* Default redirect */}
            <Route
              path={ROUTES.ROOT}
              element={<Navigate to={ROUTES.HOME} replace />}
            />

            {/* Home route */}
            <Route path={ROUTES.HOME} element={<HomePage />} />

            {/* Authentication routes */}
            <Route path="/auth/*" element={<AuthRoutes />} />

            {/* Patient routes */}
            <Route path="/patient/*" element={<PatientRoutes />} />

            {/* Doctor routes */}
            <Route path="/doctor/*" element={<DoctorRoutes />} />

            {/* Receptionist routes */}
            <Route path="/receptionist/*" element={<ReceptionistRoutes />} />

            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Error routes */}
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            <Route
              path="*"
              element={<Navigate to={ROUTES.NOT_FOUND} replace />}
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default AppRouter;
