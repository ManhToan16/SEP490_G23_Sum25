import ReceptionistDashboard from '../pages/Receptionist/Dashboard';
import { Navigate } from 'react-router-dom';

const RECEPTIONIST_ROUTES = [
  {
    path: '/receptionist',
    element: <ReceptionistDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default RECEPTIONIST_ROUTES;