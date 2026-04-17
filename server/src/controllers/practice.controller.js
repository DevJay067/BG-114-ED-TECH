const { db } = require('../firebase');

/**
 * POST /api/practice
 * Handles a practice submission, evaluates it, and updates user progress.
 */
async function submitPractice(req, res) {
  try {
    const { uid } = req.user;
    const { subject = 'Coding', input } = req.body;

    if (!input || input.trim().length < 5) {
      return res.status(400).json({ error: 'Input must be at least 5 characters long.' });
    }

    // --- Advanced Heuristic Evaluation Logic ---
    let baseScore = 50;
    const length = input.trim().length;
    
    // 1. Length Bonus (up to 20 pts)
    baseScore += Math.min(Math.floor(length / 25), 20);

    // 2. Structural Analysis (Checking for complexity)
    const structurePatterns = {
        'Coding': ['function', 'class', '=>', '{', 'let', 'const', 'async', 'try', 'await'],
        'Math': ['=', '+', '-', '*', '/', '^', 'cos', 'sin', 'tan', 'id'],
        'Science': ['cell', 'atom', 'molecule', 'energy', 'force', 'law', 'theory'],
        'English': ['however', 'therefore', 'consequently', 'furthermore', 'analysis'],
        'History': ['century', 'war', 'impact', 'signed', 'founded', 'empire']
    };

    const patterns = structurePatterns[subject] || [];
    let matchCount = 0;
    patterns.forEach(p => {
        if (input.toLowerCase().includes(p)) matchCount++;
    });

    // Patterns matching bonus (up to 30 pts)
    baseScore += Math.min(matchCount * 5, 30);

    // 3. Subject-Specific Deduction (too short check)
    if (length < 30) baseScore -= 10;

    const finalScore = Math.min(Math.max(baseScore, 0), 100);

    // 4. Personalized Feedback
    let feedback = '';
    if (finalScore >= 90) {
        feedback = `Incredible work! Your ${subject} response demonstrates deep understanding and excellent structural clarity.`;
    } else if (finalScore >= 75) {
        feedback = `Great job! You've captured the core concepts of ${subject} well. Try adding a bit more detail for a perfect score.`;
    } else if (finalScore >= 50) {
        feedback = `Solid effort. Your ${subject} practice is on the right track. Focus on using more technical terminology next time.`;
    } else {
        feedback = `Good attempt! Keep practicing your ${subject} fundamentals. Consistency is key to improvement.`;
    }

    // --- Persist Data ---

    // 1. Log submission
    const submissionRef = await db.collection('practice_submissions').add({
      userId: uid,
      subject,
      input: input.substring(0, 5000), // Cap storage
      score: finalScore,
      feedback,
      createdAt: new Date().toISOString(),
    });

    // 2. Update Progress (Moving Average)
    const progressRef = db.collection('progress').doc(uid);
    const progressDoc = await progressRef.get();
    
    let subjects = { Math: 0, Science: 0, Coding: 0, English: 0, History: 0 };
    if (progressDoc.exists) {
        subjects = progressDoc.data().subjects || subjects;
    }

    // Update specific subject score
    const oldScore = subjects[subject] || 0;
    const newProgressScore = Math.round(oldScore * 0.7 + finalScore * 0.3); // 30% weight to new submission
    
    const updatedSubjects = { ...subjects, [subject]: newProgressScore };
    await progressRef.set({
      subjects: updatedSubjects,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 3. Create Notification
    await db.collection('notifications').add({
      userId: uid,
      text: `🎯 Practice complete! Scored ${finalScore}% in ${subject}.`,
      time: 'just now',
      read: false,
      createdAt: new Date().toISOString(),
    });

    // 4. Update User totalHours (Add 15 mins for practice)
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
        const currentHours = userDoc.data().totalHours || 0;
        await userRef.update({ totalHours: parseFloat((currentHours + 0.25).toFixed(2)) });
    }

    res.status(201).json({
      message: 'Practice evaluated successfully',
      submission: { id: submissionRef.id, score: finalScore, feedback },
      updatedProgress: updatedSubjects
    });
  } catch (err) {
    console.error('submitPractice error:', err);
    res.status(500).json({ error: 'Failed to process practice submission' });
  }
}

/**
 * GET /api/practice/history
 * Returns user's practice history.
 */
async function getPracticeHistory(req, res) {
    try {
        const { uid } = req.user;
        const snapshot = await db.collection('practice_submissions')
            .where('userId', '==', uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ history });
    } catch (err) {
        console.error('getPracticeHistory error:', err);
        res.status(500).json({ error: 'Failed to fetch practice history' });
    }
}

module.exports = { submitPractice, getPracticeHistory };
