// src/routes/appointment.routes.js
const express = require('express');
const auth = require('../middlewares/auth.middleware');
const {
  createAppointment,
  getMyAppointments,
} = require('../controllers/appointment.controller');

const router = express.Router();

// Patient creates appointment
router.post('/', auth(['patient']), createAppointment);

// Patient or doctor views their appointments
router.get('/me', auth(['patient', 'doctor']), getMyAppointments);

module.exports = router;