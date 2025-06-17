import PatientDashboard from '../pages/Doctor/Dashboard';
import { Navigate } from 'react-router-dom';
import DoctorDashboard from '../pages/Doctor/Dashboard';

const DOCTOR_ROUTES = [
  {
    path: '/doctor',
    // element: <PatientDashboard />,
    element: <DoctorDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default DOCTOR_ROUTES;