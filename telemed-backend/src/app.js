// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import BookAppointment from './pages/BookAppointment';
import DoctorPrescription from './pages/DoctorPrescription'; // ✅ NEW

const PrivateRoute = ({ children, allowedRoles }) => {
  const userJson = localStorage.getItem('telemed_user');
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => (
  <div className="app-shell">
    <Navbar />
    <main className="app-content">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/book"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <BookAppointment />
            </PrivateRoute>
          }
        />

        {/* ✅ NEW – doctor writes / views prescription for an appointment */}
        <Route
          path="/doctor/appointment/:appointmentId/prescription"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
              <DoctorPrescription />
            </PrivateRoute>
          }
        />
      </Routes>
    </main>
  </div>
);

export default App;