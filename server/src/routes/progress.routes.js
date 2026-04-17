const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getProgress, updateProgress, replaceProgress } = require('../controllers/progress.controller');

router.use(verifyToken);

router.get('/', getProgress);
router.put('/', replaceProgress);           // Replace all scores at once
router.patch('/:subject', updateProgress);  // Update a single subject

module.exports = router;
