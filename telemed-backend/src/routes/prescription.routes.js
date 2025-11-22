// src/routes/prescription.routes.js
const express = require('express');
const auth = require('../middlewares/auth.middleware');
const {
  createPrescription,
  getByAppointment,
  getPdf, // import
} = require('../controllers/prescription.controller');

const router = express.Router();

// Only doctors can create prescriptions
router.post('/', auth(['doctor']), createPrescription);

// Patient or doctor can view prescriptions for their appointments
router.get('/appointment/:appointmentId', auth(['patient', 'doctor']), getByAppointment);

// PDF route: patient or doctor can open PDF by prescription ID
router.get('/:prescriptionId/pdf', auth(['patient', 'doctor']), getPdf);

module.exports = router;