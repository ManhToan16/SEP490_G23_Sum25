import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="flex justify-between">
        <h1 className="text-xl font-bold">Clinic System</h1>
        <div className="space-x-4">
          <Link to="/">Home</Link>
          <Link to="/clinics">Clinics</Link>
          <Link to="/booking">Booking</Link>
          <Link to="/records">Records</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;