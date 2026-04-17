const { db } = require('../firebase');

/**
 * GET /api/sessions
 * Returns all study sessions for the user, ordered by date desc.
 */
async function getSessions(req, res) {
  try {
    const { uid } = req.user;
    const snapshot = await db.collection('sessions')
      .where('userId', '==', uid)
      .orderBy('date', 'desc')
      .get();

    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ sessions });
  } catch (err) {
    console.error('getSessions error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

/**
 * POST /api/sessions
 * Add a new study session.
 * Body: { date, subject, duration }
 */
async function createSession(req, res) {
  try {
    const { uid } = req.user;
    const { date, subject, duration } = req.body;

    if (!date || !subject || !duration) {
      return res.status(400).json({ error: 'date, subject, and duration are required' });
    }

    const durationNum = Number(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      return res.status(400).json({ error: 'duration must be a positive number (minutes)' });
    }

    const newSession = {
      userId: uid,
      date,
      subject,
      duration: durationNum,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('sessions').add(newSession);

    // Update totalHours in user profile
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const currentHours = userDoc.data().totalHours || 0;
      const addedHours = Math.round((durationNum / 60) * 100) / 100;
      await userRef.update({ totalHours: currentHours + addedHours });
    }

    // Add session notification
    await db.collection('notifications').add({
      userId: uid,
      text: `📅 Study session logged: ${subject} for ${durationNum} minutes`,
      time: 'just now',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ session: { id: docRef.id, ...newSession } });
  } catch (err) {
    console.error('createSession error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

/**
 * DELETE /api/sessions/:id
 * Remove a study session.
 */
async function deleteSession(req, res) {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const sessionRef = db.collection('sessions').doc(id);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists || sessionDoc.data().userId !== uid) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Subtract hours from user profile
    const { duration } = sessionDoc.data();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const currentHours = userDoc.data().totalHours || 0;
      const subtractedHours = Math.round((duration / 60) * 100) / 100;
      await userRef.update({ totalHours: Math.max(0, currentHours - subtractedHours) });
    }

    await sessionRef.delete();
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error('deleteSession error:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
}

module.exports = { getSessions, createSession, deleteSession };
