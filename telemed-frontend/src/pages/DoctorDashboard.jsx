// moved from telemed-frontend/pages
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/appointments/me');
        const list = Array.isArray(data) ? data : data?.appointments ?? [];
        setAppointments(list);
      } catch (err) {
        console.error(err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading schedule...</div>;
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>;

  return (
    <>
      <h2 className="page-title">Doctor schedule</h2>
      <p className="page-subtitle">Your tele-consultations and prescriptions.</p>
      <div style={{ marginTop: '0.6rem' }}>
        <Link to="/tests" className="btn">TeleHealth Tests</Link>
      </div>

      {appointments.length === 0 ? (
        <div className="card" style={{ marginTop: '1rem' }}>
          <p>No appointments yet.</p>
        </div>
      ) : (
        <div
          className="grid-2"
          style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {appointments.map((a) => {
            const dateStr = a?.scheduled_at ? new Date(a.scheduled_at).toLocaleString() : 'TBD';
            const key = a.id ?? `${a.patient_id}-${a.scheduled_at || 'na'}`;
            return (
              <div key={key} className="card">
                <div className="card-title" style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
                  Patient: {a.patient_name || `#${a.patient_id ?? 'N/A'}`}
                </div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{dateStr}</p>
                <p style={{ fontSize: '0.85rem' }}>Status: {a?.status ?? 'unknown'}</p>

                {a.meeting_url && (
                  <a
                    href={a.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{ marginTop: '0.4rem', marginRight: '0.4rem', display: 'inline-block' }}
                  >
                    Join call
                  </a>
                )}

                <Link
                  to={`/doctor/appointment/${a.id}/prescription`}
                  className="btn btn-secondary"
                  style={{ marginTop: '0.4rem', display: 'inline-block' }}
                >
                  Prescription
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default DoctorDashboard;
