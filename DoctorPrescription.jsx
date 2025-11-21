// src/pages/DoctorPrescription.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const API_BASE = 'http://localhost:4000';

const emptyItem = { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' };

const DoctorPrescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([emptyItem]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/prescriptions/appointment/${appointmentId}`);
        setExisting(data);
        setDiagnosis(data.prescription.diagnosis || '');
        setNotes(data.prescription.notes || '');
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(
            data.items.map((it) => ({
              medicine_name: it.medicine_name || '',
              dosage: it.dosage || '',
              frequency: it.frequency || '',
              duration: it.duration || '',
              instructions: it.instructions || '',
            }))
          );
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err);
          setError('Failed to load prescription data');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appointmentId]);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addRow = () => setItems((prev) => [...prev, emptyItem]);
  const removeRow = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const filteredItems = items.filter((it) => it.medicine_name.trim() !== '');

    try {
      await api.post('/prescriptions', {
        appointment_id: Number(appointmentId),
        diagnosis,
        notes,
        items: filteredItems,
      });

      navigate('/doctor');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading prescription...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div>
          <h2 className="page-title">Prescription</h2>
          <p className="page-subtitle">
            Appointment ID: <b>{appointmentId}</b>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {existing?.prescription?.pdf_url && (
            <a
              href={`${API_BASE}${existing.prescription.pdf_url}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              View / Print PDF
            </a>
          )}
          <Link to="/doctor" className="btn btn-secondary">
            Back to schedule
          </Link>
        </div>
      </div>

      {existing && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.6rem 0.8rem',
            borderRadius: '0.6rem',
            background: 'rgba(34,197,94,0.1)',
            fontSize: '0.85rem',
          }}
        >
          A prescription already exists. Updating will overwrite its content.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="label">Diagnosis</label>
        <textarea
          className="input"
          style={{ minHeight: 70, resize: 'vertical' }}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Clinical diagnosis"
        />

        <label className="label">General notes / advice</label>
        <textarea
          className="input"
          style={{ minHeight: 60, resize: 'vertical' }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Follow-up, lifestyle advice, red flags, etc."
        />

        <div style={{ marginTop: '1rem', marginBottom: '0.4rem' }}>
          <span className="label">Medicines</span>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              borderRadius: '0.8rem',
              border: '1px solid rgba(148,163,184,0.4)',
              padding: '0.7rem',
              marginBottom: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="Medicine name"
                value={item.medicine_name}
                onChange={(e) => updateItem(index, 'medicine_name', e.target.value)}
              />
              <input
                className="input"
                style={{ width: '140px' }}
                placeholder="Dosage (e.g. 500mg)"
                value={item.dosage}
                onChange={(e) => updateItem(index, 'dosage', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="Frequency (e.g. 2 times/day)"
                value={item.frequency}
                onChange={(e) => updateItem(index, 'frequency', e.target.value)}
              />
              <input
                className="input"
                style={{ width: '140px' }}
                placeholder="Duration (e.g. 5 days)"
                value={item.duration}
                onChange={(e) => updateItem(index, 'duration', e.target.value)}
              />
            </div>
            <textarea
              className="input"
              style={{ marginTop: '0.4rem', minHeight: 40, resize: 'vertical' }}
              placeholder="Instructions (before food, etc.)"
              value={item.instructions}
              onChange={(e) => updateItem(index, 'instructions', e.target.value)}
            />

            {items.length > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '0.3rem' }}
                onClick={() => removeRow(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginBottom: '1rem' }}
          onClick={addRow}
        >
          + Add medicine
        </button>

        {error && (
          <p style={{ color: 'salmon', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn" style={{ width: '100%' }} disabled={saving}>
          {saving ? 'Saving...' : 'Save prescription'}
        </button>
      </form>
    </div>
  );
};

export default DoctorPrescription;