const { db, auth } = require('../firebase');

/**
 * POST /api/auth/register
 * Called after Firebase client-side registration to sync user profile to Firestore.
 */
async function register(req, res) {
  try {
    const { uid, email } = req.user; // from verifyToken middleware
    const { name, skillLevel = 'Beginner', interests = [] } = req.body;

    const userRef = db.collection('users').doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      return res.status(200).json({ message: 'User already exists', user: existing.data() });
    }

    const userData = {
      name: name || email.split('@')[0],
      email,
      skillLevel,
      interests,
      streak: 0,
      totalHours: 0,
      joinDate: new Date().toISOString(),
      theme: 'dark',
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    await userRef.set(userData);

    // Create default notifications for new user
    await db.collection('notifications').add({
      userId: uid,
      text: '🎉 Welcome to StudyPro! Set your first goal to get started.',
      time: 'just now',
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Initialize empty progress doc
    await db.collection('progress').doc(uid).set({
      subjects: {
        Math: 0,
        Science: 0,
        Coding: 0,
        English: 0,
        History: 0,
      },
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'User registered successfully', user: userData });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

/**
 * GET /api/auth/me
 * Returns current user's Firestore profile.
 */
async function getMe(req, res) {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found. Please register first.' });
    }

    res.json({ user: { id: uid, ...userDoc.data() } });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

module.exports = { register, getMe };
