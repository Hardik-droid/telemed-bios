-- telemed-backend/seed.sql
USE telemed;

-- Password hashes are placeholders. Register through API to generate real bcrypt hashes.
INSERT INTO users (name, phone, password_hash, role, specialization, registration_no)
VALUES
  ('Test', '1234', NULL, 'patient', NULL, NULL),
  ('Dr. Alice Sharma', '9999990002', NULL, 'doctor', 'General Physician', 'REG-12345');

-- Create an appointment between patient (id 1) and doctor (id 2). Adjust ids if necessary.
INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status)
VALUES (1, 2, NOW(), 'pending');

-- Create an empty prescription for the appointment
INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, notes, pdf_url)
VALUES (1, 2, 1, 'Sample diagnosis', 'Follow up in 7 days', NULL);

-- Add a sample prescription item
INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
VALUES (1, 'Paracetamol', '500mg', 'Twice daily', '5 days', 'After food');
