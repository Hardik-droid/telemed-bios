import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const userJson = localStorage.getItem('telemed_user');
  const user = userJson ? JSON.parse(userJson) : null;

  const logout = () => {
    localStorage.removeItem('telemed_token');
    localStorage.removeItem('telemed_user');
    window.location.href = '/';
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="nav-brand">Telemed</Link>
      </div>
      <div className="nav-right">
        <Link to="/">Home</Link>
        <Link to="/tests">TeleHealth Tests</Link>
        <Link to="/mediquick">MediQuick</Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && user.role === 'patient' && <Link to="/patient">Dashboard</Link>}
        {user && user.role === 'doctor' && <Link to="/doctor">Dashboard</Link>}
        {user && <button className="btn btn-link" onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
