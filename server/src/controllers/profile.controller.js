const { db } = require('../firebase');

/**
 * PATCH /api/profile
 * Update user profile fields.
 * Body: { name?, email?, skillLevel?, interests?, theme? }
 */
async function updateProfile(req, res) {
  try {
    const { uid } = req.user;
    const { name, skillLevel, interests, theme } = req.body;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (skillLevel) updates.skillLevel = skillLevel;
    if (Array.isArray(interests)) updates.interests = interests;
    if (theme === 'dark' || theme === 'light') updates.theme = theme;
    updates.updatedAt = new Date().toISOString();

    await userRef.update(updates);

    const updatedDoc = await userRef.get();
    res.json({ user: { id: uid, ...updatedDoc.data() } });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * PATCH /api/profile/streak
 * Increment or reset the user's study streak.
 * Body: { action: 'increment' | 'reset' }
 */
async function updateStreak(req, res) {
  try {
    const { uid } = req.user;
    const { action } = req.body;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const currentStreak = userDoc.data().streak || 0;
    let newStreak;

    if (action === 'increment') {
      newStreak = currentStreak + 1;

      // Fire streak milestone notifications
      if ([7, 14, 30, 50, 100].includes(newStreak)) {
        await db.collection('notifications').add({
          userId: uid,
          text: `🔥 Amazing! You've reached a ${newStreak}-day study streak!`,
          time: 'just now',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else if (action === 'reset') {
      newStreak = 0;
    } else {
      return res.status(400).json({ error: 'action must be "increment" or "reset"' });
    }

    await userRef.update({ streak: newStreak, updatedAt: new Date().toISOString() });
    res.json({ streak: newStreak });
  } catch (err) {
    console.error('updateStreak error:', err);
    res.status(500).json({ error: 'Failed to update streak' });
  }
}

module.exports = { updateProfile, updateStreak };
