import PatientDashboard from '../pages/Doctor/Dashboard';
import { Navigate } from 'react-router-dom';

const DOCTOR_ROUTES = [
  {
    path: '/doctor',
    element: <PatientDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default DOCTOR_ROUTES;