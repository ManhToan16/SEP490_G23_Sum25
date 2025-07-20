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

  // Nếu là môi trường dev và user là ADMIN thì cho phép vào mọi màn hình
  if (process.env.NODE_ENV === 'development' && (user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'RECEPTIONIST' || user?.role === 'NURSE' || user?.role === 'TECHNICIAN')) {
    return children;
  }

  console.log("NODE_ENV:", process.env.NODE_ENV, "user:", user, "requiredRoles:", requiredRoles);

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