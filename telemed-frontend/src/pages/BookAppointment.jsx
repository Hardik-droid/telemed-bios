import React, { useState, useEffect } from 'react';
import api from '../api';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/doctors');
        setDoctors(data || []);
        setDoctorId((data && data[0]?.id) || '');
      } catch (err) {
        console.error(err);
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', { doctor_id: Number(doctorId), scheduled_at: date });
      alert('Booked');
    } catch (err) {
      console.error(err);
      setError('Failed to book appointment');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="form-card card">
      <h2 className="page-title">Book appointment</h2>
      <form onSubmit={submit}>
        <label className="label">Doctor</label>
        <select className="input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name || d.full_name || `Dr. ${d.id}`}</option>
          ))}
        </select>
        <label className="label">Date & time</label>
        <input className="input" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        {error && <p style={{ color: 'salmon' }}>{error}</p>}
        <button className="btn" style={{ marginTop: '0.8rem' }}>Book</button>
      </form>
    </div>
  );
};

export default BookAppointment;
