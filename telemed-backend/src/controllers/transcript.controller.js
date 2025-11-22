const db = require('../db');

exports.createTranscript = async (req, res) => {
  try {
    const userId = req.user && req.user.id ? req.user.id : null;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Transcript text is required' });
    }

    const [result] = await db.query(
      'INSERT INTO transcripts (user_id, transcript_text) VALUES (?, ?)',
      [userId, text]
    );

    res.status(201).json({ id: result.insertId, message: 'Transcript saved' });
  } catch (err) {
    console.error('Save transcript error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
