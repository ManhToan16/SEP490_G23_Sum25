import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import Loading from "@/shared/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary";
import { ROUTES } from "@/shared/constants/routes";
import ProtectedRoute from "@/shared/components/common/ProtectedRouter";
import { checkAuth } from "@/shared/store/slices/authSlice";
import { useAppDispatch } from "@/shared/store/index";


// Lazy imports for code splitting
const AuthRoutes = React.lazy(() => import("./AuthRoutes"));
const PatientRoutes = React.lazy(() => import("./PatientRoutes"));
const DoctorRoutes = React.lazy(() => import("./DoctorRoutes"));
const ReceptionistRoutes = React.lazy(() => import("./ReceptionistRoutes"));
const AdminRoutes = React.lazy(() => import("./AdminRoutes"));

// Common pages
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const HomePage = React.lazy(() => import("@/pages/Home"));
const Health = React.lazy(() => import("@/pages/Health"));
const Forbidden = React.lazy(() => import("@/pages/Forbiden"));

interface AppRouterProps {
  className?: string;
}

const AppRouter: React.FC<AppRouterProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { loading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <Loading fullScreen text="Đang kiểm tra đăng nhập..." />;
  }

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

            {/* Health check route */}
            <Route path="/health" element={<Health />} />

            {/* Home route */}
            <Route path={ROUTES.HOME} element={<HomePage />} />

            {/* Authentication routes */}
            <Route path="/auth/*" element={<AuthRoutes />} />

            {/* Patient routes */}
            <Route path="/patient/*" element={<PatientRoutes />} />

            {/* Doctor routes */}
            <Route path="/doctor/*" element={
              <ProtectedRoute requiredRoles={["DOCTOR", "ADMIN"]}>
                <DoctorRoutes />
              </ProtectedRoute>
            } />

            {/* Receptionist routes */}
            <Route path="/receptionist/*" element={
              <ProtectedRoute requiredRoles={["RECEPTIONIST", "ADMIN"]}>
                <ReceptionistRoutes />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRoles={["ADMIN"]}>
                <AdminRoutes />
              </ProtectedRoute>
            } />

            {/* Error routes */}
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
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
