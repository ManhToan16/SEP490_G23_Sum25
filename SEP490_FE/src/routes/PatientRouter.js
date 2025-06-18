import LoginPage from '../pages/Auth/Login';
import HomePage from '../pages/Patient/HomePage';
import { Navigate } from 'react-router-dom';

const PATIENT_ROUTES = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default PATIENT_ROUTES;