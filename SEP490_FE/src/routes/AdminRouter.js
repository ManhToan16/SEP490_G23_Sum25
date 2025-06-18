import AdminDashboard from '../pages/Admin/Dashboard';
import { Navigate } from 'react-router-dom';

const ADMIN_ROUTES = [
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default ADMIN_ROUTES;