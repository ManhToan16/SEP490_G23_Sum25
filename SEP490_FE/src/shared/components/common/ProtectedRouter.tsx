import { useSelector } from "react-redux"; 
import { Navigate } from "react-router-dom";
import { selectIsAuthenticated, selectUser } from "@/shared/store/slices/authSlice";

const ProtectedRoute = ({ children, requiredRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Nếu chưa đăng nhập → chuyển về trang login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Nếu có yêu cầu role và không khớp → unauthorized
  if (
    requiredRoles &&
    Array.isArray(requiredRoles) &&
    !requiredRoles.includes(user?.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;