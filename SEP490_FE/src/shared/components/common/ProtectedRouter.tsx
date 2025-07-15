import { useSelector } from "react-redux"; 
import { Navigate } from "react-router-dom";
import { selectIsAuthenticated, selectUser } from "@/shared/store/slices/authSlice";

const ProtectedRoute = ({ children, requiredRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

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