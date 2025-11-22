// src/controllers/appointment.controller.js
const db = require('../db');

exports.createAppointment = async (req, res) => {
  const patientId = req.user.id;
  const { doctor_id, scheduled_at } = req.body;

  if (!doctor_id || !scheduled_at) {
    return res.status(400).json({ message: 'Doctor and datetime are required' });
  }

  try {
    const [doctorRows] = await db.query(
      'SELECT id FROM users WHERE id = ? AND role = "doctor"',
      [doctor_id]
    );
    if (doctorRows.length === 0) {
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    const [result] = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status)
       VALUES (?, ?, ?, 'pending')`,
      [patientId, doctor_id, scheduled_at]
    );

    res.status(201).json({ id: result.insertId, message: 'Appointment created' });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyAppointments = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    let query, params;
    if (role === 'patient') {
      query = `
        SELECT a.*, d.name AS doctor_name
        FROM appointments a
        JOIN users d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        ORDER BY a.scheduled_at DESC`;
      params = [userId];
    } else if (role === 'doctor') {
      query = `
        SELECT a.*, p.name AS patient_name
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        WHERE a.doctor_id = ?
        ORDER BY a.scheduled_at DESC`;
      params = [userId];
    } else {
      return res.status(403).json({ message: 'Only patients or doctors can view appointments' });
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};