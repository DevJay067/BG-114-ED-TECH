const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { register, getMe } = require('../controllers/auth.controller');

// POST /api/auth/register — Sync Firebase Auth user to Firestore (call after client-side registration)
router.post('/register', verifyToken, register);

// GET /api/auth/me — Get current user's Firestore profile
router.get('/me', verifyToken, getMe);

module.exports = router;
