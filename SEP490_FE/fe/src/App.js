import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ROUTES from './routes';

const App = () => {
  return (
    <Routes>
      {ROUTES.patient.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      {ROUTES.doctor.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      {ROUTES.paraclinical.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      {ROUTES.receptionist.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      {ROUTES.admin.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>

    // <div className="App">
    //   <DoctorDashboard />
    // </div>
  );
};

export default App;