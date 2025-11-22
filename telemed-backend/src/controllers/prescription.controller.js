const db = require('../db');
const PDFDocument = require('pdfkit'); // make sure `npm i pdfkit`

// createPrescription: inserts prescription, items and stores pdf_url
exports.createPrescription = async (req, res) => {
  const doctorId = req.user.id;
  const { appointment_id, diagnosis, notes, items } = req.body;

  if (!appointment_id) {
    return res.status(400).json({ message: 'Appointment ID is required' });
  }

  try {
    const [apps] = await db.query(
      'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
      [appointment_id, doctorId]
    );

    if (apps.length === 0) {
      return res.status(400).json({ message: 'Invalid appointment or not your appointment' });
    }

    const appointment = apps[0];

    const [presResult] = await db.query(
      `INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [appointment_id, doctorId, appointment.patient_id, diagnosis || null, notes || null]
    );

    const prescriptionId = presResult.insertId;

    if (Array.isArray(items) && items.length > 0) {
      const values = items.map((item) => [
        prescriptionId,
        item.medicine_name,
        item.dosage || null,
        item.frequency || null,
        item.duration || null,
        item.instructions || null,
      ]);

      await db.query(
        `INSERT INTO prescription_items
         (prescription_id, medicine_name, dosage, frequency, duration, instructions)
         VALUES ?`,
        [values]
      );
    }

    // store a URL that will serve the PDF on demand
    const pdfUrl = `/api/prescriptions/${prescriptionId}/pdf`;
    await db.query('UPDATE prescriptions SET pdf_url = ? WHERE id = ?', [pdfUrl, prescriptionId]);

    res.status(201).json({ id: prescriptionId, pdf_url: pdfUrl, message: 'Prescription created' });
  } catch (err) {
    console.error('Create prescription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// getByAppointment: returns prescription + items for an appointment (authorized patient/doctor)
exports.getByAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const userId = req.user.id;

  try {
    const [apps] = await db.query(
      'SELECT * FROM appointments WHERE id = ? AND (patient_id = ? OR doctor_id = ?)',
      [appointmentId, userId, userId]
    );
    if (apps.length === 0) {
      return res.status(403).json({ message: 'Not allowed to view this prescription' });
    }

    const [presRows] = await db.query(
      'SELECT * FROM prescriptions WHERE appointment_id = ?',
      [appointmentId]
    );
    if (presRows.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const prescription = presRows[0];

    const [items] = await db.query(
      'SELECT * FROM prescription_items WHERE prescription_id = ?',
      [prescription.id]
    );

    res.json({ prescription, items });
  } catch (err) {
    console.error('Get prescription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// getPdf (streamed PDF) - note: route should pass prescriptionId in params
exports.getPdf = async (req, res) => {
  const { prescriptionId } = req.params;
  const userId = req.user.id;

  try {
    // 1) Load prescription + appointment + doctor + patient
    const [rows] = await db.query(
      `
      SELECT
        p.*,
        a.scheduled_at,
        d.name        AS doctor_name,
        d.specialization,
        d.registration_no,
        pt.name       AS patient_name
      FROM prescriptions p
      JOIN appointments a ON p.appointment_id = a.id
      JOIN users d ON p.doctor_id = d.id
      JOIN users pt ON p.patient_id = pt.id
      WHERE p.id = ?
        AND (a.patient_id = ? OR a.doctor_id = ?)
      `,
      [prescriptionId, userId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Prescription not found or not allowed' });
    }

    const pres = rows[0];

    // 2) Load medicines
    const [items] = await db.query(
      'SELECT * FROM prescription_items WHERE prescription_id = ?',
      [prescriptionId]
    );

    // 3) Setup PDF response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=prescription-${prescriptionId}.pdf`
    );

    // 4) Generate PDF with pdfkit (streamed)
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // Header
    doc
      .fontSize(18)
      .text('CareConnect Telemedicine', { align: 'center' })
      .moveDown(0.3);
    doc.fontSize(14).text('Digital Prescription', { align: 'center' });
    doc.moveDown();

    // Doctor + patient details
    doc
      .fontSize(10)
      .text(`Doctor: Dr. ${pres.doctor_name} (${pres.specialization || 'N/A'})`)
      .text(`Reg. No: ${pres.registration_no || 'N/A'}`)
      .moveDown(0.5)
      .text(`Patient: ${pres.patient_name}`)
      .text(`Date: ${new Date(pres.created_at).toLocaleString()}`)
      .text(`Appointment: ${new Date(pres.scheduled_at).toLocaleString()}`)
      .moveDown();

    // Diagnosis
    if (pres.diagnosis) {
      doc.fontSize(11).text('Diagnosis:', { underline: true });
      doc.fontSize(10).text(pres.diagnosis).moveDown();
    }

    // Medicines table
    if (items.length > 0) {
      doc.fontSize(11).text('Medicines:', { underline: true }).moveDown(0.3);
      items.forEach((m, i) => {
        doc
          .fontSize(10)
          .text(
            `${i + 1}. ${m.medicine_name} — ${m.dosage || ''} | ${m.frequency || ''} | ${
              m.duration || ''
            }`
          );
        if (m.instructions) {
          doc.fontSize(9).fillColor('#555').text(`   Notes: ${m.instructions}`).fillColor('#000');
        }
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Notes / advice
    if (pres.notes) {
      doc.fontSize(11).text('Advice / Notes:', { underline: true });
      doc.fontSize(10).text(pres.notes).moveDown();
    }

    // Footer
    doc
      .moveDown()
      .fontSize(9)
      .fillColor('#555')
      .text(
        'This is a computer generated prescription from the CareConnect Telemedicine platform.',
        { align: 'center' }
      );

    doc.end();
  } catch (err) {
    console.error('Get PDF error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF' });
    }
  }
};
