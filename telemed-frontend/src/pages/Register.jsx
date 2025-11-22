import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-card card">
      <h2 className="page-title">Register</h2>
      <form onSubmit={onSubmit}>
        <label className="label">Full name</label>
        <input className="input" name="name" value={form.name} onChange={onChange} />
        <label className="label">Phone</label>
        <input className="input" name="phone" value={form.phone} onChange={onChange} />
        <label className="label">Password</label>
        <input className="input" type="password" name="password" value={form.password} onChange={onChange} />
        <label className="label">Role</label>
        <select name="role" value={form.role} onChange={onChange} className="input">
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        {error && <p style={{ color: 'salmon' }}>{error}</p>}
        <button className="btn" style={{ width: '100%', marginTop: '0.8rem' }}>Register</button>
      </form>
    </div>
  );
};

export default Register;
