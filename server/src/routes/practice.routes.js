const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practice.controller');
const { verifyToken } = require('../middleware/auth');

// All practice routes are protected
router.use(verifyToken);

router.post('/', practiceController.submitPractice);
router.get('/history', practiceController.getPracticeHistory);

module.exports = router;
