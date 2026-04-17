const { db } = require('../firebase');

/**
 * GET /api/dashboard
 * Returns aggregated stats for the authenticated user's dashboard.
 * Includes: totalHours, streak, goals summary, avg score, weekly study data.
 */
async function getDashboard(req, res) {
  try {
    const { uid } = req.user;

    // Fetch all data in parallel
    const [userDoc, goalsSnapshot, sessionsSnapshot, progressDoc, practiceSnapshot] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('goals').where('userId', '==', uid).get(),
      db.collection('sessions').where('userId', '==', uid).get(),
      db.collection('progress').doc(uid).get(),
      db.collection('practice_submissions').where('userId', '==', uid).get(),
    ]);

    // --- User stats ---
    const userData = userDoc.exists ? userDoc.data() : {};
    const totalHours = userData.totalHours || 0;
    const streak = userData.streak || 0;

    // --- Goals summary ---
    const goals = goalsSnapshot.docs.map(d => d.data());
    const totalGoals = goals.length;
    const doneGoals = goals.filter(g => g.done).length;

    // --- Average score ---
    const subjects = progressDoc.exists ? progressDoc.data().subjects : {};
    const scores = Object.values(subjects);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // --- Weekly study hours (last 7 days) ---
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyMap = {};

    // Initialize all 7 days with 0 hours
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      weeklyMap[key] = { day: days[d.getDay()], hours: 0 };
    }

    // Aggregate session durations into weekly map
    sessionsSnapshot.docs.forEach(doc => {
      const { date, duration } = doc.data();
      if (weeklyMap[date] !== undefined) {
        weeklyMap[date].hours += Math.round((duration / 60) * 100) / 100;
      }
    });

    const weeklyData = Object.entries(weeklyMap).map(([date, val]) => ({
      date,
      day: val.day,
      hours: Math.round(val.hours * 100) / 100,
    }));

    // --- Completion rate ---
    const completionRate = totalGoals > 0 ? Math.round((doneGoals / totalGoals) * 100) : 0;

    res.json({
      stats: {
        totalHours: Math.round(totalHours * 100) / 100,
        streak,
        totalGoals,
        doneGoals,
        completionRate,
        avgScore,
        totalSolved: practiceSnapshot.size,
      },
      weeklyData,
      subjectProgress: subjects,
      user: {
        name: userData.name,
        email: userData.email,
        skillLevel: userData.skillLevel,
        interests: userData.interests || [],
        joinDate: userData.joinDate,
        theme: userData.theme,
      },
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

module.exports = { getDashboard };
