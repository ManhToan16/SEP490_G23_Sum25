import { useSelector } from "react-redux"; 
import { Navigate } from "react-router-dom";
import { selectIsAuthenticated, selectUser } from "@/shared/store/slices/authSlice";
import type { ReactNode } from "react";
import { useAuth } from "@/shared/hooks/business/useAuth";


interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading || !user) {
    return <div>Loading...</div>; // hoặc spinner đẹp hơn
  }

  if (!isAuthenticated) {
    return <Navigate to="/403" replace />;
  }

  if (
    requiredRoles &&
    Array.isArray(requiredRoles) &&
    !requiredRoles.includes(user?.role)
  ) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;