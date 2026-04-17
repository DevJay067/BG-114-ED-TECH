const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboard.controller');

router.get('/', verifyToken, getDashboard);

module.exports = router;
