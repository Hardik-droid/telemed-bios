import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Welcome to Telemed</h1>
    <p>A simple telemedicine demo app.</p>
    <div style={{ marginTop: '1rem' }}>
      <Link to="/login" className="btn" style={{ marginRight: '0.5rem' }}>Login</Link>
      <Link to="/register" className="btn btn-secondary">Register</Link>
    </div>
  </div>
);

export default Landing;
