// src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config/env');

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  const { name, phone, password, role, specialization, registration_no } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ message: 'Name, phone, and password are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Phone already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await db.query(
      `INSERT INTO users (name, phone, password_hash, role, specialization, registration_no)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        phone,
        passwordHash,
        role || 'patient',
        specialization || null,
        registration_no || null,
      ]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        specialization: user.specialization,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};