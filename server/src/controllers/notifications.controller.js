const { db } = require('../firebase');

/**
 * GET /api/notifications
 * Returns all notifications for the user (most recent first).
 */
async function getNotifications(req, res) {
  try {
    const { uid } = req.user;
    const snapshot = await db.collection('notifications')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ notifications });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all unread notifications as read.
 */
async function markAllRead(req, res) {
  try {
    const { uid } = req.user;
    const snapshot = await db.collection('notifications')
      .where('userId', '==', uid)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();

    res.json({ message: `Marked ${snapshot.docs.length} notifications as read` });
  } catch (err) {
    console.error('markAllRead error:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
}

/**
 * PATCH /api/notifications/:id
 * Mark a single notification as read.
 */
async function markOneRead(req, res) {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const notifRef = db.collection('notifications').doc(id);
    const notifDoc = await notifRef.get();

    if (!notifDoc.exists || notifDoc.data().userId !== uid) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notifRef.update({ read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('markOneRead error:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
}

module.exports = { getNotifications, markAllRead, markOneRead };
