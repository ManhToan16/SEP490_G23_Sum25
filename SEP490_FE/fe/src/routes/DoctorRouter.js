import PatientDashboard from '../pages/Doctor/Dashboard';
import { Navigate } from 'react-router-dom';
import DoctorDashboard from '../pages/Doctor/doctor/DoctorDashboard';
import DoctorDashboard1 from '../pages/Doctor/Dashboard';

const DOCTOR_ROUTES = [
  {
    path: '/doctor',
    element: <DoctorDashboard />,
    // element: <DoctorDashboard1 />,
    // element: <DoctorDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default DOCTOR_ROUTES;