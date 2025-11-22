// moved from pages/Logic.jsx (was named Login)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('telemed_token', data.token);
      localStorage.setItem('telemed_user', JSON.stringify(data.user));
      navigate(data.user.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="form-card card">
      <h2 className="page-title">Login</h2>
      <form onSubmit={onSubmit}>
        <label className="label">Phone</label>
        <input
          className="input"
          name="phone"
          value={form.phone}
          onChange={onChange}
        />
        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
        />
        {error && <p style={{ color: 'salmon', fontSize: '0.85rem' }}>{error}</p>}
        <button className="btn" style={{ width: '100%', marginTop: '0.8rem' }}>
          Login
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
        New user? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
