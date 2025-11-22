const express = require('express');
const auth = require('../middlewares/auth.middleware');
const { createTranscript } = require('../controllers/transcript.controller');

const router = express.Router();

// Save a transcript (patient or doctor)
router.post('/', auth(['patient','doctor']), createTranscript);

module.exports = router;
