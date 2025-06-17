import PatientDashboard from '../pages/Patient/Dashboard';
import { Navigate } from 'react-router-dom';

const PATIENT_ROUTES = [
  {
    path: '/',
    element: <PatientDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default PATIENT_ROUTES;