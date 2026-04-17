const { db } = require('../firebase');

const DEFAULT_SUBJECTS = {
  Math: 0,
  Science: 0,
  Coding: 0,
  English: 0,
  History: 0,
};

/**
 * GET /api/progress
 * Returns subject progress scores for the user.
 */
async function getProgress(req, res) {
  try {
    const { uid } = req.user;
    const docRef = db.collection('progress').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Auto-create if missing
      await docRef.set({ subjects: DEFAULT_SUBJECTS, updatedAt: new Date().toISOString() });
      return res.json({ progress: DEFAULT_SUBJECTS });
    }

    res.json({ progress: doc.data().subjects });
  } catch (err) {
    console.error('getProgress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
}

/**
 * PATCH /api/progress/:subject
 * Update score for one subject.
 * Body: { score }  (0–100)
 */
async function updateProgress(req, res) {
  try {
    const { uid } = req.user;
    const { subject } = req.params;
    const { score } = req.body;

    const validSubjects = Object.keys(DEFAULT_SUBJECTS);
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({ error: `Invalid subject. Valid: ${validSubjects.join(', ')}` });
    }

    const scoreNum = Number(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return res.status(400).json({ error: 'Score must be a number between 0 and 100' });
    }

    const docRef = db.collection('progress').doc(uid);
    const doc = await docRef.get();

    let currentSubjects = DEFAULT_SUBJECTS;
    if (doc.exists) currentSubjects = doc.data().subjects;

    const updatedSubjects = { ...currentSubjects, [subject]: scoreNum };

    await docRef.set({
      subjects: updatedSubjects,
      updatedAt: new Date().toISOString(),
    });

    res.json({ progress: updatedSubjects });
  } catch (err) {
    console.error('updateProgress error:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
}

/**
 * PUT /api/progress
 * Replace all subject scores at once.
 * Body: { subjects: { Math, Science, Coding, English, History } }
 */
async function replaceProgress(req, res) {
  try {
    const { uid } = req.user;
    const { subjects } = req.body;

    if (!subjects || typeof subjects !== 'object') {
      return res.status(400).json({ error: 'subjects object is required' });
    }

    const docRef = db.collection('progress').doc(uid);
    await docRef.set({
      subjects: { ...DEFAULT_SUBJECTS, ...subjects },
      updatedAt: new Date().toISOString(),
    });

    res.json({ progress: { ...DEFAULT_SUBJECTS, ...subjects } });
  } catch (err) {
    console.error('replaceProgress error:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
}

module.exports = { getProgress, updateProgress, replaceProgress };
