import { Navigate } from 'react-router-dom';
import DoctorDashboard from '../pages/Doctor/DoctorDashboard';

const DOCTOR_ROUTES = [
  {
    path: '/doctor',
    element: <DoctorDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default DOCTOR_ROUTES;