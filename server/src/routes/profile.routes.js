const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { updateProfile, updateStreak } = require('../controllers/profile.controller');

router.use(verifyToken);

router.patch('/', updateProfile);
router.patch('/streak', updateStreak);

module.exports = router;
