// src/pages/PatientDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/appointments/me');
        // If API returns an object like { appointments: [...] } adjust accordingly.
        // We'll handle both shapes:
        const list = Array.isArray(data) ? data : data?.appointments ?? [];
        setAppointments(list);
      } catch (e) {
        console.error(e);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="page-title">Your appointments</h2>
        <Link to="/book" className="btn">+ Book</Link>
      </div>

      {appointments.length === 0 ? (
        <div className="card" style={{ marginTop: '1rem' }}>
          <p>No appointments yet.</p>
          <Link to="/book" className="btn" style={{ marginTop: '0.5rem' }}>
            Book now
          </Link>
        </div>
      ) : (
        <div className="grid-2" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {appointments.map((a) => {
            const dateStr = a?.scheduled_at ? new Date(a.scheduled_at).toLocaleString() : 'TBD';
            const doctorLabel = a?.doctor_name || `Doctor #${a?.doctor_id ?? 'N/A'}`;
            return (
              <div className="card" key={a.id ?? `${a.doctor_id}-${a.scheduled_at}`}>
                <div className="card-title" style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
                  Dr. {doctorLabel}
                </div>
                <p style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{dateStr}</p>
                <p style={{ fontSize: '0.85rem' }}>Status: {a?.status ?? 'unknown'}</p>
                {a?.prescription_id && (
                  <Link to={`/prescriptions/${a.prescription_id}`} className="btn btn-secondary" style={{ marginTop: '0.6rem', display: 'inline-block' }}>
                    View Prescription
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default PatientDashboard;
