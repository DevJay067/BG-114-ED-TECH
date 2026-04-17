const { db } = require('../firebase');

/**
 * GET /api/goals
 * Returns all goals for the authenticated user, ordered by creation date.
 */
async function getGoals(req, res) {
  try {
    const { uid } = req.user;
    const snapshot = await db.collection('goals')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ goals });
  } catch (err) {
    console.error('getGoals error:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
}

/**
 * POST /api/goals
 * Create a new goal.
 * Body: { text }
 */
async function createGoal(req, res) {
  try {
    const { uid } = req.user;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Goal text is required' });
    }

    const newGoal = {
      userId: uid,
      text: text.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('goals').add(newGoal);

    // Add notification
    await db.collection('notifications').add({
      userId: uid,
      text: `✅ New goal added: "${text.trim()}"`,
      time: 'just now',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ goal: { id: docRef.id, ...newGoal } });
  } catch (err) {
    console.error('createGoal error:', err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
}

/**
 * PATCH /api/goals/:id
 * Update a goal — toggle done or update text.
 * Body: { done?, text? }
 */
async function updateGoal(req, res) {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const updates = req.body;

    const goalRef = db.collection('goals').doc(id);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists || goalDoc.data().userId !== uid) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Only allow updating specific fields
    const allowed = {};
    if (typeof updates.done === 'boolean') allowed.done = updates.done;
    if (updates.text && updates.text.trim()) allowed.text = updates.text.trim();
    allowed.updatedAt = new Date().toISOString();

    await goalRef.update(allowed);

    // Notification on completion
    if (allowed.done === true) {
      await db.collection('notifications').add({
        userId: uid,
        text: `🎯 Goal completed: "${goalDoc.data().text}"`,
        time: 'just now',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ goal: { id, ...goalDoc.data(), ...allowed } });
  } catch (err) {
    console.error('updateGoal error:', err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
}

/**
 * DELETE /api/goals/:id
 * Delete a goal.
 */
async function deleteGoal(req, res) {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const goalRef = db.collection('goals').doc(id);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists || goalDoc.data().userId !== uid) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await goalRef.delete();
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    console.error('deleteGoal error:', err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
}

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
