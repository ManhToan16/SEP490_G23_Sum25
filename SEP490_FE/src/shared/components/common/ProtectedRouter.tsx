import { useSelector } from "react-redux"; 
import { Navigate } from "react-router-dom";
import { selectIsAuthenticated, selectUser } from "@/shared/store/slices/authSlice";

const ProtectedRoute = ({ children, requiredRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

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