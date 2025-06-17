import ParaclinicalDashboard from '../pages/Paraclinical/Dashboard';
import { Navigate } from 'react-router-dom';

const PARACLINICAL_ROUTES = [
  {
    path: '/paraclinical',
    element: <ParaclinicalDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default PARACLINICAL_ROUTES;